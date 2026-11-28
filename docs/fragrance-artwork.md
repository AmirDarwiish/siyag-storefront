# Numbered fragrance artwork

## Final catalogue pass — 28 November 2026

SIYAG 20 (`siyag-20-studio-v3.webp`) and 21 (`siyag-21-studio-v2.webp`) use the approved SIYAG 18 studio photograph as the numeral reference. The final image edits preserve each fragrance's own botanicals, bottle, gold liquid, label copy and lighting; only the number typography is adjusted to the reference's thin olive serif and approximately 9.3% frame height. Original images remain available.

Product and default social metadata use `/brand/share/notes-v2/`. All 21 square JPEGs are generated from each published product's current `notesImageUrl` (or first gallery photo) at 1200 × 1200. Regenerate them with `node scripts/generate-share-images.mjs` after an approved artwork change. The versioned path replaces cached previews that used older photography.

The companion API catalogue points to the same final 18, 20 and 21 assets. Its photography update runs once on API startup, without changing prices, variant IDs, stock or already-applied profile copy.

SIYAG 1, 3 and 6 use photographic edits of the approved SIYAG 7 bottle: the cylindrical glass, black domed cap, ivory label and olive typography stay consistent. All four website bottles now share the approved SIYAG 7 honey-gold liquid colour. Each gallery contains the botanical image first, then the plain bottle; Naxos retains only its existing botanical and plain photographs.

Each product has a matching botanical still life and an alpha-transparent original-fragrance cutout for its inspiration panel. Generated with the built-in image generation tool; originals are retained separately and the website serves WebP copies. No pricing or purchasing controls changed.

Confirmed inspirations and note references:

- SIYAG 1: Emporio Armani Stronger With You Intensely. https://www.armanibeauty.sa/en/perfume/mens-perfumes/emporio-armani/emporio-armani-stronger-with-you-intensely/L8717400.html
- SIYAG 3: Nishane Ani (not Ani X). https://nishane.com/product/ani/
- SIYAG 6: Amouage Decision (not Decision 42). https://amouage.com/products/new-decision

Prompt set: preserve the supplied SIYAG 7 photographic bottle and typography; preserve each numeral and change only the liquid to the SIYAG 7 honey-gold reference in the plain and botanical image. For the matching notes image, preserve the corresponding bottle and arrange the verified inspiration's botanicals naturally on ivory limestone. For each original-fragrance cutout, preserve the reference brand's bottle and lettering, remove all backdrop to true alpha, and retain a subtle three-quarter product perspective with dimensional glass and metal highlights. No additional logos, captions, products or unsupported notes.
