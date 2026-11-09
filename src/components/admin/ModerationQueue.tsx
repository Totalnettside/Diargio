import {useState} from 'react';
import {useServerFn} from '@tanstack/react-start';
import {useQuery} from '@tanstack/react-query';
import {getModerationQueue,reviewListing,sendReviewNotice} from '@/lib/moderation.functions';
import {moderationLabels} from '@/lib/moderation';
import {Button} from '@/components/ui/button';
import {ArtworkPreview} from '@/components/ArtworkPreview';
import {ListingDocumentation} from '@/components/ListingDocumentation';
import type {Artwork} from '@/data/demo';

export function ModerationQueue() {
  const fetchQueue=useServerFn(getModerationQueue);
  const decide=useServerFn(reviewListing);
  const send=useServerFn(sendReviewNotice);
  const {data,error,isLoading,refetch}=useQuery({queryKey:['moderation-queue'],queryFn:()=>fetchQueue(),refetchInterval:15000});
  const [filter,setFilter]=useState('pending');
  const [search,setSearch]=useState('');
  const [selected,setSelected]=useState<string|null>(null);
  const [reason,setReason]=useState('');
  const [note,setNote]=useState('');
  const [message,setMessage]=useState('');
  const [busy,setBusy]=useState(false);
  if(isLoading)return <p>Laster annonser til godkjenning …</p>;
  if(error||!data)return <p role="alert" className="text-destructive">Kunne ikke laste godkjenningskøen.</p>;
  const name=(id:string)=>data.profiles.find(p=>p.id===id)?.display_name??'Selger';
  const rows=data.revisions.filter(r=>(filter==='all'||r.status===filter)&&`${(r.data as unknown as Artwork).title} ${name(r.user_id)} ${r.listing_id}`.toLowerCase().includes(search.toLowerCase()));
  const revision=data.revisions.find(r=>r.id===selected);
  const artwork=revision?.data as unknown as Artwork|undefined;
  async function decision(decision:'published'|'changes_requested'|'rejected') {
    if(!revision)return;
    setBusy(true);setMessage('');
    try {
      const result=await decide({data:{revisionId:revision.id,version:revision.version,decision,reason,note}});
      setMessage('Beslutningen er lagret.');
      if(result.eventId){try{const delivery=await send({data:{eventId:result.eventId}});setMessage(delivery.status==='sent'?'Beslutningen er lagret, og e-postvarselet er sendt.':delivery.status==='suppressed'?'Beslutningen er lagret. E-post er blokkert for mottakeren.':'Beslutningen er lagret. E-postvarselet venter; prøv igjen nedenfor.');}catch{setMessage('Beslutningen er lagret. E-postvarselet venter; prøv igjen nedenfor.');}}
      setSelected(null);setReason('');setNote('');
    }catch(e){setMessage(e instanceof Error?e.message:'Kunne ikke behandle annonsen.');}
    finally{await refetch();setBusy(false);}
  }
  return <section className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-display text-xl font-semibold">Annonser til godkjenning <span className="text-primary">({data.revisions.filter(r=>r.status==='pending').length})</span></h2><Button variant="outline" onClick={()=>void refetch()}>Oppdater</Button></div>
    <div className="flex flex-wrap gap-3"><input aria-label="Søk i godkjenningskøen" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Tittel, selger eller annonse-ID" className="min-w-0 flex-1 rounded-md border border-input bg-background p-2 text-sm"/><select aria-label="Godkjenningsstatus" value={filter} onChange={e=>setFilter(e.target.value)} className="rounded-md border border-input bg-background p-2 text-sm"><option value="all">Alle statuser</option>{Object.entries(moderationLabels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></div>
    {message&&<p role="status" className="text-sm">{message}</p>}
    {rows.length===0&&<p className="text-muted-foreground">Ingen annonser i denne oversikten.</p>}
    <div className="divide-y divide-border">{rows.map(r=>{const a=r.data as unknown as Artwork;return <div key={r.id} className="flex flex-wrap items-center gap-4 py-4"><div className="w-20 shrink-0"><ArtworkPreview image={a.image} alt={a.title}/></div><div className="min-w-0 flex-1"><h3 className="break-words font-semibold">{a.title}</h3><p className="text-sm text-muted-foreground">{name(r.user_id)} · {Number(a.price).toLocaleString('nb-NO')} kr</p><p className="text-xs text-muted-foreground">{moderationLabels[r.status as keyof typeof moderationLabels]} · {r.submitted_at?new Date(r.submitted_at).toLocaleString('nb-NO'):'Ikke innsendt'} · versjon {r.version}</p></div><Button variant="outline" onClick={()=>{setSelected(r.id);setReason('');setNote('');}}>Gjennomgå</Button></div>;})}</div>
    {revision&&artwork&&<section className="space-y-4 border-t-2 border-primary pt-5"><div className="flex justify-between gap-3"><h3 className="font-display text-xl">{artwork.title} · versjon {revision.version}</h3><Button variant="ghost" onClick={()=>setSelected(null)}>Lukk</Button></div><div className="grid gap-4 sm:grid-cols-3">{(artwork.images?.length?artwork.images:[artwork.image]).map((src,i)=><ArtworkPreview key={i} image={src} alt={`${artwork.title}, bilde ${i+1}`}/>)}</div>
      <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">{Object.entries(artwork).filter(([k])=>!['image','images','moderationStatus','revisionId','sellerMessage'].includes(k)).map(([k,v])=><div key={k} className="min-w-0"><dt className="font-semibold">{({sellerType:'Selgertype',ownWork:'Eget verk',type:'Original/trykk/reproduksjon',description:'Beskrivelse',artistName:'Kunstner',condition:'Tilstand',provenance:'Proveniens',widthCm:'Bredde (cm)',heightCm:'Høyde (cm)',price:'Pris',shippingPrice:'Frakt',delivery:'Levering'} as Record<string,string>)[k]??k}</dt><dd className="break-words text-muted-foreground">{typeof v==='boolean'?(v?'Ja':'Nei'):String(v??'Ikke oppgitt')}</dd></div>)}</dl>
      <ListingDocumentation listingId={revision.listing_id} ownerId={revision.user_id}/>
      {revision.status==='pending'&&<><label className="block text-sm font-semibold">Beskjed til selger / begrunnelse<textarea aria-label="Beskjed til selger" value={reason} onChange={e=>setReason(e.target.value)} rows={3} className="mt-1 w-full rounded-md border border-input bg-background p-3 font-normal"/></label><label className="block text-sm font-semibold">Internt administratornotat<textarea aria-label="Internt administratornotat" value={note} onChange={e=>setNote(e.target.value)} rows={2} className="mt-1 w-full rounded-md border border-input bg-background p-3 font-normal"/></label><div className="flex flex-wrap gap-2"><Button disabled={busy} onClick={()=>void decision('published')}>Godkjenn og publiser</Button><Button variant="outline" disabled={busy||!reason.trim()} onClick={()=>void decision('changes_requested')}>Be om endringer</Button><Button variant="destructive" disabled={busy||!reason.trim()} onClick={()=>void decision('rejected')}>Avslå</Button></div></>}
      <h4 className="font-semibold">Historikk</h4>{data.events.filter(e=>e.listing_id===revision.listing_id).map(e=><div key={e.id} className="border-t border-border py-2 text-sm"><p>{e.decision==='submitted'?'Innsendt':moderationLabels[e.decision as keyof typeof moderationLabels]??e.decision} · versjon {e.version} · {name(e.actor_id)} · {new Date(e.created_at).toLocaleString('nb-NO')}</p>{e.reason&&<p>Beskjed: {e.reason}</p>}{data.notes.find(n=>n.event_id===e.id)?.note&&<p className="text-muted-foreground">Internt: {data.notes.find(n=>n.event_id===e.id)?.note}</p>}</div>)}
    </section>}
    <section className="border-t border-border pt-4"><h3 className="font-semibold">E-postvarsler som venter</h3>{data.events.filter(e=>['failed','not_sent'].includes(e.email_status)).map(e=><div key={e.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border py-3 text-sm"><span className="min-w-0 break-words">{e.title} · {e.decision==='submitted'?'Til administrasjonen':'Til selger'} · {e.email_error??'Ikke sendt'}</span><Button variant="outline" disabled={busy||Boolean(e.email_retry_at&&new Date(e.email_retry_at)>new Date())} onClick={()=>{setBusy(true);void send({data:{eventId:e.id}}).then(r=>setMessage(r.status==='sent'?'E-postvarselet er sendt.':'E-postvarselet er ikke sendt; status er oppdatert.')).catch(()=>setMessage('Kunne ikke sende varselet.')).finally(()=>{setBusy(false);void refetch();});}}>Prøv utsending igjen</Button></div>)}</section>
  </section>;
}