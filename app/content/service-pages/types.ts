// The shape of a service page (rendered by app/components/ServicePage.tsx).
// Each section answers one question a client actually asks.

import type { FaqItem } from '../faq'
import type { Page } from '../pages'
import type { PriceRow } from '../pricing'
import { NETWORKING_SERVICES, SOFTWARE_SERVICES, type Service } from '../services'

// A list item, optionally with a bold lead-in
export type Point = string | { lead: string; text: string }

export type Section = {
  id: string
  // Small label above the question
  eyebrow?: string
  heading: string
  body: string[]
  points?: Point[]
  ordered?: boolean
  // Paragraphs after the list
  after?: string[]
  more?: { href: string; text: string }
}

export type ServicePageContent = {
  // Short name, used in the data-cta values that analytics reports
  id: string
  page: Page
  // The matching entry in services.ts: its offer is the JSON-LD Service name and description
  service: Service
  // On-site work, so the JSON-LD lists the towns in areaServed
  onSite: boolean
  eyebrow: string
  h1: string
  // What you get, in two or three sentences
  intro: string
  sections: Section[]
  // The first row is the service's own price; one with a range becomes the JSON-LD offer
  price: { heading: string; rows: PriceRow[]; notes: string[] }
  // Shown on the page and in the FAQPage JSON-LD
  faq: FaqItem[]
  cta: { heading: string; body: string; button: string }
}

export function findService(name: string): Service {
  const service = [...NETWORKING_SERVICES, ...SOFTWARE_SERVICES].find((s) => s.name === name)
  if (!service) throw new Error(`No service named ${name}`)
  return service
}

// The other services that have their own page
export function relatedServices(path: string): Service[] {
  return [...NETWORKING_SERVICES, ...SOFTWARE_SERVICES].filter((s) => s.href && s.href !== path)
}
