import { PriceCalculator } from "@/components/PriceCalculator";
import { breakdownFromTotal, priceFromPayout } from "@/lib/fees";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  artTypes,
  categories,
  conditions,
  counties,
  formatPrice,
  saleTypes,
  styles,
  techniques,
  type SaleType,
} from "@/data/demo";
import { useStore } from "@/lib/store";
import {Button} from '@/components/ui/button';
import {ArtworkPreview} from '@/components/ArtworkPreview';
import {ListingDocumentation} from '@/components/ListingDocumentation';
import {moderationLabels,submissionDisclosure} from '@/lib/moderation';
import {useActionDialog,listingDeletionDescription} from '@/components/ActionDialogs';
import {toast} from 'sonner';
import {actionError} from '@/lib/action-errors';
import {removeListingImage,selectMainImage} from '@/lib/listing-images';

export const Route = createFileRoute("/_authenticated/rediger/$slug")({
  head: () => ({
    meta: [
      { title: "Endre annonse | Diargio" },
      { name: "description", content: "Rediger eller slett annonsen din." },
      { property: "og:title", content: "Endre annonse | Diargio" },
      { property: "og:description", content: "Rediger eller slett annonsen din." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EditListingPage,
});

const inputClass = "w-full rounded-2xl bg-white/70 px-3 py-2.5 text-sm outline-none glass";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

function EditListingPage() {
  const dialog=useActionDialog();
  const [saving,setSaving]=useState(false);
  const { slug } = Route.useParams();
  const { myListings, updateListing, deleteListing, submitListing, changeVisibility } = useStore();
  const navigate = useNavigate();
  const listing = myListings.find((l) => l.slug === slug);

  const [shippingPrice,setShippingPrice]=useState(String(listing?.shippingPrice??0));
  const [saveError,setSaveError]=useState("");
  const [title, setTitle] = useState(listing?.title ?? "");
  const [price, setPrice] = useState(String(listing ? (listing.sellerPayout ?? breakdownFromTotal(listing.price, listing.artFeeApplies ?? true).payout) : ""));
  const [artFeeApplies, setArtFeeApplies] = useState(listing?.artFeeApplies ?? true);
  const [category, setCategory] = useState(listing?.category ?? categories[0] ?? "Malerier");
  const [style, setStyle] = useState(listing?.style ?? styles[0] ?? "Abstrakt");
  const [technique, setTechnique] = useState(listing?.technique ?? techniques[0] ?? "Olje");
  const [type, setType] = useState(listing?.type ?? artTypes[0] ?? "Original");
  const [condition, setCondition] = useState(listing?.condition ?? conditions[0] ?? "Ny");
  const [saleType, setSaleType] = useState<SaleType>(listing?.saleType ?? "Fastpris");
  const [county, setCounty] = useState(listing?.county ?? counties[0] ?? "Oslo");
  const [description, setDescription] = useState(listing?.description ?? "");
  const [artistName,setArtistName]=useState(listing?.artistName??'');
  const [ownWork,setOwnWork]=useState(listing?.ownWork??true);
  const [sellerType,setSellerType]=useState(listing?.sellerType??'Kunstner');
  const [images,setImages]=useState(listing?.images??(listing?.image?[listing.image]:[]));
  const [edition,setEdition]=useState(listing?.edition??'');
  const [preview,setPreview]=useState(false);
  useEffect(()=>{if(!listing)return;setArtistName(listing.artistName??'');setOwnWork(listing.ownWork??true);setSellerType(listing.sellerType??'Kunstner');setImages(listing.images??[listing.image]);setEdition(listing.edition??'');},[listing?.id]);

  useEffect(()=>{if(listing){setTitle(listing.title);setPrice(String(listing.sellerPayout??breakdownFromTotal(listing.price,listing.artFeeApplies??true).payout));setShippingPrice(String(listing.shippingPrice??0));setCategory(listing.category);setTechnique(listing.technique);setStyle(listing.style);setType(listing.type);setCondition(listing.condition);setSaleType(listing.saleType);setCounty(listing.county);setDescription(listing.description);setArtFeeApplies(listing.artFeeApplies??true);}},[listing?.id]);

  if (!listing) {
    return (
      <main className="mx-auto w-full max-w-2xl px-5 py-10 text-center">
        <h1 className="font-display text-2xl font-semibold">Fant ikke annonsen</h1>
        <p className="mt-2 text-sm text-ink/60">
          Denne annonsen finnes ikke, eller du ikke er eier av annonsen.
        </p>
        <Link
          to="/min-side"
          className="mt-4 inline-block rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Til Min side
        </Link>
      </main>
    );
  }

  async function save(submit = false) {
    if(!listing||saving)return;
    if(!title.trim()||!images.length){setSaveError('Legg til et bilde og fyll inn verkets navn før du lagrer.');return;}
    setSaving(true);setSaveError('');
    try {await updateListing({
      ...listing,
      artistName,ownWork,sellerType,images,image:images[0]??listing.image,edition,
      title: title || listing.title,
      ...(Number(price) ? { price: priceFromPayout(Number(price), artFeeApplies).total, sellerPayout: Number(price), artFeeApplies } : {}),
      category,
      style,
      technique,
      type,
      condition,
      saleType,
      county,
      shippingPrice:Number(shippingPrice),
      description: description || listing.description,
    });
    if(submit)await submitListing(listing.id);
    toast.success(submit?'Endringene er sendt til godkjenning':'Endringene er lagret',{id:'action-result'});
    await navigate({ to: "/min-side",search:{tab:'Mine annonser'} });
    }catch(e){console.error('Listing save failed',e);setSaveError(actionError(e,'Endringene kunne ikke lagres. Prøv igjen.'));}finally{setSaving(false);}
  }

  async function remove() {
    if(!listing)return;
    dialog({title:'Slette annonsen?',description:listingDeletionDescription(listing.title),confirmLabel:'Slett annonsen',busyLabel:'Sletter …',destructive:true,success:'Annonsen er slettet',action:async()=>{await deleteListing(listing.id);await navigate({to:'/min-side',search:{tab:'Mine annonser'}});}});
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-5">
      <h1 className="font-display text-2xl font-semibold">Endre annonse</h1>
      <p className="mt-1 text-sm text-ink/60">«{listing.title}» · {formatPrice(listing.price)}</p>
      <p className="mt-2 text-primary">{moderationLabels[listing.moderationStatus as keyof typeof moderationLabels]??'Publisert'}</p>
      {listing.sellerMessage&&<p className="mt-2">Beskjed fra Diargio: {listing.sellerMessage}</p>}
      {listing.moderationStatus==='pending'&&<Button className="mt-3" variant="outline" onClick={()=>void changeVisibility(listing.id,'draft').then(()=>window.location.reload()).catch(e=>setSaveError(e.message))}>Trekk innsendt versjon tilbake til utkast</Button>}

      {saveError&&<p role="alert" className="text-destructive">{saveError}</p>}
      <section className="mt-4 space-y-4 rounded-3xl p-5 glass">
        <Field label="Kunstner"><input className={inputClass} value={artistName} onChange={e=>setArtistName(e.target.value)}/></Field>
        <Field label="Selgertype"><select className={inputClass} value={sellerType} onChange={e=>setSellerType(e.target.value as typeof sellerType)}>{['Kunstner','Privat','Galleri','Kunsthandler'].map(t=><option key={t}>{t}</option>)}</select></Field>
        <Field label="Eget verk eller videresalg"><select className={inputClass} value={ownWork?'own':'resale'} onChange={e=>setOwnWork(e.target.value==='own')}><option value="own">Eget verk</option><option value="resale">Videresalg</option></select></Field>
        <Field label="Opplag"><input className={inputClass} value={edition} onChange={e=>setEdition(e.target.value)}/></Field>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{images.map((src,i)=><div key={src}><ArtworkPreview image={src} alt={`Bilde ${i+1}`}/><div className="flex flex-wrap gap-1"><Button variant="ghost" disabled={saving||listing.moderationStatus==='pending'||listing.moderationStatus==='sold'} onClick={()=>dialog({title:'Slette bildet?',description:'Vil du fjerne dette bildet fra annonsen? Endringen lagres som en ny versjon og må gjennom godkjenning før den vises offentlig.',confirmLabel:'Slett bildet',busyLabel:'Sletter …',destructive:true,success:'Bildet er slettet fra den lagrede versjonen',action:async()=>{if(images.length<=1)throw new Error('last_image');const next=images.filter((_,n)=>n!==i);await updateListing({...listing,images:next,image:next[0]??''});setImages(next);}})}>Slett bilde</Button><Button variant="outline" disabled={i===0||saving||listing.moderationStatus==='pending'||listing.moderationStatus==='sold'} onClick={async()=>{if(saving)return;setSaving(true);try{const next=[src,...images.filter((_,n)=>n!==i)];await updateListing({...listing,images:next,image:src});setImages(next);toast.success('Hovedbildet er lagret i den nye versjonen',{id:'action-result'});}catch(e){setSaveError(actionError(e,'Hovedbildet kunne ikke lagres.'));}finally{setSaving(false);}}}>{i===0?'Hovedbilde':'Velg hovedbilde'}</Button></div></div>)}</div>
        {images.length===1&&<p className="text-sm text-muted-foreground">Legg til et nytt bilde før du sletter det siste, eller trekk annonsen fra salg.</p>}
        <label className="block text-sm">Legg til bilder<input aria-label="Legg til annonsebilder" type="file" accept="image/*" multiple onChange={e=>{for(const file of Array.from(e.target.files??[]).slice(0,15-images.length)){if(file.size>2000000){setSaveError('Velg et bilde under 2 MB.');continue;}const reader=new FileReader();reader.onload=()=>{if(typeof reader.result==='string'){const src=reader.result;setImages(prev=>[...prev,src].slice(0,15));}};reader.readAsDataURL(file);}}}/></label>
        <Field label="Tittel">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputClass} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ønsket utbetaling (kr)">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/\D/g, ""))}
              inputMode="numeric"
              className={inputClass}
            />
          </Field>
          <Field label="Salgsform">
            <select value={saleType} onChange={(e) => setSaleType(e.target.value as SaleType)} className={inputClass}>
              {saleTypes.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Fraktpris (kr)"><input type="number" min="0" className={inputClass} value={shippingPrice} onChange={e=>setShippingPrice(e.target.value)} /></Field>
        <PriceCalculator payout={Number(price) || 0} artFeeApplies={artFeeApplies} onArtFeeChange={setArtFeeApplies} />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Kategori">
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Stil">
            <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputClass}>
              {styles.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Teknikk">
            <select value={technique} onChange={(e) => setTechnique(e.target.value)} className={inputClass}>
              {techniques.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Type">
            <select value={type} onChange={(e) => setType(e.target.value)} className={inputClass}>
              {artTypes.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tilstand">
            <select value={condition} onChange={(e) => setCondition(e.target.value)} className={inputClass}>
              {conditions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
          <Field label="Fylke">
            <select value={county} onChange={(e) => setCounty(e.target.value)} className={inputClass}>
              {counties.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Beskrivelse">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className={inputClass}
          />
        </Field>
      </section>
      <ListingDocumentation listingId={listing.id} ownerId={listing.sellerId} editable={listing.moderationStatus!=='pending'}/>
      <p className="mt-4 text-sm text-muted-foreground">{submissionDisclosure}</p>
      <Button variant="outline" className="mt-4" onClick={()=>setPreview(!preview)}>Forhåndsvisning</Button>
      {preview&&<div className="mt-4 space-y-3"><ArtworkPreview image={images[0]??listing.image} alt={title}/><h2 className="font-display text-xl">{title}</h2><p>{artistName}</p><p>{description}</p><p>{formatPrice(priceFromPayout(Number(price),artFeeApplies).total)}</p></div>}

      <div className="mt-4 flex gap-2">
        <Button disabled={saving||listing.moderationStatus==='pending'||listing.moderationStatus==='sold'}
          onClick={()=>void save()}
          className="flex-1 rounded-2xl bg-brandink px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          {saving?'Lagrer …':'Lagre endringer'}
        </Button>
        <Button disabled={saving||listing.moderationStatus==='pending'||listing.moderationStatus==='sold'} onClick={()=>void save(true)}>Send til godkjenning</Button>
        <Button variant="destructive"
          onClick={remove}
          disabled={saving}
        >
          Slett annonse
        </Button>
      </div>
      <Button variant="outline" className="mt-3" disabled={saving} onClick={()=>dialog({title:'Trekke annonsen fra salg?',description:'Annonsen blir skjult for kjøpere, men blir liggende under Mine annonser.',confirmLabel:'Trekk fra salg',success:'Annonsen er trukket fra salg',action:async()=>{await changeVisibility(listing.id,'withdrawn');await navigate({to:'/min-side',search:{tab:'Mine annonser'}});}})}>Trekk fra salg</Button>
    </main>
  );
}
