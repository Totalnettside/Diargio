import { createFileRoute } from '@tanstack/react-router';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Grid2X2, PanelsTopLeft, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArtworkCard } from '@/components/ArtworkCard';
import { ArtDetails } from '@/components/visual/ArtDetails';
import { ArtStage } from '@/components/visual/ArtStage';
import { ExhibitionEditor } from '@/components/visual/ExhibitionEditor';
import { VisualError } from '@/components/visual/VisualError';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { visualArtOptions } from '@/lib/visual-art-query';
import { sceneImage, visualHead } from '@/lib/visual-art';

export const Route=createFileRoute('/utstillinger')({
  loader:({context})=>context.queryClient.ensureQueryData(visualArtOptions()),
  head:()=>visualHead('Digital utstilling','Oppdag ekte kunstverk i Diargios kuraterte digitale gallerirom og finn din neste favoritt.'),
  component:ExhibitionsPage,errorComponent:VisualError,notFoundComponent:VisualError,
});
function ExhibitionsPage(){
  const {data}=useSuspenseQuery(visualArtOptions()); const {isAdmin}=useIsAdmin();
  const [exhibitId,setExhibitId]=useState(''); const [roomIndex,setRoomIndex]=useState(0); const [mode,setMode]=useState<'gallery'|'list'>('gallery'); const [selected,setSelected]=useState<string|null>(null); const [editing,setEditing]=useState(false);
  const exhibition=data.exhibitions.find((e)=>e.id===exhibitId)??data.exhibitions[0];
  const room=exhibition?.rooms[Math.min(roomIndex,exhibition.rooms.length-1)];
  const placements=room?.placements.filter((p)=>data.artworks.some((a)=>a.id===p.artworkId))??[];
  const arts=data.artworks.filter((a)=>placements.some((p)=>p.artworkId===a.id));
  const art=data.artworks.find((a)=>a.id===placements.find((p)=>p.id===selected)?.artworkId);
  return <main className="visual-page"><div className="visual-page-heading"><div><p className="visual-eyebrow">DIARGIO / DIGITALE UTSTILLINGER</p><h1 className="text-2xl font-medium">Gå på kunstjakt</h1></div><div className="flex flex-wrap items-center gap-2"><div className="flex border border-border p-1" role="group" aria-label="Utstillingsvisning"><Button variant={mode==='gallery'?'default':'ghost'} aria-pressed={mode==='gallery'} onClick={()=>setMode('gallery')}><PanelsTopLeft />Galleri</Button><Button variant={mode==='list'?'default':'ghost'} aria-pressed={mode==='list'} onClick={()=>setMode('list')}><Grid2X2 />Liste</Button></div>{isAdmin&&<Button variant="outline" onClick={()=>setEditing(!editing)}><Settings2 />{editing?'Lukk verksted':'Administrer'}</Button>}</div></div>
    {exhibition&&<div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-3"><label className="flex items-center gap-3 text-sm"><span className="text-muted-foreground">Utstilling</span><select className="bg-transparent font-semibold" value={exhibition.id} onChange={(e)=>{setExhibitId(e.target.value);setRoomIndex(0);setSelected(null);}}>{data.exhibitions.map((e)=><option value={e.id} key={e.id}>{e.title}</option>)}</select></label><span className="text-xs text-muted-foreground">{arts.length} tilgjengelige verk · Rom {roomIndex+1} av {exhibition.rooms.length}</span></div>}
    {mode==='gallery'?<div className="exhibition-space"><ArtStage background={sceneImage(room?.scene??'gallery')} placements={placements} artworks={data.artworks} selected={selected} onSelect={setSelected} />
      {!placements.length&&<div className="stage-empty"><h2 className="text-lg font-medium">{exhibition?'Dette rommet har ingen tilgjengelige verk':'Neste utstilling er på vei'}</h2><p className="mt-2 text-sm text-muted-foreground">{exhibition?'Solgte og utilgjengelige verk vises ikke.':'Her vil du finne håndplukkede kunstverk fra Diargio.'}</p></div>}
      {art&&<ArtDetails artwork={art} onClose={()=>setSelected(null)} />}
      {exhibition&&room&&<div className="gallery-room-nav"><div><p className="text-xs text-muted-foreground">{exhibition.title}</p><h2 className="mt-1 font-display text-lg font-medium">{room.name}</h2></div><div className="mt-3 flex items-center gap-2"><Button variant="outline" disabled={roomIndex===0} onClick={()=>{setRoomIndex((i)=>i-1);setSelected(null);}}><ArrowLeft />Forrige rom</Button><Button disabled={roomIndex>=exhibition.rooms.length-1} onClick={()=>{setRoomIndex((i)=>i+1);setSelected(null);}}>Neste rom<ArrowRight /></Button></div></div>}
    </div>:<section className="px-6 py-8"><h2 className="mb-5 font-display text-lg">{room?.name??'Ingen publiserte utstillinger'}</h2><div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">{arts.map((a)=><ArtworkCard key={a.id} artwork={a} />)}</div>{!arts.length&&<p className="text-sm text-muted-foreground">Ingen tilgjengelige verk i dette rommet.</p>}{exhibition&&<div className="mt-6 flex gap-2"><Button variant="outline" disabled={roomIndex===0} onClick={()=>setRoomIndex((i)=>i-1)}><ArrowLeft />Forrige rom</Button><Button disabled={roomIndex>=exhibition.rooms.length-1} onClick={()=>setRoomIndex((i)=>i+1)}>Neste rom<ArrowRight /></Button></div>}</section>}
    {isAdmin&&editing&&<ExhibitionEditor artworks={data.artworks} />}
  </main>;
}