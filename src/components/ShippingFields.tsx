import type { BringPackage } from '@/lib/bring';

export type ShippingForm = { weightKg: string; lengthCm: string; widthCm: string; heightCm: string; fromPostalCode: string };
export const emptyShippingForm: ShippingForm = { weightKg: '', lengthCm: '', widthCm: '', heightCm: '', fromPostalCode: '' };
export function shippingFormFrom(parcel?: BringPackage): ShippingForm {
  return parcel ? { weightKg: String(parcel.weightKg), lengthCm: String(parcel.lengthCm), widthCm: String(parcel.widthCm), heightCm: String(parcel.heightCm), fromPostalCode: parcel.fromPostalCode } : { ...emptyShippingForm };
}
export function shippingParcel(form: ShippingForm) {
  return { weightKg: Number(form.weightKg.replace(',', '.')), lengthCm: Number(form.lengthCm.replace(',', '.')), widthCm: Number(form.widthCm.replace(',', '.')), heightCm: Number(form.heightCm.replace(',', '.')), fromPostalCode: form.fromPostalCode };
}
export function ShippingFields({ value, onChange }: { value: ShippingForm; onChange: (value: ShippingForm) => void }) {
  const fields: { key: keyof ShippingForm; label: string }[] = [{ key: 'weightKg', label: 'Vekt med emballasje (kg)' }, { key: 'fromPostalCode', label: 'Senders postnummer' }, { key: 'lengthCm', label: 'Pakkelengde (cm)' }, { key: 'widthCm', label: 'Pakkebredde (cm)' }, { key: 'heightCm', label: 'Pakkehøyde (cm)' }];
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{fields.map(field => <label key={field.key} className="space-y-1 text-sm font-medium"><span>{field.label}</span><input className="w-full rounded-md border border-primary/40 bg-background px-3 py-2.5 text-foreground outline-none focus:ring-2 focus:ring-ring" inputMode={field.key === 'fromPostalCode' ? 'numeric' : 'decimal'} maxLength={field.key === 'fromPostalCode' ? 4 : 10} value={value[field.key]} onChange={e => onChange({ ...value, [field.key]: field.key === 'fromPostalCode' ? e.target.value.replace(/\D/g, '').slice(0, 4) : e.target.value })} /></label>)}</div>;
}