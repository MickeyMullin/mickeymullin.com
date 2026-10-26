import { PassThrough } from 'node:stream'
import { createReadableStreamFromReadable } from '@react-router/node'
import { renderToPipeableStream } from 'react-dom/server'
import {
  type AppLoadContext,
  type EntryContext,
  type HandleErrorFunction,
  isRouteErrorResponse,
  ServerRouter,
} from 'react-router'
import { SITE } from './content/site'
import { NonceContext } from './lib/nonce'

export const streamTimeout = 5_000

// Read by server/app.js (as build.entry.module.canonicalOrigin) for the www redirect
export const canonicalOrigin = SITE.origin

// Unknown paths are routine (bots probing for /wp-login.php and the like):
// answer 404 without logging a stack trace for each one.
export const handleError: HandleErrorFunction = (error, { request }) => {
  if (request.signal.aborted) return
  if (isRouteErrorResponse(error) && error.status === 404) return
  console.error(error)
}

// Like React Router's default entry, but always waits for the full document
// (every page is small and mostly pre-rendered) and passes the request's CSP
// nonce to React and to the router's inline scripts.
export default function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  routerContext: EntryContext,
  loadContext?: AppLoadContext,
) {
  const nonce = loadContext?.cspNonce

  return new Promise<Response>((resolve, reject) => {
    let ready = false
    const { pipe, abort } = renderToPipeableStream(
      <NonceContext value={nonce}>
        <ServerRouter context={routerContext} url={request.url} nonce={nonce} />
      </NonceContext>,
      {
        nonce,
        onAllReady() {
          ready = true
          const body = new PassThrough()
          responseHeaders.set('Content-Type', 'text/html; charset=utf-8')
          resolve(
            new Response(createReadableStreamFromReadable(body), {
              headers: responseHeaders,
              status: responseStatusCode,
            }),
          )
          pipe(body)
        },
        onShellError(error) {
          reject(error)
        },
        onError(error) {
          responseStatusCode = 500
          if (ready) console.error(error)
        },
      },
    )
    setTimeout(abort, streamTimeout + 1000)
  })
}
