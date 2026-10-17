import {expect,it} from 'vitest';
import {verifySignedPayment} from './payment-webhook-signature';
async function signature(body:string,t:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode('test-only-secret'),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(`${t}.${body}`))),v=>v.toString(16).padStart(2,'0')).join('');}
it('accepts valid raw-body signature and rejects altered payload',async()=>{const t='1792244721';const sig=`t=${t},v1=${await signature('payload',t)}`;await expect(verifySignedPayment('payload',sig,'test-only-secret',1792244721000)).resolves.toBeUndefined();await expect(verifySignedPayment('changed',sig,'test-only-secret',1792244721000)).rejects.toThrow();});
it('rejects signatures older than five minutes',async()=>{const t='1792244721';await expect(verifySignedPayment('payload',`t=${t},v1=${await signature('payload',t)}`,'test-only-secret',1792245022000)).rejects.toThrow();});
it('rejects malformed timestamp',async()=>{await expect(verifySignedPayment('{}','t=NaN,v1=abc','test-only-secret')).rejects.toThrow();});
