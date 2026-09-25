import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { artistById, formatPrice, sellerById } from "@/data/demo";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/meldinger")({
  head: () => ({
    meta: [
      { title: "Meldinger | Diargio" },
      { name: "description", content: "Samtaler med kjøpere og selgere, koblet til kunstverket." },
      { property: "og:title", content: "Meldinger | Diargio" },
      { property: "og:description", content: "Send meldinger, bud og motbud i samme samtale." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MessagesPage,
});

function MessagesPage() {
  const { conversations, allArtworks, sendMessage } = useStore();
  const [activeId, setActiveId] = useState(conversations[0]?.id ?? "");
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0];
  const artwork = active ? allArtworks.find((a) => a.id === active.artworkId) : undefined;
  const [text, setText] = useState("");

  if (conversations.length === 0) {
    return (
      <main className="mx-auto w-full max-w-3xl px-5 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Meldinger</h1>
        <p className="mt-2 text-sm text-ink/60">
          Du har ingen samtaler ennå. Kontakt en selger fra en annonse.
        </p>
        <Link
          to="/kunst"
          className="mt-4 inline-block rounded-2xl bg-brandink px-6 py-3 text-sm font-semibold text-primary-foreground"
        >
          Utforsk kunst
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Meldinger</h1>
      <div className="mt-4 grid gap-4 md:grid-cols-[300px_1fr]">
        <aside className="space-y-2">
          {conversations.map((c) => {
            const art = allArtworks.find((a) => a.id === c.artworkId);
            const last = c.messages[c.messages.length - 1];
            return (
              <button
                key={c.id}
                onClick={() => setActiveId(c.id)}
                className={`flex w-full items-center gap-3 rounded-2xl p-3 text-left glass ${
                  c.id === active?.id ? "bg-lav/50" : ""
                }`}
              >
                {art && (
                  <img
                    src={art.image}
                    alt={art.title}
                    loading="lazy"
                    width={512}
                    height={512}
                    className="size-12 rounded-xl object-cover"
                  />
                )}
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{art?.title}</p>
                  <p className="truncate text-xs text-ink/55">
                    {last?.bidAmount ? `Bud: ${formatPrice(last.bidAmount)}` : last?.text}
                  </p>
                </div>
              </button>
            );
          })}
        </aside>

        <section className="rounded-3xl p-4 glass">
          {artwork && (
            <Link
              to="/kunst/$slug"
              params={{ slug: artwork.slug }}
              className="flex items-center gap-3 rounded-2xl bg-white/70 p-3 glass"
            >
              <img
                src={artwork.image}
                alt={artwork.title}
                loading="lazy"
                width={512}
                height={512}
                className="size-14 rounded-xl object-cover"
              />
              <div>
                <p className="text-sm font-semibold">{artwork.title}</p>
                <p className="text-xs text-ink/55">
                  {artistById(artwork.artistId).name} · {formatPrice(artwork.price)}
                </p>
                <p className="text-xs text-ink/45">Selger: {sellerById(artwork.sellerId).name}</p>
              </div>
            </Link>
          )}

          <div className="mt-4 space-y-2">
            {active?.messages.map((m) => (
              <div
                key={m.id}
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  m.from === "meg"
                    ? "ml-auto bg-brandink text-primary-foreground"
                    : "bg-white/80 glass"
                }`}
              >
                {m.bidAmount && (
                  <p className="font-semibold">Bud: {formatPrice(m.bidAmount)}</p>
                )}
                {m.text && <p>{m.text}</p>}
                {m.bidAmount && m.from === "meg" && (
                  <p className="mt-1 text-[11px] opacity-80">Venter på svar fra selger</p>
                )}
              </div>
            ))}
          </div>

          {active?.messages.some((m) => m.bidAmount) && (
            <div className="mt-3 flex flex-wrap gap-2 rounded-2xl bg-white/70 p-3 glass">
              <p className="w-full text-xs font-bold uppercase tracking-wide text-ink/45">
                Budhistorikk
              </p>
              {active.messages
                .filter((m) => m.bidAmount)
                .map((m) => (
                  <span key={m.id} className="rounded-full bg-lav/70 px-3 py-1 text-xs font-semibold">
                    {formatPrice(m.bidAmount ?? 0)}
                  </span>
                ))}
              <div className="flex w-full gap-2 pt-2">
                <button className="rounded-xl bg-mint/70 px-3 py-2 text-xs font-semibold text-brandink glass">
                  Godta
                </button>
                <button className="rounded-xl bg-peach/70 px-3 py-2 text-xs font-semibold text-brandink glass">
                  Gi motbud
                </button>
                <button className="rounded-xl bg-white/70 px-3 py-2 text-xs font-semibold glass">
                  Avslå
                </button>
              </div>
            </div>
          )}

          <form
            className="mt-4 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim() || !active) return;
              sendMessage(active.artworkId, text.trim());
              setText("");
            }}
          >
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Skriv en melding …"
              className="w-full rounded-2xl bg-white/70 px-4 py-3 text-sm outline-none glass"
            />
            <button className="rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground">
              Send
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
