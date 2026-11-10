import { createContext, useContext, useRef, useState, type ReactNode } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast, Toaster } from 'sonner';
import { actionError } from '@/lib/action-errors';

type Request = { title: string; description: string; confirmLabel: string; busyLabel?: string; destructive?: boolean; inputLabel?: string; initialValue?: string; required?: boolean; success?: string; action: (value: string) => Promise<unknown> | unknown };
const Context = createContext<((request: Request) => void) | null>(null);

export function ActionDialogs({ children }: { children: ReactNode }) {
  const [request, setRequest] = useState<Request | null>(null);
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const lock = useRef(false);
  const submitting = useRef(false);
  const trigger = useRef<HTMLElement | null>(null);
  const open = (r: Request) => {
    if (lock.current) return;
    lock.current = true;
    trigger.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setValue(r.initialValue ?? ''); setError(''); setRequest(r);
  };
  const close = () => { if (!busy) { lock.current = false; setRequest(null); } };
  const perform = async () => {
    if (!request || submitting.current) return;
    if (request.required && !value.trim()) { setError('Fyll inn en begrunnelse før du fortsetter.'); return; }
    submitting.current=true;setBusy(true); setError('');
    try {
      await request.action(value.trim());
      if (request.success) toast.success(request.success, { id: 'action-result' });
      lock.current = false; setRequest(null);
    } catch (e) { console.error('Diargio action failed', e); setError(actionError(e)); }
    finally { submitting.current=false;setBusy(false); }
  };
  return <Context.Provider value={open}>{children}
    <Toaster position="bottom-center" toastOptions={{ className: 'border-border bg-card text-foreground' }} />
    <Dialog open={!!request} onOpenChange={o => { if (!o) close(); }}>
      <DialogContent className="max-h-[85dvh] w-[calc(100%_-_2rem)] overflow-y-auto rounded-lg" onEscapeKeyDown={e => { if (busy) e.preventDefault(); }} onInteractOutside={e => e.preventDefault()} onCloseAutoFocus={e => { e.preventDefault(); if (trigger.current?.isConnected) trigger.current.focus(); }}>
        <DialogHeader><DialogTitle>{request?.title}</DialogTitle><DialogDescription>{request?.description}</DialogDescription></DialogHeader>
        {request?.inputLabel && <label className="space-y-2 text-sm"><span>{request.inputLabel}</span><textarea autoFocus rows={4} maxLength={4000} disabled={busy} value={value} onChange={e => setValue(e.target.value)} aria-invalid={!!error} aria-describedby={error ? 'action-error' : undefined} className="w-full rounded-md border border-input bg-background p-3 text-foreground" /></label>}
        {error && <p id="action-error" role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="gap-2"><Button variant="outline" disabled={busy} onClick={close}>Avbryt</Button><Button variant={request?.destructive ? 'destructive' : 'default'} disabled={busy} onClick={() => void perform()}>{busy ? request?.busyLabel ?? 'Behandler …' : request?.confirmLabel}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  </Context.Provider>;
}
export function useActionDialog() {
  const open = useContext(Context);
  if (!open) throw new Error('ActionDialogs provider missing');
  return open;
}

export function listingDeletionDescription(title?: string) {
  return `${title?.trim() ? `Vil du slette annonsen «${title.trim()}»?` : 'Vil du slette denne annonsen?'} Den blir fjernet fra offentlig visning og kan ikke lenger kjøpes.`;
}