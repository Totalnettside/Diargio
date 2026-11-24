import {beforeEach,expect,it,vi} from 'vitest';
const h=vi.hoisted(()=>{
 const state={status:'approved',ready:true,transfer:null as null|{id:string;amount:number;currency:string;destination:string;metadata:{orderId:string};reversed:boolean},finishFails:false,events:[] as string[]};
 const order={id:'order',seller_id:'seller',buyer_id:'buyer',environment:'sandbox',stripe_payment_id:'payment',status:'approved',artwork_amount:700000,shipping_amount:33395,total_amount:733395,currency:'nok',snapshot:{fees:{total:7000,payout:5556}}};
 const rpc=vi.fn(async(name:string)=>{
  if(name==='claim_art_settlement'){
   if(!['approved','payout_pending','paid_out'].includes(state.status))return {error:{message:'Mottak må godkjennes'},data:null};
   return {error:null,data:{lease_token:'token',reversal_id:null}};
  }
  if(state.finishFails)return {error:{message:'write failed'}};
  state.status=state.events.includes('refund')?'refunded':'paid_out';return {error:null};
 });
 const admin={rpc,from:(table:string)=>{
  const value=()=>({error:null,data:table==='art_orders'?{...order,status:state.status}:{stripe_account_id:'account'}});
  const chain={select:()=>chain,eq:()=>chain,update:()=>chain,single:async()=>value(),maybeSingle:async()=>value(),then:(resolve:(result:ReturnType<typeof value>)=>unknown)=>Promise.resolve(value()).then(resolve)};
  return chain;
 }};
 const stripe={accounts:{retrieve:vi.fn(async()=>({metadata:{userId:'seller'},details_submitted:true,payouts_enabled:state.ready,capabilities:{transfers:'active'}}))},paymentIntents:{retrieve:vi.fn(async()=>({id:'payment',status:'succeeded',amount:733395,currency:'nok',livemode:false,latest_charge:{id:'charge',refunded:false,disputed:false,amount_refunded:0}}))},transfers:{list:vi.fn(async()=>({has_more:false,data:state.transfer?[state.transfer]:[]})),create:vi.fn(async()=>{state.events.push('transfer');state.transfer={id:'transfer',amount:588995,currency:'nok',destination:'account',metadata:{orderId:'order'},reversed:false};return state.transfer;}),listReversals:vi.fn(async()=>({data:[]})),createReversal:vi.fn(async()=>{state.events.push('reversal');return {id:'reversal'};})},refunds:{list:vi.fn(async()=>({has_more:false,data:[]})),create:vi.fn(async()=>{state.events.push('refund');return {id:'refund',status:'succeeded'};})}};
 return {state,admin,stripe};
});
vi.mock('@/integrations/supabase/client.server',()=>({supabaseAdmin:h.admin}));
vi.mock('./stripe.server',()=>({createStripeClient:()=>h.stripe,getStripeErrorMessage:(e:unknown)=>e instanceof Error?e.message:'Error'}));
import {settleArtOrder} from './settlement.server';
beforeEach(()=>{vi.clearAllMocks();h.state.status='approved';h.state.ready=true;h.state.transfer=null;h.state.finishFails=false;h.state.events=[];});
it('transfers exactly the agreed seller share and shipping after approval',async()=>{
 await settleArtOrder('order','payout');expect(h.stripe.transfers.create).toHaveBeenCalledWith(expect.objectContaining({amount:588995,source_transaction:'charge',transfer_group:'art-order-order'}),{idempotencyKey:'settlement-order'});
 expect(h.state.status).toBe('paid_out');
});
it('does not transfer before receipt approval',async()=>{
 h.state.status='paid';await expect(settleArtOrder('order','payout')).rejects.toThrow('Mottak');expect(h.stripe.transfers.create).not.toHaveBeenCalled();
});
it('does not transfer during a dispute',async()=>{
 h.state.status='disputed';await expect(settleArtOrder('order','payout')).rejects.toThrow('Mottak');expect(h.stripe.transfers.create).not.toHaveBeenCalled();
});
it('does not double-transfer an already credited order',async()=>{
 await settleArtOrder('order','payout');await settleArtOrder('order','payout');expect(h.stripe.transfers.create).toHaveBeenCalledTimes(1);
});
it('reconciles a Stripe success after a failed local save without another transfer',async()=>{
 h.state.finishFails=true;await expect(settleArtOrder('order','payout')).rejects.toThrow('avstemming');h.state.finishFails=false;
 await settleArtOrder('order','payout');expect(h.stripe.transfers.create).toHaveBeenCalledTimes(1);expect(h.state.status).toBe('paid_out');
});
it('reverses seller funds before refunding the buyer',async()=>{
 await settleArtOrder('order','payout');await settleArtOrder('order','refund');expect(h.state.events).toEqual(['transfer','reversal','refund']);expect(h.state.status).toBe('refunded');
});
it('requires enabled bank payouts on the verified seller account',async()=>{
 h.state.ready=false;await expect(settleArtOrder('order','payout')).rejects.toThrow('verifisert');expect(h.admin.rpc).not.toHaveBeenCalled();
});