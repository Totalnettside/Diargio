export const PLATFORM_FEE_RATE = 0.2;
export const ART_FEE_RATE = 0.05;
export const TOTAL_FEE_RATE = PLATFORM_FEE_RATE + ART_FEE_RATE;

export function calculateTransactionFees(price: number) {
  const platformFee = Math.round(price * PLATFORM_FEE_RATE);
  const artFee = Math.round(price * ART_FEE_RATE);

  return {
    platformFee,
    artFee,
    totalFees: platformFee + artFee,
    total: price + platformFee + artFee,
  };
}