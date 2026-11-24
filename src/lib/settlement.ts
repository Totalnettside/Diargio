import {breakdownFromTotal} from './fees';
import {minorUnits} from './commerce';

export function sellerSettlementAmount(order:{artwork_amount:number;shipping_amount:number;snapshot:unknown}):number {
 const snapshot=order.snapshot as {fees?:{payout?:number;total?:number};artFeeApplies?:boolean}|null;
 const fees=snapshot?.fees;
 const payout=fees && typeof fees.payout==='number' && typeof fees.total==='number' && minorUnits(fees.total)===order.artwork_amount
  ? fees.payout : breakdownFromTotal(order.artwork_amount/100,snapshot?.artFeeApplies??true).payout;
 const amount=minorUnits(payout)+order.shipping_amount;
 if(!Number.isSafeInteger(amount)||amount<=0||amount>order.artwork_amount+order.shipping_amount)throw new Error('Ugyldig selgeroppgjør');
 return amount;
}

export function accountReady(account:{details_submitted?:boolean;payouts_enabled?:boolean;capabilities?:{transfers?:string}|null}){
 return account.details_submitted===true&&account.payouts_enabled===true&&account.capabilities?.transfers==='active';
}

export function maySettle(status:string){return ['approved','payout_pending'].includes(status);}