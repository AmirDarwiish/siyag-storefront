# Approved SIYAG catalogue — 28 November 2026

21 sequential numbered perfumes, including the duplicated original entry 4 as its own product. 42 prices in EGP minor units, only 30 and 50 ml. Musk Patchouli is Laverne. SIYAG 20 Satsuma is an original creation.

The storefront displays approved prices and enables commerce. API variant IDs, prices and availability are authoritative; catalogue metadata is merged by stable product ID and size/format. Missing or legacy catalogue data is not marked in stock.

The API imports the embedded approved-catalog.json once on startup after migrations. It retains existing product/variant identities and inventory, renumbers Decision to 7 and Naxos to 8, retires preview products, and enables orders. Subsequent starts preserve staff edits. ApprovedCatalog:Enabled=false disables this import for isolated legacy tests. Deploy the API main branch to apply it to the hosted database. No production database changes have been made from this workspace.

New sizes/products begin with zero stock because the owner did not supply inventory quantities. Set their actual balances in the inventory dashboard before accepting orders for them. Existing Naxos 50 ml stock is preserved.

All product artwork is bundled locally as WebP. Existing approved 1 and 3 images stay unchanged; the remaining product galleries use one botanical and one plain photograph. Prompts preserve the approved bottle, black dome cap, cream/olive label and golden liquid; change only the number for plain images and add verified note props for botanical images. Images were created with the built-in image tool. Downloaded original-fragrance reference image sources are recorded in image-sources.json.

Official sources: Laverne Musk Patchouli product page; Amouage Decision, Epic Man and Outlands; Chanel BLEU EDP and L’EXCLUSIF; Nishane Ani; Valentino Uomo Born in Roma Intense; Parfums de Marly Althaïr; Louis Vuitton Stellar Times; Clive Christian Blonde Amber; Matière Première Vanilla Powder Extrait; YSL Y EDP; OMANLUXURY Caden; Tom Ford Tobacco Vanille; Xerjoff Erba Pura and Naxos; Arabian Oud Amiri. Feeling notes were cross-checked against Parfumo because primary material was unavailable. Flat published key notes are displayed as key notes, without inventing a top/heart/base pyramid.
