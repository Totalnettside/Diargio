import { createServerFn } from '@tanstack/react-start';
import { z } from 'zod';
import { requireSupabaseAuth } from '@/integrations/supabase/auth-middleware';
import { createStripeClient, getStripeErrorMessage } from '@/lib/stripe.server';
import { checkoutAmounts, environmentSchema } from './commerce';
import {canDeliver} from './payment-state';
import {breakdownFromTotal,priceFromPayout} from './fees';
import type { Artwork } from '@/data/demo';
import { bringPackageSchema, type BringQuote } from './bring';
import { fetchBringQuote } from './bring.server';
import {deliveryAddressSchema} from './delivery-address';

async function resolveOrCreateCustomer(
  stripe: ReturnType<typeof createStripeClient>,
  options: { email?: string; userId?: string },
): Promise<string> {
  if (options.userId && !/^[a-zA-Z0-9_-]+$/.test(options.userId)) throw new Error('Invalid userId');
  if (options.userId) {
    const found = await stripe.customers.search({ query: `metadata['userId']:'${options.userId}'`, limit: 1 });
    const matched=found.data[0]; if (matched) return matched.id;
  }
  if (options.email) {
    const existing = await stripe.customers.list({ email: options.email, limit: 1 });
    const customer = existing.data[0];
    if (customer && (!options.userId || customer.metadata?.['userId'] === options.userId)) return customer.id;
    // Never claim or reuse another account's customer based on an email match alone.
  }
  const created = await stripe.customers.create({ ...(options.email && { email: options.email }), ...(options.userId && { metadata: { userId: options.userId } }) });
  return created.id;
}
const checkoutInput=z.object({listingId:z.string().min(1).max(200),environment:environmentSchema,bidId:z.string().uuid().optional(),pickup:z.boolean().optional(),toPostalCode:z.string().regex(/^\d{4}$/).optional(),expectedShipping:z.number().int().positive().optional(),shippingAddress:deliveryAddressSchema.optional()});
export const createArtCheckout=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>checkoutInput.parse(d)).handler(async({data,context}):Promise<{clientSecret:string;orderId:string}|{error:string}>=>{
 try {
  const { data: allowed, error: maintenanceError } = await context.supabase.rpc('maintenance_allows_actor', { _actor: context.userId });
  if (maintenanceError || allowed !== true) throw new Error('Diargio klargjøres for lansering. Nye kjøp er midlertidig stengt.');
  if(data.environment==='live'){const {livePaymentReadiness}=await import('./settlement.server');const ready=await livePaymentReadiness();if(!ready.ready)throw new Error(ready.reason);}
  const {data:l,error}=await context.supabase.from('listings').select('id,user_id,data,updated_at').eq('moderation_status','published').eq('id',data.listingId).single();
  if(error||!l||l.user_id===context.userId) throw new Error('Verket er utilgjengelig eller tilhører deg.');
  if(l.id.startsWith('demo'))throw new Error('Presentasjonsverk kan ikke kjøpes.');
  const a=l.data as unknown as Artwork & {shippingPrice?:number};
  let total=a.price;
  if(data.bidId){
   const {data:b}=await context.supabase.from('bids').select('*').eq('id',data.bidId).eq('buyer_id',context.userId).eq('listing_id',l.id).eq('seller_id',l.user_id).eq('status','accepted').single();
   if(!b)throw new Error('Budet er ikke godkjent for deg.');
   total=Number(b.amount);
  } else if(a.saleType!=='Fastpris') throw new Error('Dette verket krever et godkjent bud før betaling. Auksjonsoppgjør er ikke åpnet.');
  if(a.saleType==='Auksjon')throw new Error('Auksjonsoppgjør er ikke åpnet.');
  const pickup=a.delivery==='Må hentes'||(a.delivery==='Begge deler'&&data.pickup===true);
  const shippingAddress=pickup?undefined:deliveryAddressSchema.parse(data.shippingAddress);
  if(shippingAddress&&data.toPostalCode&&shippingAddress.postalCode!==data.toPostalCode)throw new Error('Leveringspostnummeret må være likt postnummeret brukt for fraktprisen.');
  let shippingQuote: BringQuote | undefined;
  if (!pickup && a.shippingMethod === 'bring') {
    if (!data.toPostalCode || data.expectedShipping == null) throw new Error('Beregn Bring-frakt før du åpner betaling.');
    const parcel = bringPackageSchema.safeParse(a.shippingPackage);
    if (!parcel.success) throw new Error('Selger må fylle inn pakkeopplysninger først.');
    shippingQuote = await fetchBringQuote(parcel.data, data.toPostalCode);
    if (shippingQuote.amount !== data.expectedShipping) throw new Error('Fraktprisen har endret seg. Beregn frakten på nytt før du betaler.');
  }
  if(!pickup && !shippingQuote && typeof a.shippingPrice!=='number') throw new Error('Selger må oppgi fraktpris eller henting før betaling.');
  const amounts=checkoutAmounts(total,pickup?0:shippingQuote ? shippingQuote.amount / 100 : a.shippingPrice??0);
  const {supabaseAdmin:admin}=await import('@/integrations/supabase/client.server');
  if(data.environment==='live'){
   const {data:sellerAccount}=await admin.from('artist_payment_accounts').select('stripe_account_id').eq('user_id',l.user_id).eq('environment','live').maybeSingle();
   const {accountReady}=await import('./settlement');
   if(!sellerAccount||!accountReady(await createStripeClient('live').accounts.retrieve(sellerAccount.stripe_account_id)))throw new Error('Selger må fullføre utbetalingsverifisering før kjøp.');
  }
  const {data:held}=await admin.from('art_orders').select('*').eq('listing_id',l.id).eq('environment',data.environment).eq('status','reserved').maybeSingle();
  if(held?.stripe_session_id&&new Date(held.expires_at).getTime()<Date.now()){
    const prior=await createStripeClient(data.environment).checkout.sessions.retrieve(held.stripe_session_id);
    const {applyCheckoutSession}=await import('./payment-fulfillment.server');await applyCheckoutSession(prior,data.environment);
  }
  if(held&&!held.stripe_session_id&&new Date(held.expires_at).getTime()<Date.now())throw new Error('Betalingsoppretting må avstemmes av admin før reservasjonen kan frigjøres.');
  const {data:order,error:reserveError}=await admin.rpc('reserve_art_order',{_buyer:context.userId,_listing:l.id,_environment:data.environment,_snapshot:{...a,...(shippingAddress?{shippingAddress}:{}),...(shippingQuote ? {shippingQuote} : {}),listingVersion:l.updated_at,deliveryMode:pickup?'pickup':'shipping',id:l.id,sellerId:l.user_id,price:total,fees:!data.bidId&&a.sellerPayout!=null&&priceFromPayout(a.sellerPayout,a.artFeeApplies??true).total===total?priceFromPayout(a.sellerPayout,a.artFeeApplies??true):breakdownFromTotal(total,a.artFeeApplies??true),bidId:data.bidId??null},_artwork:amounts.artwork,_shipping:amounts.shipping});
  if(reserveError||!order)throw new Error(reserveError?.message??'Kunne ikke reservere verket.');
  const stripe=createStripeClient(data.environment);
  const storedAddress=(order.snapshot as {shippingAddress?:Record<string,string>}).shippingAddress;
  if(shippingAddress&&(['name','line1','postalCode','city'] as const).some(key=>storedAddress?.[key]!==shippingAddress[key]))throw new Error('Leveringsadressen er endret. Avbryt den gamle reservasjonen først.');
  if(order.stripe_session_id){
   const s=await stripe.checkout.sessions.retrieve(order.stripe_session_id);
   if(s.status==='open'&&s.client_secret)return {clientSecret:s.client_secret,orderId:order.id};
   throw new Error('Denne ordren er allerede behandlet. Åpne ordreoversikten.');
  }
  if(new Date(order.expires_at).getTime()-Date.now()<1800000)throw new Error('Reservasjonen nærmer seg utløp. Avbryt den i ordreoversikten og prøv igjen.');
  const {data:auth}=await context.supabase.auth.getUser();
  const customer=await resolveOrCreateCustomer(stripe,{userId:context.userId,...(auth.user?.email?{email:auth.user.email}:{})});
  const {getRequest}=await import('@tanstack/react-start/server');
  const origin=new URL(getRequest().url).origin;
  const session=await stripe.checkout.sessions.create({
   customer,mode:'payment',ui_mode:'embedded_page',payment_method_types:['card'],locale:'nb',adaptive_pricing:{enabled:false},billing_address_collection:'required',
   line_items:[{price_data:{currency:'nok',unit_amount:order.artwork_amount,product_data:{name:String((order.snapshot as {title?:string}).title??a.title)}},quantity:1},...(order.shipping_amount?[{price_data:{currency:'nok',unit_amount:order.shipping_amount,product_data:{name:'Frakt'}},quantity:1}]:[])],
   payment_intent_data:{...(shippingAddress?{shipping:{name:shippingAddress.name,address:{line1:shippingAddress.line1,postal_code:shippingAddress.postalCode,city:shippingAddress.city,country:'NO'}}}:{}),transfer_group:`art-order-${order.id}`,description:String((order.snapshot as {title?:string}).title??a.title),metadata:{orderId:order.id,userId:context.userId}},
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
 const {data:isAdmin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 return {orders:data.map(o=>({...o,admin_note:isAdmin?o.admin_note:null})),userId:context.userId};
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
 const {data:current}=await context.supabase.from('art_orders').select('status').eq('id',o.id).single();
 if(current?.status==='refund_pending'){const {data:settlement}=await context.supabase.from('art_settlements').select('operation').eq('order_id',o.id).maybeSingle();if(settlement?.operation==='refund'){const {settleArtOrder}=await import('./settlement.server');await settleArtOrder(o.id,'refund');}}
 if(current&&['approved','payout_pending'].includes(current.status)){const {settleArtOrder}=await import('./settlement.server');await settleArtOrder(o.id,'payout');}
 return {ok:true};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const updateArtDelivery=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid(),action:z.enum(['ship','approve','dispute']),note:z.string().trim().max(2000).default('')}).parse(d)).handler(async({data,context})=>{
 const {data:o}=await context.supabase.from('art_orders').select('*').eq('id',data.orderId).single();
 if(!o)throw new Error('Ordren finnes ikke');
 const allowed=canDeliver(data.action,o,context.userId);
 if(!allowed)throw new Error('Denne handlingen er ikke tillatt');
 if(data.action==='dispute'&&!data.note)throw new Error('Beskriv saken');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 const {error}=await supabaseAdmin.from('art_orders').update(data.action==='ship'?{status:'shipped',shipping_note:data.note}:data.action==='approve'?{status:'approved',approved_at:new Date().toISOString()}:{status:'disputed',dispute_note:data.note}).eq('id',o.id).eq('status',o.status).select().single();
 if(error)throw new Error('Ordren er endret. Oppdater og prøv igjen.');
 if(data.action==='approve'){try{const {settleArtOrder}=await import('./settlement.server');await settleArtOrder(o.id,'payout');}catch(e){return {error:`Mottak er lagret. Oppgjør avventer: ${getStripeErrorMessage(e)}`};}}
 return {ok:true};
});
export const adminRefundArt=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid(),note:z.string().trim().min(1).max(2000)}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:isAdmin}=await context.supabase.rpc('has_role',{_user_id:context.userId,_role:'admin'});
 if(!isAdmin)throw new Error('Forbidden');
 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');
 const {data:o}=await a.from('art_orders').select('*').eq('id',data.orderId).single();
 if(!o?.stripe_payment_id||!['paid','shipped','approved','disputed','refund_pending','paid_out'].includes(o.status))throw new Error('Ordren kan ikke refunderes');
 if(o.environment!=='sandbox'&&o.environment!=='live')throw new Error('Invalid environment');
 const {data:settlement}=await a.from('art_settlements').select('order_id').eq('order_id',o.id).maybeSingle();
 if(settlement){const {settleArtOrder}=await import('./settlement.server');await settleArtOrder(o.id,'refund');return {ok:true};}
 if(o.status==='paid_out')throw new Error('Utbetalt ordre mangler oppgjørsreferanse. Admin må avstemme.');
 if(o.status!=='refund_pending'){const {error:claimError}=await a.from('art_orders').update({status:'refund_pending',admin_note:data.note}).eq('id',o.id).eq('status',o.status).select('id').single();if(claimError)throw new Error('Ordren ble endret. Prøv igjen.');}
 const stripe=createStripeClient(o.environment);const prior=await stripe.refunds.list({payment_intent:o.stripe_payment_id,limit:100});
 if(prior.has_more||prior.data.length>1||prior.data.some(r=>r.amount!==o.total_amount))throw new Error('Refusjoner krever manuell avstemming.');
 const r=prior.data[0]??await stripe.refunds.create({payment_intent:o.stripe_payment_id},{idempotencyKey:`refund-${o.id}`});
 const {error}=await a.from('art_orders').update({status:r.status==='succeeded'?'refunded':'refund_pending',stripe_refund_id:r.id,admin_note:data.note}).eq('id',o.id).eq('status','refund_pending');
 if(error)throw new Error('Refusjon sendt, men oppfølging må avstemmes.');
 return {ok:true};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const cancelArtCheckout=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid()}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:o}=await context.supabase.from('art_orders').select('*').eq('id',data.orderId).eq('buyer_id',context.userId).single();
 if(!o||o.status!=='reserved')throw new Error('Bare en ubetalt reservasjon kan avbrytes');
 if(o.environment!=='sandbox'&&o.environment!=='live')throw new Error('Invalid environment');
 if(o.stripe_session_id){
  const stripe=createStripeClient(o.environment);const s=await stripe.checkout.sessions.retrieve(o.stripe_session_id);
  if(s.status==='complete')throw new Error('Betalingen er sendt. Kontroller betaling først.');
  if(s.status==='open')await stripe.checkout.sessions.expire(s.id);
 }
 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');const {error}=await a.from('art_orders').update({status:'expired'}).eq('id',o.id).eq('status','reserved').select('id').single();if(error)throw new Error('Reservasjonen kunne ikke frigjøres.');
 return {ok:true};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const startArtistOnboarding=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({environment:environmentSchema}).parse(d)).handler(async({data,context})=>{
 try{

 const {supabaseAdmin:a}=await import('@/integrations/supabase/client.server');const stripe=createStripeClient(data.environment);
 const {data:existing,error}=await a.from('artist_payment_accounts').select('stripe_account_id,api_generation').eq('user_id',context.userId).eq('environment',data.environment).maybeSingle();if(error)throw error;
 let generation=existing?.api_generation??'v2';
 let accountId=existing?.stripe_account_id;
 if(!accountId){
  const {data:auth}=await context.supabase.auth.getUser();
  if(!auth.user?.email)throw new Error('Kontoen mangler bekreftet e-post.');
  const account=await stripe.v2.core.accounts.create({contact_email:auth.user.email,display_name:'Diargio selger',identity:{country:'NO'},dashboard:'express',configuration:{recipient:{capabilities:{stripe_balance:{stripe_transfers:{requested:true}}}}},defaults:{currency:'nok',locales:['nb-NO'],responsibilities:{fees_collector:'application',losses_collector:'application'}},metadata:{userId:context.userId}},{idempotencyKey:`artist-account-v2-${data.environment}-${context.userId}`});accountId=account.id;generation='v2';
  const {error:e}=await a.from('artist_payment_accounts').upsert({user_id:context.userId,environment:data.environment,stripe_account_id:accountId,api_generation:generation});if(e)throw e;
 }
 const {getRequest}=await import('@tanstack/react-start/server');const requestOrigin=new URL(getRequest().url).origin;const origin=data.environment==='live'&&requestOrigin.startsWith('http://')?'https://diargio.com':requestOrigin;
 const link=generation==='v2'?await stripe.v2.core.accountLinks.create({account:accountId,use_case:{type:'account_onboarding',account_onboarding:{configurations:['recipient'],return_url:`${origin}/kunstneroppgjor`,refresh_url:`${origin}/kunstneroppgjor`}}}):await stripe.accountLinks.create({account:accountId,type:'account_onboarding',return_url:`${origin}/kunstneroppgjor`,refresh_url:`${origin}/kunstneroppgjor`});
 return {url:link.url};
 }catch(e){const message=getStripeErrorMessage(e);return {error:message.includes('non_connect_platform_accounts_v2_access_blocked')?'Stripe Connect må aktiveres i dette miljøet under Settings → Connect → Platform setup. Test og ekte betaling har separate oppsett.':message.includes('signed up for Connect')?'Kunstnerkontoer er ikke aktivert ennå. Eier må først fullføre aktiveringen i Betalinger; deretter kan Stripe Connect klargjøres.':message};}
});
export const getArtistPaymentStatus=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({environment:environmentSchema}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:account,error}=await context.supabase.from('artist_payment_accounts').select('stripe_account_id').eq('user_id',context.userId).eq('environment',data.environment).maybeSingle();if(error)throw error;
 if(!account)return {connected:false,ready:false};
 const result=await createStripeClient(data.environment).accounts.retrieve(account.stripe_account_id);
 return {connected:true,ready:result.details_submitted===true&&result.payouts_enabled===true&&result.capabilities?.transfers==='active',detailsSubmitted:result.details_submitted,payoutsEnabled:result.payouts_enabled};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const getArtReceipt=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid()}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:o}=await context.supabase.from('art_orders').select('*').eq('id',data.orderId).single();if(!o?.paid_at||!o.stripe_payment_id)throw new Error('Betaling er ikke bekreftet');
 if(o.environment!=='sandbox'&&o.environment!=='live')throw new Error('Invalid environment');
 const stripe=createStripeClient(o.environment);const p=await stripe.paymentIntents.retrieve(o.stripe_payment_id,{expand:['latest_charge']});const charge=p.latest_charge;
 if(!charge||typeof charge==='string'||!charge.receipt_url)throw new Error('Kvittering er ikke tilgjengelig ennå.');
 return {url:charge.receipt_url};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});
