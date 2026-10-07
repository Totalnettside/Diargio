import { Link } from '@tanstack/react-router';
import { Heart, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { artistFor, formatPrice, type Artwork } from '@/data/demo';
import { useStore } from '@/lib/store';

export function ArtDetails({ artwork, onClose, children }: { artwork: Artwork; onClose: () => void; children?: React.ReactNode }) {
  const { isFavorite, toggleFavorite } = useStore();
  return <aside className="visual-details" aria-label="Valgt kunstverk">
    <Button variant="ghost" size="icon" className="absolute right-2 top-2" aria-label="Lukk kunstinformasjon" onClick={onClose}><X /></Button>
    <img src={artwork.image} alt={artwork.title} className="mx-auto mb-4 max-h-48 w-full object-contain" />
    <h2 className="font-display text-xl font-medium">{artwork.title}</h2>
    <p className="mt-1 text-sm text-muted-foreground">{artistFor(artwork).name}</p>
    <p className="mt-4 text-2xl font-semibold">{formatPrice(artwork.price)}</p>
    <p className="mt-1 text-xs text-muted-foreground">Totalpris inkl. provisjon og eventuell kunstavgift</p>
    <p className="mt-1 text-xs text-muted-foreground">Frakt avtales separat før betaling.</p>
    <Button asChild className="mt-4 w-full"><Link to="/kunst/$slug" params={{ slug: artwork.slug }}>Se kunstverket <ArrowRight /></Link></Button>
    <Button variant="outline" className="mt-2 w-full" onClick={() => toggleFavorite(artwork.id)}><Heart className={isFavorite(artwork.id) ? 'fill-primary' : ''} />{isFavorite(artwork.id) ? 'Lagret som favoritt' : 'Lagre favoritt'}</Button>
    <dl className="mt-4 space-y-2 border-t border-border pt-4 text-xs">
      <div><dt className="text-muted-foreground">Verkstørrelse</dt><dd>{artwork.widthCm > 0 && artwork.heightCm > 0 ? `${artwork.widthCm} × ${artwork.heightCm} cm` : 'Mål ikke oppgitt'}</dd></div>
      <div><dt className="text-muted-foreground">Teknikk</dt><dd>{artwork.technique || 'Ikke oppgitt'}</dd></div>
      <div><dt className="text-muted-foreground">Selger</dt><dd><Link to="/selger/$id" params={{ id: artwork.sellerId }} className="underline underline-offset-2">Se profil</Link></dd></div>
    </dl>
    {children}
  </aside>;
}