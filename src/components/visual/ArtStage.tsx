import { useRef, type PointerEvent } from 'react';
import type { Artwork } from '@/data/demo';
import { Button } from '@/components/ui/button';
import type { Placement } from '@/lib/visual-art';

export function ArtStage({ background, aspect = 1.5, color = 'original', placements, artworks, selected, onSelect, onChange, onDropArt, calibration, onCalibrationPoint }: {
  background: string; aspect?: number; color?: string; placements: Placement[]; artworks: Artwork[]; selected: string | null;
  onSelect: (id: string) => void; onChange?: (items: Placement[]) => void; onDropArt?: (id: string, x: number, y: number) => void;
  calibration?: { start: number; end: number; cm: number } | null; onCalibrationPoint?: (x: number) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: string; startX: number; startY: number; initial: Placement; corner?: string } | null>(null);
  const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(Math.max(min, max), v));
  const update = (id: string, patch: Partial<Placement>) => onChange?.(placements.map((p) => p.id === id ? { ...p, ...patch } : p));
  function start(e: PointerEvent, p: Placement, corner?: string) {
    if (!onChange) return;
    e.preventDefault(); e.stopPropagation();
    onSelect(p.id);
    gesture.current = { id: p.id, startX: e.clientX, startY: e.clientY, initial: p, corner };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function move(e: PointerEvent) {
    const g = gesture.current; const rect = ref.current?.getBoundingClientRect();
    if (!g || !rect) return;
    const dx = (e.clientX - g.startX) / rect.width; const dy = (e.clientY - g.startY) / rect.height;
    const p = g.initial;
    if (g.corner) {
      const left = g.corner.includes('left'); const top = g.corner.includes('top');
      const rightEdge = p.x + p.width; const bottomEdge = p.y + p.width * aspect / p.ratio;
      const delta = Math.abs(dx) >= Math.abs(dy * p.ratio / aspect) ? (left ? -dx : dx) : (top ? -dy : dy) * p.ratio / aspect;
      const maxWidth = Math.min(left ? rightEdge : 1 - p.x, (top ? bottomEdge : 1 - p.y) * p.ratio / aspect, 0.9);
      const width = clamp(p.width + delta, 0.02, maxWidth);
      update(p.id, { width, x: left ? rightEdge - width : p.x, y: top ? bottomEdge - width * aspect / p.ratio : p.y });
    } else update(p.id, { x: clamp(p.x + dx, 0, 1 - p.width), y: clamp(p.y + dy, 0, 1 - p.width * aspect / p.ratio) });
  }
  return <div ref={ref} className={`art-stage wall-tone-${color}`} style={{ aspectRatio: aspect }}
    onDragOver={(e) => { if (onDropArt) e.preventDefault(); }} onDrop={(e) => { e.preventDefault(); const r = ref.current?.getBoundingClientRect(); if (r) onDropArt?.(e.dataTransfer.getData('text/plain'), (e.clientX-r.left)/r.width, (e.clientY-r.top)/r.height); }}
    onClick={(e) => { if (onCalibrationPoint) { const r = ref.current?.getBoundingClientRect(); if (r) onCalibrationPoint((e.clientX-r.left)/r.width); } }}>
    <img src={background} alt="Rom med vegg for kunst" className="absolute inset-0 size-full object-fill" />
    <div className="wall-tint" />
    {calibration && <div className="calibration-line" style={{ left: `${Math.min(calibration.start, calibration.end)*100}%`, width: `${Math.abs(calibration.end-calibration.start)*100}%` }}><span>{calibration.cm} cm</span></div>}
    {placements.map((p, i) => {
      const a = artworks.find((a) => a.id === p.artworkId); if (!a) return null;
      return <div key={p.id} className={`placed-art ${selected === p.id ? 'is-selected' : ''}`} style={{ left: `${p.x*100}%`, top: `${p.y*100}%`, width: `${p.width*100}%`, aspectRatio: p.ratio }}>
        <Button variant="ghost" className="placed-art-button" aria-label={`${onChange ? 'Flytt' : 'Se'} ${a.title}`} onClick={(e) => { e.stopPropagation(); onSelect(p.id); }}
          onPointerDown={(e) => start(e, p)} onPointerMove={move} onPointerUp={() => { gesture.current = null; }} onPointerCancel={() => { gesture.current = null; }}
          onKeyDown={(e) => {
            if (!onChange) return;
            const step = e.shiftKey ? 0.025 : 0.005;
            const keys: Record<string, [number, number]> = { ArrowLeft: [-step,0], ArrowRight: [step,0], ArrowUp: [0,-step], ArrowDown: [0,step] };
            if (keys[e.key]) { e.preventDefault(); const [x,y] = keys[e.key]; update(p.id, { x: clamp(p.x+x,0,1-p.width), y: clamp(p.y+y,0,1-p.width*aspect/p.ratio) }); }
            if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); onChange(placements.filter((x) => x.id !== p.id)); }
          }}>
          <img src={a.image} alt={a.title} draggable={false} onLoad={(e) => { const img = e.currentTarget; const ratio = img.naturalWidth / img.naturalHeight; if (onChange && Number.isFinite(ratio) && Math.abs(ratio-p.ratio) > 0.01) update(p.id, { ratio, width: Math.min(p.width, (1-p.y)*ratio/aspect) }); }} />
          {!onChange && <span className="art-marker">{i+1}</span>}
        </Button>
        {onChange && selected === p.id && ['top-left','top-right','bottom-left','bottom-right'].map((corner) => <Button key={corner} variant="default" size="icon" className={`resize-handle handle-${corner}`} aria-label={`Juster størrelse ${a.title} ${corner}`} onPointerDown={(e) => start(e,p,corner)} onPointerMove={move} onPointerUp={() => { gesture.current=null; }} onKeyDown={(e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); update(p.id, { width: clamp(p.width + (e.key === 'ArrowUp' ? 0.01 : -0.01),0.02,Math.min(1-p.x,(1-p.y)*p.ratio/aspect,0.9)) }); } }} />)}
      </div>;
    })}
  </div>;
}