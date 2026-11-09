import * as React from 'npm:react@18.3.1';
import { Body, Container, Head, Heading, Html, Preview, Text, Img } from 'npm:@react-email/components@0.0.22';
import type { TemplateEntry } from './registry.ts';
interface Props { stage?: number; greeting?: string; paragraphs?: string[]; orderCode?: string; productName?: string; endDate?: string; replyTo?: string }
const Email = ({ stage = 1, greeting = 'Hallo,', paragraphs = [], orderCode = '', productName = '', endDate = '', replyTo = '' }: Props) => (
  <Html lang="de"><Head /><Preview>{stage === 1 ? 'Benötigst du deinen Mietgegenstand länger?' : 'Bitte um umgehende Rückgabe'} · Auftrag {orderCode}</Preview>
    <Body style={{ backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', color: '#393d46' }}><Container style={{ maxWidth: '600px', padding: '28px 24px' }}>
      <Img src="https://www.slt-rental.de/favicon.png" alt="SLT Rental" width="64" height="64" />
      <Heading style={{ color: '#00507d', fontSize: '22px' }}>{stage === 1 ? 'Freundliche Rückgabeerinnerung' : 'Aufforderung zur Rückgabe'}</Heading>
      <Text>{greeting}</Text>{paragraphs.map((p, i) => <Text key={i} style={{ lineHeight: '1.6' }}>{p}</Text>)}
      <Text><strong>Auftrag #{orderCode}</strong><br />{productName}<br />Vereinbartes Mietende: {endDate}</Text>
      <Text>Viele Grüße<br />Dein SLT Rental Team<br />{replyTo}</Text>
    </Container></Body>
  </Html>
);
export const template = { component: Email, subject: (data: Record<string, unknown>) => `${data.stage === 2 ? 'Aufforderung zur Rückgabe' : 'Freundliche Rückgabeerinnerung'} · Auftrag #${data.orderCode ?? ''}`, displayName: 'Rückgabeerinnerung', previewData: { stage: 1, greeting: 'Hallo Luca,', orderCode: 'TEST', productName: 'Test-Mietgegenstand', endDate: '08.11.2026', paragraphs: ['Benötigst du deinen Mietgegenstand länger? Antworte bitte auf diese E-Mail.'] } } satisfies TemplateEntry;