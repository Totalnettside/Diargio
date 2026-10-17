# Diargio: business-flow audit

## Evidence and boundaries

Reviewed application source, all 13 existing migrations, current public-table policies and constraints, hosted public Auth settings, Stripe sandbox products/accounts/webhook registrations, email-domain status, and signed-out/signed-in browser flows. The initial audit was read-only. Subsequent approved implementation saved/read back the requesting user’s unchanged profile and performed one isolated NOK 7,000 sandbox payment for an existing listing, receipt approval and full sandbox refund. No live purchase or seller transfer was performed.

## Current implementation

- Catalog: six persistent listing rows; listing payloads are editable JSON. The exported ordinary demo catalogs are empty, despite legacy demo definitions remaining in the file. Investor artwork is a separate presentation-only catalog and must stay outside commerce.
- Pricing: seller payout + rounded 20% of payout + conditional rounded 5% of payout including commission. Art fee applies only above a seller payout of NOK 2,000. NOK 2,000 yields NOK 2,400 buyer total; NOK 3,000 yields NOK 3,780. This is not 25% of the buyer total. Shipping has no authoritative payable amount. No fee recalculation should add fees in checkout.
- Auth: hosted settings confirm email/password and Google enabled, anonymous accounts disabled, public signup enabled, email auto-confirm currently enabled. Source supports email signup/sign-in, Google, and sign-out. Confirmation resend, forgotten-password completion, password/email change and account recovery presentation are missing. Redirect allowlists, secure-email-change policy, password security settings and actual mail delivery remain unverified.
- Accounts: profile form saves names, phone, biography, location, website, story, techniques, avatar and studio images. Some upload/update errors are ignored. Broken profile imagery was visible in the signed-in browser check.
- Authorization: admin server functions validate persisted roles before privileged reads/writes. Several private-looking pages are top-level public routes rather than authenticated-layout children. Signed-out `/selg` redirects to auth; `/min-side` remains accessible. This is not by itself evidence of private-data disclosure, but produces inconsistent account UX.
- Bids: persistent authenticated submission and transactional chat delivery; seller decision RPC uses row locking and pending-only transitions. Acceptance correctly does not create a payment. No negotiated-price checkout redemption or inventory reservation exists.
- Messages: persistent, participant-scoped reads and sends, but row-wide update grants permit changing message content and conversation participants.
- Purchases: checkout is a client-side simulation. First click inserts a purchase without charging a card, then advances even on failure. Current purchase count is zero. No immutable amount, currency, financial breakdown, provider payment ID or completion status is stored.
- Payments: Lovable built-in Stripe sandbox is linked. Sandbox products and connected seller accounts are empty. Go-live account claim is in progress; subsequent steps are not started. App and analytics webhook endpoints are registered, but the application handler is absent. Registered sandbox app events use API version `2025-03-31.basil`; new SDK integration must account for payload-version differences rather than assuming a matching dahlia webhook payload.
- Entitlements and renewal: no paid membership/subscription product exists; no recurring billing is intended by current requirements. Art-wall ownership/sharing and published exhibitions are real persisted access rules. Gallery slots are free previews with 7/14/30-day quoted periods, not paid bookings. No automatic renewal is intended.
- Email: the project's current sender domain `diargio.com` is verified. Welcome and seller-notice templates exist. End-to-end delivery and retry/reconciliation remain unverified; client-triggered notices are not reliable payment fulfillment.
- Tests: no executable application tests found. Browser checks produced no runtime errors; current observed build log reports success.

## Prioritized gaps

### Critical: fix before accepting any payments

1. Remove simulated checkout and revoke buyer-controlled purchase creation. Existing policy does not verify listing existence, seller ownership or real payment; forged rows can unlock reviews and hide inventory.
2. Create authoritative orders and integer-minor-unit price/shipping/fee snapshots; validate canonical listing identity, owner, availability and sale type on the server.
3. Enforce one sale per unique artwork through atomic holds, expiration, idempotent checkout requests and payment-confirmed fulfillment. Resolve late settlement and duplicate/out-of-order events safely.
4. Build embedded Stripe checkout through the shared gateway utility, authenticated customer resolution, test-mode notice, verified webhook handler, authorized result lookup, receipts and recoverable payment states. Never trust a return URL or a browser click as proof of payment.
5. Delayed seller transfers require connected seller onboarding, capability checks and a durable ledger. Stripe delayed transfers are not legal escrow; standard automatic platform payouts must not defeat the intended retention policy. Support, timing limits and operating terms need confirmation before real-money rollout.

