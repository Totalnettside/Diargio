export const PLATFORM_FEE_RATE = 0.2;
export const ART_FEE_RATE = 0.05;
/** Total markup on seller payout: commission 20 % of payout, art fee 5 % of (payout + commission). */
export const TOTAL_FEE_RATE = PLATFORM_FEE_RATE + ART_FEE_RATE * (1 + PLATFORM_FEE_RATE);

/** Kunstavgift gjelder bare når selgerens pris (utbetaling) er over denne grensen. */
export const ART_FEE_THRESHOLD = 2000;

export type PriceBreakdown = { payout: number; platformFee: number; artFee: number; total: number };

/** Seller enters desired payout; buyer sees one all-inclusive total. */
export function priceFromPayout(payout: number, artFeeApplies = true): PriceBreakdown {
  const p = Math.max(0, Math.round(payout));
  const platformFee = Math.round(p * PLATFORM_FEE_RATE);
  const artFee = artFeeApplies && p > ART_FEE_THRESHOLD ? Math.round((p + platformFee) * ART_FEE_RATE) : 0;
  return { payout: p, platformFee, artFee, total: p + platformFee + artFee };
}

/** Split an all-inclusive buyer price into its parts (no fees added on top). */
export function breakdownFromTotal(total: number, artFeeApplies = true): PriceBreakdown {
  const t = Math.round(total);
  const applies = artFeeApplies && t > ART_FEE_THRESHOLD * (1 + PLATFORM_FEE_RATE);
  const factor = (1 + PLATFORM_FEE_RATE) * (applies ? 1 + ART_FEE_RATE : 1);
  const payout = Math.round(t / factor);
  const platformFee = Math.round(payout * PLATFORM_FEE_RATE);
  return { payout, platformFee, artFee: t - payout - platformFee, total: t };
}

export const PRICE_EXPLANATION =
  "Prisen kjøperen ser inkluderer Diargios provisjon og eventuell kunstavgift (kun ved salg over 2 000 kr). Derfor blir annonseprisen høyere enn beløpet du får utbetalt.";
