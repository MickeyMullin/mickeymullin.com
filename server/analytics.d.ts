// Types for server/analytics.js, which the app imports through app/lib/analytics.ts.

export declare const ANALYTICS: {
  ga4: string
  umamiSrc: string
  umamiId: string
  umamiDomains: string
  clarity: string
}

export declare function analyticsCsp(cfg?: typeof ANALYTICS): { scriptSrc: string[]; connectSrc: string[] }
