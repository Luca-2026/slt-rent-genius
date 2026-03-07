/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

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
} from 'npm:@react-email/components@0.0.22'

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
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Bestätige Deine E-Mail-Adresse für SLT Rental</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png"
          alt="SLT Rental"
          width="160"
          height="auto"
          style={logo}
        />
        <Heading style={h1}>E-Mail-Adresse bestätigen</Heading>
        <Text style={text}>
          Willkommen bei{' '}
          <Link href={siteUrl} style={link}>
            <strong>SLT Rental</strong>
          </Link>
          !
        </Text>
        <Text style={text}>
          Bitte bestätige Deine E-Mail-Adresse (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ), indem Du auf den folgenden Button klickst:
        </Text>
        <Button style={button} href={confirmationUrl}>
          E-Mail bestätigen
        </Button>
        <Text style={footer}>
          Falls Du kein Konto erstellt hast, kannst Du diese E-Mail ignorieren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Montserrat, Arial, sans-serif' }
const container = { padding: '20px 25px' }
const logo = { marginBottom: '24px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#393d46',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#595959',
  lineHeight: '1.5',
  margin: '0 0 25px',
}
const link = { color: '#00507d', textDecoration: 'underline' }
const button = {
  backgroundColor: '#00507d',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