### Security and account integrity

6. Restrict profile verification/identity linkage to trusted server writes. Current owners can directly update `bankid_verified` and `vipps_sub`. Remove obsolete Vipps callable logic/callback, including its unsafe first-profile collision fallback; do not introduce BankID now or claim verification that has not occurred.
7. Separate public artist profile fields from private phone/identity/account information; current public SELECT exposes all profile columns.
8. Freeze conversation identity columns and allow recipients to update only read status, not message content. Validate seller/listing relationship on conversation creation.
9. Preserve financial/sale history through account deletion and listing edits; current sequential deletion ignores errors, removes counterparties' history, misses walls/storage, and purchase cascades can make sold artwork appear available again. Do not reintroduce self-service deletion UI, previously removed by request.
10. Add reset/recovery, current-password-protected password change and secure email change, with public safe callback and intended-destination handling. Verify hosted settings before changing them; do not silently overwrite them.
11. Await listing publication/edit/deletion before claiming success or navigating; return meaningful failures. Prevent owner spoofing through listing JSON. Filter sold inventory consistently across cards, detail, checkout and exhibitions.

### Completeness and operational truth

12. Snapshot and reconcile paid transactions for admin reports; do not derive historic GMV from editable current listing prices or multiply buyer total by a markup rate. Separate commission, art-fee handling, seller liability, shipping, tax and processor fees.
13. Persist favorites, collections and saved searches per account; browser-local state currently lacks cross-device ownership and can survive account switches. Unify persisted follows with the account overview. Saved-search delivery and fabricated statistics must be replaced by real data or truthful empty states.
14. Add real order history, shipping status, buyer receipt approval, admin disputes/refunds and payout statuses. Define shipping, accepted-bid totals, nonresponse and refund policy before charging customers.
15. Auction and price-on-request sale modes lack authoritative settlement logic. Either explicitly defer them with honest UI or implement their distinct purchase rules; never silently treat them as fixed-price purchases.
16. If gallery sales are activated: persist price versions, Oslo-timezone periods, slot holds, overlap constraints, paid activation/expiry, replacement, extensions, receipts, cancellation/refunds and admin calendar. Keep physical artwork and placement purchases separate, with no automatic renewal.

## Preview test plan for the eventual implementation

Use a real buyer account and a different real seller account, with an explicitly designated real listing. Do not add demo users or inventory or mutate production sale records to simulate tests; sandbox orders must be isolated from live availability/reporting.

1. Account: sign up, receive any required confirmation, sign in via email and Google, reset a forgotten password, change permitted account fields, reload and read back. Confirm signed-out/non-admin restrictions and rejected verification spoofing.
2. Price: seller payout NOK 2,000 -> commission NOK 400, art fee NOK 0, total NOK 2,400. Seller payout NOK 3,000 -> commission NOK 600, art fee NOK 180, total NOK 3,780. Confirm the same total on card/detail/checkout plus shipping separately.
3. Payment: in the preview test banner, use `4242 4242 4242 4242`, a future expiry such as `12/30`, and any three-digit CVC. Never use a real card. Confirm a single payment, authoritative order read-back and no live sale or automatic seller transfer.
4. Failure: use `4000 0000 0000 0002` for decline; order stays unpaid, inventory/slot hold expires, no receipt or sale entitlement. Use `4000 0025 0000 3155` for authentication. Retry, reload and double-click must not create duplicate charges or fulfillment.
5. Delivery: seller records shipping, buyer alone approves receipt, admin handles a dispute; payout cannot occur before approval and eligible seller-account checks. Verify refund/transfer failures remain actionable.
6. Reliability: automated tests for concurrent buyers, altered client totals, accepted-bid authorization, duplicate/out-of-order webhooks, reservation expiry/late payment, wrong environment, unauthorized account changes and deletion history retention.
7. Gallery if enabled: paid activation, overlap rejection, canceled/failed payment release, exact expiry, explicit extension and full pre-start refund. No auto-renewal.

