import React from 'react'
import { Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Img } from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props { name?: string }

const LOGO_URL = 'https://diargio.com/diargio-logo.png'

const Email = ({ name }: Props) => (
  <Html lang="nb" dir="ltr">
    <Head />
    <Preview>Velkommen til Diargio</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={LOGO_URL} alt="Diargio" width="160" style={logo} />
        <Heading style={h1}>Velkommen til Diargio{name ? `, ${name}` : ''}!</Heading>
        <Text style={text}>Så fint at du har laget bruker hos oss. Diargio er en norsk markedsplass for kjøp og salg av kunst.</Text>
        <Text style={text}>Utforsk kunst fra kunstnere over hele Norge, gi bud på verk du liker, eller legg ut din egen kunst.</Text>
        <Button style={button} href="https://diargio.com/kunst">Utforsk kunst</Button>
        <Hr style={hr} />
        <Text style={small}>Spørsmål? Svar på denne e-posten eller skriv til post@diargio.com.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: 'Velkommen til Diargio',
  displayName: 'Velkomst',
  previewData: { name: 'Kari' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Georgia, serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const h1 = { fontSize: '24px', color: '#111111', fontWeight: 'normal' as const }
const logo = { display: 'block', margin: '0 auto 18px' as const }
const text = { fontSize: '15px', color: '#333333', lineHeight: '1.6' }
const button = { backgroundColor: '#111111', color: '#ffffff', padding: '12px 22px', borderRadius: '6px', fontSize: '14px', textDecoration: 'none' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0 16px' }
const small = { fontSize: '12px', color: '#777777' }
