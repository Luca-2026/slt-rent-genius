/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>Ihr Bestätigungscode – SLT Rental</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="180" height="auto" alt="SLT Rental" style={logo} />
        </Section>
        <Section style={divider} />
        <Heading style={h1}>Identität bestätigen</Heading>
        <Text style={text}>Verwenden Sie den folgenden Code, um Ihre Identität zu bestätigen:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          Dieser Code ist nur kurze Zeit gültig. Falls Sie diesen nicht angefordert haben, können Sie diese E-Mail ignorieren.
        </Text>
        <Section style={divider} />
        <Text style={footerBrand}>
          © {new Date().getFullYear()} SLT Rental · Alle Rechte vorbehalten
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = { margin: '0 auto' }
const divider = { borderTop: '2px solid hsl(201, 100%, 25%)', marginBottom: '28px', marginTop: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: 'hsl(218, 10%, 25%)', margin: '0 0 20px', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const text = { fontSize: '15px', color: 'hsl(0, 0%, 35%)', lineHeight: '1.6', margin: '0 0 20px', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const codeStyle = { fontFamily: "'Courier New', Courier, monospace", fontSize: '28px', fontWeight: '700' as const, color: 'hsl(201, 100%, 25%)', margin: '0 0 30px', textAlign: 'center' as const, letterSpacing: '4px' }
const footer = { fontSize: '13px', color: '#999999', margin: '24px 0 0', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const footerBrand = { fontSize: '12px', color: '#bbbbbb', textAlign: 'center' as const, margin: '0', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
