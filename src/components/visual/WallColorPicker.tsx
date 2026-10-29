import { useState } from 'react';
import Wheel from '@uiw/react-color-wheel';
import { hexToHsva, hsvaToHex, type HsvaColor } from '@uiw/color-convert';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { wallColors } from '@/lib/visual-art';

const validHex = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
const initialColor: HsvaColor = { h: 35, s: 10, v: 96, a: 1 };
const names = ['Original', 'Lys', 'Grå', 'Salvie', 'Varm'];

export function WallColorPicker({ color, onChange }: { color: string; onChange: (color: string) => void }) {
  const [lastCustom, setLastCustom] = useState(initialColor);
  const [code, setCode] = useState('');
  const hsva = validHex(color) ? hexToHsva(color) : lastCustom;
  const choose = (next: HsvaColor) => { setLastCustom(next); setCode(''); onChange(hsvaToHex(next)); };

  return <fieldset className="wall-color-picker min-w-0">
    <legend className="visual-label">Veggfarger</legend>
    <div className="mt-2 flex flex-wrap gap-2">
      {wallColors.map((c, i) => <Button key={c} variant="outline" size="icon" title={names[i]} aria-label={`Veggfarge ${names[i]}`} aria-pressed={color === c} className={`wall-swatch tone-${c}`} onClick={() => onChange(c)}>{color === c && <Check />}</Button>)}
    </div>
    <div className="wall-color-wheel mt-4" role="group" aria-label="Fargehjul for egen veggfarge" tabIndex={0}
      onKeyDown={(e) => {
        const delta: Record<string, [number, number]> = { ArrowLeft: [-5, 0], ArrowRight: [5, 0], ArrowUp: [0, 5], ArrowDown: [0, -5] };
        const change = delta[e.key];
        if (!change) return;
        e.preventDefault(); choose({ ...hsva, h: (hsva.h + change[0] + 360) % 360, s: Math.max(0, Math.min(100, hsva.s + change[1])) });
      }}>
      <Wheel width={138} height={138} color={hsva} onChange={(next) => choose(next.hsva)} />
    </div>
    <label className="visual-label mt-3">Lysstyrke
      <input type="range" min={0} max={100} value={Math.round(hsva.v)} aria-label="Veggfargens lysstyrke" className="wall-color-brightness w-full" onChange={(e) => choose({ ...hsva, v: Number(e.target.value) })} />
    </label>
    <label className="visual-label mt-3">Fargekode
      <Input aria-label="Veggfargens fargekode" placeholder={hsvaToHex(hsva)} value={code || (validHex(color) ? color : '')} maxLength={7}
        onChange={(e) => { const value = e.target.value; setCode(value); if (validHex(value)) { setLastCustom(hexToHsva(value)); onChange(value); } }}
        onBlur={() => setCode('')} />
    </label>
  </fieldset>;
}