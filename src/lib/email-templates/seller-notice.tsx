import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Img } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { kind?: 'bid' | 'sale'; title?: string; amount?: string }

const LOGO_URL = 'https://diargio.com/diargio-logo.png'

const Email = ({ kind = 'bid', title = 'verket ditt', amount }: Props) => {
  const sale = kind === 'sale'
  const head = sale ? 'Gratulerer, verket ditt er solgt!' : 'Du har fått et nytt bud'
  return (
    <Html lang="nb" dir="ltr">
      <Head />
      <Preview>{head}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Img src={LOGO_URL} alt="Diargio" width="160" style={logo} />
          <Heading style={h1}>{head}</Heading>
          <Text style={text}>
            {sale
              ? `«${title}» er kjøpt${amount ? ` for ${amount} kr` : ''}. Logg inn for å avtale levering med kjøperen.`
              : `Noen har gitt bud${amount ? ` på ${amount} kr` : ''} på «${title}». Logg inn for å godkjenne eller avslå budet.`}
          </Text>
          <Button style={button} href={sale ? 'https://diargio.com/meldinger' : 'https://diargio.com/min-side?tab=Bud'}>
            {sale ? 'Se meldinger' : 'Se budet'}
          </Button>
          <Hr style={hr} />
          <Text style={small}>Spørsmål? Skriv til post@diargio.com.</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: Email,
  subject: (d: Record<string, any>) => (d.kind === 'sale' ? 'Verket ditt er solgt' : 'Nytt bud på verket ditt'),
  displayName: 'Bud / salg til selger',
  previewData: { kind: 'bid', title: 'Sommerkveld', amount: '4 500' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', color: '#111111', fontWeight: 'normal' as const }
const logo = { display: 'block', margin: '0 auto 18px' as const }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6' }
const button = { backgroundColor: '#111111', color: '#ffffff', padding: '12px 22px', borderRadius: '6px', fontSize: '14px', textDecoration: 'none' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 16px' }
const small = { fontSize: '12px', color: '#777777' }
