import { createFileRoute, Link } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { getBringQuote } from '@/lib/bring.functions';
import type { BringQuote } from '@/lib/bring';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { useStore } from '@/lib/store';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { NorwegianAddressInput } from '@/components/NorwegianAddressInput';
import {useQuery} from '@tanstack/react-query';
import { createArtCheckout,getPaymentReadiness } from '@/lib/payments.functions';
import { getStripe, getStripeEnvironment } from '@/lib/stripe';
import { formatPrice } from '@/data/demo';
import { privateHead, privatePageFor } from '@/lib/seo';
export const Route=createFileRoute('/kjop/$slug')({
 validateSearch:(s:Record<string,unknown>):{bid?:string|undefined}=>({bid:typeof s['bid']==='string'?s['bid']:undefined}),
 head:()=>{const page=privatePageFor('/kjop');return privateHead(page.title,page.description);},component:CheckoutPage});
function CheckoutPage(){
 const {slug}=Route.useParams();const {bid}=Route.useSearch();const {allArtworks,bids}=useStore();const {user,loading}=useAuth();
 const [pickup,setPickup]=useState(false);
 const [recipient,setRecipient]=useState('');const [address,setAddress]=useState('');const [city,setCity]=useState('');
 const readiness=useQuery({queryKey:['payment-readiness'],queryFn:()=>getPaymentReadiness()});
 const quoteShipping = useServerFn(getBringQuote);
 const openCheckout = useServerFn(createArtCheckout);
 const [toPostalCode,setToPostalCode]=useState('');
 const [quote,setQuote]=useState<BringQuote | null>(null);
 const [quoting,setQuoting]=useState(false);
 const [quoteAttempt,setQuoteAttempt]=useState(0);
 const [secret,setSecret]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 const art=allArtworks.find(a=>a.slug===slug);const accepted=bids.find(b=>b.id===bid&&b.status==='Godtatt');
 useEffect(() => {
   setQuote(null);
   if (!art || !user || art.shippingMethod !== 'bring' || art.delivery === 'Må hentes' || pickup || toPostalCode.length !== 4) {setQuoting(false);return;}
   let active = true;
   setQuoting(true);setError('');
   const timer = setTimeout(() => {
     void quoteShipping({data:{listingId:art.id,toPostalCode}}).then(result => {
       if (!active) return;
       if ('error' in result) setError(result.error); else setQuote(result.quote);
     }).catch(() => {if(active)setError('Kunne ikke beregne frakt. Prøv igjen.');}).finally(() => {if(active)setQuoting(false);});
   }, 350);
   return () => {active=false;clearTimeout(timer);};
 }, [art?.id, art?.shippingMethod, art?.delivery, user?.id, pickup, toPostalCode, quoteAttempt, quoteShipping]);
 const token=import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
 if(!art)return <main className="mx-auto max-w-3xl px-5 py-10"><p>Henter verket, eller annonsen er utilgjengelig.</p><Button asChild variant="link"><Link to="/kunst">Til kunsten</Link></Button></main>;
 const shipping=(art as typeof art & {shippingPrice?:number}).shippingPrice;
 const isPickup = art.delivery === 'Må hentes' || pickup;
 const bringShipping = !isPickup && art.shippingMethod === 'bring';
 const shippingAmount = isPickup ? 0 : bringShipping ? quote ? quote.amount / 100 : null : shipping ?? null;
 return <main className="mx-auto max-w-3xl px-5 py-6">
 <p role="status" className="mb-5 border-b border-border bg-muted p-3 text-sm">{token?.startsWith('pk_test_')?'Testbetaling · Ingen ekte penger eller bankutbetaling.':!token?'Betaling er ikke konfigurert. Fullfør Stripe-aktivering.':readiness.data?.ready?'Sikker betaling med kort, Apple Pay eller Klarna':readiness.data?.reason??'Kontrollerer betalingsoppsett …'}</p>
 <h1 className="font-display text-2xl">Kjøp {art.title}</h1>
 <img src={art.image} alt={art.title} className="my-5 max-h-72 w-full object-contain" />
 {art.delivery==='Begge deler'&&<label className="my-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={pickup} disabled={!!secret} onChange={e=>setPickup(e.target.checked)}/>Jeg henter verket · ingen fraktkostnad</label>}
 {bringShipping && <section className="my-5 space-y-3"><h2 className="font-semibold">Bring · Pakke til hentested</h2><div className="flex flex-wrap items-end gap-3"><label className="flex-1 space-y-1 text-sm"><span>Ditt postnummer</span><input className="block w-full rounded-md border border-primary/40 bg-background px-3 py-2.5 text-foreground focus:ring-2 focus:ring-ring" inputMode="numeric" maxLength={4} value={toPostalCode} disabled={!!secret} onChange={e => {setToPostalCode(e.target.value.replace(/\D/g,'').slice(0,4));setQuote(null);setError('');}} /></label><Button variant="outline" disabled={quoting || !!secret || !user || toPostalCode.length !== 4} onClick={() => setQuoteAttempt(attempt => attempt + 1)}>{quoting ? 'Beregner …' : 'Beregn på nytt'}</Button></div></section>}
 {bringShipping && art.shippingPackage?.estimated && <p className="mb-4 text-sm text-muted-foreground">Fraktprisen er veiledende og beregnes ut fra anslått vekt og pakkemål. Endelig pris kan variere med emballasje og leveringsadresse.</p>}
 {!isPickup&&<section className="my-5 space-y-3"><h2 className="font-semibold">Leveringsadresse</h2><label className="block space-y-1 text-sm"><span>Mottakers navn</span><input className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" autoComplete="name" value={recipient} disabled={!!secret} onChange={e=>setRecipient(e.target.value)} /></label><NorwegianAddressInput value={address} disabled={!!secret} onChange={setAddress} onSelect={suggestion=>{setAddress(suggestion.line1);setToPostalCode(suggestion.postalCode);setCity(suggestion.city);setError('');}} /><label className="block space-y-1 text-sm"><span>Poststed</span><input className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" autoComplete="address-level2" value={city} disabled={!!secret} onChange={e=>setCity(e.target.value)} /></label>{!bringShipping&&<label className="block space-y-1 text-sm"><span>Postnummer</span><input className="block w-full rounded-md border border-border bg-background px-3 py-2 text-foreground" autoComplete="postal-code" inputMode="numeric" maxLength={4} value={toPostalCode} disabled={!!secret} onChange={e=>setToPostalCode(e.target.value.replace(/\D/g,'').slice(0,4))} /></label>}</section>}
 <dl className="space-y-3 border-y border-border py-4"><div className="flex justify-between"><dt>Verk · gebyrer inkludert</dt><dd>{formatPrice(accepted?.amount??art.price)}</dd></div><div className="flex justify-between gap-3"><dt>Frakt</dt><dd>{isPickup?'Henting · 0 kr':shippingAmount == null ? bringShipping ? 'Beregnes med Bring' : 'Selger må oppgi frakt' : formatPrice(shippingAmount)}</dd></div>{shippingAmount != null && <div className="flex justify-between font-semibold"><dt>Totalt</dt><dd>{formatPrice((accepted?.amount ?? art.price)+shippingAmount)}</dd></div>}</dl>
 <p className="my-4 text-sm text-muted-foreground">Selgeroppgjør avventer mottaksbekreftelse. Selger er ansvarlig for beskrivelse og forsvarlig pakking. Kontakt selger først ved varefeil eller transportskade. Lovfestede rettigheter gjelder uansett. Testkjøp endrer ikke ekte salgsstatus.</p>
 {!user&&!loading?<Button asChild><Link to="/auth" search={{next:`/kjop/${slug}`}}>Logg inn for å kjøpe</Link></Button>:secret?<EmbeddedCheckoutProvider stripe={getStripe()} options={{clientSecret:secret}}><EmbeddedCheckout /></EmbeddedCheckoutProvider>:<Button disabled={busy||loading||!user||quoting||(bringShipping&&!quote)||shippingAmount==null||(!isPickup&&(!recipient.trim()||!address.trim()||!city.trim()||!/^\d{4}$/.test(toPostalCode)))||(token?.startsWith('pk_live_')&&!readiness.data?.ready)} onClick={async()=>{setBusy(true);setError('');try{const r=await openCheckout({data:{listingId:art.id,pickup,...(!isPickup?{shippingAddress:{name:recipient,line1:address,postalCode:toPostalCode,city}}:{}),environment:getStripeEnvironment(),...(bid?{bidId:bid}:{}),...(bringShipping&&quote?{toPostalCode,expectedShipping:quote.amount}:{})}});if('error'in r)throw new Error(r.error);setSecret(r.clientSecret);}catch(e){setError(e instanceof Error?e.message:'Kunne ikke åpne betaling');}finally{setBusy(false);}}}>{busy?'Åpner betaling …':'Åpne sikker betaling'}</Button>}
 {error&&<p role="alert" className="mt-3 text-destructive">{error}</p>}
 <Button asChild variant="link" className="mt-4"><Link to="/ordre">Mine ordre</Link></Button>
 </main>;
}
