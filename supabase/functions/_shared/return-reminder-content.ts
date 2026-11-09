import { byForm, salutationLine, type AddressForm } from './salutation.ts';

export function returnReminderContent(stage: number, name: string, form: AddressForm) {
  return {
    greeting: salutationLine({ name, address_form: form }),
    paragraphs: stage === 1 ? [
      byForm(form, 'Brauchst du deinen Mietgegenstand vielleicht doch länger als erwartet? Gib uns bitte kurz Bescheid. Dann passen wir gemeinsam deinen Mietzeitraum an und schicken dir eine neue Auftragsbestätigung.', 'Benötigen Sie Ihren Mietgegenstand länger als erwartet? Bitte geben Sie uns kurz Bescheid. Dann passen wir gemeinsam Ihren Mietzeitraum an und schicken Ihnen eine neue Auftragsbestätigung.'),
      byForm(form, 'Antworte dazu bitte einfach auf diese E-Mail.', 'Bitte antworten Sie dazu einfach auf diese E-Mail.'),
    ] : [
      byForm(form, 'Auf unsere freundliche Nachfrage haben wir bislang keine Antwort erhalten. Bitte bring den Mietgegenstand jetzt umgehend zurück oder setze dich unverzüglich mit uns in Verbindung.', 'Auf unsere freundliche Nachfrage haben wir bislang keine Antwort erhalten. Bitte bringen Sie den Mietgegenstand jetzt umgehend zurück oder setzen Sie sich unverzüglich mit uns in Verbindung.'),
      'Bleiben sowohl Rückgabe als auch Rückmeldung aus, müssen wir einen möglichen Verdacht auf Unterschlagung beziehungsweise Diebstahl prüfen und behalten uns rechtliche Schritte vor.',
      byForm(form, 'Falls du bereits geantwortet oder den Mietgegenstand zurückgebracht hast, antworte bitte kurz auf diese E-Mail, damit wir den Vorgang klären können.', 'Falls Sie bereits geantwortet oder den Mietgegenstand zurückgebracht haben, antworten Sie bitte kurz auf diese E-Mail, damit wir den Vorgang klären können.'),
    ],
  };
}