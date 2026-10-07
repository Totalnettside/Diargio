import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArtStage } from '@/components/visual/ArtStage';
import { GallerySlots } from '@/components/visual/GallerySlots';
import { VisualError } from '@/components/visual/VisualError';
import { useAuth } from '@/hooks/useAuth';
import { useStore } from '@/lib/store';
import { visualArtOptions } from '@/lib/visual-art-query';
import { visualHead } from '@/lib/visual-art';
import { GALLERY_ASPECT, GALLERY_ROOMS, GALLERY_TIERS, GALLERY_PREVIEW_PRICES, WALL_CATEGORIES, fitGalleryArt } from '@/lib/gallery-rooms';
import { formatPrice } from '@/data/demo';

export const Route = createFileRoute('/galleriplass')({
  validateSearch: (s: Record<string, unknown>): { room?: number; slot?: string } => ({ room: Number(s['room']) === 3 ? 3 : 2, ...(typeof s['slot'] === 'string' ? { slot: s['slot'] } : {}) }),
  loader: ({ context }) => context.queryClient.ensureQueryData(visualArtOptions()),
  head: () => visualHead('Still ut i galleriet', 'Velg en veggplass i Diargios digitale galleri og forhåndsvis ditt eget kunstverk.'),
  component: GalleryPreview, errorComponent: VisualError, notFoundComponent: VisualError,
});

