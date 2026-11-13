import { useRef, useState } from "react";
import ReactCrop, { type PercentCrop } from "react-image-crop";
import { Crop, RotateCcw, RotateCw, Undo2 } from "lucide-react";
import { rotateImage } from '@/lib/image-edit';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const fullImage: PercentCrop = { unit: "%", x: 0, y: 0, width: 100, height: 100 };

export function ImageCropDialog({ image, onSave, onClose }: {
  image: string;
  onSave: (image: string) => void;
  onClose: () => void;
}) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<PercentCrop>(fullImage);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [preview, setPreview] = useState(image);
  const [turns, setTurns] = useState(0);
  const [rotating, setRotating] = useState(false);

  async function rotate(direction: number) {
    if (rotating) return;
    setRotating(true);
    setError('');
    try {
      const next = turns + direction;
      const result = await rotateImage(image, next);
      setReady(false);
      setPreview(result);
      setTurns(next);
      setCrop(fullImage);
    } catch {
      setError('Bildet kunne ikke roteres. Prøv igjen.');
    } finally {
      setRotating(false);
    }
  }

  function save() {
    const source = imageRef.current;
    if (!source || crop.width <= 0 || crop.height <= 0) return;
    try {
      const x = source.naturalWidth * crop.x / 100;
      const y = source.naturalHeight * crop.y / 100;
      const width = source.naturalWidth * crop.width / 100;
      const height = source.naturalHeight * crop.height / 100;
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(width));
      canvas.height = Math.max(1, Math.round(height));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas unavailable");
      context.drawImage(source, x, y, width, height, 0, 0, canvas.width, canvas.height);
      onSave(canvas.toDataURL("image/jpeg", 0.92));
      onClose();
    } catch {
      setError("Bildet kunne ikke lagres. Prøv igjen.");
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="image-crop-dialog max-h-[90dvh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-lg p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Roter og beskjær bildet</DialogTitle>
          <DialogDescription>Tilpass bildet</DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button type="button" variant="outline" disabled={!ready || rotating} onClick={() => void rotate(-1)} title="Roter 90° mot venstre" aria-label="Roter 90° mot venstre"><RotateCcw /> Venstre</Button>
          <Button type="button" variant="outline" disabled={!ready || rotating} onClick={() => void rotate(1)} title="Roter 90° mot høyre" aria-label="Roter 90° mot høyre"><RotateCw /> Høyre</Button>
        </div>
        <div className="flex min-h-0 justify-center overflow-hidden rounded-md bg-muted p-2">
          <ReactCrop crop={crop} onChange={(_, percent) => setCrop(percent)} minWidth={5} minHeight={5} keepSelection ariaLabels={{ cropArea: "Bildeutsnitt", nwDragHandle: "Øvre venstre hjørne", nDragHandle: "Øvre kant", neDragHandle: "Øvre høyre hjørne", eDragHandle: "Høyre kant", seDragHandle: "Nedre høyre hjørne", sDragHandle: "Nedre kant", swDragHandle: "Nedre venstre hjørne", wDragHandle: "Venstre kant" }}>
            <img ref={imageRef} src={preview} alt="Bildet som skal beskjæres" onLoad={() => setReady(true)} onError={() => setError("Bildet kunne ikke åpnes.")} className="block max-h-[55dvh] max-w-full object-contain" />
          </ReactCrop>
        </div>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="gap-2 sm:flex-wrap">
          <Button type="button" variant="ghost" disabled={rotating} onClick={() => { setPreview(image); setTurns(0); setCrop(fullImage); setError(''); }}><Undo2 /> Tilbakestill</Button>
          <Button type="button" variant="outline" onClick={onClose}>Avbryt</Button>
          <Button type="button" onClick={save} disabled={!ready || rotating || crop.width <= 0 || crop.height <= 0}><Crop /> Bruk bildet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}