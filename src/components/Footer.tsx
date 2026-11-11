import { Link } from "@tanstack/react-router";
import { useState } from "react";
import logo from "@/assets/diargio-logo.png.asset.json";

const linkCls = "text-sm text-ink/70 hover:text-ink hover:underline";

const SOCIAL = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1KTCP1YZVs/?mibextid=wwXIfr",
    path: "M13.5 22v-8h2.7l.4-3.2h-3.1V8.8c0-.9.3-1.5 1.6-1.5h1.7V4.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2.3H7.4V14h2.7v8h3.4z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/diargio_art",
    path: "M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zm0 8.2a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4zM17.2 5.6a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4zM12 2c-2.7 0-3 0-4.1.1C4.3 2.2 2.2 4.3 2.1 7.9 2 9 2 9.3 2 12s0 3 .1 4.1c.1 3.6 2.2 5.7 5.8 5.8 1.1.1 1.4.1 4.1.1s3 0 4.1-.1c3.6-.1 5.7-2.2 5.8-5.8.1-1.1.1-1.4.1-4.1s0-3-.1-4.1c-.1-3.6-2.2-5.7-5.8-5.8C15 2 14.7 2 12 2zm0 1.8c2.7 0 3 0 4 .1 2.6.1 3.9 1.4 4 4 .1 1 .1 1.3.1 4s0 3-.1 4c-.1 2.6-1.4 3.9-4 4-1 .1-1.3.1-4 .1s-3 0-4-.1c-2.6-.1-3.9-1.4-4-4-.1-1-.1-1.3-.1-4s0-3 .1-4c.1-2.6 1.4-3.9 4-4 1-.1 1.3-.1 4-.1z",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/diargio/",
    path: "M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2zM7.1 20.5H3.5V9h3.6v11.5z",
  },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <footer className="no-print mt-12 border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="max-w-xl">
          <span
            className="footer-logo-link"
            style={{ ["--logo-source" as string]: `url("${logo.url}")` }}
          >
            <img src={logo.url} alt="Diargio" className="footer-logo h-10 w-auto" />
          </span>
          <p className="mt-3 text-sm text-ink/70">
            Diargio er en markedsplass som formidler kjøp og salg av kunst fra kunstnere, gallerier og private selgere.
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
              <li><Link to="/info/$page" params={{ page: "kjopsvilkaar" }} className={linkCls}>Kjøpsvilkår</Link></li>
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
            </ul>
            <ul className="mt-4 flex items-center gap-3" aria-label="Følg Diargio">
              {SOCIAL.map((s) => (
                <li key={s.name}>
                  <a
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Diargio på ${s.name} (åpnes i ny fane)`}
                    title={s.name}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border text-ink/70 transition-colors hover:text-ink hover:border-ink/40"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
                      <path d={s.path} />
                    </svg>
                  </a>
                </li>
              ))}
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
          <p>© 2026 Diargio · Diargio AS · Org.nr. 938724148</p>
          <p>
            <Link to="/info/$page" params={{ page: "kjopsvilkaar" }} className="font-semibold hover:underline">Kjøpsvilkår</Link>
            {" · Brukervilkår · Personvern · Innstillinger for informasjonskapsler"}
          </p>
          <p>
            Kontakt:{" "}
            <a href="mailto:post@diargio.com" className="font-semibold hover:underline">post@diargio.com</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
