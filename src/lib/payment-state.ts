export function canDeliver(action:'ship'|'approve'|'dispute',order:{buyer_id:string;seller_id:string;status:string},userId:string){
 return action==='ship'?order.seller_id===userId&&order.status==='paid':order.buyer_id===userId&&['paid','shipped'].includes(order.status);
}
export function isPaymentMatch(order:{stripe_session_id:string|null;buyer_id:string;environment:string;total_amount:number;currency:string},session:{id:string;userId?:string|undefined;environment?:string|undefined;amount:number|null;currency:string|null}){
 return order.stripe_session_id===session.id&&order.buyer_id===session.userId&&order.environment===session.environment&&order.total_amount===session.amount&&order.currency===session.currency;
}
