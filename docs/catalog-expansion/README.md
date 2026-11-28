# Approved SIYAG catalogue — 28 November 2026

21 sequential numbered perfumes, including the duplicated original entry 4 as its own product. 42 prices in EGP minor units, only 30 and 50 ml. Musk Patchouli is Laverne. SIYAG 20 Satsuma is an original creation.

The storefront displays approved prices and enables commerce. API variant IDs, prices and availability are authoritative; catalogue metadata is merged by stable product ID and size/format. Missing or legacy catalogue data is not marked in stock.

The API imports the embedded approved-catalog.json once on startup after migrations. It retains existing product/variant identities and inventory, renumbers Decision to 7 and Naxos to 8, retires preview products, and enables orders. Subsequent starts preserve staff edits. ApprovedCatalog:Enabled=false disables this import for isolated legacy tests. Deploy the API main branch to apply it to the hosted database. No production database changes have been made from this workspace.

The owner subsequently requested stock for every size. A separate one-time stock/media update raises each of the 42 active 30/50 ml variants to a minimum opening balance of 100 (ApprovedCatalog:OpeningStockPerVariant), retains higher balances and records every increase in StockChanges. Its independent marker supports databases that already ran the original catalogue import. Subsequent restarts never replenish sold units. Deploy the new API main revision to apply it.

All product artwork is bundled locally as WebP. Existing approved 1 and 3 images stay unchanged; the remaining product galleries use one botanical and one plain photograph. Prompts preserve the approved bottle, black dome cap, cream/olive label and golden liquid; change only the number for plain images and add verified note props for botanical images. Images were created with the built-in image tool. Downloaded original-fragrance reference image sources are recorded in image-sources.json.

Official sources: Laverne Musk Patchouli product page; Amouage Decision, Epic Man and Outlands; Chanel BLEU EDP and L’EXCLUSIF; Nishane Ani; Valentino Uomo Born in Roma Intense; Parfums de Marly Althaïr; Louis Vuitton Stellar Times; Clive Christian Blonde Amber; Matière Première Vanilla Powder Extrait; YSL Y EDP; OMANLUXURY Caden; Tom Ford Tobacco Vanille; Xerjoff Erba Pura and Naxos; Arabian Oud Amiri. Feeling notes were cross-checked against Parfumo because primary material was unavailable. Flat published key notes are displayed as key notes, without inventing a top/heart/base pyramid.

Inspired-by images are transparent 3D bottle cutouts. SIYAG 20 Satsuma has no external inspiration because it is an original creation. The exact customer numbering is recorded and tested in customer-order.md. Both the storefront default and the public backend default sort follow this sequence; explicit customer price/newest sorts remain available.
