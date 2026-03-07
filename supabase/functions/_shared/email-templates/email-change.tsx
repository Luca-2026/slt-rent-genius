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

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>E-Mail-Änderung bestätigen – SLT Rental</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png"
          alt="SLT Rental"
          width="160"
          height="auto"
          style={logo}
        />
        <Heading style={h1}>E-Mail-Änderung bestätigen</Heading>
        <Text style={text}>
          Du hast eine Änderung Deiner E-Mail-Adresse bei SLT Rental von{' '}
          <Link href={`mailto:${email}`} style={link}>
            {email}
          </Link>{' '}
          zu{' '}
          <Link href={`mailto:${newEmail}`} style={link}>
            {newEmail}
          </Link>{' '}
          angefordert.
        </Text>
        <Text style={text}>
          Klicke auf den folgenden Button, um die Änderung zu bestätigen:
        </Text>
        <Button style={button} href={confirmationUrl}>
          E-Mail-Änderung bestätigen
        </Button>
        <Text style={footer}>
          Falls Du diese Änderung nicht angefordert hast, sichere bitte
          umgehend Dein Konto.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

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
