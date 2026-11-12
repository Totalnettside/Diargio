<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Reuse ArtworkPreview for marketplace cards; display the complete original uploaded image without composited scenes or frames.
- Format public listing seller labels through the shared seller-name helper; keep stored profile names and artist attribution unchanged.
- Bid decisions use a seller-authorized transactional RPC with pending-only transitions and a buyer chat message; acceptance never records payment or purchase.
- Submit bids through the authenticated database RPC and transactional message trigger; seller notifications and bid dashboards read the same RLS-protected persistent bids, never local browser bids.
- Visual art experiences use normalized 2D placements over room photographs in a shared ArtStage, keeping geometry consistent on all viewport sizes.
- Art wall custom colors use validated six-digit hex values in the existing layout and a scoped CSS variable in ArtStage; the color wheel uses a shared color library so saved and shared walls retain the same color.
- Art walls persist in owner-scoped art_walls with explicit opt-in sharing; room photos stay in private storage readable only by the owner or viewers of a shared wall.
- Exhibitions persist room layouts in art_exhibitions with server-validated admin writes and RLS; public visual-art reads use a publishable server client and polling to hide sold or unavailable listings without exposing purchase details.
- Gallery room geometry and preview pricing are shared across exhibition and placement previews; previews never persist bookings or claim payment until a server-confirmed payment integration exists.
- Resolve gallery placement prices by room and duration, never slot tier, through the shared gallery pricing helper.
- Navigate from exhibition slots through TanStack Router, preserving the document and shared query cache to avoid full-page reloads.
- Scope messaging visual tokens and typography to the messages page; preserve shared chat persistence and read-status logic to avoid redesign changes affecting other pages.
- Use react-image-crop with browser canvas for seller-selected photo crops, retaining the source photo during listing creation so crops can be reset without altering the artwork.
- Keep fixed homepage illustrations in a separate presentation-only module without seller IDs or listing links; public inventory and exhibitions use approved user listings only, so decorative art cannot enter commerce.
- Scope authentication presentation to `.auth-page` and preserve existing sign-in and signup calls so visual changes cannot alter account access.
- Keep homepage gallery scenery in non-interactive CSS background pseudo-elements scoped to the welcome field; this preserves content geometry and independent artwork animation.
- Keep homepage text and artwork in separate minmax grid columns and switch the top navigation before it collides; reference styling must not change artwork links or commerce behavior.
- Centralize the reference header dimensions and outer page gutters in shared shell CSS; preserve narrow form widths and normalized art-stage geometry so every route shares the same responsive frame.
- Payments go through Lovable's built-in payments using the shared gateway utility; checkout charges the listing total the buyer already sees (fees included) plus shipping as its own line, and never recomputes commission or the art fee in the cart — seller payouts wait for connected artist accounts.

- Use immutable art_orders and server-confirmed Stripe state for trade status; sandbox orders never create live purchase records, so preview tests cannot sell real inventory.
- Keep account, messages, notifications, editing and admin views under the authenticated pathless layout; enforce roles in server functions because navigation guards are not authorization.
- Store libraries by authenticated owner in account_library; do not restore cross-account browser favorites or bids.
- Validate listing versions and accepted bids within the reservation lock; release uncertain reservations only after Stripe reconciliation to avoid charged-but-unfulfilled purchases.
- Serialize refund claims and use leased payment events with retryable processing; every lifecycle side effect must be idempotent.
- Preserve trade and conversation history by blocking destructive account deletion when counterparties have records; do not recreate self-service deletion.
- Route payment account creation and status through the shared gateway, with live checkout and transfers blocked until operational and legal requirements are approved.
- Listing moderation uses immutable reviewed revisions, locked owner/admin RPC transitions and a separate public approved snapshot; RLS and trade triggers prevent unreviewed content from entering commerce.
- Catalog reads use the generated lightweight image-URL projection; original image data remains unchanged, and moderation loads revisions by selected status to avoid repeatedly transferring reviewed photos.
- Review events persist decisions and single-recipient email outcomes with managed API idempotency keys; internal notes and private storage documentation remain separate from seller-facing messages.
- Use one ActionDialogs provider for consequential confirmations and typed input, with locked submissions and safe errors; never invoke browser alert, confirm or prompt.
- Archive listings through the locked owner/admin visibility RPC; deleted and blocked listings cannot enter commerce, and referenced files remain intact for reviewed and financial history.
- Store profile restrictions and administrative action history separately from editable profiles; enforce blocking in publication, trade, messaging and upload rules, exposing only seller-safe notices.
- Keep authentication emails in the managed signed auth-email handler and bypass document rewriting for /lovable/ routes so verification links and email previews remain intact.
