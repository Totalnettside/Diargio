import {useState} from 'react';
import {ArtistBankPayouts} from './ArtistBankPayouts';
import {Link} from '@tanstack/react-router';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/hooks/useAuth';
import {getStripeEnvironment} from '@/lib/stripe';
import {sellerSettlementAmount} from '@/lib/settlement';
import {formatPrice} from '@/data/demo';
import {listArtOrders,getArtistPaymentStatus,startArtistOnboarding,openArtistStripeDashboard} from '@/lib/payments.functions';

const statusLabel:Record<string,string>={paid:'Venter på levering',shipped:'Sendt · venter på kjøper',approved:'Klar for utbetaling',payout_pending:'Utbetaling behandles',paid_out:'Overført til Stripe-konto',disputed:'Under behandling',refund_pending:'Refunderes',refunded:'Refundert'};

export function PayoutsPanel(){
 const {user}=useAuth();const [error,setError]=useState('');const [busy,setBusy]=useState(false);
 const env=getStripeEnvironment();
 const status=useQuery({queryKey:['artist-payment',user?.id,env],enabled:!!user,refetchInterval:15000,queryFn:()=>getArtistPaymentStatus({data:{environment:env}})});
 const orders=useQuery({queryKey:['art-orders',user?.id],enabled:!!user,refetchInterval:10000,queryFn:()=>listArtOrders()});
 const sales=(orders.data?.orders??[]).filter(o=>o.seller_id===user?.id&&o.environment===env&&statusLabel[o.status]);
 const rows=sales.map(o=>({o,payout:sellerSettlementAmount(o)/100}));
 const sum=(f:(s:string)=>boolean)=>rows.filter(r=>f(r.o.status)).reduce((a,r)=>a+r.payout,0);
 const s=status.data&&!('error' in status.data)?status.data:null;
 const go=async(fn:()=>Promise<{url:string}|{error:string}>)=>{setBusy(true);setError('');try{const r=await fn();if('error' in r)throw new Error(r.error);window.location.assign(r.url);}catch(e){setError(e instanceof Error?e.message:'Kunne ikke åpne Stripe');}finally{setBusy(false);}};
 return <section className="mt-5 space-y-5">
  <div className="grid gap-3 sm:grid-cols-3">
   {[['Venter',sum(x=>['paid','shipped','disputed'].includes(x))],['Klar for utbetaling',sum(x=>['approved','payout_pending'].includes(x))],['Overført til Stripe',sum(x=>x==='paid_out')]].map(([l,v])=><div key={l as string} className="rounded-2xl border border-border bg-card p-4"><p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p><p className="mt-1 font-display text-2xl">{formatPrice(v as number)}</p></div>)}
  </div>
  <div className="rounded-2xl border border-border bg-card p-4 text-sm space-y-3">
   <p className="font-semibold">Utbetalingskonto</p>
   <p>{status.isLoading?'Henter status …':status.data&&'error' in status.data?status.data.error:s?.ready?'Kontoen er klar for utbetalinger.':s?.connected?'Kontoen trenger flere opplysninger.':'Ingen utbetalingskonto koblet. Verifiser deg én gang (ID og kontonummer).'}</p>
   <div className="flex flex-wrap gap-2">
    {!s?.ready&&<Button disabled={busy} onClick={()=>go(()=>startArtistOnboarding({data:{environment:env}}))}>{s?.connected?'Fullfør verifisering':'Koble utbetalingskonto'}</Button>}
    {s?.connected&&<Button variant="outline" disabled={busy} onClick={()=>go(()=>openArtistStripeDashboard({data:{environment:env}}))}>Åpne utbetalinger i Stripe</Button>}
   </div>
   {error&&<p role="alert" className="text-destructive">{error}</p>}
  </div>
  {s?.connected&&<ArtistBankPayouts environment={env} />}
  {orders.error&&<p role="alert" className="text-destructive">Kunne ikke hente salg og oppgjør.</p>}
  <div className="rounded-2xl border border-border bg-card">
   <p className="border-b border-border p-4 font-semibold">Salg og utbetalinger</p>
   {rows.length===0?<p className="p-4 text-sm text-muted-foreground">Ingen salg ennå.</p>:<ul>{rows.map(({o,payout})=><li key={o.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4 text-sm last:border-0"><span>{new Date(o.created_at).toLocaleDateString('nb-NO')} · Totalpris {formatPrice(o.artwork_amount/100)}</span><span className="text-muted-foreground">{statusLabel[o.status]}</span><span className="font-semibold">Din utbetaling {formatPrice(payout)}</span></li>)}</ul>}
  </div>
  <p className="text-xs text-muted-foreground">Selgerandelen overføres til din Stripe-konto etter at kjøper har bekreftet mottak. Stripe viser videre bankutbetaling og eventuelle manglende opplysninger. Provisjon og eventuell kunstavgift er trukket fra; frakt inngår i utbetalingen. <Link to="/ordre" className="underline">Se alle ordre</Link></p>
 </section>;
}
