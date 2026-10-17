import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/diargio-logo.png.asset.json";

const linkCls = "text-sm text-ink/70 hover:text-ink hover:underline";

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="no-print mt-12 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-xl">
          <img src={logo.url} alt="Diargio" className="h-10 w-auto" />
          <p className="mt-3 text-sm text-ink/70">
            Diargio er en norsk markedsplass for kjøp og salg av kunst fra kunstnere, gallerier og private selgere.
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-8 md:grid-cols-4">
          <nav aria-label="Utforsk kunst">
            <h3 className="text-sm font-semibold">Utforsk kunst</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/kunst" className={linkCls}>Alle kunstverk</Link></li>
              {([
                ["Malerier", "Malerier"],
                ["Grafikk og trykk", "Grafikk & trykk"],
                ["Fotografi", "Fotografi"],
                ["Skulpturer", "Skulpturer"],
              ] as [string, string][]).map(([label, k]) => (
                <li key={k}>
                  <Link to="/kunst" search={{ kategori: k }} className={linkCls}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Selg på Diargio">
            <h3 className="text-sm font-semibold">Selg på Diargio</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/selg" className={linkCls}>Legg ut kunst</Link></li>
              <li><Link to="/info/$page" params={{ page: "for-kunstnere" }} className={linkCls}>For kunstnere</Link></li>
              <li><Link to="/info/$page" params={{ page: "for-gallerier" }} className={linkCls}>For gallerier</Link></li>
              <li><Link to="/info/$page" params={{ page: "for-private-selgere" }} className={linkCls}>For private selgere</Link></li>
              <li><Link to="/info/$page" params={{ page: "guide-til-a-selge-kunst" }} className={linkCls}>Guide til å selge kunst</Link></li>
            </ul>
          </nav>
          <nav aria-label="Hjelp og trygghet">
            <h3 className="text-sm font-semibold">Hjelp og trygghet</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/info/$page" params={{ page: "slik-fungerer-diargio" }} className={linkCls}>Slik fungerer Diargio</Link></li>
              <li><Link to="/info/$page" params={{ page: "trygg-kunsthandel" }} className={linkCls}>Trygg kunsthandel</Link></li>
              <li><Link to="/info/$page" params={{ page: "betaling-og-levering" }} className={linkCls}>Betaling og levering</Link></li>
              <li><Link to="/info/$page" params={{ page: "priser-og-gebyrer" }} className={linkCls}>Priser og gebyrer</Link></li>
              <li><Link to="/info/$page" params={{ page: "ofte-stilte-sporsmal" }} className={linkCls}>Ofte stilte spørsmål</Link></li>
            </ul>
          </nav>
          <nav aria-label="Om Diargio">
            <h3 className="text-sm font-semibold">Om Diargio</h3>
            <ul className="mt-3 space-y-2">
              <li><Link to="/info/$page" params={{ page: "om-oss" }} className={linkCls}>Om oss</Link></li>
              <li><a href="mailto:post@diargio.com" className={linkCls}>Kontakt oss</a></li>
              <li><a href="https://www.instagram.com/diargio" target="_blank" rel="noreferrer" className={linkCls}>Instagram</a></li>
              <li><a href="https://www.facebook.com/diargio" target="_blank" rel="noreferrer" className={linkCls}>Facebook</a></li>
              <li><a href="https://www.linkedin.com/company/diargio/about/" target="_blank" rel="noreferrer" className={linkCls}>LinkedIn</a></li>
            </ul>
          </nav>
        </div>

        <form
          className="mt-10 max-w-md"
          onSubmit={(e) => {
            e.preventDefault();
            if (email.includes("@")) setDone(true);
          }}
        >
          <h3 className="text-sm font-semibold">Oppdag nye kunstnere og verk</h3>
          {done ? (
            <p className="mt-2 text-sm text-ink/70">Nyhetsbrev er ikke åpnet ennå. Følg Diargio på LinkedIn for nyheter.</p>
          ) : (
            <div className="mt-2 flex gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Din e-postadresse"
                aria-label="E-postadresse"
                className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
              />
              <button type="submit" className="rounded-md bg-sage px-4 py-2 text-sm font-medium text-white hover:bg-sagelight">
                Hold meg oppdatert
              </button>
            </div>
          )}
        </form>

        <div className="mt-10 space-y-2 border-t border-border pt-6 text-xs text-ink/60">
          <p>© 2026 Diargio · Diargio AS · Org.nr. [orgnummer kommer senere]</p>
          <p>Brukervilkår · Personvern · Innstillinger for informasjonskapsler</p>
          <p>
            Kontakt:{" "}
            <a href="mailto:post@diargio.com" className="font-semibold hover:underline">post@diargio.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
