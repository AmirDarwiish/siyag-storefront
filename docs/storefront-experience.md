# SIYAG customer storefront refinement — 12 November 2026

## Audit and implementation checklist

- Existing functionality retained: public catalog/search/filter/sort; collection filters; selected variants with independent price/stock; wishlists and guest bags; direct-purchase checkout isolated from the bag; authoritative server quotes and guarded order submission; Paymob handoff; moderated reviews with verified-purchase proof; consent-aware analytics; accessible error/404 states.
- Existing routes: `/`, `/shop`, `/products/[slug]`, `/checkout`, `/track`, `/payment/result`, `/reviews`. Wishlist and collections use the existing shop query routes; no duplicate catalog implementations.
- Added: `/about`, `/contact`, `/faq`, `/policies/shipping`, `/policies/returns`, `/policies/privacy`, `/policies/terms`, `/cart`. Reused bag contents for the drawer and full bag page.
- Shared system: canonical `app/theme/tokens.css` and `app/theme/storefront.css`; no new dependency or parallel stylesheet. Compact editorial typography, understated badges, less repeated homepage decoration, full client-care footer and mobile drawer navigation.
- Mobile rail root causes: integer scroll rounding at low speed; multiple-card native flings rebased one card at a time; resize callbacks resetting position on height changes. Use native touch scrolling with subpixel transform remainder, a single atomic multi-card rebase after momentum settles, width-change-only measurements, visibility/interaction pauses and reduced-motion support. Keep unique real product cards and their state; no inert duplicate cards or carousel library. `normalizeRail` is tested against multi-card, reverse and fractional movements.
- Sharing/SEO: centralized absolute canonical/Open Graph/Twitter metadata; SIYAG's existing branded photograph for the homepage, actual product image and description for individual products; robots exclusions for private workflows; public sitemap. `NEXT_PUBLIC_SITE_URL` can set the final custom domain.
- Customer service: shipping options/prices and contact email come from existing public APIs. Published content with `area=pages` and the matching slug can replace the default page copy without introducing HTML injection. FAQs and default policies explain actual implemented behavior rather than inventing shipping dates, free returns or refund timelines.
- Tracking: localized real statuses, event timeline, refresh and payment-state messaging. Secure-receipt holders can submit the existing server-side delivered-order return request for review. Server still enforces eligibility and its configured return window.
- Analytics: retain consent and exclusion of personal/free-text fields; add the real homepage product-list impression. No fabricated ratings, metrics or purchases.

## Integration limits requiring merchant configuration

- Contact email must be populated in store settings; no invented phone, email, address, social account or non-functional contact form.
- Phone-only order lookup with OTP is not exposed by the existing public API. Tracking continues to require order number + mobile, or a private receipt token; do not expose customers' orders by phone alone. Existing commerce endpoint rate limiting is preserved.
- Return requests use a private receipt token and are subject to server rules. Request submission is not automatic approval/refund. Exact commercial return/refund terms should be published via the existing content API once confirmed by the merchant.
- No specific delivery dates or carrier creation guarantees without provider data. Shipping prices are live; any final coupon/tax/total comes from checkout's authoritative quote.
- Paymob payments and actual production order placement must not be fabricated during UI QA. Live settlement and refund execution require the merchant's configured account.
- Safari on a physical iPhone cannot be claimed from Chromium/Edge viewport emulation. The rail uses native overflow, pointer events and fractional transforms; a real Safari smoke test remains a separate platform check.

## Validation

`pnpm check` covers TypeScript, canonical theme/token rules, existing office/cache checks and the new rail/metadata cases. `pnpm build` covers the complete route tree. Browser QA is recorded after the candidate deployment below; field Core Web Vitals cannot be inferred from screenshots or a small number of manual interactions.

### Preview review

Preview inspected at 1440px, iPhone 15 393px, small mobile 360px and large mobile 430px. Verified unique equal-width rail cards, automatic movement, hover/focus pauses, multi-card horizontal native scrolling and resumed recycling without document overflow. Checked bilingual client care, expandable FAQs, independent bag page and full-height bag drawer. Changing a real preview variant to 50ml updated its price to EGP 890; Buy now opened a separate checkout while the original one-item bag remained intact. A navigation issue aligning the new main region underneath the sticky header was identified and corrected in the persistent storefront frame, preserving query filters and history restoration. No live order or payment was submitted.

### Production performance measurement

Initial PageSpeed Insights mobile lab run after deployment (12 November 2026, 20:32 Cairo): Performance 82, Accessibility 96, Best Practices 100, SEO 100. FCP 1.2s, LCP 3.7s, TBT 240ms, CLS 0. Emulated Moto G Power, Slow 4G, Lighthouse 13.6.0. No field/CrUX data was available, so no field INP claim is made. The report identified oversized delivered images (estimated 145KiB savings) and insufficient contrast in the amber mood-card caption. Follow-up uses Next Image responsive sources for bundled brand photography, shared image size hints, and stronger caption contrast. Third-party and API image URLs retain their existing delivery behavior.

