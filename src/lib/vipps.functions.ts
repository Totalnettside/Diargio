import {createServerFn} from '@tanstack/react-start';
export const startVippsLogin=createServerFn({method:'POST'}).inputValidator((d:{redirectUri:string;state:string})=>d).handler(async()=>({authorizationUrl:null,error:'Vipps-innlogging er fjernet. Bruk e-post eller Google.'}));
export const completeVippsLogin=createServerFn({method:'POST'}).inputValidator((d:{code:string;redirectUri:string})=>d).handler(async():Promise<{tokenHash:string;email:string}>=>{throw new Error('Vipps-innlogging er fjernet.');});