export const openArtistStripeDashboard=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({environment:environmentSchema}).parse(d)).handler(async({data,context})=>{
 try{
 const {data:account,error}=await context.supabase.from('artist_payment_accounts').select('stripe_account_id').eq('user_id',context.userId).eq('environment',data.environment).maybeSingle();if(error)throw error;
 if(!account)throw new Error('Ingen utbetalingskonto er koblet ennå.');
 const link=await createStripeClient(data.environment).accounts.createLoginLink(account.stripe_account_id);
 return {url:link.url};
 }catch(e){return {error:getStripeErrorMessage(e)};}
});

export const getPaymentReadiness=createServerFn({method:'GET'}).handler(async()=>{try{const {livePaymentReadiness}=await import('./settlement.server');return await livePaymentReadiness();}catch(e){return {ready:false,reason:getStripeErrorMessage(e)};}});

export const getArtistPayoutOverview=createServerFn({method:'GET'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({environment:environmentSchema}).parse(d)).handler(async({data,context})=>{try{
 const {data:account,error}=await context.supabase.from('artist_payment_accounts').select('stripe_account_id').eq('user_id',context.userId).eq('environment',data.environment).maybeSingle();if(error)throw error;if(!account)return {available:0,pending:0,payouts:[]};
 const stripe=createStripeClient(data.environment);const options={stripeAccount:account.stripe_account_id};
 const [balance,payouts]=await Promise.all([stripe.balance.retrieve({},options),stripe.payouts.list({limit:10},options)]);
 return {available:balance.available.filter(b=>b.currency==='nok').reduce((s,b)=>s+b.amount,0),pending:balance.pending.filter(b=>b.currency==='nok').reduce((s,b)=>s+b.amount,0),payouts:payouts.data.map(p=>({id:p.id,amount:p.amount,currency:p.currency,status:p.status,arrival:p.arrival_date}))};
 }catch(e){return {error:getStripeErrorMessage(e)};}});

export const sendOrderMessage=createServerFn({method:'POST'}).middleware([requireSupabaseAuth]).inputValidator(d=>z.object({orderId:z.string().uuid(),body:z.string().trim().min(1).max(4000)}).parse(d)).handler(async({data,context})=>{const {data:conversationId,error}=await context.supabase.rpc('send_art_order_message',{_order:data.orderId,_body:data.body});if(error||!conversationId)throw new Error('Meldingen kunne ikke sendes.');return {conversationId};});
