import { z } from 'zod';

export const moderationLabels = {
  draft: 'Utkast', pending: 'Til godkjenning', changes_requested: 'Endringer kreves',
  published: 'Publisert', rejected: 'Avslått', withdrawn: 'Trukket', sold: 'Solgt',
} as const;
export type ModerationStatus = keyof typeof moderationLabels;
export const submissionConfirmation = 'Annonsen er sendt til gjennomgang. Du får beskjed når den er publisert, eller dersom vi trenger flere opplysninger.';
export const submissionDisclosure = 'Vi gjennomgår alle nye annonser før de publiseres, slik at opplysningene er tydelige og presentasjonen følger Diargios retningslinjer. Gjennomgangen innebærer ikke en verdivurdering eller bekreftelse av verkets ekthet. Som selger er du ansvarlig for at opplysningene er riktige, og at du har rett til å selge verket.';

const editableListingShape = {
  artistId: z.string().max(200).optional(), artistName: z.string().max(200).optional(),
  category: z.string().max(200).optional(), style: z.string().max(200).optional(), technique: z.string().max(200).optional(),
  year: z.number().int().nonnegative().max(3000).optional(), edition: z.string().max(200).optional(),
  signed: z.boolean().optional(), framed: z.boolean().optional(), coa: z.boolean().optional(),
  provenance: z.string().max(20000).optional(), location: z.string().max(200).optional(), county: z.string().max(200).optional(),
  saleType: z.enum(['Fastpris','Bud ønskes','Auksjon','Pris på forespørsel']).optional(),
  sellerPayout: z.number().nonnegative().max(1000000000).optional(), artFeeApplies: z.boolean().optional(),
  currentBid: z.number().nonnegative().max(1000000000).optional(), bidCount: z.number().int().nonnegative().optional(),
  auctionEndsInMin: z.number().nonnegative().optional(), minIncrement: z.number().nonnegative().max(1000000000).optional(),
  sellerType: z.enum(['Kunstner', 'Privat', 'Galleri', 'Kunsthandler']).optional(), ownWork: z.boolean().optional(),
  views: z.number().nonnegative().optional(), favorites: z.number().nonnegative().optional(), verified: z.boolean().optional(),
  createdDaysAgo: z.number().nonnegative().optional(), description: z.string().max(20000).optional(),
  widthCm: z.number().positive().optional(), heightCm: z.number().positive().optional(),
  type: z.string().min(1).max(200).optional(), condition: z.string().min(1).max(200).optional(),
  delivery: z.enum(['Må hentes','Kan sendes','Begge deler']).optional(),
};
const draftRequiredShape = {
  id: z.string().min(1).max(200), slug: z.string().min(1).max(240),
  title: z.string().trim().min(1).max(200), image: z.string().min(1).max(3000000),
  images: z.array(z.string().min(1).max(3000000)).max(15).optional(),
  price: z.number().nonnegative().max(1000000000), shippingPrice: z.number().nonnegative().max(1000000000),
};
const protectedListingShape = {
  sellerId: z.string().max(200).optional(), moderationStatus: z.string().max(100).optional(),
  sellerMessage: z.string().max(4000).nullable().optional(), revisionId: z.string().uuid().optional(),
  revisionVersion: z.number().int().positive().optional(),
};

export const listingDraftSchema = z.object({ ...draftRequiredShape, ...editableListingShape, ...protectedListingShape }).strict().transform((listing) => {
  const clean = { ...listing };
  delete clean.sellerId;
  delete clean.moderationStatus;
  delete clean.sellerMessage;
  delete clean.revisionId;
  delete clean.revisionVersion;
  return clean;
});
export const listingContentSchema = z.object({
  ...draftRequiredShape, ...editableListingShape,
  description: z.string().trim().min(1).max(20000), widthCm: z.number().positive(), heightCm: z.number().positive(),
  sellerType: z.enum(['Kunstner', 'Privat', 'Galleri', 'Kunsthandler']), ownWork: z.boolean(),
  type: z.string().min(1).max(200), condition: z.string().min(1).max(200), delivery: z.enum(['Må hentes','Kan sendes','Begge deler']),
}).strict().superRefine((v,ctx)=>{if(v.saleType!=='Pris på forespørsel'&&v.price<=0)ctx.addIssue({code:'custom',path:['price'],message:'Pris kreves.'});});

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
