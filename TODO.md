# TODO — Tomorrow (20–21 Oct 2026)

## 1. M-Pesa → real payments (BLOCKED ON YOU, not code)
- [ ] Call Vodacom Lesotho (call centre / premises) → request the **electronic business application form**
      Say: **"online website checkout / customer online shopping API"** — NOT a normal merchant till
- [ ] Submit KYC docs → they issue org account + **shortcode** + bank link
- [ ] Register at https://openapiportal.m-pesa.com/ → select product → wait for product match approval
- [ ] Sandbox end-to-end test (payment, query, refund, reconciliation)
- [ ] Submit Go Live review
- [ ] Then: paste credentials into Vercel → `MPESA_BASE_URL`, `MPESA_SHORTCODE`, `MPESA_API_KEY`,
      `MPESA_PUBLIC_KEY`, `MPESA_CALLBACK_URL` (exact names confirmed from portal docs)
- [ ] Then: OpenCode fills the two `TODO(provider)` blocks in `src/lib/payments/mpesa.js`
      with the official request schemas — NO other code changes needed

## 2. EcoCash square (already in UI, disabled)
- [ ] Same onboarding process with Econet → enable second payment square in
      `src/components/watch/WatchModal.jsx` CheckoutPanel

## 3. Remaining site features (from WEBSITE_PROMPT.txt)
- [ ] `/events` page
- [ ] `/services` page
- [ ] `/academy` page
- [ ] Admin dashboard (orders view exists in DB; UI not built)
- [ ] Customer auth (payments currently keyed to device key `oxsnow-buyer-uid`)
- [ ] Sesotho / i18n
- [ ] Contact form: set `GMAIL_APP_PASSWORD` in Vercel (Gmail app password, 2FA on)
- [ ] VOD: add full films from `C:\Users\User\Documents\website\movies`
      (currently ALL `movie: null` — nothing to unlock after payment yet!)

## 4. Cleanup
- [ ] Remove `.agents/skills/` + `skills-lock.json` from git (accidentally committed in `796e4ae`),
      add to `.gitignore`
- [ ] Lint: 4 pre-existing `react-hooks/set-state-in-effect` errors (Footer.jsx, WatchModal.jsx)
      — cosmetic, doesn't block builds
