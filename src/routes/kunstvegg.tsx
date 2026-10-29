import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useRef, useState } from 'react';
import { useSuspenseQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ImagePlus, Plus, Save, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { categories, formatPrice, type Artwork } from '@/data/demo';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { visualArtOptions } from '@/lib/visual-art-query';
import { getSharedWall, saveArtWall } from '@/lib/visual-art.functions';
import { emptyWall, newPlacement, wallRoomScenes, sceneImage, wallLayoutSchema, visualHead, type WallLayout } from '@/lib/visual-art';
import { ArtStage } from '@/components/visual/ArtStage';
import { WallColorPicker } from '@/components/visual/WallColorPicker';
import { ArtDetails } from '@/components/visual/ArtDetails';
import { VisualError } from '@/components/visual/VisualError';

export const Route = createFileRoute('/kunstvegg')({
  validateSearch: (s: Record<string, unknown>): { wall?: string } => typeof s['wall'] === 'string' && /^[0-9a-f-]{36}$/i.test(s['wall']) ? { wall: s['wall'] } : {},
  loaderDeps: ({ search }) => ({ wall: search.wall }),
  loader: async ({ context, deps }) => {
    const [, shared] = await Promise.all([context.queryClient.ensureQueryData(visualArtOptions()), deps.wall ? getSharedWall({ data: { id: deps.wall } }) : Promise.resolve(null)]);
    return { shared };
  },
  head: () => visualHead('Din kunstvegg', 'Prøv ekte kunstverk i et rom, bygg din kunstvegg og lagre eller del den på Diargio.'),
  component: ArtWallPage, errorComponent: VisualError, notFoundComponent: VisualError,
});

function ArtWallPage() {
  const { data } = useSuspenseQuery(visualArtOptions()); const { shared } = Route.useLoaderData();
  const wallSearch = Route.useSearch().wall; const { user } = useAuth(); const cache = useQueryClient();
  const [layout, setLayout] = useState<WallLayout>(shared?.layout ?? emptyWall());
  const [roomUrl, setRoomUrl] = useState(shared?.roomUrl ?? '');
  const [ownId, setOwnId] = useState<string>(); const [name, setName] = useState(shared?.name ?? 'Min kunstvegg');
  const [selected, setSelected] = useState<string | null>(null); const [budget, setBudget] = useState(''); const [category, setCategory] = useState(''); const [size, setSize] = useState('');
  const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false); const [shareUrl, setShareUrl] = useState(''); const [isShared, setIsShared] = useState(false);
  const [photo, setPhoto] = useState<File>(); const fileInput = useRef<HTMLInputElement>(null);
  const strip = useRef<HTMLDivElement>(null);
  useEffect(() => { if (!shared) return; setLayout(shared.layout);setRoomUrl(shared.roomUrl??'');setName(shared.name);setOwnId(undefined);setIsShared(false);setSelected(null); },[shared]);
  useEffect(() => {
    if (!wallSearch || !user) return;
    let alive = true;
    void (async () => {
      const { data: w, error } = await supabase.from('art_walls').select('id,name,layout,shared').eq('id', wallSearch).eq('user_id',user.id).maybeSingle();
      if (!alive || error || !w) return;
      const parsed = wallLayoutSchema.safeParse(w.layout); if (!parsed.success) return;
      setOwnId(w.id); setName(w.name); setLayout(parsed.data); setIsShared(w.shared);
      if (parsed.data.roomPath) { const { data: signed } = await supabase.storage.from('art-wall-rooms').createSignedUrl(parsed.data.roomPath,3600); if (alive && signed) setRoomUrl(signed.signedUrl); }
    })();
    return () => { alive=false; };
  }, [wallSearch,user?.id,shared]);
  useEffect(() => {
    if (!layout.roomPath) return;
    const path=layout.roomPath; let active=true;
    const timer=window.setInterval(()=>{ void supabase.storage.from('art-wall-rooms').createSignedUrl(path,3600).then(({data})=>{if(active&&data)setRoomUrl(data.signedUrl);}); },45*60*1000);
    return ()=>{active=false;window.clearInterval(timer);};
  },[layout.roomPath]);
  useEffect(() => {
    if (!user) return;
    try { const draft = sessionStorage.getItem('diargio-wall-draft'); if (draft && !wallSearch) { const d = JSON.parse(draft); const parsed = wallLayoutSchema.safeParse(d.layout); if (parsed.success) { setLayout(parsed.data); setName(d.name || 'Min kunstvegg'); } sessionStorage.removeItem('diargio-wall-draft'); } } catch { /* No draft */ }
  }, [user?.id,wallSearch]);
  const a = data.artworks.find((a) => a.id === layout.placements.find((p) => p.id === selected)?.artworkId);
  const p = layout.placements.find((p) => p.id === selected);
  const filtered = data.artworks.filter((a) => (!budget || a.price <= Number(budget)) && (!category || a.category === category) && (!size || (size === 'small' ? Math.max(a.widthCm,a.heightCm) <= 60 : size === 'medium' ? Math.max(a.widthCm,a.heightCm) > 60 && Math.max(a.widthCm,a.heightCm) <= 100 : Math.max(a.widthCm,a.heightCm) > 100)));
  const total = layout.placements.reduce((s,p) => s + (data.artworks.find((a) => a.id === p.artworkId)?.price ?? 0),0);
  const missing = layout.placements.filter((p) => !data.artworks.some((a) => a.id === p.artworkId)).length;
  function add(art: Artwork, x?: number, y?: number) {
    if (layout.placements.length >= 30) { setMessage('Maksimalt 30 verk per kunstvegg.'); return; }
    const item = newPlacement(art.id,art.widthCm / art.heightCm,layout.placements.length);
    if (art.widthCm > 0) item.width = Math.max(0.02,Math.min(0.8,art.widthCm/300));
    item.width = Math.min(item.width,0.7*item.ratio/layout.aspect);
    if (x !== undefined) item.x = Math.max(0,Math.min(1-item.width,x-item.width/2));
    if (y !== undefined) item.y = Math.max(0,Math.min(1-item.width*layout.aspect/item.ratio,y));
    setLayout((l) => ({ ...l, placements: [...l.placements,item] })); setSelected(item.id);
  }
  function adjust(patch: Partial<typeof p>) { if (!p) return; setLayout((l) => ({ ...l, placements: l.placements.map((v) => v.id === p.id ? { ...v,...patch } : v) })); }
  async function persist(share = false) {
    if (!user) { setMessage('Logg inn for å lagre kunstveggen.'); return; }
    setBusy(true); setMessage('');
    try {
      let savedLayout = layout;
      if (photo) {
        const path = `${user.id}/${crypto.randomUUID()}.${photo.type === 'image/png' ? 'png' : 'jpg'}`;
        const { error } = await supabase.storage.from('art-wall-rooms').upload(path,photo); if (error) throw new Error('Romfotoet kunne ikke lastes opp.');
        savedLayout = { ...layout,roomPath:path }; setLayout(savedLayout); setPhoto(undefined);
      }
      // A shared wall copied by another user must not retain their private room path.
      if (savedLayout.roomPath && !savedLayout.roomPath.startsWith(`${user.id}/`)) throw new Error('Velg et ferdig rom eller last opp ditt eget rom før du lagrer en kopi.');
      const id = await saveArtWall({ data: { ...(ownId ? { id: ownId } : {}), name, layout:savedLayout, shared:share || isShared } });
      setOwnId(id); setIsShared(share || isShared); await cache.invalidateQueries({ queryKey:['my-art-walls'] });
      if (share) { const url = `${window.location.origin}/kunstvegg?wall=${id}`; setShareUrl(url); try { await navigator.clipboard.writeText(url); setMessage('Delingslenken er kopiert. Romfotoet er synlig for alle med lenken.'); } catch { setMessage('Delingslenken er klar. Romfotoet er synlig for alle med lenken.'); } }
      else setMessage('Kunstveggen er lagret på Min side.');
    } catch (e) { setMessage(e instanceof Error ? e.message : 'Kunne ikke lagre.'); } finally { setBusy(false); }
  }
  return <main className="visual-page">
    <div className="visual-page-heading"><div><p className="visual-eyebrow">DIARGIO / DIN KUNSTVEGG</p><h1 className="text-2xl font-medium">Bygg din egen kunstvegg</h1></div><div className="flex flex-wrap items-center gap-2"><Button variant="outline" onClick={() => void persist()} disabled={busy}><Save />Lagre kunstveggen</Button><Button variant="outline" onClick={() => void persist(true)} disabled={busy}><Share2 />Del</Button></div></div>
    <div className="visual-workspace">
      <aside className="visual-sidebar" aria-label="Kunstvegginnstillinger">
        <label className="visual-label">Navn<Input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} /></label>
        <label className="visual-label">Budsjett<select value={budget} onChange={(e) => setBudget(e.target.value)}><option value="">Alle priser</option><option value="5000">Under 5 000 kr</option><option value="15000">Under 15 000 kr</option><option value="50000">Under 50 000 kr</option></select></label>
        <label className="visual-label">Kategori<select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Alle kategorier</option>{categories.map((c) => <option key={c}>{c}</option>)}</select></label>
        <label className="visual-label">Verkstørrelse<select value={size} onChange={(e) => setSize(e.target.value)}><option value="">Alle størrelser</option><option value="small">Opptil 60 cm</option><option value="medium">60–100 cm</option><option value="large">Over 100 cm</option></select></label>
        <WallColorPicker color={layout.color} onChange={(color) => setLayout((l) => ({ ...l, color }))} />
        <label className="visual-label">Rom<select value={roomUrl ? 'custom' : layout.scene} onChange={(e) => { setRoomUrl(''); setPhoto(undefined); setLayout((l) => ({ ...l,scene:e.target.value as WallLayout['scene'],roomPath:undefined,aspect:1.5,calibration:null })); }}><option value="custom" disabled>Ditt rom</option>{wallRoomScenes.map((r) => <option value={r.id} key={r.id}>{r.name}</option>)}</select></label>
        <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" aria-label="Last opp romfoto" onChange={async (e) => { const f=e.target.files?.[0]; if (!f) return; if (!['image/jpeg','image/png','image/webp'].includes(f.type) || f.size>10*1024*1024) { setMessage('Velg JPG, PNG eller WebP under 10 MB.'); return; } const url=URL.createObjectURL(f); const img=new Image(); img.onload=() => { const aspect=img.width/img.height; if (aspect<0.2 || aspect>5) { setMessage('Romfotoet har et format som ikke støttes.'); URL.revokeObjectURL(url); return; } setPhoto(f); setRoomUrl(url); setLayout((l) => ({ ...l,roomPath:undefined,aspect,calibration:null })); }; img.src=url; }} />
        <Button variant="outline" onClick={() => fileInput.current?.click()} className="w-full"><ImagePlus />Last opp ditt rom</Button>
      </aside>
      <div className="visual-stage-area">
        <ArtStage background={roomUrl || sceneImage(layout.scene)} aspect={layout.aspect} color={layout.color} scene={roomUrl ? undefined : layout.scene} placements={layout.placements} artworks={data.artworks} selected={selected} onSelect={setSelected}
          onChange={(placements) => setLayout((l) => ({ ...l,placements }))}
          onDropArt={(id,x,y) => { const art=data.artworks.find((a) => a.id===id); if (art) add(art,x,y); }} />
        {layout.placements.length===0 && <div className="stage-empty"><ImagePlus className="mx-auto mb-2 size-6" /><p>Velg ditt første verk</p></div>}
        <div className="flex flex-wrap justify-between gap-2 px-4 py-3 text-xs text-muted-foreground"><span>Verkene henger i reelle størrelsesforhold</span><span>{layout.placements.length} verk · {formatPrice(total)} · Frakt separat</span></div>
        {missing>0 && <p role="status" className="px-4 pb-3 text-xs text-muted-foreground">{missing} verk er solgt eller utilgjengelig og vises ikke lenger.</p>}
      </div>
      {a && <ArtDetails artwork={a} onClose={() => setSelected(null)}>{p && <div className="mt-4 border-t border-border pt-3"><div className="flex flex-wrap gap-1">{[[ArrowLeft,-0.02,0,'Flytt venstre'],[ArrowRight,0.02,0,'Flytt høyre'],[ArrowUp,0,-0.02,'Flytt opp'],[ArrowDown,0,0.02,'Flytt ned']].map(([Icon,dx,dy,label]) => { const I=Icon as typeof ArrowLeft; return <Button key={String(label)} size="icon" variant="outline" aria-label={String(label)} onClick={() => adjust({x:Math.max(0,Math.min(1-p.width,p.x+Number(dx))),y:Math.max(0,Math.min(1-p.width*layout.aspect/p.ratio,p.y+Number(dy)))})}><I /></Button>; })}<Button size="icon" variant="ghost" aria-label="Fjern fra veggen" onClick={() => { setLayout((l) => ({...l,placements:l.placements.filter((v) => v.id!==p.id)})); setSelected(null); }}><Trash2 /></Button></div></div>}</ArtDetails>}
    </div>
    {(message || (!user && message)) && <div className="px-6 py-3 text-sm" role="status">{message}{!user && <Button asChild variant="link"><Link to="/auth" onClick={() => { sessionStorage.setItem('diargio-wall-draft',JSON.stringify({layout,name})); }}>Logg inn</Link></Button>}</div>}
    {shareUrl && <label className="visual-label mx-6 mb-4">Delingslenke<Input readOnly value={shareUrl} onFocus={(e) => e.currentTarget.select()} /></label>}
    {isShared && <div className="px-6 pb-3"><Button variant="link" className="px-0" disabled={busy} onClick={async () => { if (!ownId || !user) return; setBusy(true); try { await saveArtWall({data:{id:ownId,name,layout,shared:false}}); setIsShared(false); setShareUrl(''); setMessage('Delingslenken er deaktivert.'); } catch { setMessage('Kunne ikke stoppe deling.'); } finally { setBusy(false); } }}>Stopp deling</Button></div>}
    <section className="art-tray"><div className="mb-4 flex items-center justify-between"><h2 className="font-semibold">Legg til verk <span className="ml-2 text-xs font-normal text-muted-foreground">{filtered.length} tilgjengelige</span></h2><div className="flex gap-1"><Button variant="ghost" size="icon" aria-label="Forrige kunstverk" onClick={() => strip.current?.scrollBy({left:-360,behavior:'smooth'})}><ArrowLeft /></Button><Button variant="ghost" size="icon" aria-label="Neste kunstverk" onClick={() => strip.current?.scrollBy({left:360,behavior:'smooth'})}><ArrowRight /></Button></div></div>
      <div ref={strip} className="flex gap-5 overflow-x-auto pb-3">{filtered.map((art) => <article key={art.id} className="w-40 shrink-0" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain',art.id)}><Button variant="ghost" className="h-28 w-full rounded-none bg-muted p-2" aria-label={`Legg ${art.title} på veggen`} onClick={() => add(art)}><img src={art.image} alt={art.title} draggable={false} className="size-full object-contain" /></Button><p className="mt-2 truncate text-sm font-semibold">{art.title}</p><p className="text-sm">{formatPrice(art.price)}</p><Button variant="link" className="h-8 px-0 text-xs" onClick={() => add(art)}><Plus />Legg på veggen</Button></article>)}{filtered.length===0 && <p className="py-6 text-sm text-muted-foreground">Ingen tilgjengelige verk passer disse filtrene.</p>}</div>
    </section>
  </main>;
}