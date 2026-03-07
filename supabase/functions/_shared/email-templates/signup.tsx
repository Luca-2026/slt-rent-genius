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
    <Preview>Bestätige deine E-Mail-Adresse für SLT Rental</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={header}>
          <Img
            src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png"
            alt="SLT Rental"
            height="48"
            style={{ margin: '0 auto' }}
          />
        </div>
        <div style={content}>
          <Heading style={h1}>E-Mail-Adresse bestätigen</Heading>
          <Text style={text}>
            vielen Dank für deine Registrierung im{' '}
            <Link href={siteUrl} style={link}>
              <strong>SLT Rental B2B-Portal</strong>
            </Link>
            !
          </Text>
          <Text style={text}>
            Bitte bestätige deine E-Mail-Adresse (
            <Link href={`mailto:${recipient}`} style={link}>
              {recipient}
            </Link>
            ), indem du auf den folgenden Button klickst:
          </Text>
          <Button style={button} href={confirmationUrl}>
            E-Mail bestätigen
          </Button>
          <Text style={text}>
            Nach der Bestätigung wird dein Konto geprüft und du erhältst eine weitere E-Mail, sobald es freigeschaltet wurde.
          </Text>
          <Text style={footer}>
            Falls du kein Konto erstellt hast, kannst du diese E-Mail ignorieren.
          </Text>
        </div>
        <div style={footerBar}>
          SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
        </div>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', Arial, sans-serif" }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }
const header = {
  backgroundColor: '#ffffff',
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderBottom: '3px solid #ff8e02',
}
const content = { padding: '32px' }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: '#393d46',
  margin: '0 0 20px',
}
const text = {
  fontSize: '14px',
  color: '#595959',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const link = { color: '#00507d', textDecoration: 'underline' }
const button = {
  backgroundColor: '#00507d',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '6px',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
  margin: '0 0 24px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '20px 0 0' }
const footerBar = {
  backgroundColor: '#f9f9f9',
  padding: '16px 32px',
  textAlign: 'center' as const,
  fontSize: '12px',
  color: '#999999',
}
