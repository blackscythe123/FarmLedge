# FarmLedge – Work Log (2025-12-09)

## What changed today
- Navigation: Added a single **Services** dropdown that contains `Weather Alerts` and `Government Schemes`; removed overlapping standalone links.
- Home page: Removed the inline Weather Alert section; weather remains accessible via navigation.
- Government Schemes page: Subscriptions now send the authenticated farmer address to the backend when enabling alerts.
- Scheme subscriptions backend:
  - Added Mongo-backed model `server/src/models/schemeSubscription.js` with fallback to in-memory when `MONGODB_URI` is missing.
  - Updated endpoints `/api/schemes`, `/api/schemes/subscriptions`, `/api/schemes/subscribe`, `/api/schemes/notify-test` to use the DB and accept `farmerAddress`.
- Expiry cron improvements (`/api/cron/check-expiry`):
  - Checks 30/14/7/1-day windows instead of only 24h before expiry.
  - Only alerts if the batch is still farmer-owned.
  - Looks up farmer phone/language via scheme subscriptions; skips if no phone.
  - Webhook payload now includes phone, language, windowDays, scheme recommendations (id/name/summary/applyUrl/docs), and a clearer message.
- Zero-loss crop guides:
  - Added `CropGuide` model + service (`server/src/models/cropGuide.js`, `server/src/services/cropGuidesService.js`).
  - API endpoints: `GET /api/crop-guides` (list) and `GET /api/crop-guides/:name` (case-insensitive lookup).
  - Seed script `server/scripts/seedCropGuides.js` reads `server/data/crop_guides.json` (now populated with Tomato, Potato, Onion, Paddy, Wheat, Mango, Banana, Cauliflower, Green Chili, Pomegranate, Turmeric) and upserts into Mongo.
  - Frontend farmer dashboard: new page `/farmer/guides` (ProtectedRoute `farmer`) shows searchable crop list and detailed zero-loss guidance (handling, processing options, alternate markets, shelf-life, recommendations, MNREGA potential). Navigation: account dropdown when logged in as farmer.
- Awareness resources (CFTRI/KVK style):
  - New model `server/src/models/awarenessResource.js`, service `server/src/services/awarenessService.js`, seed script `server/scripts/seedAwarenessResources.js` (sample Tomato/Mango/Onion CFTRI-style links).
  - API: `GET /api/awareness?crop=&scope=&scheme=` returns filtered resources.
- Batch zero-loss actions:
  - Endpoint `GET /api/batch/:id/zero-loss` combines on-chain batch, crop guide, and awareness resources to produce options (flash/processing/alternates/MNREGA) with urgency based on expiry.
  - Frontend: `ZeroLossPanel` embedded in `BatchDetails` showing urgency badge, options, and related awareness links.

## How to run/verify
1) Set env in `server/.env`: `MONGODB_URI`, optional `DB_NAME`, and `N8N_WEBHOOK_SECRET` (your WhatsApp/n8n webhook URL). Restart the server.
2) Create a subscription (frontend Schemes page or `POST /api/schemes/subscribe` with `{ phone, language, farmerAddress, schemeIds }`).
3) Ensure batches have meaningful `expiryDate` and are farmer-owned.
4) Trigger cron manually: `POST http://localhost:3001/api/cron/check-expiry` (or `/api/cron/check-expire`). Check server logs for `[cron]` and `[WHATSAPP]`; your webhook should receive the enriched payload.
5) Seed zero-loss guides: from `server/` run `node ./scripts/seedCropGuides.js` (uses `MONGODB_URI` and optional `CROP_GUIDE_FILE`), then query `GET /api/crop-guides` to confirm records exist.
6) Seed awareness resources: from `server/` run `node ./scripts/seedAwarenessResources.js` (uses `MONGODB_URI`).
7) Zero-loss panel: start backend (`npm run server:dev`) and frontend (`npm run dev`), open `/batch?id=...` to view the ZeroLossPanel (needs expiryDate on batch to compute urgency).
6) Frontend zero-loss: start dev (`npm run dev`) and login as farmer, open `/farmer/guides` or use the account dropdown link to view guides.

## Known gaps / next actions
- Scheduler: Set a real cron/n8n/uptime job to hit `/api/cron/check-expiry` daily.
- Outbound delivery: Confirm the WhatsApp/SMS sender via your n8n flow; currently just posts to `N8N_WEBHOOK_SECRET`.
- Persistence fallback: Without `MONGODB_URI`, subscriptions reset on restart. Configure Mongo to keep phone/address mappings.
- Data quality: Ensure batches carry correct `expiryDate` on registration; otherwise no reminders fire.
- Testing: No automated tests were run for these changes; consider adding API smoke tests for cron + subscriptions.
- Frontend: Zero-loss guides are not yet surfaced; add UI/query hook to consume the new endpoints.
 - Frontend coverage improved: `/farmer/guides` now surfaces the guides; consider adding quick actions (e.g., copy handling steps, share to WhatsApp) and translations.
- Awareness/zero-loss: Batch detail page now shows ZeroLossPanel; awareness resources still sample—replace with real CSIR/CFTRI URLs. Add scheme-scoped awareness links if needed.

## Changed files (key ones)
- `src/components/Navigation.tsx`
- `src/pages/Index.tsx`
- `src/pages/GovSchemes.tsx`
- `server/src/services/schemesService.js`
- `server/src/models/schemeSubscription.js` (new)
- `server/src/index.js`
- `server/data/crop_guides.json`
- `server/src/models/cropGuide.js`
- `server/src/services/cropGuidesService.js`
- `server/scripts/seedCropGuides.js`
- `src/pages/FarmerGuides.tsx`
- `server/src/models/awarenessResource.js`
- `server/src/services/awarenessService.js`
- `server/scripts/seedAwarenessResources.js`
- `src/components/ZeroLossPanel.tsx`
- `src/pages/BatchDetails.tsx`
