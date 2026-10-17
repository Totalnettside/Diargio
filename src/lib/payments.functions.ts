import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { createStripeClient, getStripeErrorMessage } from '@/lib/stripe.server';
import { checkoutAmounts, environmentSchema } from './commerce';
import type { Artwork } from '@/data/demo';

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error('Invalid userId');
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    if (found.data.length) return found.data[0].id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    if (existing.data.length) {
      const customer = existing.data[0];
      if (options.userId && customer.metadata?.userId !== options.userId) {
        await stripe.customers.update(customer.id, { metadata: { ...customer.metadata, userId: options.userId } });
      }
      return customer.id;
    }
  }
  const created = await stripe.customers.create({ ...(options.email && { email: options.email }), ...(options.userId && { metadata: { userId: options.userId } }) });
  return created.id;
}
const checkoutInput=z.object({listingId:z.string().min(1).max(200),environment:environmentSchema,bidId:z.string().uuid().optional()});
export const createArtCheckout=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>checkoutInput.parse(d)).handler(async({data,context}):Promise<{clientSecret:string;orderId:string}|{error:string}>=>{
 try {
  if(data.environment==='live') throw new Error('Ekte betaling er stengt til moms, kunstavgift og utsatt kunstneroppgjør er avklart.');
  const {data:l,error}=await context.supabase.from('listings').select('id,user_id,data').eq('id',data.listingId).single();
  if(error||!l||l.user_id===context.userId) throw new Error('Verket er utilgjengelig eller tilhører deg.');
  const a=l.data as unknown as Artwork & {shippingPrice?:number};
  let total=a.price;
  if(data.bidId){
   const {data:b}=await context.supabase.from('bids').select('*').eq('id',data.bidId).eq('buyer_id',context.userId).eq('listing_id',l.id).eq('seller_id',l.user_id).eq('status','accepted').single();
   if(!b)throw new Error('Budet er ikke godkjent for deg.');
   total=Number(b.amount);
  } else if(a.saleType!=='Fastpris') throw new Error('Dette verket krever et godkjent bud før betaling. Auksjonsoppgjør er ikke åpnet.');
  if(a.saleType==='Auksjon')throw new Error('Auksjonsoppgjør er ikke åpnet.');
  if(a.delivery!=='Må hentes' && typeof a.shippingPrice!=='number') throw new Error('Selger må oppgi fraktpris eller henting før betaling.');
  const amounts=checkoutAmounts(total,a.delivery==='Må hentes'?0:a.shippingPrice??0);
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  const {data:order,error:reserveError}=await admin.rpc('reserve_art_order',{_buyer:context.userId,_listing:l.id,_environment:data.environment,_snapshot:{...a,id:l.id,sellerId:l.user_id,price:total,bidId:data.bidId??null},_artwork:amounts.artwork,_shipping:amounts.shipping});
  if(reserveError||!order)throw new Error(reserveError?.message??'Kunne ikke reservere verket.');
  const stripe=createStripeClient(data.environment);
  if(order.stripe_session_id){
   const s=await stripe.checkout.sessions.retrieve(order.stripe_session_id);
   if(s.status==='open'&&s.client_secret)return {clientSecret:s.client_secret,orderId:order.id};
   throw new Error('Denne ordren er allerede behandlet. Åpne ordreoversikten.');
  }
  const {data:auth}=await context.supabase.auth.getUser();
  const customer=await resolveOrCreateCustomer(stripe,{userId:context.userId,email:auth.user?.email});
  const {getRequest}=await import('@tanstack/react-start/server');
  const origin=new URL(getRequest().url).origin;
  const session=await stripe.checkout.sessions.create({
   customer,mode:'payment',ui_mode:'embedded_page',payment_method_types:['card'],
   line_items:[{price_data:{currency:'nok',unit_amount:order.artwork_amount,product_data:{name:a.title}},quantity:1},...(order.shipping_amount?[{price_data:{currency:'nok',unit_amount:order.shipping_amount,product_data:{name:'Frakt'}},quantity:1}]:[])],
   payment_intent_data:{description:a.title,metadata:{orderId:order.id,userId:context.userId}},
   metadata:{orderId:order.id,userId:context.userId,environment:data.environment},
   return_url:`${origin}/ordre?order=${order.id}`,
   expires_at:Math.floor(new Date(order.expires_at).getTime()/1000),
  },{idempotencyKey:`art-order-${order.id}`});
  const {error:saveError}=await admin.from('art_orders').update({stripe_session_id:session.id}).eq('id',order.id);
  if(saveError)throw new Error('Betalingsøkten kunne ikke lagres. Prøv igjen.');
  if(!session.client_secret)throw new Error('Stripe returnerte ikke betalingsskjema.');
  return {clientSecret:session.client_secret,orderId:order.id};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const listArtOrders=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).handler(async({context})=>{
 const {data,error}=await context.supabase.from('art_orders').select('*').order('created_at',{ascending:false});
 if(error)throw new Error('Kunne ikke hente ordreoversikten');
 return {orders:data,userId:context.userId};
});
export const refreshArtOrder=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid()}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:o}=await context.supabase.from('art_orders').select('*').eq('id',data.orderId).single();
 if(!o||!o.stripe_session_id)throw new Error('Ordren mangler betalingsøkt');
 if(o.environment!=='sandbox'&&o.environment!=='live')throw new Error('Invalid environment');
 const stripe=createStripeClient(o.environment);
 const s=await stripe.checkout.sessions.retrieve(o.stripe_session_id);
 const {applyCheckoutSession}=await import('./payment-fulfillment.server');
 await applyCheckoutSession(s,o.environment);
 return {ok:true};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const updateArtDelivery=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid(),action:z.enum(['ship','approve','dispute']),note:z.string().trim().max(2000).default('')}).parse(d)).handler(async({data,context})=>{
 const {data:o}=await context.supabase.from('art_orders').select('*').eq('id',data.orderId).single();
 if(!o)throw new Error('Ordren finnes ikke');
 const allowed=data.action==='ship'?o.seller_id===context.userId&&o.status==='paid':o.buyer_id===context.userId&&['paid','shipped'].includes(o.status);
 if(!allowed)throw new Error('Denne handlingen er ikke tillatt');
 if(data.action==='dispute'&&!data.note)throw new Error('Beskriv saken');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {error}=await supabaseAdmin.from('art_orders').update(data.action==='ship'?{status:'shipped',shipping_note:data.note}:data.action==='approve'?{status:'approved',approved_at:new Date().toISOString()}:{status:'disputed',dispute_note:data.note}).eq('id',o.id).eq('status',o.status).select().single();
 if(error)throw new Error('Ordren er endret. Oppdater og prøv igjen.');
 return {ok:true};
});
export const adminRefundArt=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid(),note:z.string().trim().min(1).max(2000)}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:isAdmin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(!isAdmin)throw new Error('Forbidden');
 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
 const {data:o}=await a.from('art_orders').select('*').eq('id',data.orderId).single();
 if(!o?.stripe_payment_id||!['paid','shipped','approved','disputed','refund_pending'].includes(o.status))throw new Error('Ordren kan ikke refunderes');
 if(o.environment!=='sandbox'&&o.environment!=='live')throw new Error('Invalid environment');
 const r=await createStripeClient(o.environment).refunds.create({payment_intent:o.stripe_payment_id},{idempotencyKey:`refund-${o.id}`});
 const {error}=await a.from('art_orders').update({status:r.status==='succeeded'?'refunded':'refund_pending',stripe_refund_id:r.id,admin_note:data.note}).eq('id',o.id);
 if(error)throw new Error('Refusjon sendt, men oppfølging må avstemmes.');
 return {ok:true};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
