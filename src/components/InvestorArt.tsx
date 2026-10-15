import { useState } from 'react';
import { ArtworkPreview } from '@/components/ArtworkPreview';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { formatPrice, type Artwork } from '@/data/demo';

export function InvestorArtDetails({ artwork }: { artwork: Artwork }) {
  return <>
    <ArtworkPreview image={artwork.image} alt={artwork.title} />
    <p className="mt-4 text-xs font-semibold text-primary">DEMOVERK · AI-GENERERT · IKKE TIL SALGS</p>
    <h3 className="mt-2 font-display text-lg">{artwork.title}</h3>
    <p className="mt-2 text-sm text-muted-foreground">{artwork.category} · {artwork.widthCm} × {artwork.heightCm} cm · Trondheim</p>
    <p className="mt-3 text-sm">Eksempelpris: <strong>{formatPrice(artwork.price)}</strong></p>
  </>;
}

export function InvestorArtCard({ artwork }: { artwork: Artwork }) {
  const [open, setOpen] = useState(false);
  return <article className="min-w-0 overflow-hidden rounded-lg border border-border bg-card">
    <Button variant="ghost" className="block h-auto w-full rounded-none p-0" aria-label={`Se demoverk ${artwork.title}`} onClick={() => setOpen(true)}>
      <ArtworkPreview image={artwork.image} alt={`Demobilde: ${artwork.title}`} />
    </Button>
    <div className="p-3">
      <p className="text-[10px] font-semibold text-primary">DEMOVERK · AI-GENERERT</p>
      <h3 className="mt-1 text-sm font-medium">{artwork.title}</h3>
      <p className="mt-2 text-sm font-semibold">{formatPrice(artwork.price)} <span className="text-[10px] font-normal text-muted-foreground">eksempelpris</span></p>
      <p className="mt-1 text-xs text-muted-foreground">Trondheim · Ikke til salgs</p>
    </div>
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader><DialogTitle>Investorvisning</DialogTitle><DialogDescription>Fiktivt eksempel, ikke en salgsannonse.</DialogDescription></DialogHeader>
        <InvestorArtDetails artwork={artwork} />
      </DialogContent>
    </Dialog>
  </article>;
}