function localDate() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }
function GalleryPreview() {
  const search = Route.useSearch();
  const { data } = useSuspenseQuery(visualArtOptions());
  const { user, loading } = useAuth();
  const { myListings } = useStore();
  const [roomNumber, setRoomNumber] = useState(search.room ?? 2);
  const [slotId, setSlotId] = useState(search.slot ?? '');
  const [artId, setArtId] = useState('');
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const [start, setStart] = useState(localDate);
  const room = GALLERY_ROOMS[roomNumber - 1];
  if (!room) return <VisualError />;
  const slot = room.slots.find((s) => s.id === slotId);
  const ownArt = data.artworks.filter((a) => WALL_CATEGORIES.has(a.category) && myListings.some((mine) => mine.id === a.id));
  const art = ownArt.find((a) => a.id === artId);
  const placement = art && slot ? fitGalleryArt(slot, art.widthCm && art.heightCm ? art.widthCm / art.heightCm : 1, art.id) : null;
  const end = new Date(`${start}T12:00:00`);
  end.setDate(end.getDate() + days);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(start) && start >= localDate() && Number.isFinite(end.getTime());
  const dateText = (date: Date) => date.toLocaleDateString('nb-NO', { day: 'numeric', month: 'long', year: 'numeric' });

  return <main className="visual-page">
    <header className="visual-page-heading"><div><Button asChild variant="link" className="mb-2 px-0"><Link to="/utstillinger"><ArrowLeft />Til galleriet</Link></Button><h1 className="text-2xl font-medium">Gi kunsten din en plass i Diargios digitale galleri</h1><p className="mt-2 text-sm text-muted-foreground">Velg veggplass og periode. La besøkende oppdage kunsten din og kjøpe direkte gjennom Diargio.</p></div></header>
    <div className="gallery-preview-layout">
      <section className="min-w-0">
        <ArtStage background={room.image} aspect={GALLERY_ASPECT} placements={placement ? [placement] : []} artworks={ownArt} selected={null} onSelect={() => {}}>
          <GallerySlots slots={room.slots.filter((s) => !placement || s.id !== placement.id)} selected={slotId} onSelect={(s) => setSlotId(s.id)} />
        </ArtStage>
        <div className="border-b border-border px-5 py-4"><h2 className="font-medium">Rom {roomNumber} — {room.name}</h2><p className="mt-1 text-sm text-muted-foreground">Gratis forhåndsvisning · Ingen plass er reservert</p><div className="mt-3 flex flex-wrap gap-2">{room.slots.map((s, i) => <Button key={s.id} variant={s.id === slotId ? 'default' : 'outline'} onClick={() => setSlotId(s.id)}>Plass {i + 1} · Ledig</Button>)}</div></div>
      </section>
      <section className="space-y-5 p-5">
        <h2 className="text-lg font-medium">Din galleriplass</h2>
        {loading ? <p role="status" className="text-sm text-muted-foreground">Henter dine kunstverk …</p> : !user ? <Button asChild variant="outline"><Link to="/auth">Logg inn for å velge eget kunstverk</Link></Button> : !ownArt.length ? <div><p className="text-sm text-muted-foreground">Du har ingen tilgjengelige veggverk.</p><Button asChild variant="link" className="px-0"><Link to="/selg">Legg ut kunst</Link></Button></div> : <label className="visual-label">Kunstverk<Select value={artId} onValueChange={setArtId}><SelectTrigger aria-label="Kunstverk"><SelectValue placeholder="Velg ditt kunstverk" /></SelectTrigger><SelectContent>{ownArt.map((a) => <SelectItem key={a.id} value={a.id}>{a.title}</SelectItem>)}</SelectContent></Select></label>}
        <label className="visual-label">Gallerirom<Select value={String(roomNumber)} onValueChange={(v) => { setRoomNumber(Number(v)); setSlotId(''); }}><SelectTrigger aria-label="Gallerirom"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="2">Rom 2 — Stille rom</SelectItem><SelectItem value="3">Rom 3 — Den lange gangen</SelectItem></SelectContent></Select></label>
        <label className="visual-label">Veggplass<Select value={slotId} onValueChange={setSlotId}><SelectTrigger aria-label="Veggplass"><SelectValue placeholder="Velg en ledig plass" /></SelectTrigger><SelectContent>{room.slots.map((s, i) => <SelectItem key={s.id} value={s.id}>Plass {i + 1} — {GALLERY_TIERS[s.tier]}</SelectItem>)}</SelectContent></Select></label>
        {slot && <p className="text-sm text-muted-foreground">{slot.tier === 'entrance' ? 'Nær inngangen, på veggen i forgrunnen.' : slot.tier === 'prominent' ? 'En tydelig veggplass som møter blikket i rommet.' : 'En roligere plass lenger inn i rommet.'}</p>}
        <label className="visual-label">Startdato<Input type="date" value={start} min={localDate()} onChange={(e) => setStart(e.target.value)} /></label>
        {!validDate && <p role="alert" className="text-sm text-destructive">Velg dagens dato eller en senere dato.</p>}
        <div><p className="mb-2 text-xs font-semibold">Periode</p><div className="flex gap-2" role="group" aria-label="Periode">{([7, 14, 30] as const).map((d) => <Button key={d} variant={days === d ? 'default' : 'outline'} aria-pressed={days === d} onClick={() => setDays(d)}>{d} dager</Button>)}</div></div>
        {slot && <section className="space-y-2 border-t border-border pt-4" aria-label="Oppsummering"><h3 className="font-medium">Oppsummering</h3><p className="text-sm">{art?.title ?? 'Kunstverk ikke valgt'}</p><p className="text-sm">Rom {roomNumber} · Plass {room.slots.indexOf(slot) + 1} · {GALLERY_TIERS[slot.tier]}</p>{validDate && <p className="text-sm">{dateText(new Date(`${start}T12:00:00`))} – {dateText(end)}</p>}<p className="text-xl font-semibold">{formatPrice(GALLERY_PREVIEW_PRICES[slot.tier][days])}</p><p className="text-xs text-muted-foreground">Totalpris inkludert eventuell mva · Ingen automatisk fornyelse</p></section>}
        <div className="border-t border-border pt-4"><p className="text-sm font-medium">Betaling er ikke åpnet ennå</p><p className="mt-1 text-xs text-muted-foreground">Forhåndsvisningen er gratis og oppretter ingen bestilling.</p></div>
        <p className="text-xs text-muted-foreground">Du betaler for plassering i galleriet. Plasseringen garanterer ikke visninger eller salg. Diargios ordinære salgsprovisjon gjelder dersom kunstverket blir solgt.</p>
        <Button asChild variant="link" className="h-auto whitespace-normal px-0"><Link to="/info/$page" params={{ page: 'priser-og-gebyrer' }}>Se Diargios salgsprovisjon</Link></Button>
        <p className="text-xs text-muted-foreground">Avbestilling: full refusjon før perioden starter. Ingen refusjon etter start, med forbehold om lovpålagte rettigheter.</p>
      </section>
    </div>
  </main>;
}