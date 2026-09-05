import { useState } from "react";
import { formatPrice, type Artwork } from "@/data/demo";
import { useStore } from "@/lib/store";

export function BidDialog({ artwork, onClose }: { artwork: Artwork; onClose: () => void }) {
  const { placeBid } = useStore();
  const base = artwork.saleType === "Auksjon" ? (artwork.currentBid ?? artwork.price) : artwork.price;
  const [amount, setAmount] = useState(String(Math.round(base * 0.9)));
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 backdrop-blur-sm sm:place-items-center sm:p-6">
      <div className="w-full max-w-md rounded-t-3xl bg-card p-5 sm:rounded-3xl">
        {sent ? (
          <div className="text-center">
            <p className="font-display text-xl font-semibold">Budet er sendt</p>
            <p className="mt-2 text-sm text-ink/60">
              Selger får varsel og kan godta, avslå eller gi motbud. Du finner budet i meldingene.
            </p>
            <button
              onClick={onClose}
              className="mt-4 w-full rounded-2xl bg-brandink py-3 text-sm font-semibold text-primary-foreground"
            >
              Lukk
            </button>
          </div>
        ) : (
          <>
            <p className="font-display text-xl font-semibold">Gi bud</p>
            <p className="mt-1 text-sm text-ink/60">
              {artwork.title} · {artwork.saleType === "Auksjon" ? "Nåværende bud" : "Pris"}{" "}
              {formatPrice(base)}
            </p>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink/50">
              Ditt bud
            </label>
            <div className="mt-1 flex items-center gap-2 rounded-2xl bg-white/70 px-4 py-3 glass">
              <input
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                className="w-full bg-transparent text-lg font-bold outline-none"
              />
              <span className="text-sm font-semibold text-ink/50">kr</span>
            </div>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-ink/50">
              Melding til selger (valgfritt)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              className="mt-1 w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none glass"
              placeholder="Hei! Jeg er interessert i verket …"
            />

            <div className="mt-4 flex gap-2">
              <button
                onClick={onClose}
                className="rounded-2xl bg-white/70 px-4 py-3 text-sm font-semibold text-brandink glass"
              >
                Avbryt
              </button>
              <button
                onClick={() => {
                  placeBid(artwork.id, Number(amount || 0), message || undefined);
                  setSent(true);
                }}
                className="flex-1 rounded-2xl bg-brandink py-3 text-sm font-semibold text-primary-foreground"
              >
                Send bud
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
