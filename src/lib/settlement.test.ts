import {expect,it} from 'vitest';
import {accountReady,maySettle,sellerSettlementAmount} from './settlement';
it('pays the agreed seller share plus shipping, not cents treated as kroner',()=>{
 expect(sellerSettlementAmount({artwork_amount:700000,shipping_amount:33395,snapshot:{fees:{payout:5556,total:7000}}})).toBe(588995);
});
it('retains a saved art-fee exemption',()=>{
 expect(sellerSettlementAmount({artwork_amount:600000,shipping_amount:0,snapshot:{artFeeApplies:false}})).toBe(500000);
});
it('does not add art fee at seller payout 2000',()=>{
 expect(sellerSettlementAmount({artwork_amount:240000,shipping_amount:0,snapshot:{}})).toBe(200000);
});
it('cannot pay before buyer receipt or during a dispute',()=>{
 expect(maySettle('approved')).toBe(true);expect(maySettle('paid')).toBe(false);expect(maySettle('disputed')).toBe(false);expect(maySettle('refunded')).toBe(false);
});
it('requires verification, transfers and bank payouts',()=>{
 const ready={details_submitted:true,payouts_enabled:true,capabilities:{transfers:'active'}};
 expect(accountReady(ready)).toBe(true);expect(accountReady({...ready,payouts_enabled:false})).toBe(false);
});