import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { saveExhibition } from '@/lib/visual-art.functions';
import { exhibitionRoomSchema, newPlacement, roomScenes, sceneImage, type Exhibition, type ExhibitionRoom } from '@/lib/visual-art';
import { z } from 'zod';
import type { Artwork } from '@/data/demo';
import { ArtStage } from './ArtStage';

const freshRoom = (): ExhibitionRoom => ({ id:crypto.randomUUID(),name:'Nytt rom',scene:'gallery',placements:[] });
export function ExhibitionEditor({ artworks }: { artworks: Artwork[] }) {
  const cache=useQueryClient(); const [id,setId]=useState<string>(); const [title,setTitle]=useState('Ny utstilling'); const [published,setPublished]=useState(false);
  const [rooms,setRooms]=useState<ExhibitionRoom[]>([freshRoom()]); const [roomIndex,setRoomIndex]=useState(0); const [selected,setSelected]=useState<string|null>(null);
  const [message,setMessage]=useState(''); const [busy,setBusy]=useState(false); const room=rooms[roomIndex];
  const exhibits=useQuery({queryKey:['admin-exhibitions'],queryFn:async () => { const {data,error}=await supabase.from('art_exhibitions').select('id,title,rooms,published').order('created_at'); if(error) throw error; return (data??[]).map((e)=>({...e,rooms:z.array(exhibitionRoomSchema).parse(e.rooms)})); }});
  function load(e?: Exhibition) { setId(e?.id);setTitle(e?.title??'Ny utstilling');setPublished(e?.published??false);setRooms(e?.rooms.length?e.rooms:[freshRoom()]);setRoomIndex(0);setSelected(null);setMessage(''); }
  function patchRoom(patch:Partial<ExhibitionRoom>) {setRooms((r)=>r.map((v,i)=>i===roomIndex?{...v,...patch}:v));}
  const p=room?.placements.find((p)=>p.id===selected);
  return <section className="border-t border-border bg-card px-6 py-7" aria-label="Administrer utstillinger"><h2 className="font-display text-xl font-medium">Utstillingsverksted</h2>
    <div className="my-4 flex flex-wrap gap-3"><label className="visual-label min-w-48">Utstilling<select value={id??''} onChange={(e)=>load(exhibits.data?.find((v)=>v.id===e.target.value))}><option value="">Ny utstilling</option>{exhibits.data?.map((e)=><option key={e.id} value={e.id}>{e.title}{e.published?'':' · Utkast'}</option>)}</select></label><label className="visual-label flex-1">Tittel<Input value={title} maxLength={120} onChange={(e)=>setTitle(e.target.value)} /></label><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={published} onChange={(e)=>setPublished(e.target.checked)} />Publisert</label><Button disabled={busy} onClick={async()=>{setBusy(true);setMessage('');try{const saved=await saveExhibition({data:{...(id?{id}:{}),title,published,rooms}});setId(saved);await Promise.all([cache.invalidateQueries({queryKey:['admin-exhibitions']}),cache.invalidateQueries({queryKey:['visual-art']})]);setMessage('Utstillingen er lagret.');}catch(e){setMessage(e instanceof Error?e.message:'Kunne ikke lagre.');}finally{setBusy(false);}}}><Save />Lagre utstilling</Button></div>
    {(message||exhibits.error)&&<p role="status" className="mb-3 text-sm">{message||'Utstillinger kunne ikke lastes.'}</p>}
    <div className="mb-4 flex flex-wrap items-center gap-2">{rooms.map((r,i)=><Button key={r.id} variant={roomIndex===i?'default':'outline'} onClick={()=>{setRoomIndex(i);setSelected(null);}}>{r.name}</Button>)}<Button variant="ghost" disabled={rooms.length>=20} onClick={()=>{setRooms((r)=>[...r,freshRoom()]);setRoomIndex(rooms.length);}}><Plus />Legg til rom</Button></div>
    {room&&<div className="grid gap-5 lg:grid-cols-[220px_1fr]"><div className="space-y-4"><label className="visual-label">Romnavn<Input value={room.name} maxLength={100} onChange={(e)=>patchRoom({name:e.target.value})} /></label><label className="visual-label">Bakgrunn<select value={room.scene} onChange={(e)=>patchRoom({scene:e.target.value as ExhibitionRoom['scene']})}>{roomScenes.map((r)=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label className="visual-label">Legg til kunstverk<select value="" onChange={(e)=>{const a=artworks.find((a)=>a.id===e.target.value);if(!a)return;const item=newPlacement(a.id,a.widthCm/a.heightCm,room.placements.length);patchRoom({placements:[...room.placements,item]});setSelected(item.id);}}><option value="">Velg verk</option>{artworks.map((a)=><option key={a.id} value={a.id}>{a.title}</option>)}</select></label>
    {p&&<><label className="visual-label">Bredde på veggen (%)<Input type="number" value={Math.round(p.width*100)} min="2" max="90" onChange={(e)=>patchRoom({placements:room.placements.map((v)=>v.id===p.id?{...v,width:Math.max(0.02,Math.min(0.9,1-v.x,(1-v.y)*v.ratio/1.5,Number(e.target.value)/100))}:v)})} /></label><Button variant="outline" onClick={()=>{patchRoom({placements:room.placements.filter((v)=>v.id!==p.id)});setSelected(null);}}><Trash2 />Fjern valgt verk</Button></>}
    <Button variant="ghost" disabled={rooms.length<=1} onClick={()=>{setRooms((r)=>r.filter((_,i)=>i!==roomIndex));setRoomIndex(0);}}><Trash2 />Fjern rom</Button>
    {room.placements.filter((p)=>!artworks.some((a)=>a.id===p.artworkId)).map((p)=><Button key={p.id} variant="outline" className="w-full" onClick={()=>patchRoom({placements:room.placements.filter((v)=>v.id!==p.id)})}>Fjern utilgjengelig verk</Button>)}
    </div><ArtStage background={sceneImage(room.scene)} placements={room.placements} artworks={artworks} selected={selected} onSelect={setSelected} onChange={(placements)=>patchRoom({placements})} /></div>}
  </section>;
}