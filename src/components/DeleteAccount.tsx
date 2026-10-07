import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { deleteOwnAccount } from "@/lib/account.functions";

export function DeleteAccount() {
  const del = useServerFn(deleteOwnAccount);
  const [busy, setBusy] = useState(false);
  return (
    <div className="mt-6 border-t border-border pt-4">
      <button
        type="button"
        disabled={busy}
        onClick={async () => {
          if (!confirm("Slette brukeren din og alle annonser, meldinger og bud? Dette kan ikke angres.")) return;
          setBusy(true);
          try {
            await del();
            await supabase.auth.signOut();
            window.location.replace("/");
          } catch {
            alert("Kunne ikke slette brukeren. Prøv igjen.");
            setBusy(false);
          }
        }}
        className="w-full rounded-2xl border border-destructive py-2.5 text-sm font-semibold text-destructive disabled:opacity-60"
      >
        {busy ? "Sletter…" : "Slett brukeren min"}
      </button>
    </div>
  );
}
