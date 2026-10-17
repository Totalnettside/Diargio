import {expect,it} from 'vitest';
import {canDeliver,isPaymentMatch} from './payment-state';
const order={buyer_id:'buyer',seller_id:'seller',status:'paid',stripe_session_id:'session',environment:'sandbox',total_amount:403000,currency:'nok'};
it('seller alone registers shipping',()=>{expect(canDeliver('ship',order,'seller')).toBe(true);expect(canDeliver('ship',order,'buyer')).toBe(false);});
it('buyer alone approves receipt',()=>{expect(canDeliver('approve',order,'buyer')).toBe(true);expect(canDeliver('approve',order,'seller')).toBe(false);});
it('unpaid orders cannot be approved',()=>expect(canDeliver('approve',{...order,status:'reserved'},'buyer')).toBe(false));
it('disputes block routine approval',()=>expect(canDeliver('approve',{...order,status:'disputed'},'buyer')).toBe(false));
it('payment requires exact total and environment',()=>{const session={id:'session',userId:'buyer',environment:'sandbox',amount:403000,currency:'nok'};expect(isPaymentMatch(order,session)).toBe(true);expect(isPaymentMatch(order,{...session,amount:378000})).toBe(false);expect(isPaymentMatch(order,{...session,environment:'live'})).toBe(false);});
