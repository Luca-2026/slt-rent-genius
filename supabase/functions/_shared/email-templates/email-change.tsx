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
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface EmailChangeEmailProps {
  siteName: string
  email: string
  newEmail: string
  confirmationUrl: string
}

const LOGO_URL = 'https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-logo.png'

export const EmailChangeEmail = ({
  siteName,
  email,
  newEmail,
  confirmationUrl,
}: EmailChangeEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head>
      <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap" rel="stylesheet" />
    </Head>
    <Preview>E-Mail-Adresse ändern – SLT Rental</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img src={LOGO_URL} width="180" height="auto" alt="SLT Rental" style={logo} />
        </Section>
        <Section style={divider} />
        <Heading style={h1}>E-Mail-Adresse ändern</Heading>
        <Text style={text}>
          Sie haben beantragt, Ihre E-Mail-Adresse bei SLT Rental von{' '}
          <Link href={`mailto:${email}`} style={link}>{email}</Link>{' '}
          auf{' '}
          <Link href={`mailto:${newEmail}`} style={link}>{newEmail}</Link>{' '}
          zu ändern.
        </Text>
        <Text style={text}>
          Klicken Sie auf den Button, um die Änderung zu bestätigen:
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Änderung bestätigen
          </Button>
        </Section>
        <Text style={footer}>
          Falls Sie diese Änderung nicht angefordert haben, sichern Sie bitte umgehend Ihr Konto.
        </Text>
        <Section style={divider} />
        <Text style={footerBrand}>
          © {new Date().getFullYear()} SLT Rental · Alle Rechte vorbehalten
        </Text>
      </Container>
    </Body>
  </Html>
)

export default EmailChangeEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '560px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '24px' }
const logo = { margin: '0 auto' }
const divider = { borderTop: '2px solid hsl(201, 100%, 25%)', marginBottom: '28px', marginTop: '0' }
const h1 = { fontSize: '24px', fontWeight: '700' as const, color: 'hsl(218, 10%, 25%)', margin: '0 0 20px', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const text = { fontSize: '15px', color: 'hsl(0, 0%, 35%)', lineHeight: '1.6', margin: '0 0 20px', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const link = { color: 'hsl(201, 100%, 25%)', textDecoration: 'underline' }
const buttonSection = { textAlign: 'center' as const, margin: '28px 0' }
const button = { backgroundColor: 'hsl(33, 100%, 50%)', color: '#ffffff', fontSize: '15px', fontWeight: '600' as const, borderRadius: '8px', padding: '14px 28px', textDecoration: 'none', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const footer = { fontSize: '13px', color: '#999999', margin: '24px 0 0', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
const footerBrand = { fontSize: '12px', color: '#bbbbbb', textAlign: 'center' as const, margin: '0', fontFamily: "'Montserrat', 'Helvetica Neue', Arial, sans-serif" }