Second mobile lab run (20:40 Cairo): Performance 87, Accessibility 100, Best Practices 100, SEO 100; FCP 1.4s, LCP 3.6s, TBT 20ms, CLS 0. The follow-up LCP audit exposed Next Image’s default lazy loading on the high-priority hero (1,350ms load delay), plus a 1,000ms image reveal delay. The shared StoreImage wrapper now makes high-priority images eager, and the first hero photograph paints without its intro animation. Subsequent slide transitions retain their motion.

Final measured mobile lab run after the eager-hero fix (20:46 Cairo): Performance 99, Accessibility 100, Best Practices 100, SEO 100; FCP 0.9s, LCP 2.1s, TBT 0ms, CLS 0. This is a lab session under Slow 4G emulation, not a field guarantee. A final menu smoke test found that selecting side placement without an explicit viewport inset left the navigation dialog at its static document position. The canonical navigation-drawer rule now fixes it to the viewport, with logical RTL anchoring and independent overflow only when its content exceeds the screen.

### Mobile one-card interaction refinement

The mobile rail now has its own stepped mode controlled by shared theme variables: a full-width card, a 4.2-second reading interval, and a 520ms one-card transition. Arabic advances physically left, English physically right, using the same unique card instances. Native scroll snap and `scroll-snap-stop: always` support manual browsing. The desktop continuous presentation is preserved.

Pointer/touch start, click, focus, wheel or keyboard input inside the mobile rail synchronously cancels its movement and permanently disables autoplay for the current homepage visit. It cannot restart while a customer chooses a size, uses quick view, saves an item or adds to the bag. Leaving the homepage creates a fresh visit; changing language alone does not restart a rail the customer has paused. Idle mobile intervals use timers rather than a continuously running animation loop. Reduced-motion preference disables autoplay. Native touch scrolling and vertical page scrolling are not prevented.

The prior navigation-drawer fix was verified live at 393×852: the panel spans y=0..852, remains inside the viewport, and exposes all six navigation links.

The first compiled-preview timing check exposed the actual timing bug: the CSS toolchain normalized time variables from ms to s (`4200ms` → `4.2s`, `520ms` → `.52s`, and `1800ms` → `1.8s`), while the previous reader used parseFloat without unit conversion. This made intervals/transitions and the interaction grace period nearly immediate. All rail time settings now use a shared ms/s parser, with regression cases using both source and compiled representations.

Compiled-preview QA after the time-unit fix: 393×852 Arabic and English both enter stepped mode with 338px full-width cards. English rotates toward the previous card; Arabic toward the next. Selecting 50ml was followed by a 10.5s wait in each language: scroll position, product ordering, selected size and paused state remained unchanged. Quick view opened and closed without restarting autoplay; manual horizontal scrolling remained available and ended at a snap point. At 360×800 cards measured 305px (equal to the rail), add-to-bag stopped motion, updated the preview bag and left other add buttons enabled without opening a forced bag dialog. At 430px cards measured 375px and retained the paused state after resizing. At 1440×900 the desktop stayed in continuous/running mode. No horizontal document overflow was found at these sizes. These are browser viewport tests, not a claim of physical iPhone/Safari testing.

### Photographic homepage direction

Reviewed the Egyptian Arabian Oud and Oud Elite homepages on desktop and mobile. The useful pattern is the alternating rhythm of campaign photography, shoppable collections, products and contextual scent stories. SIYAG now uses that structure with its own existing brand photography and bilingual copy, without importing competitor assets, promotions or unsupported merchant claims.

The former rotating split hero's destinations now have dedicated placements: a stable cinematic collection campaign, a reusable discovery-size feature and a reusable house/notes feature. Collection edits continue to use the live API. Scent-family photography links to the existing fresh, woody, oriental and amber filters; the guide explains notes, wear and available sizes; customer-care links use existing routes. The unique-card rail, real prices/stock, reviews, cart and analytics remain intact. No extra dependency or asset payload was introduced. Only the hero is eager; below-fold photographs use existing responsive image delivery and lazy loading.

Shared homepage dimensions, surfaces, foreground colors, image hover scale and typography are defined in app/theme/tokens.css. Components use canonical rules in app/theme/storefront.css; the replaced hero/mood/mosaic rules were removed rather than left as overrides. The two editorial features share one component. The first visual pass exposed double section spacing before those features, which was removed.

Compiled preview inspected at 360×800 and 393×852 (mobile), 768×1024 (tablet), 1440×900 and 1920×1080 (desktop). Arabic and English text/images were inspected; no horizontal document overflow was found. Mobile cards remain exactly rail-width (305px at 360 and 338px at 393). Selecting 50ml stopped movement and preserved selection/scroll position through 6s in Arabic and 5.5s in English. The fresh-family link opened the existing filtered catalog and showed the matching products. The full mobile page was scrolled to the footer; loaded imagery had no broken images. Tablet console had no errors. At 1920 the desktop rail retained continuous mode and the hero had one h1. Hero focal positions are tokenized for desktop/mobile. Browser viewport QA does not constitute physical iPhone/Safari testing. pnpm check and pnpm build passed.
