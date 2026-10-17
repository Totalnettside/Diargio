import { createFileRoute, Link } from '@tanstack/react-router';
import { useState } from 'react';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { createArtCheckout } from '@/lib/payments.functions';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { formatPrice } from '@/data/demo';
export const Route=createFileRoute('/kjop/$slug')({
 validateSearch:(s:Record<string,unknown>):{bid?:string|undefined}=>({bid:typeof s['bid']==='string'?s['bid']:undefined}),
 head:()=>({meta:[{title:'Kjøp kunst | Diargio'},{name:'description',content:'Kjøp kunst med én totalpris og frakt separat.'},{property:'og:title',content:'Kjøp kunst | Diargio'},{property:'og:description',content:'Sikker kortbetaling og oversikt over kunstkjøpet.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary'},{name:'robots',content:'noindex'}]}),component:CheckoutPage});
function CheckoutPage(){
 const {slug}=Route.useParams();const {bid}=Route.useSearch();const {allArtworks,bids}=useStore();const {user,loading}=useAuth();
 const [pickup,setPickup]=useState(false);
 const [secret,setSecret]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const art=allArtworks.find(a=>a.slug===slug);const accepted=bids.find(b=>b.id===bid&&b.status==='Godtatt');
 const token=import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
 if(!art)return <main className="mx-auto max-w-3xl px-5 py-10"><p>Henter verket, eller annonsen er utilgjengelig.</p><Button asChild variant="link"><Link to="/kunst">Til kunsten</Link></Button></main>;
 const shipping=(art as typeof art & {shippingPrice?:number}).shippingPrice;
 return <main className="mx-auto max-w-3xl px-5 py-6">
 <p role="status" className="mb-5 border-b border-border bg-muted p-3 text-sm">{token?.startsWith('pk_test_')?'Testbetaling · Ingen ekte penger eller utbetaling til selger.':'Ekte betaling er foreløpig stengt. Fullfør aktivering og avgiftsavklaring.'}</p>
 <h1 className="font-display text-2xl">Kjøp {art.title}</h1>
 <img src={art.image} alt={art.title} className="my-5 max-h-72 w-full object-contain" />
 {art.delivery==='Begge deler'&&<label className="my-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={pickup} disabled={!!secret} onChange={e=>setPickup(e.target.checked)}/>Jeg henter verket · ingen fraktkostnad</label>}
 <dl className="space-y-3 border-y border-border py-4"><div className="flex justify-between"><dt>Verk · gebyrer inkludert</dt><dd>{formatPrice(accepted?.amount??art.price)}</dd></div><div className="flex justify-between"><dt>Frakt</dt><dd>{art.delivery==='Må hentes'||pickup?'Henting · 0 kr':shipping==null?'Selger må oppgi frakt':formatPrice(shipping)}</dd></div></dl>
 <p className="my-4 text-sm text-muted-foreground">Selgeroppgjør avventer mottaksbekreftelse. Tvister behandles av admin. Testkjøp endrer ikke ekte salgsstatus.</p>
 {!user&&!loading?<Button asChild><Link to="/auth" search={{next:`/kjop/${slug}`}}>Logg inn for å kjøpe</Link></Button>:secret?<EmbeddedCheckoutProvider stripe={getStripe()} options={{clientSecret:secret}}><EmbeddedCheckout /></EmbeddedCheckoutProvider>:<Button disabled={busy||loading||!user} onClick={async()=>{setBusy(true);setError('');try{const r=await createArtCheckout({data:{listingId:art.id,pickup,environment:getStripeEnvironment(),...(bid?{bidId:bid}:{})}});if('error'in r)throw new Error(r.error);setSecret(r.clientSecret);}catch(e){setError(e instanceof Error?e.message:'Kunne ikke åpne betaling');}finally{setBusy(false);}}}>{busy?'Åpner betaling …':'Åpne sikker kortbetaling'}</Button>}
 {error&&<p role="alert" className="mt-3 text-destructive">{error}</p>}
 <Button asChild variant="link" className="mt-4"><Link to="/ordre">Mine ordre</Link></Button>
 </main>;
}
