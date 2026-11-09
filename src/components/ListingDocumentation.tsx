import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';

export function ListingDocumentation({listingId,ownerId,editable=false}:{listingId:string;ownerId:string;editable?:boolean}) {
  const [files,setFiles] = useState<string[]>([]);
  const [error,setError] = useState('');
  const prefix = `${ownerId}/${listingId}`;
  async function load() {
    const {data,error} = await supabase.storage.from('listing-documentation').list(prefix);
    if(error){setError('Dokumentasjonen kunne ikke lastes.');return;}
    setFiles((data??[]).map(f=>f.name));
  }
  useEffect(()=>{void load();},[prefix]);
  async function upload(file:File) {
    setError('');
    if(file.size>10*1024*1024||!['application/pdf','image/jpeg','image/png'].includes(file.type)){setError('Velg PDF, JPG eller PNG under 10 MB.');return;}
    const name=`${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9.æøåÆØÅ_-]/g,'_')}`;
    const {error}=await supabase.storage.from('listing-documentation').upload(`${prefix}/${name}`,file);
    if(error)setError('Vedlegget kunne ikke lastes opp.');else await load();
  }
  async function open(name:string) {
    const {data,error}=await supabase.storage.from('listing-documentation').createSignedUrl(`${prefix}/${name}`,60);
    if(error||!data){setError('Kunne ikke åpne vedlegget.');return;}
    window.open(data.signedUrl,'_blank','noopener,noreferrer');
  }
  return <section className="space-y-2 border-t border-border pt-4"><h3 className="font-semibold">Privat dokumentasjon</h3>{error&&<p role="alert" className="text-destructive">{error}</p>}{editable&&<label className="block text-sm">Legg til dokumentasjon<input aria-label="Last opp privat dokumentasjon" type="file" accept="application/pdf,image/jpeg,image/png" className="mt-2 block w-full" onChange={e=>{const f=e.target.files?.[0];if(f)void upload(f);e.target.value='';}}/></label>}{files.length===0&&<p className="text-sm text-muted-foreground">Ingen vedlegg.</p>}{files.map(f=><div key={f} className="flex min-w-0 gap-2"><Button variant="link" className="min-w-0 truncate" onClick={()=>void open(f)}>{f.slice(37)}</Button>{editable&&<Button variant="outline" onClick={()=>void supabase.storage.from('listing-documentation').remove([`${prefix}/${f}`]).then(()=>load())}>Fjern</Button>}</div>)}</section>;
}