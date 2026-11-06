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

## SIYAG Office

Visit `/admin` and sign in with an existing SIYAG API operator key. The dashboard supports `Owner`, `Catalog`, and `Fulfillment` roles. Set a distinct random server-only `SIYAG_ADMIN_SESSION_SECRET` (at least 32 characters) on the storefront host before deploying the office. Configure operator accounts on the API host using `Operators__<name>__Key` and `Operators__<name>__Role`. Restart the API after changes and distribute operator keys through an approved password manager.

Catalog operators can create drafts, upload product photos, create collections, add variants, adjust stock, and publish. Use JPEG, PNG, or WebP up to 3 MB through the dashboard. Fulfillment operators can see incoming orders, inspect delivery details, and update status. Valid transitions and inventory changes are enforced by the API. Production order submission also needs active shipping methods.

Vercel Preview deployments display six labelled sample products. The preview bag and estimated checkout use sample data and cannot submit orders. Run locally with `SIYAG_DEMO=1` to review the sample catalog.
