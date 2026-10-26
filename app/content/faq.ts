// One source for the visible FAQ and the FAQPage JSON-LD, so they cannot drift.

export type FaqItem = { question: string; answer: string }

export const FAQ: FaqItem[] = [
  {
    question: 'Do you sell the networking equipment?',
    answer:
      'Yes. Hardware is billed at cost plus a small markup, or you can buy it yourself from a parts list. Jobs that include hardware take a 50% deposit on the equipment.',
  },
  {
    question: 'Will I be locked in to you?',
    answer:
      'No. You get the admin logins, a labeled port map and a short written summary of how the network is set up, so anyone competent can pick it up later.',
  },
  {
    question: 'Do you work evenings and Saturdays?',
    answer:
      "Yes. Evening and Saturday appointments are available, which is often easier for homes and small offices that can't go offline during the day.",
  },
  {
    question: 'Do you use AI to write the software?',
    answer:
      "Yes, as a tool. AI-assisted development lets one experienced developer build in weeks what used to take a small team months. Every line still goes through the review, testing and design judgment that 30 years of production software taught me, and you own all of the code when we're done.",
  },
  {
    question: 'I built an app with AI. Can you make it work for real?',
    answer:
      'Usually, yes. I start with a free review of what you have: what works, what is risky, and what is missing, such as the domain, hosting, logins, email, CRM and security. Then you get a fixed quote to finish it. Sometimes rebuilding one piece costs less than patching it, and I will tell you when that is the case. You keep the code, and every account is in your name.',
  },
  {
    question: 'Do you do electrical work?',
    answer:
      'No. Anything involving power, such as a new outlet for a rack or UPS, goes to a licensed electrician.',
  },
]
