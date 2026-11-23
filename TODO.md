# Oxsnow Studio — project status and next actions

This is an evidence-based snapshot, not a production-readiness claim. Check the current code and deployed configuration before changing status.

## Implemented and verified locally

- [x] Events, Services and Academy routes exist and render locally; the Events page groups the static records by their dates in Lesotho time.
- [x] Admin dashboard and customer account pages and API routes exist.
- [x] Sesotho language controls and translations exist; translation coverage has not been audited.
- [x] `.agents/skills/` and `skills-lock.json` are ignored and are not tracked in the current Git index.

## Implemented, production behavior unverified

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
