import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useServerFn } from '@tanstack/react-start';
import { getMaintenanceStatus, setMaintenanceMode } from '@/lib/maintenance.functions';
import { Switch } from '@/components/ui/switch';

export function MaintenanceSettings() {
  const getStatus = useServerFn(getMaintenanceStatus);
  const setMode = useServerFn(setMaintenanceMode);
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const { data } = useQuery({ queryKey: ['maintenance-status'], queryFn: () => getStatus() });
  async function change(enabled: boolean) {
    setBusy(true); setError('');
    try { const result = await setMode({ data: { enabled } }); qc.setQueryData(['maintenance-status'], result); }
    catch { setError('Kunne ikke endre vedlikeholdsmodus. Prøv igjen.'); }
    finally { setBusy(false); }
  }
  return <section className="max-w-xl space-y-4">
    <h2 className="font-display text-xl font-semibold">Innstillinger</h2>
    <div className="flex items-center justify-between gap-4 border-b border-border py-4">
      <label htmlFor="maintenance-mode" className="font-semibold">Vedlikeholdsmodus</label>
      <Switch id="maintenance-mode" checked={data?.enabled ?? true} disabled={busy || !data} onCheckedChange={v => void change(v)} />
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
  </section>;
}