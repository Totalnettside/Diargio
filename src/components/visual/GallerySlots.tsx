import { Button } from '@/components/ui/button';
import { GALLERY_TIERS, type GallerySlot } from '@/lib/gallery-rooms';

export function GallerySlots({ slots, selected, onSelect }: { slots: GallerySlot[]; selected?: string; onSelect: (slot: GallerySlot) => void }) {
  return <>{slots.map((slot, index) => <Button key={slot.id} variant="outline"
    className={`gallery-slot ${selected === slot.id ? 'gallery-slot-selected' : ''}`}
    style={{ left: `${slot.cx * 100}%`, top: `${slot.cy * 100}%` }}
    aria-label={`Plass ${index + 1} — ${GALLERY_TIERS[slot.tier]} — Ledig`}
    aria-pressed={selected === slot.id} onClick={() => onSelect(slot)}>
    <span className="gallery-slot-number">{index + 1}</span><span>Ledig</span>
  </Button>)}</>;
}