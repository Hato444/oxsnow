# Oxsnow Studio — project status and next actions

## 2026-11-23 — Sony ZV-E10 hire redesign (in progress)

- [x] Compared the live `/hire` page with the local repository. Both lacked the requested Sony ZV-E10 packages; the live page displayed the earlier demo inventory. Existing local catalogue edits concern image filenames and must be preserved.
- [x] Inspected `C:\Users\User\Downloads\oxsnow-equipment-kit.zip` and copied the supplied Sony image into `public/equipment/sony-zve10.webp`. The supplied package contains no photograph establishing the exact support/rig model.
- [ ] Finish and verify the two requested package options: camera only M600/day and Ready-to-Shoot kit M850/day. Studio must confirm physical availability, deposit and exact support/rig details; do not describe the unknown support as a confirmed gimbal or stabilizer.
- [ ] Finish the booking and checkout UI and backend integration. Work has begun to accept only the Sony packages as pending requests and reject other inventory and stale-cart requests; this is **not yet verified**. Check existing booking creation, staff approval, shared-camera conflicts, pricing and confirmation emails end to end. Do not invent stock counts or a confirmed deposit.
- [ ] Finish the hire catalogue/detail pages and homepage showcase, normalize equipment image stages, and remove misleading demo-stock/availability claims. Preserve all existing equipment records and historical prices.
- [ ] Review the change to catalogue synchronization in `src/lib/db.js`: it has been adjusted to avoid overwriting existing records or archiving legacy equipment. Verify the migration behavior with an isolated test database before release; do not assume the local database is isolated from production.
- [ ] Run the build, relevant tests and desktop/mobile browser checks. Inspect the working tree and preserve pre-existing changes in `src/lib/hire/catalogue.mjs`, `src/components/VideoPlayer.jsx`, `src/components/watch/WatchModal.jsx`, and untracked equipment images.
- [ ] Do not commit, push or deploy the Sony redesign until the user approves. The current work is incomplete and may not compile until the remaining integration is finished.

This is an evidence-based snapshot, not a production-readiness claim. Check the current code and deployed configuration before changing status.

### 2026-11-24 — local continuation

- Sony package request UI, rental estimates, server-side request policy, shared-camera approval conflict checks and pending-request emails have been revised. The deposit remains subject to studio confirmation; existing booking records and catalogue data are retained.
- `npm test` passes 12 tests, including Sony request-policy and pricing checks. `npm run build` passed before the final small follow-up edits. Targeted ESLint passed with image warnings; full lint timed out.
- Still required: verify booking creation, staff approvals and emails end to end using an isolated test database; test catalogue migration there; perform desktop/mobile browser checks. Docker and `psql` were not available in the current environment. Do not use the configured database for destructive testing without confirming its isolation.

## Implemented and verified locally

- [x] Events, Services and Academy routes exist and render locally; the Events page groups the static records by their dates in Lesotho time.
- [x] Admin dashboard and customer account pages and API routes exist.
- [x] Sesotho language controls and translations exist; translation coverage has not been audited.
- [x] `.agents/skills/` and `skills-lock.json` are ignored and are not tracked in the current Git index.

## Implemented, production behavior unverified

### 2026-11-24 — Academy interface continuation

- Reworked the Academy hero, discipline selector and guided application. The selected discipline is shared with the existing application payload. The API now returns an error when database persistence fails instead of reporting a successful submission.
- The Academy admin API reads `academy_applications`, but actual persistence and admin visibility have not been tested against an isolated database. The existing duration, intake, sponsorship and on-set/screen-credit claims require studio confirmation. Production-specific behind-the-scenes and discipline imagery still need verification; the interface currently uses existing community photography and film posters.
- Desktop and mobile-sized headless browser screenshots were captured for the hero; interaction, reduced motion and full application submission remain to be checked in a browser. The Sony rotation MP4 was not found under the supplied filename; no substitute video was added.

### 2026-11-24 — VOD credit implementation in progress

- Added separate account-based credit grants, 30-day pass grants, playback-session history, resume positions and a private-Blob media proxy. Legacy records and transaction amounts are retained. Legacy film access is recognized for the owning account; legacy passes are interpreted as valid for 30 days from their original paid timestamp. Device-key migration still needs review.
- Added a development-only payment simulator restricted to an explicitly configured loopback test database. See `docs/VOD-CREDITS-IMPLEMENTATION.md` for setup and session rules. Real sales remain disabled pending provider integration.
- `npm test` passes 15 tests, including three VOD tests using an in-memory PostgreSQL emulator: simulated success/failure, two credits, idempotent grant, resume position, repeat viewing, pass precedence/expiry and legacy film access. This does not verify real PostgreSQL locks or actual browser/media playback.
- `npm run build` passed during this implementation; focused ESLint reported image warnings and no errors. Still required: real isolated PostgreSQL concurrency/migration tests, private Blob delivery and actual full-film playback, desktop/mobile checks, provider verification and reconciliation. Progressive media and client playback events do not provide DRM-grade enforcement.

- [ ] Test the deployed Academy application flow end to end, including persistence and email delivery.
- [ ] Verify customer registration, login and account recovery requirements in the deployed environment. The film-payment code still uses a device buyer key.
- [ ] Verify deployed contact and Academy email delivery and whether the required Gmail configuration is present. Do not put secret values in this file.
- [ ] Verify deployed newsletter storage and connect an approved email delivery provider if the studio wants to send dispatches.
- [ ] Review all Sesotho translations and missing coverage with a fluent reviewer.

## Partially implemented / external dependencies

- [ ] **M-PESA:** complete Vodacom Lesotho's online checkout onboarding, obtain the approved API specifications and credentials, implement the provider TODOs in `src/lib/payments/mpesa.js`, and verify sandbox payment, status, callback and reconciliation before seeking go-live approval. Existing simulated payment behavior is not proof of real payment processing.
- [ ] **EcoCash:** complete provider onboarding and implement and test the actual integration. The checkout can display the option, but it is not available for payment.
- [ ] **Events:** current event actions lead to the contact form; no event-specific reservations, capacity tracking, ticket payment or booking confirmations were found. Decide on a booking backend and confirm actual event data before offering live availability.
- [ ] **Films:** the static catalogue has `movie: null` entries. Confirm whether full films exist in an approved external source and verify the entitlement and streaming flow before claiming paid playback works.
- [ ] **Donations:** the support panel states online donations are coming soon; it does not process payments.

## Verification and maintenance

- [ ] Run the full lint suite and resolve any current errors; older notes about four specific hook errors may be outdated.
- [ ] Confirm whether event dates, venues, prices and listed capacities are current with the studio. Past entries are retained in the archive; no availability is tracked online.
- [ ] Confirm deployed email, payment and full-film status with the appropriate service owners; local code and a successful build do not verify production.
