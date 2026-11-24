import {createStripeClient,type StripeEnv,getStripeErrorMessage} from './stripe.server';
import {sellerSettlementAmount,accountReady} from './settlement';

export async function livePaymentReadiness(){
 if(process.env['DIARGIO_LIVE_PAYMENTS_APPROVED']!=='true')return {ready:false,reason:'Ekte betaling avventer siste oppgjørskontroll.'};
 const account=await createStripeClient('live').accounts.retrieve(null);
 if(!account.charges_enabled||!account.payouts_enabled||account.settings?.payouts?.schedule?.interval!=='manual')return {ready:false,reason:'Stripe-kontoen må være aktiv og ha godkjent oppsett for utsatt selgeroppgjør.'};
 return {ready:true,reason:''};
}

export async function settleArtOrder(orderId:string,operation:'payout'|'refund'){
 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
 const {data:o,error:readError}=await a.from('art_orders').select('*').eq('id',orderId).single();
 if(readError||!o?.stripe_payment_id)throw new Error('Ordren mangler bekreftet betaling.');
 if(o.environment!=='live'&&o.environment!=='sandbox')throw new Error('Invalid environment');
 const env:StripeEnv=o.environment;
 if(env==='live'&&operation==='payout'){const readiness=await livePaymentReadiness();if(!readiness.ready)throw new Error(readiness.reason);}
 const {data:account,error:accountError}=await a.from('artist_payment_accounts').select('stripe_account_id').eq('user_id',o.seller_id).eq('environment',env).maybeSingle();
 if(accountError||!account)throw new Error('Selger må fullføre verifisering av utbetalingskonto først.');
 const stripe=createStripeClient(env);
 if(operation==='payout'){
  const destination=await stripe.accounts.retrieve(account.stripe_account_id);
  if(destination.metadata?.['userId']!==o.seller_id||!accountReady(destination))throw new Error('Selgers utbetalingskonto er ikke ferdig verifisert.');
 }
 const amount=sellerSettlementAmount(o);
 const {data:claim,error}=await a.rpc('claim_art_settlement',{_order:o.id,_operation:operation,_amount:amount,_destination:account.stripe_account_id});
 if(error||!claim)throw new Error(error?.message??'Kunne ikke låse oppgjøret.');
 if(operation==='payout'&&o.status==='paid_out')return {ok:true};
 const token=claim.lease_token;if(!token)throw new Error('Oppgjørslåsen mangler.');
 try{
  const payment=await stripe.paymentIntents.retrieve(o.stripe_payment_id,{expand:['latest_charge']});
  const charge=payment.latest_charge;
  if(payment.status!=='succeeded'||payment.amount!==o.total_amount||payment.currency!==o.currency||payment.livemode!==(env==='live')||!charge||typeof charge==='string')throw new Error('Stripe-betalingen stemmer ikke med ordren.');
  const group=`art-order-${o.id}`;
  const found=await stripe.transfers.list({transfer_group:group,limit:100});
  if(found.has_more||found.data.length>1)throw new Error('Oppgjøret krever manuell avstemming.');
  let transfer=found.data[0];
  if(transfer&&(transfer.amount!==amount||transfer.currency!==o.currency||transfer.destination!==account.stripe_account_id||transfer.metadata['orderId']!==o.id))throw new Error('Stripe-overføringen stemmer ikke med ordren.');
  let reversal:string|null=claim.reversal_id;
  let refundId:string|null=null;
  let finalStatus:'paid_out'|'refunded'|'refund_pending'='paid_out';
  if(operation==='payout'){
   if(charge.refunded||charge.disputed||charge.amount_refunded>0)throw new Error('Betalingen har refusjon eller korttvist. Oppgjøret er stanset.');
   if(transfer?.reversed)throw new Error('Overføringen er allerede reversert.');
   transfer??=await stripe.transfers.create({amount,currency:o.currency,destination:account.stripe_account_id,source_transaction:charge.id,transfer_group:group,metadata:{orderId:o.id,environment:env}},{idempotencyKey:`settlement-${o.id}`});
  }else{
   if(transfer&&!transfer.reversed){
    const reversals=await stripe.transfers.listReversals(transfer.id,{limit:100});
    const prior=reversals.data.find(r=>r.metadata?.['orderId']===o.id);
    if(prior)reversal=prior.id;
    else reversal=(await stripe.transfers.createReversal(transfer.id,{metadata:{orderId:o.id}},{idempotencyKey:`settlement-reversal-${o.id}`})).id;
   }
   const refunded=await stripe.refunds.list({payment_intent:payment.id,limit:100});
   if(refunded.has_more)throw new Error('Refusjoner krever manuell avstemming.');
   const prior=refunded.data.find(r=>r.metadata?.['orderId']===o.id);
   if(!prior&&refunded.data.some(r=>r.status==='pending'||r.status==='succeeded'))throw new Error('En annen refusjon finnes. Admin må avstemme beløpet først.');
   const refund=prior??await stripe.refunds.create({payment_intent:payment.id,metadata:{orderId:o.id}},{idempotencyKey:`refund-${o.id}`});
   refundId=refund.id;finalStatus=refund.status==='succeeded'?'refunded':'refund_pending';
  }
  const {error:finishError}=await a.rpc('finish_art_settlement',{_order:o.id,_token:token,_transfer:transfer?.id??'',_reversal:reversal??'',_refund:refundId??'',_status:finalStatus});
  if(finishError)throw new Error('Stripe har behandlet oppgjøret. Kontroller oppgjøret igjen for avstemming.');
  return {ok:true};
 }catch(e){
  await a.from('art_settlements').update({lease_until:null,last_error:getStripeErrorMessage(e)}).eq('order_id',o.id).eq('lease_token',token);
  throw e;
 }
}