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

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({
  siteName,
  confirmationUrl,
}: MagicLinkEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Login-Link für SLT Rental</Preview>
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
          <Heading style={h1}>Dein Login-Link</Heading>
          <Text style={text}>
            Klicke auf den folgenden Button, um dich im SLT Rental B2B-Portal anzumelden. Der Link ist nur kurze Zeit gültig.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Jetzt anmelden
          </Button>
          <Text style={footer}>
            Falls du diesen Link nicht angefordert hast, kannst du diese E-Mail ignorieren.
          </Text>
        </div>
        <div style={footerBar}>
          SLT Technology Group GmbH & Co. KG · Anrather Straße 291 · 47807 Krefeld
        </div>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

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
