import * as React from 'react'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
} from '@react-email/components'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="nb" dir="ltr">
    <Head>
      <style>{darkModeCss}</style>
    </Head>
    <Preview>Aktiver kontoen din hos {siteName} ved å bekrefte e-postadressen din.</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img src={`${siteUrl}/diargio-logo.png`} alt={siteName} width="160" style={{ margin: '0 auto 28px' }} />
        <Heading style={h1}>Bekreft e-postadressen din</Heading>
        <Text style={text}>
          Velkommen til{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Bekreft at du eier e-postadressen (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) ved å klikke på knappen nedenfor. Kontoen din aktiveres først når du har bekreftet e-postadressen.
        </Text>
        <Button className="dm-btn" style={button} href={confirmationUrl}>
          Aktiver kontoen min
        </Button>
        <Text style={footer}>
          Hvis du ikke har opprettet en konto hos {siteName}, kan du trygt se bort fra denne e-posten. Ingen kan aktivere kontoen uten bekreftelsen din.
        </Text>
        <Text style={footer}>Virker ikke knappen? <Link href={confirmationUrl} style={link}>Bekreft e-postadressen her</Link>.</Text>
        <Text style={footer}>Spørsmål? Kontakt <Link href="mailto:post@diargio.com" style={link}>post@diargio.com</Link>.</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '560px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#002825',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#55575d',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: 'inherit', textDecoration: 'underline' }
const button = {
  backgroundColor: '#002825',
  color: '#ffffff',
  fontSize: '14px',
  border: '1px solid #002825',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
// Rendered as a text child, which React may HTML-escape: keep this CSS free of >, &, and quotes.
const darkModeCss = `
  @media (prefers-color-scheme: dark) {
    .dm-btn { background-color: #002825 !important; color: #ffffff !important; }
  }
  [data-ogsc] .dm-btn { background-color: #002825 !important; color: #ffffff !important; }
  [data-ogsb] .dm-btn { background-color: #002825 !important; color: #ffffff !important; }
`
