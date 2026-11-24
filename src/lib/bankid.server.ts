// Idura (BankID) OIDC helpers. Server-only.
const enc = new TextEncoder();
const b64url = (buf: ArrayBuffer | Uint8Array) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (s: string) => atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));

function config() {
  const domain = process.env['IDURA_DOMAIN']?.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const clientId = process.env['IDURA_CLIENT_ID'];
  const clientSecret = process.env['IDURA_CLIENT_SECRET'];
  const stateSecret = process.env['BANKID_STATE_SECRET'];
  if (!domain || !clientId || !clientSecret || !stateSecret) throw new Error('BankID er ikke konfigurert.');
  return { domain, clientId, clientSecret, stateSecret };
}
async function hmac(secret: string, value: string) {
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(await crypto.subtle.sign('HMAC', key, enc.encode(value)));
}
export function safeReturnPath(path: string | undefined) {
  return path && /^\/[a-zA-Z0-9\-_/.?=&%]*$/.test(path) && !path.startsWith('//') ? path : '/min-side';
}
export async function buildAuthorizeUrl(userId: string, origin: string, returnTo: string) {
  const c = config();
  const payload = b64url(enc.encode(JSON.stringify({ u: userId, r: safeReturnPath(returnTo), e: Date.now() + 10 * 60_000, n: crypto.randomUUID() })));
  const state = `${payload}.${await hmac(c.stateSecret, payload)}`;
  const url = new URL(`https://${c.domain}/oauth2/authorize`);
  url.search = new URLSearchParams({ client_id: c.clientId, redirect_uri: `${origin}/api/public/bankid/callback`, response_type: 'code', scope: 'openid', acr_values: 'urn:grn:authn:no:bankid:substantial', state }).toString();
  return url.toString();
}
export async function verifyState(state: string) {
  const c = config();
  const [payload, sig] = state.split('.');
  if (!payload || !sig || (await hmac(c.stateSecret, payload)) !== sig) return null;
  const s = JSON.parse(fromB64url(payload)) as { u: string; r: string; e: number };
  return s.e > Date.now() ? s : null;
}
/** Exchanges the code directly with Idura over TLS (OIDC §3.1.3.7 allows trusting the token from the token endpoint). */
export async function exchangeCode(code: string, origin: string) {
  const c = config();
  const res = await fetch(`https://${c.domain}/oauth2/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Authorization: `Basic ${btoa(`${encodeURIComponent(c.clientId)}:${encodeURIComponent(c.clientSecret)}`)}` },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: `${origin}/api/public/bankid/callback` }),
  });
  if (!res.ok) { console.error('Idura token error', res.status, await res.text()); return null; }
  const { id_token } = (await res.json()) as { id_token?: string };
  const part = id_token?.split('.')[1];
  if (!part) return null;
  const claims = JSON.parse(fromB64url(part)) as { sub?: string; aud?: string | string[]; identityscheme?: string };
  const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
  if (!claims.sub || !aud.includes(c.clientId) || claims.identityscheme !== 'nobankid-oidc') return null;
  return claims;
}
