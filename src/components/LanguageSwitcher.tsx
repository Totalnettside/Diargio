import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

const LANGS = [
  { code: "no", label: "Norsk", flag: "🇳🇴" },
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "pl", label: "Polski", flag: "🇵🇱" },
] as const;

const KEY = "diargio-lang";

function setCookie(value: string | null) {
  const host = window.location.hostname;
  const exp = value ? "" : "; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  const v = value ?? "";
  document.cookie = `googtrans=${v}; path=/${exp}`;
  document.cookie = `googtrans=${v}; path=/; domain=${host}${exp}`;
  document.cookie = `googtrans=${v}; path=/; domain=.${host}${exp}`;
}

function applyLang(code: string, tries = 0) {
  const combo = document.querySelector<HTMLSelectElement>("select.goog-te-combo");
  if (!combo || combo.options.length < 2) {
    if (tries < 50) setTimeout(() => applyLang(code, tries + 1), 200);
    return;
  }
  combo.value = code === "no" ? "" : code;
  combo.dispatchEvent(new Event("change"));
}

function loadScript(onReady: () => void) {
  const w = window as unknown as { gtInit?: () => void; google?: any };
  if (document.getElementById("gt-script")) {
    onReady();
    return;
  }
  w.gtInit = () => {
    new w.google.translate.TranslateElement(
      { pageLanguage: "no", includedLanguages: "en,pl,no", autoDisplay: false },
      "gt-el",
    );
    onReady();
  };
  const s = document.createElement("script");
  s.id = "gt-script";
  s.src = "https://translate.google.com/translate_a/element.js?cb=gtInit";
  document.body.appendChild(s);
}

export function LanguageSwitcher() {
  const [lang, setLang] = useState("no");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const current = localStorage.getItem(KEY) ?? "no";
    setLang(current);
    document.documentElement.lang = current === "no" ? "nb" : current;
    if (current !== "no") loadScript(() => applyLang(current));
  }, []);

  const choose = (code: string) => {
    setOpen(false);
    if (code === lang) return;
    localStorage.setItem(KEY, code);
    setLang(code);
    document.documentElement.lang = code === "no" ? "nb" : code;
    if (code === "no") {
      setCookie(null);
      window.location.reload();
      return;
    }
    setCookie(`/no/${code}`);
    loadScript(() => applyLang(code));
  };

  const active = LANGS.find((l) => l.code === lang) ?? LANGS[0];

  return (
    <div className="relative notranslate" translate="no">
      <div id="gt-el" className="hidden" />
      <Button variant="ghost"
        onClick={() => setOpen((o) => !o)}
        className="flex h-10 items-center gap-1.5 rounded-2xl bg-topbar px-3 text-sm font-semibold text-nav-highlight glass"
        aria-label="Velg språk"
        aria-expanded={open}
      >
        <Globe className="size-4" />
        <span>{active.code.toUpperCase()}</span>
      </Button>
      {open && (
        <div className="absolute right-0 top-12 z-50 w-40 overflow-hidden rounded-2xl border border-border bg-card shadow-lg">
          {LANGS.map((l) => (
            <Button variant="ghost"
              key={l.code}
              onClick={() => choose(l.code)}
              className={`flex w-full justify-start items-center gap-2 px-3 py-2 text-left text-sm hover:bg-mist ${l.code === lang ? "font-semibold text-brandink" : "text-ink"}`}
            >
              <span>{l.flag}</span>
              {l.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
