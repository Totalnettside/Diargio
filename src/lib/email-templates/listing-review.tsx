import React from 'react';
import { Body, Container, Head, Heading, Html, Preview, Text, Link } from '@react-email/components';
import type { TemplateEntry } from './registry';

interface Props { title?: string; listingId?: string; seller?: string; price?: string; submittedAt?: string; decision?: string; reason?: string }
function Email({title,listingId,seller,price,submittedAt,decision,reason}: Props) {
  const submitted = decision === 'submitted';
  const heading = submitted ? 'En annonse venter på gjennomgang' : decision === 'published' ? 'Annonsen din er publisert' : decision === 'changes_requested' ? 'Annonsen trenger endringer' : 'Annonsen din er avslått';
  return <Html lang="nb"><Head/><Preview>{heading}</Preview><Body style={{backgroundColor:'#ffffff',fontFamily:'Georgia, serif'}}><Container style={{padding:'28px',maxWidth:'560px'}}><Heading>Diargio</Heading><Heading as="h2">{heading}</Heading><Text>«{title}» · Annonse-ID: {listingId}</Text>{submitted && <><Text>Selger: {seller}<br/>Pris: {price} kr<br/>Innsendt: {submittedAt}</Text><Text>En annonse venter på gjennomgang. Logg inn på Diargio og åpne Administrasjon → Annonser til godkjenning.</Text></>}{reason && <Text>Beskjed fra Diargio: {reason}</Text>}<Link href={submitted ? 'https://diargio.com/diargioadmin007' : 'https://diargio.com/min-side?tab=Mine%20annonser'}>Åpne Diargio</Link></Container></Body></Html>;
}
export const template = {
  component: Email,
  subject: (d: Record<string, unknown>) => d['decision'] === 'submitted' ? `Diargio – ny annonse til godkjenning: ${d['title']}` : `Diargio – ${d['decision'] === 'published' ? 'annonsen er publisert' : d['decision'] === 'changes_requested' ? 'endringer kreves' : 'annonsen er avslått'}: ${d['title']}`,
  displayName: 'Annonsegjennomgang',
} satisfies TemplateEntry;