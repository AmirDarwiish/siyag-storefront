<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## SIYAG storefront preferences

- Keep brand naming as SIYAG, including Arabic UI.
- Do not reintroduce decorative arrows on homepage cards/links, rail navigation buttons, hero counters, or visible Pause/Resume controls unless explicitly requested.
- Do not restore the removed corner label on hero images or dot decorations in product family metadata.
- Use app/theme/tokens.css and canonical component rules. Do not add override stylesheets. Run pnpm check and inspect mobile and desktop before merging visual changes.
