# SIYAG commerce optimization — 11 November 2026

## Delivered behavior

- Add to bag keeps the shopper on the page. A dismissible, nonmodal confirmation offers View bag, Checkout and Continue shopping. The count updates from the returned cart; a synchronous mutation lock blocks rapid duplicate requests.
- Buy now creates a separate server cart containing the chosen variant and quantity, then opens `/checkout?express=1`. The original bag token is never replaced, including after express checkout succeeds. Express state lives in session storage and is validated against the API on checkout entry. Preview uses a separate illustrative snapshot and cannot submit orders.
- Checkout has larger labeled controls, a collapsible mobile summary, explicit delivery/payment grouping, optional email for COD, Egyptian mobile validation, an accessible submit control and existing opted-in address autofill. Quotes, inventory, payment options and totals remain backend-controlled. A ref blocks repeated submissions before React renders the pending state.
- Cards give the photograph more space. Only real comparison-price discounts and unavailability receive badges; size/format is shown with variant selection. Quick view and wishlist remain available.
- Automatic campaign modals have been removed; the configured campaign strip remains.
- A consent-gated measurement layer and an owner-only journey dashboard have been added. The paired API changes must be deployed before collection/reporting is available.

## Initial audit

Inspected the connected production store and then the branch preview. Severity describes purchase friction, not a claimed measured conversion loss.

| Finding | Severity | Surface | Result |
|---|---|---|---|
| Add action always opened a modal bag | High | Home, cards, product | Removed automatic opening; explicitly chosen bag still opens |
| No direct checkout action | High | Product | Separate-cart Buy now and sticky mobile action |
| Full summary before delivery fields on mobile | Medium | Checkout | Collapsible summary and clearer form hierarchy |
| Small/heavy checkout controls | Medium | Checkout | 52px controls, 16px input text, larger submit control |
| Format badge repeated above product photography | Medium | Catalog | Badge reserved for actual sale/unavailability |
| Automatic campaign popup interrupted browsing | Medium | Shared header | Automatic opening removed |
| No measurable first-party shopping funnel | High | Cross-page | Consented events, persistence, attribution and owner reporting |
| Tracking currently requires order number plus mobile | Existing behavior | Order tracking | Retained; a phone-only redesign requires a separate privacy/access contract |

## Benchmarks and hypotheses

These are borrowed interaction principles, not claims that a change already increased conversion.

