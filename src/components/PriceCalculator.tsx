import { formatPrice } from "@/data/demo";
import { PRICE_EXPLANATION, priceFromPayout } from "@/lib/fees";

export function PriceCalculator({ payout, artFeeApplies, onArtFeeChange }: { payout: number; artFeeApplies: boolean; onArtFeeChange: (v: boolean) => void }) {
  const b = priceFromPayout(payout, artFeeApplies);
  return (
    <div className="rounded-2xl border border-border bg-card p-4 text-sm">
      <div className="flex justify-between"><span>Ønsket utbetaling til deg</span><span className="font-semibold">{formatPrice(b.payout)}</span></div>
      <div className="mt-1 flex justify-between text-muted-foreground"><span>Plattformprovisjon (20 %)</span><span>{formatPrice(b.platformFee)}</span></div>
      <div className="mt-1 flex justify-between text-muted-foreground">
        <span>Kunstavgift (5 %, kun over 2 000 kr)</span>
        <span>{b.artFee > 0 ? formatPrice(b.artFee) : "Gjelder ikke"}</span>
      </div>
      <div className="mt-2 flex justify-between border-t border-border pt-2 font-bold"><span>Totalpris i annonsen</span><span>{formatPrice(b.total)}</span></div>
      <p className="mt-2 text-xs text-muted-foreground">{PRICE_EXPLANATION}</p>
      <p className="mt-1 text-xs text-muted-foreground">Frakt kommer i tillegg og vises separat for kjøper.</p>
    </div>
  );
}
