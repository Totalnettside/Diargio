import {createFileRoute} from '@tanstack/react-router';
export const Route=createFileRoute('/api/public/payments/webhook')({server:{handlers:{POST:async({request})=>{
 const env=new URL(request.url).searchParams.get('env');
 if(env!=='sandbox'&&env!=='live')return new Response('Invalid environment',{status:400});
 let event;
 try{const {verifyPaymentWebhook}=await import('@/lib/stripe.server');event=await verifyPaymentWebhook(request,env);}catch{return new Response('Invalid signature',{status:400});}
 try{
  if(event.livemode!==(env==='live'))return new Response('Invalid event environment',{status:400});
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
   const charge=typeof refund.charge==='string'?refund.charge:refund.charge?.id;
   if(charge){const {reconcileArtCharge}=await import('@/lib/payment-reconciliation.server');await reconcileArtCharge(charge,env);}
  }
  if(['charge.refunded','charge.dispute.created','charge.dispute.closed'].includes(event.type)){
   const obj=event.data.object as {id:string;charge?:string};
   const {reconcileArtCharge}=await import('@/lib/payment-reconciliation.server');await reconcileArtCharge(event.type==='charge.refunded'?obj.id:obj.charge??'',env);
  }
  if(event.type==='transfer.created'){
   const obj=event.data.object as {metadata?:Record<string,string>};const orderId=obj.metadata?.['orderId'];
   if(orderId){const {data:o}=await a.from('art_orders').select('status').eq('id',orderId).eq('environment',env).maybeSingle();if(o?.status==='payout_pending'){const {settleArtOrder}=await import('@/lib/settlement.server');await settleArtOrder(orderId,'payout');}}
  }
  if(event.type==='account.updated'){
   const account=event.data.object as {id:string};
   const {data:seller,error}=await a.from('artist_payment_accounts').select('user_id').eq('stripe_account_id',account.id).eq('environment',env).maybeSingle();if(error)throw error;
   if(seller){
    const {createStripeClient}=await import('@/lib/stripe.server');const {accountReady}=await import('@/lib/settlement');
    if(accountReady(await createStripeClient(env).accounts.retrieve(account.id))){
     const {data:orders,error}=await a.from('art_orders').select('id').eq('seller_id',seller.user_id).eq('environment',env).in('status',['approved','payout_pending']);if(error)throw error;
     const {settleArtOrder}=await import('@/lib/settlement.server');for(const order of orders??[])await settleArtOrder(order.id,'payout');
    }
   }
  }
  if(event.type==='transfer.reversed'){
   const transfer=event.data.object as {id:string;metadata?:Record<string,string>};const orderId=transfer.metadata?.['orderId'];
   if(orderId){const {data:s,error}=await a.from('art_settlements').select('transfer_id,reversal_id,operation').eq('order_id',orderId).eq('environment',env).maybeSingle();if(error)throw error;
    if(s?.transfer_id===transfer.id&&!s.reversal_id&&s.operation===null){const {error}=await a.from('art_orders').update({status:'disputed',dispute_note:'Selgeroverføringen er reversert hos Stripe. Administrator må avstemme oppgjøret.'}).eq('id',orderId).eq('status','paid_out');if(error)throw error;}
   }
  }
  const {error}=await a.from('payment_events').update({processed_at:new Date().toISOString(),processing_until:null}).eq('event_id',event.id).eq('environment',env);if(error)throw error;
  return Response.json({received:true});
 }catch(e){const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');await a.from('payment_events').update({processing_until:null}).eq('event_id',event.id).eq('environment',env);console.error('Payment reconciliation failed',e);return new Response('Retry required',{status:500});}
}}}});
