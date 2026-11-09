import { describe, expect, it, vi } from 'vitest';
import { sendReturnReminder, ReminderSendError } from '../../supabase/functions/_shared/return-reminder-resend';

const email = { deliveryId: 'stage-1', from: 'SLT Rental <noreply@slt-rental.de>', recipient: 'luca@sandhoff.org', replyTo: 'bonn@slt-rental.de', subject: 'Rückgabe', html: '<p>Rückgabe</p>', text: 'Rückgabe' };
describe('return reminder Resend delivery', () => {
  it('sends only to the stored customer with the branch reply address', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ id: 'receipt-1' })));
    expect(await sendReturnReminder('test-key', email, request)).toBe('receipt-1');
    const [url, options] = request.mock.calls[0];
    expect(url).toBe('https://api.resend.com/emails');
    expect(JSON.parse(String(options?.body))).toEqual({ from: email.from, to: ['luca@sandhoff.org'], reply_to: 'bonn@slt-rental.de', subject: email.subject, html: email.html, text: email.text });
  });
  it('reuses the same stage idempotency key across retries', async () => {
    const request = vi.fn<typeof fetch>().mockImplementation(async () => new Response('{"id":"receipt-1"}'));
    await sendReturnReminder('test-key', email, request); await sendReturnReminder('test-key', email, request);
    expect(request.mock.calls.map(([, options]) => (options?.headers as Record<string, string>)['Idempotency-Key'])).toEqual(['rental-return-stage-1', 'rental-return-stage-1']);
  });
  it('keeps provider refusal status and details without claiming success', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('{"message":"forbidden"}', { status: 403 }));
    await expect(sendReturnReminder('test-key', email, request)).rejects.toMatchObject({ status: 403, uncertain: false, message: 'Resend [403]: {"message":"forbidden"}' });
  });
  it('blocks blind retry after a transport failure', async () => {
    const request = vi.fn<typeof fetch>().mockRejectedValue(new Error('timeout'));
    await expect(sendReturnReminder('test-key', email, request)).rejects.toMatchObject({ status: 502, uncertain: true });
    expect(request).toHaveBeenCalledTimes(1);
  });
  it('requires a provider receipt even on HTTP success', async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response('{}'));
    await expect(sendReturnReminder('test-key', email, request)).rejects.toBeInstanceOf(ReminderSendError);
  });
});