import { loadStripe, type Stripe } from '@stripe/stripe-js';
const token = import.meta.env['VITE_PAYMENTS_CLIENT_TOKEN'];
export function getStripeEnvironment(): 'sandbox' | 'live' {
  if (token?.startsWith('pk_test_')) return 'sandbox';
  if (token?.startsWith('pk_live_')) return 'live';
  throw new Error('Betaling er ikke konfigurert. Fullfør aktivering i Betalinger før ekte kjøp åpnes.');
}
let promise: Promise<Stripe | null> | null = null;
export function getStripe() {
  getStripeEnvironment();
  if (!promise && token) promise = loadStripe(token);
  if (!promise) throw new Error('Betaling er ikke konfigurert.');
  return promise;
}
