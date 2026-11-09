import { z } from 'zod';

export const moderationLabels = {
  draft: 'Utkast', pending: 'Til godkjenning', changes_requested: 'Endringer kreves',
  published: 'Publisert', rejected: 'Avslått', withdrawn: 'Trukket', sold: 'Solgt',
} as const;
export type ModerationStatus = keyof typeof moderationLabels;
export const submissionConfirmation = 'Annonsen er sendt til gjennomgang. Du får beskjed når den er publisert, eller dersom vi trenger flere opplysninger.';
export const submissionDisclosure = 'Vi gjennomgår alle nye annonser før de publiseres, slik at opplysningene er tydelige og presentasjonen følger Diargios retningslinjer. Gjennomgangen innebærer ikke en verdivurdering eller bekreftelse av verkets ekthet. Som selger er du ansvarlig for at opplysningene er riktige, og at du har rett til å selge verket.';
export const listingContentSchema = z.object({
  id: z.string().min(1).max(200), slug: z.string().min(1).max(240),
  title: z.string().trim().min(1).max(200), image: z.string().min(1).max(3000000),
  images: z.array(z.string().min(1).max(3000000)).max(15).optional(),
  description: z.string().trim().min(1).max(20000), widthCm: z.number().positive(), heightCm: z.number().positive(),
  price: z.number().nonnegative().max(1000000000), shippingPrice: z.number().nonnegative().max(1000000000),
  sellerType: z.enum(['Kunstner', 'Privat', 'Galleri', 'Kunsthandler']), ownWork: z.boolean(),
  type: z.string().min(1), condition: z.string().min(1), delivery: z.enum(['Må hentes','Kan sendes','Begge deler']),
}).passthrough().superRefine((v,ctx)=>{if(v['saleType']!=='Pris på forespørsel'&&v.price<=0)ctx.addIssue({code:'custom',path:['price'],message:'Pris kreves.'});});
// Only commercial fields can bypass a new content review.
export const commercialKeys = ['price','sellerPayout','artFeeApplies','shippingPrice','delivery','saleType'] as const;
export function contentChanged(a: Record<string, unknown>, b: Record<string, unknown>) {
  const ignored = new Set<string>([...commercialKeys, 'moderationStatus','sellerMessage','revisionId','revisionVersion']);
  const clean = (v: Record<string, unknown>) => Object.fromEntries(Object.keys(v).filter(k => !ignored.has(k)).sort().map(k => [k,v[k]]));
  return JSON.stringify(clean(a)) !== JSON.stringify(clean(b));
}
export function canReview(status: string, versionStatus: string) {
  return !['sold','withdrawn'].includes(status) && versionStatus === 'pending';
}