## Outstanding decisions/blockers

Await owner choices on rollout scope, shipping, how to handle buyer nonresponse/disputes and whether delayed-transfer connected-account setup satisfies the intended retention model. Live activation remains an owner onboarding task. Norwegian VAT/art-fee classification and allocation require qualified confirmation; physical art cannot use full digital-product compliance handling. Automatic tax calculation/collection, if applicable, adds 0.5% processor cost and does not file/remit taxes for Diargio.

## Implemented and verified after approval

- Simulated purchases disabled; browser writes to purchases rejected. Profile phone reads and BankID writes rejected for authenticated browser callers. Message/conversation update grants narrowed.
- Private profile owner read; authenticated layouts for account/messages/notifications/edit/admin; obsolete Vipps endpoints disabled.
- Recovery/reset and current-password-protected email/password changes; safe intended-destination handling. Unchanged profile save/read-back verified; recovery page rendered. Email delivery and complete Google/recovery email round trips remain unverified.
- Seller-defined shipping or eligible pickup; publication/edit/delete awaited. Server trigger validates owner and recalculates entered payout prices using agreed rules.
- Owner-scoped favorites/collections/saved searches and persistent follows. Invented account graph removed; legacy sales excluded from confirmed financial revenue.
- Embedded gateway Stripe checkout, immutable authoritative order snapshot, accepted-bid and listing-version validation under lock, verified payment matching, event retry leases, refund/dispute reconciliation and one live sale per artwork.
- Order view, buyer-only approval, seller shipping, full admin refund, receipt retrieval and reservation cancellation. Test orders do not create live purchases. Auctions and gallery bookings remain unavailable.
- 15 unit tests passed. Browser: authenticated safety checks, profile roundtrip, Stripe card form, NOK 7,000 test charge, paid order readback, receipt approval and full refund verified; no app runtime errors during verified flows.
- Seller-account onboarding attempted through managed gateway: Stripe refuses account creation because the sandbox is unclaimed and Connect is not enabled. No seller account or transfer was created.

## Exact preview checklist

1. Use two existing real accounts, buyer and seller. Open a real listing whose seller is different from buyer. Seller must specify shipping, or buyer selects pickup when offered.
2. Open secure card payment in the preview; select NOK if Stripe offers currency conversion. Use `4242 4242 4242 4242`, `12/30`, CVC `123`, and a cardholder name. Never use a real card.
3. Open **Ordre og oppgjør**, choose **Kontroller betaling**, and confirm **Betalt · venter på levering**. Reload: same order and amount. Test order must not mark the real artwork sold.
4. Seller registers delivery; buyer approves receipt or opens a dispute. Approval must show payout waiting, never a claimed seller transfer. Admin may refund the entire test amount; confirm **Refundert** after reload.
5. Retry with decline card `4000 0000 0000 0002` and authentication card `4000 0025 0000 3155`. These two cases are provided for owner testing, not yet browser-certified. Unpaid reservation may be canceled; uncertain payment must be checked, not assumed failed.
6. Test profile save/reload, wrong-current-password rejection, recovery email link and email-change confirmation. Do not test account deletion on accounts with trade/message history; it is deliberately blocked.

## Remaining launch gates

- Owner completes Payments claim/activation; Stripe Connect onboarding and gateway transfer capability must then be verified. Actual transfers, transfer reversals and bank payout timings are not enabled.
- Qualified Norwegian VAT/art-levy classification, recipient, fee VAT and invoice wording; agreed UI fee model is implemented but is not legal advice. Live checkout remains explicitly disabled.
- Platform balance retention/liquidity and maximum holding periods require confirmation with Stripe; this is not escrow and no automatic release exists.
- Hosted recovery/email-change redirects and actual recovery/receipt-email delivery remain to be certified. Existing welcome/bid templates are not a durable payment-email outbox.
- Scheduled reconciliation, payment expiry concurrency stress tests, orphan-session recovery and fully private internal audit notes need final operational review before live launch. Current ambiguous reservations stay blocked rather than being released blindly.
- Gallery booking, renewals, subscriptions, BankID and newsletter delivery remain deferred/unavailable by scope; no paid entitlements are falsely granted.
