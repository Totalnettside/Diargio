import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/payments/webhook')({server:{handlers:{POST:async({request})=>{
 const env=new URL(request.url).searchParams.get('env');
 if(env!=='sandbox'&&env!=='live')return new Response('Invalid environment',{status:400});
 let event;
 try{const {verifyPaymentWebhook}=await import('@/lib/stripe.server');event=await verifyPaymentWebhook(request,env);}catch{return new Response('Invalid signature',{status:400});}
 try{
  const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
  const {data:seen}=await a.from('payment_events').select('event_id').eq('event_id',event.id).eq('environment',env).maybeSingle();
  if(seen)return Response.json({received:true});
  if(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.expired'].includes(event.type)){
   const {createStripeClient}=await import('@/lib/stripe.server');
   const session=await createStripeClient(env).checkout.sessions.retrieve((event.data.object as {id:string}).id);
   const {applyCheckoutSession}=await import('@/lib/payment-fulfillment.server');await applyCheckoutSession(session,env);
  }
  if(event.type==='checkout.session.async_payment_failed'){
   const {error}=await a.from('art_orders').update({status:'failed'}).eq('stripe_session_id',(event.data.object as {id:string}).id).eq('environment',env).in('status',['reserved','pending']);if(error)throw error;
  }
  const {error}=await a.from('payment_events').upsert({event_id:event.id,environment:env});if(error)throw error;
  return Response.json({received:true});
 }catch(e){console.error('Payment reconciliation failed',e);return new Response('Retry required',{status:500});}
}}}});
