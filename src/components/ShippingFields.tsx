import type { BringPackage } from '@/lib/bring';
import bringLogo from '@/assets/bring-logo.svg.asset.json';

export type ShippingForm = { weightKg: string; lengthCm: string; widthCm: string; heightCm: string; fromPostalCode: string };
export const emptyShippingForm: ShippingForm = { weightKg: '', lengthCm: '', widthCm: '', heightCm: '', fromPostalCode: '' };
export function shippingFormFrom(parcel?: BringPackage): ShippingForm {
  return parcel ? { weightKg: String(parcel.weightKg), lengthCm: String(parcel.lengthCm), widthCm: String(parcel.widthCm), heightCm: String(parcel.heightCm), fromPostalCode: parcel.fromPostalCode } : { ...emptyShippingForm };
}
export function shippingParcel(form: ShippingForm) {
  return { weightKg: Number(form.weightKg.replace(',', '.')), lengthCm: Number(form.lengthCm.replace(',', '.')), widthCm: Number(form.widthCm.replace(',', '.')), heightCm: Number(form.heightCm.replace(',', '.')), fromPostalCode: form.fromPostalCode };
}
export function ShippingFields({ value, onChange }: { value: ShippingForm; onChange: (value: ShippingForm) => void }) {
  const fields: { key: keyof ShippingForm; label: string }[] = [{ key: 'weightKg', label: 'Vekt med emballasje (kg)' }, { key: 'fromPostalCode', label: 'Senders postnummer' }, { key: 'widthCm', label: 'Høyde med emballasje (cm)' }, { key: 'lengthCm', label: 'Lengde med emballasje (cm)' }, { key: 'heightCm', label: 'Dybde med emballasje (cm)' }];
  return <div className="space-y-4"><img src={bringLogo.url} alt="Bring" className="h-8 w-24 object-contain object-left" /><div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="space-y-1 text-sm font-medium"><span>{field.label}</span><input className="w-full rounded-md border border-primary/40 bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring" inputMode={field.key === 'fromPostalCode' ? 'numeric' : 'decimal'} maxLength={field.key === 'fromPostalCode' ? 4 : 10} value={value[field.key]} onChange={e => onChange({ ...value, [field.key]: field.key === 'fromPostalCode' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value })} /></label>)}</div></div>;
}