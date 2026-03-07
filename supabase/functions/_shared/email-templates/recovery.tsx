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
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Passwort zurücksetzen – SLT Rental</Preview>
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
          <Heading style={h1}>Passwort zurücksetzen</Heading>
          <Text style={text}>
            Du hast angefordert, dein Passwort für das SLT Rental B2B-Portal zurückzusetzen. Klicke auf den folgenden Button, um ein neues Passwort zu wählen.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Neues Passwort wählen
          </Button>
          <Text style={footer}>
            Falls du kein neues Passwort angefordert hast, kannst du diese E-Mail ignorieren. Dein Passwort bleibt unverändert.
          </Text>
        </div>
        <div style={footerBar}>
          SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
        </div>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
