import { describe, expect, it } from 'vitest';
import { checkoutAmounts, safeDestination } from './commerce';
import { priceFromPayout } from './fees';
describe('Agreed money rules',()=>{
 it('no art fee at seller payout 2000',()=>expect(priceFromPayout(2000)).toEqual({payout:2000,platformFee:400,artFee:0,total:2400}));
 it('no art fee below 2000',()=>expect(priceFromPayout(1999).artFee).toBe(0));
 it('fee includes commission above 2000',()=>expect(priceFromPayout(3000)).toEqual({payout:3000,platformFee:600,artFee:180,total:3780}));
 it('checkout adds only seller shipping',()=>expect(checkoutAmounts(3780,250)).toEqual({artwork:378000,shipping:25000,total:403000}));
 it('rejects invalid shipping',()=>expect(()=>checkoutAmounts(3780,-1)).toThrow());
 it('rejects nonfinite prices',()=>expect(()=>checkoutAmounts(NaN,0)).toThrow());
 it('keeps redirect same origin',()=>expect(safeDestination('//evil.example')).toBe('/min-side'));
});
