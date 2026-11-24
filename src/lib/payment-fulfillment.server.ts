import {isPaymentMatch} from './payment-state';
import type Stripe from 'stripe';
export async function applyCheckoutSession(s:Stripe.Checkout.Session,environment:'sandbox'|'live') {
 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
 if(s.livemode!==(environment==='live'))throw new Error('Environment mismatch');
 const orderId=s.metadata?.['orderId'];
 if(!orderId)return;
 const {data:o,error}=await a.from('art_orders').select('*').eq('id',orderId).eq('environment',environment).single();
 if(error||!o||o.stripe_session_id!==s.id||s.metadata?.['userId']!==o.buyer_id)throw new Error('Order mismatch');
 if(s.payment_status==='paid'){
  const payment=typeof s.payment_intent==='string'?s.payment_intent:s.payment_intent?.id;
  if(!payment||s.amount_total==null||!s.currency||!isPaymentMatch(o,{id:s.id,userId:s.metadata?.['userId'],environment:s.metadata?.['environment'],amount:s.amount_total,currency:s.currency}))throw new Error('Payment incomplete or mismatched');
  const {error:e}=await a.rpc('confirm_art_payment',{_order:o.id,_session:s.id,_payment:payment,_amount:s.amount_total,_currency:s.currency});
  if(e)throw new Error(e.message);
  if(environment==='live'&&!['refunded','refund_pending'].includes(o.status)){
   const {data:purchase,error:purchaseError}=await a.from('purchases').select('id').eq('listing_id',o.listing_id).eq('buyer_id',o.buyer_id).single();if(purchaseError)throw purchaseError;
   const {data:seller}=await a.auth.admin.getUserById(o.seller_id);
   if(seller.user?.email){const {sendTemplateEmail}=await import('./email-templates/send-email');await sendTemplateEmail('seller-notice',seller.user.email,{idempotencyKey:`seller-sale-${purchase.id}`,templateData:{kind:'sale',title:(o.snapshot as {title?:string}).title??'Kunstverk',amount:(o.artwork_amount/100).toLocaleString('nb-NO')}});}
  }
 }else if(s.status==='expired'){
  const {error:e}=await a.from('art_orders').update({status:'expired'}).eq('id',o.id).eq('status','reserved');if(e)throw e;
 }else if(s.status==='complete'){
  const {error:e}=await a.from('art_orders').update({status:'pending'}).eq('id',o.id).eq('status','reserved');if(e)throw e;
 }
}
