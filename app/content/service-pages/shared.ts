// Sections that read the same on more than one software page

import type { Section } from './types'

export const OWNERSHIP: Section = {
  id: 'ownership',
  eyebrow: 'Ownership',
  heading: "Who owns it when we're done?",
  body: [
    'You do. The code lives in your GitHub account, and every account the app depends on, from the domain and hosting to the email and the database, is in your name and on your billing.',
    'If we stop working together, nothing has to be handed back, because none of it was ever mine.',
  ],
}
