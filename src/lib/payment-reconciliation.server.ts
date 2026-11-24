import {createStripeClient,type StripeEnv} from './stripe.server';
export async function reconcileArtCharge(chargeId:string,environment:StripeEnv){
 const stripe=createStripeClient(environment);const charge=await stripe.charges.retrieve(chargeId);
 if(charge.livemode!==(environment==='live'))throw new Error('Charge environment mismatch');
 const payment=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id;if(!payment)return;
 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
 const {data:o,error}=await a.from('art_orders').select('*').eq('stripe_payment_id',payment).eq('environment',environment).maybeSingle();
 if(error)throw error;if(!o||o.status==='refunded')return;
 if(o.total_amount!==charge.amount||o.currency!==charge.currency)throw new Error('Charge amount mismatch');
 const {data:claim,error:claimError}=await a.from('art_settlements').select('*').eq('order_id',o.id).maybeSingle();if(claimError)throw claimError;
 if(claim?.operation&&claim.lease_until&&new Date(claim.lease_until).getTime()>Date.now())throw new Error('Settlement in progress; retry event');
 if(!charge.refunded&&!charge.disputed&&charge.amount_refunded===0)return;
 if(claim?.transfer_id&&(charge.refunded||charge.disputed)){
  const transfer=await stripe.transfers.retrieve(claim.transfer_id);
  if(!transfer.reversed){const reversal=await stripe.transfers.createReversal(transfer.id,{metadata:{orderId:o.id}},{idempotencyKey:`reconcile-reversal-${o.id}`});const {error:saveError}=await a.from('art_settlements').update({reversal_id:reversal.id}).eq('order_id',o.id);if(saveError)throw saveError;}
 }
 const {error:saveError}=await a.from('art_orders').update(charge.refunded?{status:'refunded'}:charge.disputed?{status:'disputed',dispute_note:'Korttvist hos Stripe. Kjøper kontakter selger; administrator avklarer oppgjøret.'}:{status:'refund_pending',dispute_note:'Delvis refusjon hos Stripe. Administrator må avstemme oppgjøret.'}).eq('id',o.id).eq('status',o.status);if(saveError)throw saveError;
}