import { useEffect, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { avatarLayout } from '@/lib/avatar-layout';

export function AvatarAdjustDialog({ file, onClose, onSave }: { file: File | null; onClose: () => void; onSave: (file: File) => Promise<void> }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    setImage(null); setZoom(1); setOffset({ x: 0, y: 0 }); setError('');
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => setImage(img);
    img.onerror = () => setError('Bildet kunne ikke åpnes. Velg et annet bilde.');
    img.src = url;
    return () => { img.onload = null; URL.revokeObjectURL(url); };
  }, [file]);
  useEffect(() => {
    const ctx = canvas.current?.getContext('2d');
    if (!ctx || !image) return;
    ctx.clearRect(0, 0, 320, 320);
    const frame = avatarLayout(image.naturalWidth, image.naturalHeight, zoom, offset.x, offset.y);
    ctx.drawImage(image, frame.x, frame.y, frame.width, frame.height);
  }, [image, zoom, offset]);
  async function save() {
    if (!canvas.current || !image) return;
    setBusy(true); setError('');
    try {
      const blob = await new Promise<Blob>((resolve, reject) => canvas.current?.toBlob(b => b ? resolve(b) : reject(new Error()), 'image/png'));
      await onSave(new File([blob], 'profile.png', { type: 'image/png' }));
      onClose();
    } catch { setError('Bildet kunne ikke lagres. Prøv igjen.'); }
    finally { setBusy(false); }
  }
  return <Dialog open={!!file} onOpenChange={open => { if (!open && !busy) onClose(); }}>
    <DialogContent className="max-w-md"><DialogTitle>Tilpass profilbildet</DialogTitle><DialogDescription>Profilbilde / gallerilogo</DialogDescription>
      <canvas ref={canvas} width={320} height={320} aria-label="Utsnitt av profilbilde" className="mx-auto aspect-square w-full max-w-80 touch-none rounded-full bg-card ring-2 ring-border"
        onPointerDown={e => { e.currentTarget.setPointerCapture(e.pointerId); drag.current = { x: e.clientX, y: e.clientY }; }}
        onPointerMove={e => { const start = drag.current; if (!start) return; const scale = 320 / e.currentTarget.getBoundingClientRect().width; setOffset(p => ({ x: p.x + (e.clientX - start.x) * scale, y: p.y + (e.clientY - start.y) * scale })); drag.current = { x: e.clientX, y: e.clientY }; }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} />
      <label className="space-y-3 text-sm">Zoom<Slider aria-label="Zoom profilbilde" min={0.25} max={4} step={0.01} value={[zoom]} onValueChange={v => setZoom(v[0] ?? 1)} disabled={busy} /></label>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap justify-end gap-2"><Button type="button" variant="ghost" disabled={busy} onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>Tilbakestill</Button><Button type="button" variant="outline" disabled={busy} onClick={onClose}>Avbryt</Button><Button type="button" disabled={!image || busy} onClick={() => void save()}>{busy ? 'Lagrer …' : 'Lagre'}</Button></div>
    </DialogContent>
  </Dialog>;
}