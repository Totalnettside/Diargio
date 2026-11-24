import { useEffect, useState } from 'react';
import { useServerFn } from '@tanstack/react-start';
import { ShieldCheck } from 'lucide-react';
import { getBankIdStatus, startBankIdVerification } from '@/lib/bankid.functions';

/** Shows children only for BankID-verified users; otherwise a verify button. */
export function BankIdGate({ action, children }: { action: string; children: React.ReactNode }) {
  const status = useServerFn(getBankIdStatus);
  const start = useServerFn(startBankIdVerification);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => { status().then((r) => setVerified(r.verified)).catch(() => setVerified(false)); }, [status]);
  if (verified === null) return <p className="py-6 text-center text-sm text-muted-foreground">Sjekker verifisering …</p>;
  if (verified) return <>{children}</>;
  const go = async () => {
    setBusy(true); setError('');
    const r = await start({ data: { returnTo: window.location.pathname + window.location.search } });
    if ('url' in r && r.url) { window.location.href = r.url; return; }
    setError('error' in r && r.error ? r.error : 'Noe gikk galt.'); setBusy(false);
  };
  const failed = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('bankid') === 'feil';
  return (
    <div className="mx-auto my-8 max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
      <ShieldCheck className="mx-auto h-10 w-10 text-primary" aria-hidden />
      <h2 className="mt-3 font-display text-xl font-semibold">Bekreft identiteten din med BankID</h2>
      <p className="mt-2 text-sm text-muted-foreground">For å {action} må du verifisere deg med BankID én gang. Dette gjør handel på Diargio tryggere for alle.</p>
      {(error || failed) && <p role="alert" className="mt-3 text-sm text-destructive">{error || 'Verifiseringen ble ikke fullført. Prøv igjen.'}</p>}
      <button type="button" onClick={go} disabled={busy} className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60">
        <ShieldCheck className="h-4 w-4" aria-hidden />{busy ? 'Åpner BankID …' : 'Verifiser med BankID'}
      </button>
    </div>
  );
}
