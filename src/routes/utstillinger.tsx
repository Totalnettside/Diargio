import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Grid2X2, PanelsTopLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ArtDetails } from '@/components/visual/ArtDetails';
import { ArtStage } from '@/components/visual/ArtStage';
import { VisualError } from '@/components/visual/VisualError';
import { visualArtOptions } from '@/lib/visual-art-query';
import { visualHead, type Placement } from '@/lib/visual-art';
import hall1 from '@/assets/gallery-hall-1.jpg';
import hall2 from '@/assets/gallery-hall-2.jpg';
import hall3 from '@/assets/gallery-hall-3.jpg';

export const Route=createFileRoute('/utstillinger')({
  loader:({context})=>context.queryClient.ensureQueryData(visualArtOptions()),
  head:()=>visualHead('Digital utstilling','Gå på kunstjakt gjennom Diargios digitale gallerirom med ekte kunstverk.'),
  component:ExhibitionsPage,errorComponent:VisualError,notFoundComponent:VisualError,
});

const ASPECT=1600/912;
type Slot={cx:number;cy:number;w:number;h:number};
const WALL_CATEGORIES=new Set(['Malerier','Grafikk & trykk','Fotografi','Tegninger','Street art','Digital kunst']);
const HALLS:{name:string;text:string;image:string;slots:Slot[]}[]=[
  {name:'Nye perspektiver',text:'Lyse vegger og naturlig lys – start kunstjakten her.',image:hall1,slots:[{cx:.36,cy:.33,w:.2,h:.3},{cx:.87,cy:.33,w:.12,h:.32},{cx:.6,cy:.37,w:.07,h:.12},{cx:.18,cy:.3,w:.05,h:.2}]},
  {name:'Stille rom',text:'Et rolig rom under takvinduet.',image:hall2,slots:[{cx:.36,cy:.36,w:.15,h:.26},{cx:.64,cy:.36,w:.15,h:.26},{cx:.12,cy:.33,w:.13,h:.3},{cx:.88,cy:.33,w:.13,h:.3}]},
  {name:'Den lange gangen',text:'Gå videre innover og oppdag flere verk.',image:hall3,slots:[{cx:.14,cy:.33,w:.16,h:.32},{cx:.87,cy:.33,w:.15,h:.32},{cx:.44,cy:.34,w:.08,h:.18},{cx:.7,cy:.35,w:.05,h:.12}]},
];

function fit(slot:Slot,ratio:number,artworkId:string,id:string):Placement{
  const r=ratio>0?ratio:1; let width=slot.w; let h=width*ASPECT/r;
  if(h>slot.h){h=slot.h;width=h*r/ASPECT;}
  return {id,artworkId,ratio:r,width,x:slot.cx-width/2,y:slot.cy-h/2};
}

function ExhibitionsPage(){
  const {data}=useSuspenseQuery(visualArtOptions());
  const [roomIndex,setRoomIndex]=useState(0); const [mode,setMode]=useState<'gallery'|'list'>('gallery'); const [selected,setSelected]=useState<string|null>(null);
  const rooms=useMemo(()=>{
    const arts=data.artworks.filter((a)=>WALL_CATEGORIES.has(a.category)); const out:{hall:typeof HALLS[number];placements:Placement[]}[]=[]; let i=0; let r=0;
    do{ const hall=HALLS[r%HALLS.length]!; const placements=hall.slots.map((s,k)=>{const a=arts[i+k]; return a?fit(s,(a.widthCm&&a.heightCm)?a.widthCm/a.heightCm:1,a.id,`${r}-${k}`):null;}).filter(Boolean) as Placement[];
      out.push({hall,placements}); i+=hall.slots.length; r++; }while(i<arts.length||r<HALLS.length);
    return out;
  },[data.artworks]);
  const idx=Math.min(roomIndex,rooms.length-1); const room=rooms[idx]!;
  const arts=data.artworks.filter((a)=>room.placements.some((p)=>p.artworkId===a.id));
  const art=data.artworks.find((a)=>a.id===room.placements.find((p)=>p.id===selected)?.artworkId);
  const go=(d:number)=>{setRoomIndex(idx+d);setSelected(null);};
  const nav=<div className="mt-3 flex items-center gap-2"><Button variant="outline" disabled={idx===0} onClick={()=>go(-1)}><ArrowLeft />Forrige rom</Button><Button disabled={idx>=rooms.length-1} onClick={()=>go(1)}>Neste rom<ArrowRight /></Button></div>;
  return <main className="visual-page"><div className="visual-page-heading"><div><p className="visual-eyebrow">DIARGIO / DIGITAL UTSTILLING</p><h1 className="text-2xl font-medium">Gå på kunstjakt</h1><p className="text-sm text-muted-foreground">Klikk på et verk for å se pris og kunstner.</p></div><div className="flex border border-border p-1" role="group" aria-label="Utstillingsvisning"><Button variant={mode==='gallery'?'default':'ghost'} aria-pressed={mode==='gallery'} onClick={()=>setMode('gallery')}><PanelsTopLeft />Galleri</Button><Button variant={mode==='list'?'default':'ghost'} aria-pressed={mode==='list'} onClick={()=>setMode('list')}><Grid2X2 />Liste</Button></div></div>
    {mode==='gallery'?<div className="exhibition-space"><ArtStage background={room.hall.image} aspect={ASPECT} placements={room.placements} artworks={data.artworks} selected={selected} onSelect={setSelected} />
      {!room.placements.length&&<div className="stage-empty"><h2 className="text-lg font-medium">Dette rommet venter på kunst</h2><p className="mt-2 text-sm text-muted-foreground">Nye verk dukker opp her når de legges ut.</p></div>}
      {art&&<ArtDetails artwork={art} onClose={()=>setSelected(null)} />}
      <div className="gallery-room-nav"><h2 className="font-display text-lg font-medium">Rom {String(idx+1).padStart(2,'0')} — {room.hall.name}</h2><p className="mt-1 text-sm text-muted-foreground">{room.hall.text}</p><div className="mt-3 flex gap-1" aria-label="Romoversikt">{rooms.map((_,k)=><button key={k} aria-label={`Rom ${k+1}`} aria-current={k===idx} onClick={()=>{setRoomIndex(k);setSelected(null);}} className={`h-8 w-10 border text-xs ${k===idx?'border-foreground bg-secondary font-semibold':'border-border'}`}>{String(k+1).padStart(2,'0')}</button>)}</div>{nav}</div>
    </div>:<section className="px-6 py-8"><h2 className="mb-5 font-display text-lg">Rom {idx+1} — {room.hall.name}</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{arts.map((a)=><ArtworkCard key={a.id} artwork={a} />)}</div>{!arts.length&&<p className="text-sm text-muted-foreground">Ingen tilgjengelige verk i dette rommet.</p>}{nav}</section>}
  </main>;
}
