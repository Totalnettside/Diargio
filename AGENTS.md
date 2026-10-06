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
