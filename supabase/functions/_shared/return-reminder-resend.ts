export interface ReminderEmail {
  deliveryId: string;
  from: string;
  recipient: string;
  replyTo: string;
  subject: string;
  html: string;
  text: string;
}

export class ReminderSendError extends Error {
  constructor(message: string, public status: number, public uncertain = false) { super(message); }
}

/** Uses the same direct Resend credentials as existing document senders. */
export async function sendReturnReminder(key: string, email: ReminderEmail, request: typeof fetch = fetch): Promise<string> {
  let response: Response;
  try {
    response = await request('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', 'Idempotency-Key': `rental-return-${email.deliveryId}` },
      body: JSON.stringify({ from: email.from, to: [email.recipient], reply_to: email.replyTo, subject: email.subject, html: email.html, text: email.text }),
    });
  } catch {
    throw new ReminderSendError('Versandantwort nicht erhalten. Nicht erneut senden; Versandstatus muss geprüft werden.', 502, true);
  }
  const body = await response.text();
  if (!response.ok) throw new ReminderSendError(`Resend [${response.status}]: ${body}`, response.status, response.status >= 500);
  let result: { id?: string };
  try { result = JSON.parse(body); } catch { throw new ReminderSendError('Ungültige Versandantwort. Versandstatus muss geprüft werden.', 502, true); }
  if (!result.id || typeof result.id !== 'string') throw new ReminderSendError('Versandbeleg fehlt. Versandstatus muss geprüft werden.', 502, true);
  return result.id;
}