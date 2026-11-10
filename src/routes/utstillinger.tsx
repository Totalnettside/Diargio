import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Grid2X2, PanelsTopLeft, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ArtDetails } from '@/components/visual/ArtDetails';
import { ArtStage } from '@/components/visual/ArtStage';
import { VisualError } from '@/components/visual/VisualError';
import { visualArtOptions } from '@/lib/visual-art-query';
import { visualHead } from '@/lib/visual-art';
import { GallerySlots } from '@/components/visual/GallerySlots';
import { GALLERY_ASPECT, GALLERY_ROOMS, WALL_CATEGORIES, fitGalleryArt } from '@/lib/gallery-rooms';
import { investorArtworks } from '@/data/investor-art';
import { InvestorArtCard, InvestorArtDetails } from '@/components/InvestorArt';
export const Route=createFileRoute('/utstillinger')({
  validateSearch: (search: Record<string, unknown>): { investor?: boolean } => search['investor'] === true || search['investor'] === 'true' ? { investor: true } : {},
  loader:({context})=>context.queryClient.ensureQueryData(visualArtOptions()),
  head:()=>visualHead('Digital utstilling','Gå på kunstjakt gjennom Diargios digitale gallerirom med ekte kunstverk.','/utstillinger'),
  component:ExhibitionsPage,errorComponent:VisualError,notFoundComponent:VisualError,
});

function ExhibitionsPage(){
  const {data}=useSuspenseQuery(visualArtOptions());
  const {investor}=Route.useSearch();
  const [roomIndex,setRoomIndex]=useState(0); const [mode,setMode]=useState<'gallery'|'list'>('gallery'); const [selected,setSelected]=useState<string|null>(null);
  const displayedArt=investor?investorArtworks:[...data.artworks,...investorArtworks];
  const wallArt=displayedArt.filter((a)=>WALL_CATEGORIES.has(a.category));
  const rooms=GALLERY_ROOMS.map((hall,r)=>({hall,placements:investor||r===0?hall.slots.flatMap((s,k)=>{const a=investor?wallArt[r*4+k]:investorArtworks[k];return a?[fitGalleryArt(s,a.widthCm&&a.heightCm?a.widthCm/a.heightCm:1,a.id)]:[];}):[]}));
  const idx=Math.min(roomIndex,rooms.length-1); const room=rooms[idx];
  if(!room) return <VisualError />;
  const arts=displayedArt.filter((a)=>room.placements.some((p)=>p.artworkId===a.id));
  const art=displayedArt.find((a)=>a.id===room.placements.find((p)=>p.id===selected)?.artworkId);
  const isDemo=(a:{id:string})=>a.id.startsWith('investor-demo-');
  const go=(d:number)=>{setRoomIndex(idx+d);setSelected(null);};
  const nav=<div className="mt-3 flex items-center gap-2"><Button variant="outline" disabled={idx===0} onClick={()=>go(-1)}><ArrowLeft />Forrige rom</Button><Button disabled={idx>=rooms.length-1} onClick={()=>go(1)}>Neste rom<ArrowRight /></Button></div>;
  return <main className="visual-page"><div className="visual-page-heading"><div><p className="visual-eyebrow">DIARGIO / DIGITAL UTSTILLING</p><h1 className="text-2xl font-medium">Gå på kunstjakt</h1><p className="text-sm text-muted-foreground">Klikk på et verk for å se pris og kunstner.</p></div><div className="flex flex-wrap items-center gap-2"><Button asChild><Link to="/galleriplass" search={{room:2}}>Still ut i galleriet</Link></Button><div className="flex border border-border p-1" role="group" aria-label="Utstillingsvisning"><Button variant={mode==='gallery'?'default':'ghost'} aria-pressed={mode==='gallery'} onClick={()=>setMode('gallery')}><PanelsTopLeft />Galleri</Button><Button variant={mode==='list'?'default':'ghost'} aria-pressed={mode==='list'} onClick={()=>setMode('list')}><Grid2X2 />Liste</Button></div></div></div>
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-secondary px-6 py-3"><p className="text-xs font-medium">{investor?'Investorvisning · AI-genererte demoverk · Eksempelpriser · Ikke til salgs':'Ekte kunstverk'}</p><Button asChild variant="outline" size="sm"><Link to="/utstillinger" search={investor?{}:{investor:true}} onClick={()=>{setSelected(null);setRoomIndex(0);}}>{investor?'Vis ekte kunst':'Vis investorutstilling'}</Link></Button></div>
    {mode==='gallery'?<div className="exhibition-space"><ArtStage background={room.hall.image} aspect={GALLERY_ASPECT} placements={room.placements} artworks={displayedArt} selected={selected} onSelect={setSelected} >
        {idx>0&&!investor&&<GallerySlots slots={room.hall.slots} onSelect={(slot)=>{window.location.assign(`/galleriplass?room=${idx+1}&slot=${slot.id}`);}} />}
      </ArtStage>
      {!room.placements.length&&idx===0&&<div className="stage-empty"><h2 className="text-lg font-medium">Dette rommet venter på kunst</h2><p className="mt-2 text-sm text-muted-foreground">Dette rommet venter på tilgjengelige veggverk.</p></div>}
      {art&&(investor||isDemo(art)?<aside className="visual-details" aria-label="Demoverk"><Button variant="ghost" size="icon" className="absolute right-1 top-1" aria-label="Lukk demoverk" onClick={()=>setSelected(null)}><X /></Button><InvestorArtDetails artwork={art} /></aside>:<ArtDetails artwork={art} onClose={()=>setSelected(null)} />)}
      <div className="gallery-room-nav"><h2 className="font-display text-lg font-medium">Rom {String(idx+1).padStart(2,'0')} — {room.hall.name}</h2><p className="mt-1 text-sm text-muted-foreground">{room.hall.text}</p><div className="mt-3 flex gap-1" aria-label="Romoversikt">{rooms.map((_,k)=><Button variant="outline" key={k} aria-label={`Rom ${k+1}`} aria-current={k===idx} onClick={()=>{setRoomIndex(k);setSelected(null);}} className={`h-8 w-10 border text-xs ${k===idx?'border-foreground bg-secondary font-semibold':'border-border'}`}>{String(k+1).padStart(2,'0')}</Button>)}</div>{nav}</div>
    </div>:<section className="px-6 py-8"><h2 className="mb-5 font-display text-lg">Rom {idx+1} — {room.hall.name}</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{arts.map((a)=>investor||isDemo(a)?<InvestorArtCard key={a.id} artwork={a} />:<ArtworkCard key={a.id} artwork={a} />)}</div>{!arts.length&&<p className="text-sm text-muted-foreground">Ledige galleriplasser — velg en plass i gallerivisningen.</p>}{nav}</section>}
  </main>;
}
