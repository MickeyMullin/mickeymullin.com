# TODO: mickeymullin.com

Work is tracked in Dispatch (private board), project **MickeyMullin.com**, program task #674. That board is the source of truth, so this file no longer keeps its own list, which would drift.

Next up:

1. Confirm the Hostinger plan supports Node.js Web Apps (Business or Cloud).
2. Re-platform to **Bun + React + Elysia**. React + Vite gets prerendered to static HTML for SEO. Elysia runs on Node through `@elysiajs/node`, because Hostinger's managed hosting runs Node 18–24 and not Bun. The current `site/` prototype, including `contact.php`, is a design and content reference only. PHP is not part of the target stack.
3. Decisions that block launch: business name, published prices, and whether cabling is offered at launch.
