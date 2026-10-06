import { useEffect, useState } from "react";
import { Globe } from "lucide-react";

const LANGS = [
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
] as const;

function readLang(): string {
  const m = document.cookie.match(/googtrans=\/no\/(\w+)/);
  return m?.[1] ?? "no";
}

function setCookie(value: string | null) {
  const host = window.location.hostname;
  const exp = value ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const v = value ?? "";
  document.cookie = `googtrans=${v}; path=/${exp}`;
  document.cookie = `googtrans=${v}; path=/; domain=${host}${exp}`;
  document.cookie = `googtrans=${v}; path=/; domain=.${host}${exp}`;
}

export function LanguageSwitcher() {
  const [lang, setLang] = useState("no");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = readLang();
    setLang(current);
    document.documentElement.lang = current === "no" ? "nb" : current;
    if (current === "no" || document.getElementById("gt-script")) return;
    (window as unknown as { gtInit: () => void }).gtInit = () => {
      const g = (window as unknown as { google: any }).google;
      new g.translate.TranslateElement({ pageLanguage: "no", autoDisplay: false }, "gt-el");
    };
    const s = document.createElement("script");
    s.id = "gt-script";
    s.src = "https://translate.google.com/translate_a/element.js?cb=gtInit";
    document.body.appendChild(s);
  }, []);

  const choose = (code: string) => {
    setOpen(false);
    if (code === lang) return;
    setCookie(code === "no" ? null : `/no/${code}`);
    window.location.reload();
  };

  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative notranslate" translate="no">
      <div id="gt-el" className="hidden" />
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-2xl bg-white/60 px-3 text-sm font-semibold text-ink glass"
        aria-label="Velg språk"
      >
        <Globe className="size-4" />
        <span>{active.code.toUpperCase()}</span>
      </button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => choose(l.code)}
              className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-mist ${l.code === lang ? "font-semibold text-brandink" : "text-ink"}`}
            >
              <span>{l.flag}</span>
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