| Source / observed pattern | SIYAG adaptation | Hypothesis | Evaluation |
|---|---|---|---|
| [Shopify accelerated checkout](https://help.shopify.com/en/manual/online-store/dynamic-checkout) skips cart for a selected variant | Buy now with isolated cart | Fewer navigation steps increase checkout starts | Buy-now starts, checkout completion, overall conversion |
| [PHLUR](https://phlur.com/) uses restrained badges and direct product add actions | Minimal state badges, visible quick add | Less visual competition improves product selection | Item views / list sessions; add-to-cart / sessions |
| [Dossier](https://dossier.co/) emphasizes scent discovery and product-level actions | Preserve family, concentration and note hierarchy | Clearer product information supports selection | Product view to add / checkout |
| Existing guest checkout and browser autofill | Preserve them, clarify fields and summary | Fewer interruptions reduce checkout loss | Checkout sessions without verified purchase |

Do not introduce unconfigured shipping incentives, invented reviews, bestseller claims, countdowns or unverified delivery promises. Compare a stable baseline against at least one full trading cycle; segment direct checkout from bag checkout and mobile from desktop. Attribution measures participating visitors, not everyone who visits.

## Event contract

`lib/analytics.ts` is independent of presentation. Standard events: page_view, view_item_list, select_item, view_item, search, add_to_wishlist, add_to_cart, remove_from_cart, view_cart, begin_checkout, add_shipping_info, add_payment_info, purchase. Custom events: buy_now, coupon_apply, select_variant, checkout_validation, checkout_exit, order_placed.

Common fields include UUID event/visitor/session IDs, server receipt time, safe current/previous paths, source/medium/campaign, returning-visitor indicator, device/viewport/browser context, item identifiers/price/quantity and checkout stage. Sessions expire after 30 minutes of inactivity. UTM fields are bounded; search content, full URLs, query strings, delivery details and form contents are excluded. The collector validates a bounded allowlist and ignores unknown properties. Prices are integer piastres in storage and EGP units in vendor payloads.

- No optional identifiers, event collection or vendor scripts before consent. Cart/wishlist persistence remains essential functionality. Privacy preferences remain accessible in the footer; withdrawal stops subsequent measurement calls and revokes browser vendor consent.
- Order proof is sent only to the first-party API for validation. It is never stored in the analytics table or forwarded to analytics providers.
- Purchase and order-placement IDs are deterministic per order. The API validates the order proof, recomputes canonical items/value and excludes cancelled/returned orders and uncollected online payments. COD purchase means an accepted placed order, not collected cash.
- The background dispatcher promotes consented online order attribution after the backend confirms collection, even when the shopper has left the browser. Data older than 90 days is deleted by the worker.
- Transient first-party transport failures retry twice using the same ID. Purchases are deduplicated in the database; browser/vendor deduplication also uses the order ID.
- Meta CAPI purchase delivery uses persistent retry state, exponential backoff and the same event ID as the browser Pixel. At most ten attempts, only recent events. Anonymous external ID is hashed; no IP, email, phone, address or payment credentials are exported. Lower match quality is expected without advertising click identifiers.
- GA4 purchase is dispatched only after first-party verification. Browser GA4 can miss a purchase when the customer closes the browser before payment confirmation; the first-party dashboard remains authoritative. No GA4 server Measurement Protocol export is included.
- Replay and heatmaps are not enabled. No Clarity script or checkout recording is installed.

## Configuration and rollout

Deploy the paired API branch first so SQL Server migrations create `siyag_store.JourneyEvents`; SQLite has its own development/test migration. API startup already applies migrations. Back up production before the normal deployment procedure. Then merge the storefront and allow the existing Git integration to deploy it. Do not add an extra manual Vercel deployment.

Optional storefront build-time variables:

- `NEXT_PUBLIC_GA4_ID`: GA4 measurement ID.
- `NEXT_PUBLIC_META_PIXEL_ID`: browser Pixel ID.

Optional API host settings:

- `Analytics__MetaPixelId`, `Analytics__MetaAccessToken`, `Analytics__MetaApiVersion` (the supported Graph API version selected for the account).
- `Analytics__StorefrontOrigin`: exact HTTPS storefront origin, used for the CAPI event-source URL.

Keep access tokens on the API host. Disable automatic form/outbound enhanced measurement in GA4 and automatic advanced matching in Meta; this layer sends explicit events. Validate in GA4 DebugView and Meta Test Events with the owner's configured accounts before relying on campaign reports. Missing vendor settings do not block shopping or first-party reporting. Missing API deployment leaves collection/reporting unavailable; it does not block orders.

## Dashboard semantics

Owner-only endpoint `/api/v1/admin/reports/journey?days=30` and the Arabic “رحلة العميل” administration panel show unique participating visitors/sessions, event counts, product views, bag additions, checkout starts, verified attributed orders, ordered revenue/AOV, source/campaign, device, new/returning segments, top-viewed and top-selling variants. Bag-to-checkout uses intersection of the same session IDs. Cart/checkout loss is a session-level signal, not a recovered abandoned customer. Date windows can split a journey; refunds, collection and accounting require the existing operations reports.

Queries cap at 100,000 events and show a truncation notice; use a shorter window at that size. Production scaling should move aggregations into database queries/materialized reporting rather than increasing this cap.

## Verification

- `pnpm check` and production `pnpm build` pass.
- `.NET Release build` passes, zero warnings/errors.
- Existing API suites pass: catalog/roles, repeat checkout, concurrent last unit, tracking, delivery, returns/inventory, account ownership, tax/promotions, media, Paymob signed callbacks/refunds and email recovery.
- Added API checks: event validation, owner authorization, deduplication, proof-required purchase, canonical order value/items, unpaid Paymob exclusion and paid Paymob inclusion.
- Production page inspection: home, collection, product/variants/gallery, bag, checkout, reviews and tracking. Preview interactions: quick add, explicit bag, multiple items, summary toggle, language switch, invalid phone, search, quick view and wishlist/reload.
- Direct-purchase preview: Noir 50ml alone in checkout at EGP 890; original bag remains Noir 10ml + Oud 10ml at EGP 390. Preview order submission is intentionally disabled. Backend tests use disposable local databases and a test payment transport; no live paid orders were placed.
- Checkout overflow checks at 360, 393, 430, 768 and 1440 CSS pixels: none. iPhone 15 testing uses a 393×852 viewport, not physical Safari hardware.
- SQL Server migrations compile and an idempotent SQL script was generated. No production SQL Server migration execution is claimed.
- External GA4/CAPI delivery, physical iPhone Safari, throttled mobile networking, live frontend-to-new-API checkout and the authenticated dashboard UI still need production/staging validation after API deployment/configuration. They are not reported as passed.

## Next experiments

1. Measure the baseline and compare mobile checkout completion after this rollout.
2. Compare Buy now vs bag checkout completion by source and device.
3. Test a shorter delivery-notes disclosure only if field usage shows it is rarely needed.
4. Add first-party click identifiers only with an explicit marketing consent contract and retention rules.
5. Add server GA4 purchase export and consent-aware replay only after configuring providers and masking tests.
