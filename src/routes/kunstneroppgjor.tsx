import {createFileRoute,Link} from '@tanstack/react-router';
import {useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {Button} from '@/components/ui/button';
import {useAuth} from '@/hooks/useAuth';
import {getStripeEnvironment} from '@/lib/stripe';
import {startArtistOnboarding,getArtistPaymentStatus} from '@/lib/payments.functions';
import {privateHead,privatePageFor} from '@/lib/seo';
export const Route=createFileRoute('/kunstneroppgjor')({head:()=>{const page=privatePageFor('/kunstneroppgjor');return privateHead(page.title,page.description);},component:ArtistPayments});
function ArtistPayments(){const {user}=useAuth();const [error,setError]=useState('');const [busy,setBusy]=useState(false);const q=useQuery({queryKey:['artist-payment',user?.id],enabled:!!user,queryFn:()=>getArtistPaymentStatus({data:{environment:getStripeEnvironment()}})});return <main className="mx-auto max-w-xl space-y-5 px-5 py-10"><h1 className="font-display text-2xl">Kunstneroppgjør</h1><p className="text-sm">Kun testmiljø. Ekte utbetaling er ikke åpnet. Mottaksbekreftelse, avgiftsavklaring og godkjent oppgjørsoppsett kreves.</p>{!user?<Button asChild><Link to="/auth" search={{next:'/kunstneroppgjor'}}>Logg inn</Link></Button>:<><p>{q.data&&'error'in q.data?q.data.error:q.data?.ready?'Betalingskontoen støtter testoverføringer.':q.data?.connected?'Betalingskontoen trenger flere opplysninger.':'Ingen betalingskonto koblet.'}</p><Button disabled={busy} onClick={async()=>{setBusy(true);try{const r=await startArtistOnboarding({data:{environment:getStripeEnvironment()}});if('error'in r)throw new Error(r.error);window.location.assign(r.url);}catch(e){setError(e instanceof Error?e.message:'Kunne ikke åpne oppsett');}finally{setBusy(false);}}}>Sett opp kunstnerkonto i testmiljø</Button></>}{error&&<p role="alert" className="text-destructive">{error}</p>}<Button asChild variant="link"><Link to="/ordre">Ordre og oppgjør</Link></Button></main>;}
