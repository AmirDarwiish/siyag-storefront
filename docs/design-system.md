# SIYAG storefront design system

The storefront has one theme, shared by Arabic and English. The visual direction uses warm ivory, forest ink, considered typography, fine rules and generous photography. The references were the public mobile and desktop previews of [Prestige](https://themes.shopify.com/themes/prestige/presets/prestige) and [Stiletto](https://themes.shopify.com/themes/stiletto/presets/stiletto). No theme source or licensed assets were copied.

## Where changes belong

- `app/theme/tokens.css`: brand palette, fonts, type scale, spacing scale, control anatomy, radii, shadows, container widths and responsive values. Change shared appearance here.
- `app/theme/storefront.css`: canonical component rules and responsive layouts. Edit the existing selector; do not append another override stylesheet.
- `app/globals.css`: Tailwind entry only. The office dashboard keeps its separate `office.css`.

The root layout loads tokens before the component styles. All storefront colors and font sizes use tokens. Shared actions use `--type-action`, `--control-height`, `--control-padding`, `--radius-control`, `--weight-action` and `--tracking-action`. Page gutters, section spacing and product gaps adapt centrally. Arabic font families and scale overrides are declared in the token file.

Fixed image/dialog geometry, percentages and breakpoint conditions are layout constraints rather than brand tokens. Keep any new reusable sizing decision in the token file. Do not introduce inline visual values in storefront JSX.

## Verification before merging

`pnpm check` checks TypeScript and rejects undefined theme variables, raw component colors/font sizes, duplicate selector definitions within the same responsive context, and legacy stylesheet imports. `pnpm build` checks the production build.

Review the homepage, catalog, filtered/empty search, wishlist, product variants, quick view, purchase dock, bag receipt/drawer, checkout summary, written review and impression sheets at 393px and desktop widths. Repeat Arabic and English; check horizontal overflow, sticky header, focus/close behavior and safe-area controls. Use preview data for visual tests, avoid publishing test reviews or placing real orders.

Keep main as the permanent frontend branch. Merge temporary work branches, confirm the automatic production build, then delete the merged branch. Never discard unmerged work without reviewing its difference from main.
