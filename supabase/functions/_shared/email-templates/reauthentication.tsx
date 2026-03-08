/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="de" dir="ltr">
    <Head />
    <Preview>Dein Bestätigungscode – SLT Rental</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img
            src="https://ccmxitxgyznethanixlg.supabase.co/storage/v1/object/public/brand-assets/slt-rental-logo.png"
            alt="SLT Rental"
            height="48"
            style={{ margin: '0 auto' }}
          />
        </Section>
        <Section style={content}>
          <Heading style={h1}>Bestätigungscode</Heading>
          <Text style={text}>Hallo,</Text>
          <Text style={text}>verwende den folgenden Code, um deine Identität zu bestätigen:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Hr style={divider} />
          <Text style={smallText}>
            Dieser Code ist nur kurze Zeit gültig. Falls du ihn nicht angefordert hast, kannst du diese E-Mail ignorieren.
          </Text>
        </Section>
        <Section style={footerSection}>
          <Text style={footerCompany}>SLT Technology Group GmbH & Co. KG</Text>
          <Text style={footerTextStyle}>Geschäftsführer: Benedikt Nöchel</Text>
          <Hr style={footerDivider} />
          <Text style={footerLocations}>
            <strong>Krefeld</strong> · Anrather Straße 291, 47807 Krefeld · Tel: 02151 417 99 04 · krefeld@slt-rental.de
          </Text>
          <Text style={footerLocations}>
            <strong>Bonn</strong> · Drachenburgstraße 8, 53179 Bonn · Tel: 0228 504 660 61 · bonn@slt-rental.de
          </Text>
          <Text style={footerLocations}>
            <strong>Mülheim</strong> · Ruhrorter Str. 122, 45478 Mülheim an der Ruhr · Tel: 02151 417 99 04
          </Text>
          <Hr style={footerDivider} />
          <Text style={footerLinksStyle}>
            <Link href="https://www.slt-rental.de" style={footerLink}>www.slt-rental.de</Link>
            {' · '}
            <Link href="https://www.slt-rental.de/impressum" style={footerLink}>Impressum</Link>
            {' · '}
            <Link href="https://www.slt-rental.de/datenschutz" style={footerLink}>Datenschutz</Link>
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#f5f5f5', fontFamily: "'Montserrat', Arial, Helvetica, sans-serif", padding: '20px 0' }
const container = { maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff', borderRadius: '4px', overflow: 'hidden' as const }
const header = { backgroundColor: '#ffffff', padding: '28px 32px', textAlign: 'center' as const, borderBottom: '3px solid #ff8e02' }
const content = { padding: '32px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#393d46', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#595959', lineHeight: '1.7', margin: '0 0 16px' }
const codeStyle = {
  fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const,
  color: '#00507d', margin: '0 0 30px', letterSpacing: '4px', textAlign: 'center' as const,
}
const divider = { borderColor: '#e5e7eb', margin: '24px 0' }
const smallText = { fontSize: '12px', color: '#999999', lineHeight: '1.5', margin: '0' }
const footerSection = { backgroundColor: '#393d46', padding: '24px 32px' }
const footerCompany = { fontSize: '13px', fontWeight: 'bold' as const, color: '#ffffff', margin: '0 0 4px', textAlign: 'center' as const }
const footerTextStyle = { fontSize: '11px', color: '#cccccc', margin: '0 0 12px', textAlign: 'center' as const }
const footerDivider = { borderColor: '#555555', margin: '12px 0' }
const footerLocations = { fontSize: '11px', color: '#cccccc', lineHeight: '1.5', margin: '0 0 6px', textAlign: 'center' as const }
const footerLinksStyle = { fontSize: '11px', color: '#cccccc', margin: '0', textAlign: 'center' as const }
const footerLink = { color: '#ff8e02', textDecoration: 'none' }
