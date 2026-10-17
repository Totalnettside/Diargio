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
- Bid decisions use a seller-authorized transactional RPC with pending-only transitions and a buyer chat message; acceptance never records payment or purchase.
- Submit bids through the authenticated database RPC and transactional message trigger; seller notifications and bid dashboards read the same RLS-protected persistent bids, never local browser bids.
- Visual art experiences use normalized 2D placements over room photographs in a shared ArtStage, keeping geometry consistent on all viewport sizes.
- Art walls persist in owner-scoped art_walls with explicit opt-in sharing; room photos stay in private storage readable only by the owner or viewers of a shared wall.
- Exhibitions persist room layouts in art_exhibitions with server-validated admin writes and RLS; public visual-art reads use a publishable server client and polling to hide sold or unavailable listings without exposing purchase details.
- Gallery room geometry and preview pricing are shared across exhibition and placement previews; previews never persist bookings or claim payment until a server-confirmed payment integration exists.
- Scope messaging visual tokens and typography to the messages page; preserve shared chat persistence and read-status logic to avoid redesign changes affecting other pages.
- Use react-image-crop with browser canvas for seller-selected photo crops, retaining the source photo during listing creation so crops can be reset without altering the artwork.
- Keep investor artwork in a separate presentation-only catalog and explicit exhibition search mode; never merge it into listings, commerce, favorites, or user records, so demo content cannot be mistaken for available inventory.
- Scope authentication presentation to `.auth-page` and preserve existing sign-in and signup calls so visual changes cannot alter account access.
