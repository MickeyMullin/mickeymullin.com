import { createContext, useContext } from 'react'

// The per-request CSP nonce for pages rendered at request time. Undefined for
// pages pre-rendered at build time; their inline scripts are allowed by hash.
export const NonceContext = createContext<string | undefined>(undefined)

export function useNonce() {
  return useContext(NonceContext)
}
