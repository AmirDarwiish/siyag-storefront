# SIYAG Storefront

A Next.js storefront for SIYAG Parfums, derived from AmirDarwiish/AIM-front at `59c0bfbc64ff8ea39a23bf2ff27941c025a84a74`. It retains the App Router structure, Radix-based dialog and accordion components, utility classes, and the Arabic typography assets.

## Run

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

The same-origin storefront API proxy defaults to `https://siyag.runasp.net`. Set `SIYAG_API_ORIGIN` to override the server-side upstream. Publish products, stock, collections and shipping options through the SIYAG backend before opening checkout to buyers. The interface offers Paymob only when the backend advertises it.

Set `SIYAG_DEMO=1` in `.env.local` for the design preview. A Vercel Preview deployment uses this mode by default. Set `SIYAG_DEMO=0` there if you need to exercise the live catalog. It enables labeled sample products, a local sample bag and an illustrative Black Friday modal. The preview mode blocks order submission and is excluded from search indexing. Remove the setting and rebuild for the live catalog.

For a real campaign, publish a backend content block in area `campaign`, set the localized titles and copy, and point its action to a storefront path. Plain copy is supported. Optional tiered copy in each localized text field can use a JSON object with `description`, up to three `tiers` with `value` and `label`, and an optional `footnote`. Configure matching promotion rules in the backend. The modal appears once per browser tab session and the checkout quote remains authoritative.

Campaign and product photographs under `public/brand` are visual concepts. The live catalog uses the product images and pricing published by SIYAG.
