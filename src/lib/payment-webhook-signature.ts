export async function verifySignedPayment(body:string,signature:string,secret:string,now=Date.now()) {
 const parts=signature.split(',').map(p=>p.trim().split('=',2));
 const timestamp=parts.find(p=>p[0]==='t')?.[1];
 const candidates=parts.filter(p=>p[0]==='v1').map(p=>p[1]).filter((v):v is string=>typeof v==='string');
 if(!timestamp||!/^\d+$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300||!candidates.length)throw new Error('Invalid payment signature');
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${timestamp}.${body}`));
 const expected=Array.from(new Uint8Array(signed),v=>v.toString(16).padStart(2,'0')).join('');
 if(!candidates.some(c=>c.length===expected.length&&Array.from(c).reduce((n,ch,i)=>n|(ch.charCodeAt(0)^(expected.charCodeAt(i))),0)===0))throw new Error('Invalid payment signature');
}
