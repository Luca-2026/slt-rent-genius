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

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Du wurdest zu SLT Rental eingeladen</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png"
          alt="SLT Rental"
          width="160"
          height="auto"
          style={logo}
        />
        <Heading style={h1}>Du wurdest eingeladen</Heading>
        <Text style={text}>
          Du wurdest eingeladen,{' '}
          <Link href={siteUrl} style={link}>
            <strong>SLT Rental</strong>
          </Link>{' '}
          beizutreten. Klicke auf den folgenden Button, um die Einladung
          anzunehmen und Dein Konto zu erstellen.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Einladung annehmen
        </Button>
        <Text style={footer}>
          Falls Du diese Einladung nicht erwartet hast, kannst Du diese E-Mail
          ignorieren.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

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
