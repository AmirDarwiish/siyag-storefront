# Community impressions and mobile refinement

Replaces family-derived seasonal guidance with real community choices: multiple seasons, day/night, perceived catalog notes and an optional 1–5 rating. Catalog composition remains owned by the store; customer note recognition does not rewrite the formula.

Votes use an independent opaque browser key, hashed in the API database. The composite product/key primary key ensures one editable record per product/key; PUT replaces choices and DELETE removes that record. No login, name, phone, email or analytics consent is needed for this explicit feature. Clearing browser storage loses the edit key; this is not verified-buyer voting or a fraud-resistant identity system.

GET/PUT/DELETE `/api/v1/store/products/{slug}/impressions` return aggregate counts and, when the anonymous key is supplied, that browser’s selection. Exact catalog note names and known season/time keys are validated. Public counts are computed from persisted votes, not editorial guidance or local selection state. No fabricated starter ratings.

Deployment: merge both repositories. The API host must deploy its new commit so startup applies the SQL Server `AddScentImpressionsSqlServer` migration. The existing Vercel Git integration deploys the storefront; no manual Vercel deployment is needed. Until the API is deployed, users can select but receive an explicit not-saved/unavailable message. Preview permits trying controls but disables public submission.

UI: open sections instead of rounded cards, fine rules, flatter buttons, quieter ivory/ink contrast, a compact image-led bag notice and explicit close/continue actions. Reference review includes the retail examples on ilham.io; no reference markup, photography or customer data is copied.

Validation: production Next build and .NET Release build pass; the full API suite passes, including new vote persistence, replacement, note/rating validation, private selection isolation, aggregate averages and removal. Browser preview checks cover multi-select seasons, notes, evening choice, rating, new add-to-bag feedback and mobile RTL.
