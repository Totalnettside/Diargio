import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/payments/webhook')({server:{handlers:{POST:async({request})=>{
 const env=new URL(request.url).searchParams.get('env');
 if(env!=='sandbox'&&env!=='live')return new Response('Invalid environment',{status:400});
 let event;
 try{const {verifyPaymentWebhook}=await import('@/lib/stripe.server');event=await verifyPaymentWebhook(request,env);}catch{return new Response('Invalid signature',{status:400});}
 try{
  const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
  const {data:claimed,error:claimError}=await a.rpc('claim_payment_event',{_event:event.id,_environment:env});if(claimError)throw claimError;if(!claimed)return Response.json({received:true});
  if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type)){
   const {createStripeClient}=await import('@/lib/stripe.server');
   const session=await createStripeClient(env).checkout.sessions.retrieve((event.data.object as {id:string}).id);
   const {applyCheckoutSession}=await import('@/lib/payment-fulfillment.server');await applyCheckoutSession(session,env);
  }
  if(event.type==='checkout.session.async_payment_failed'){
   const {error}=await a.from('art_orders').update({status:'failed'}).eq('stripe_session_id',(event.data.object as {id:string}).id).eq('environment',env).in('status',['reserved','pending']);if(error)throw error;
  }
  if(event.type.startsWith('refund.')){
   const {createStripeClient}=await import('@/lib/stripe.server');const refund=await createStripeClient(env).refunds.retrieve((event.data.object as {id:string}).id);
   const payment=typeof refund.payment_intent==='string'?refund.payment_intent:refund.payment_intent?.id;
   if(payment){const {data:orders,error:readError}=await a.from('art_orders').select('id,total_amount').eq('stripe_payment_id',payment).eq('environment',env);if(readError)throw readError;
    for(const o of orders??[]){const {error:e}=await a.from('art_orders').update({status:refund.status==='succeeded'&&refund.amount>=o.total_amount?'refunded':'refund_pending',stripe_refund_id:refund.id}).eq('id',o.id);if(e)throw e;}
   }
  }
  if(['charge.refunded','charge.dispute.created','charge.dispute.closed'].includes(event.type)){
   const {createStripeClient}=await import('@/lib/stripe.server');const stripe=createStripeClient(env);const obj=event.data.object as {id:string;charge?:string};
   const charge=await stripe.charges.retrieve(event.type==='charge.refunded'?obj.id:obj.charge??'');
   const payment=typeof charge.payment_intent==='string'?charge.payment_intent:charge.payment_intent?.id;
   if(payment){const {error:e}=await a.from('art_orders').update(event.type==='charge.refunded'?{status:charge.refunded?'refunded':'refund_pending'}:{status:'disputed',dispute_note:'Korttvist hos Stripe · admin må avklare saken'}).eq('stripe_payment_id',payment).eq('environment',env).neq('status','refunded');if(e)throw e;}
  }
  const {error}=await a.from('payment_events').update({processed_at:new Date().toISOString(),processing_until:null}).eq('event_id',event.id).eq('environment',env);if(error)throw error;
  return Response.json({received:true});
 }catch(e){const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');await a.from('payment_events').update({processing_until:null}).eq('event_id',event.id).eq('environment',env);console.error('Payment reconciliation failed',e);return new Response('Retry required',{status:500});}
}}}});
