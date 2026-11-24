import {useAuth} from '@/hooks/useAuth';
import {useQuery} from '@tanstack/react-query';
import {getArtistPayoutOverview} from '@/lib/payments.functions';
import {formatPrice} from '@/data/demo';
export function ArtistBankPayouts({environment}:{environment:'sandbox'|'live'}){
 const {user}=useAuth();
 const q=useQuery({queryKey:['artist-bank-payouts',user?.id,environment],enabled:!!user,queryFn:()=>getArtistPayoutOverview({data:{environment}}),refetchInterval:30000});
 if(q.isPending)return <p className="text-sm text-muted-foreground">Henter Stripe-saldo …</p>;
 if(q.error||!q.data)return <p role="alert">Kunne ikke hente bankutbetalinger.</p>;
 if('error' in q.data)return <p role="alert" className="text-destructive">{q.data.error}</p>;
 return <section className="space-y-3 border-y border-border py-4"><h3 className="font-semibold">Saldo og bankutbetalinger fra Stripe</h3><p className="text-sm">Tilgjengelig: {formatPrice(q.data.available/100)} · Under behandling: {formatPrice(q.data.pending/100)}</p>{q.data.payouts.length===0?<p className="text-sm text-muted-foreground">Ingen bankutbetalinger registrert.</p>:<ul className="divide-y divide-border">{q.data.payouts.map(p=><li key={p.id} className="flex flex-wrap justify-between gap-2 py-3 text-sm"><span>{formatPrice(p.amount/100)} · {p.currency.toUpperCase()}</span><span>{p.status==='paid'?'Utbetalt til bank':p.status==='failed'?'Mislyktes – kontroller bankkonto':p.status==='canceled'?'Avbrutt':'Under behandling'} · {new Date(p.arrival*1000).toLocaleDateString('nb-NO')}</span></li>)}</ul>}</section>;
}