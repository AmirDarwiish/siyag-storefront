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
