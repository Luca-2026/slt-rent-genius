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
        <Img
          src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png"
          alt="SLT Rental"
          width="160"
          height="auto"
          style={logo}
        />
        <Heading style={h1}>Passwort zurücksetzen</Heading>
        <Text style={text}>
          Du hast eine Anfrage zum Zurücksetzen Deines Passworts bei SLT Rental
          gestellt. Klicke auf den folgenden Button, um ein neues Passwort zu
          vergeben.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Neues Passwort vergeben
        </Button>
        <Text style={footer}>
          Falls Du kein Passwort-Reset angefordert hast, kannst Du diese E-Mail
          ignorieren. Dein Passwort bleibt unverändert.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const button = {
  backgroundColor: '#00507d',
  color: '#ffffff',
  fontSize: '14px',
  borderRadius: '8px',
  padding: '12px 20px',
  textDecoration: 'none',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }
