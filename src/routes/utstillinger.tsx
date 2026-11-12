import { createFileRoute, Link } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Grid2X2, PanelsTopLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ArtDetails } from '@/components/visual/ArtDetails';
import { ArtStage } from '@/components/visual/ArtStage';
import { VisualError } from '@/components/visual/VisualError';
import { visualArtOptions } from '@/lib/visual-art-query';
import { visualHead } from '@/lib/visual-art';
import { GallerySlots } from '@/components/visual/GallerySlots';
import { GALLERY_ASPECT, GALLERY_ROOMS, WALL_CATEGORIES, fitGalleryArt } from '@/lib/gallery-rooms';
export const Route=createFileRoute('/utstillinger')({
  loader:({context})=>context.queryClient.ensureQueryData(visualArtOptions()),
  head:()=>visualHead('Digital utstilling','Gå på kunstjakt gjennom Diargios digitale gallerirom med ekte kunstverk.','/utstillinger'),
  component:ExhibitionsPage,errorComponent:VisualError,notFoundComponent:VisualError,
});

function ExhibitionsPage(){
  const {data}=useSuspenseQuery(visualArtOptions());
  const [roomIndex,setRoomIndex]=useState(0); const [mode,setMode]=useState<'gallery'|'list'>('gallery'); const [selected,setSelected]=useState<string|null>(null);
  const displayedArt=data.artworks;
  const wallArt=displayedArt.filter((a)=>WALL_CATEGORIES.has(a.category));
  const rooms=GALLERY_ROOMS.map((hall,r)=>({hall,placements:[] as ReturnType<typeof fitGalleryArt>[]}));
  const idx=Math.min(roomIndex,rooms.length-1); const room=rooms[idx];
  if(!room) return <VisualError />;
  const arts=displayedArt.filter((a)=>room.placements.some((p)=>p.artworkId===a.id));
  const art=displayedArt.find((a)=>a.id===room.placements.find((p)=>p.id===selected)?.artworkId);
  const go=(d:number)=>{setRoomIndex(idx+d);setSelected(null);};
  const nav=<div className="mt-3 flex items-center gap-2"><Button variant="outline" disabled={idx===0} onClick={()=>go(-1)}><ArrowLeft />Forrige rom</Button><Button disabled={idx>=rooms.length-1} onClick={()=>go(1)}>Neste rom<ArrowRight /></Button></div>;
  return <main className="visual-page"><div className="visual-page-heading"><div><p className="visual-eyebrow">DIARGIO / DIGITAL UTSTILLING</p><h1 className="text-2xl font-medium">Still ut kunsten din her</h1><p className="text-sm text-muted-foreground">Alle 12 veggplasser er ledige. Klikk på en ledig plass for å annonsere verket ditt i galleriet.</p></div><div className="flex flex-wrap items-center gap-2"><Button asChild><Link to="/galleriplass" search={{room:1}}>Annonser ditt verk her</Link></Button><div className="flex border border-border p-1" role="group" aria-label="Utstillingsvisning"><Button variant=<div className="mx-6 mb-4 border border-primary/40 bg-primary/10 px-4 py-3 text-sm"><strong>Ledige galleriplasser:</strong> Velg en tom ramme på veggen, velg ditt kunstverk og periode – så vises verket ditt for alle besøkende.</div>{mode==='gallery'?'default':'ghost'} aria-pressed={mode==='gallery'} onClick={()=>setMode('gallery')}><PanelsTopLeft />Galleri</Button><Button variant={mode==='list'?'default':'ghost'} aria-pressed={mode==='list'} onClick={()=>setMode('list')}><Grid2X2 />Liste</Button></div></div></div>
    {mode==='gallery'?<div className="exhibition-space"><ArtStage background={room.hall.image} aspect={GALLERY_ASPECT} color={idx===1?'sage':idx===2?'clay':'original'} placements={room.placements} artworks={displayedArt} selected={selected} onSelect={setSelected} >
        {<GallerySlots slots={room.hall.slots} onSelect={(slot)=>{window.location.assign(`/galleriplass?room=${idx+1}&slot=${slot.id}`);}} />}
      </ArtStage>
      
      {art&&<ArtDetails artwork={art} onClose={()=>setSelected(null)} />}
      <div className="gallery-room-nav"><h2 className="font-display text-lg font-medium">Rom {String(idx+1).padStart(2,'0')} — {room.hall.name}</h2><p className="mt-1 text-sm text-muted-foreground">{room.hall.text}</p><div className="mt-3 flex gap-1" aria-label="Romoversikt">{rooms.map((_,k)=><Button variant="outline" key={k} aria-label={`Rom ${k+1}`} aria-current={k===idx} onClick={()=>{setRoomIndex(k);setSelected(null);}} className={`h-8 w-10 border text-xs ${k===idx?'border-foreground bg-secondary font-semibold':'border-border'}`}>{String(k+1).padStart(2,'0')}</Button>)}</div>{nav}</div>
    </div>:<section className="px-6 py-8"><h2 className="mb-5 font-display text-lg">Rom {idx+1} — {room.hall.name}</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{arts.map((a)=><ArtworkCard key={a.id} artwork={a} />)}</div>{!arts.length&&<p className="text-sm text-muted-foreground">Ledige galleriplasser — velg en plass i gallerivisningen.</p>}{nav}</section>}
  </main>;
}
