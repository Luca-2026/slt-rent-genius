// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { feedbackSubmission } from '../supabase/functions/notify-feedback/submission';
import { applicationSubmission, attachmentContent } from '../supabase/functions/send-application-email/submission';

const feedback = { location: 'bonn', order_ref: 'TEST', rented_items: 'Gerät', customer_email: 'test@example.com', ratings: { q1_buchung: 4 }, answers: {} };
function application() {
  const form = new FormData();
  Object.entries({ jobId: 'test', jobTitle: 'Test', firstName: 'Test', lastName: 'Applicant', email: 'test@example.com', phone: '123456', jobSpecificAnswers: '{}' }).forEach(([k, v]) => form.set(k, v));
  form.set('resume', new File(['%PDF-1.7\nTest'], 'resume.pdf', { type: 'application/pdf' }));
  return form;
}

async function loadHandler(path: string, client: unknown, extra: Record<string, unknown> = {}) {
  const source = readFileSync(path, 'utf8').replace(/^import .*;?\s*$/gm, '');
  let handler!: (req: Request) => Promise<Response>;
  const register = (fn: typeof handler) => { handler = fn; };
  const env = { SUPABASE_URL: 'https://example.invalid', SUPABASE_SERVICE_ROLE_KEY: 'test-only', RESEND_API_KEY: 'test-only' };
  const fetch = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));
  // Transpile entrypoints to execute the actual handlers with isolated, non-network services.
  const { transform } = await import('esbuild');
  const js = (await transform(source, { loader: 'ts', format: 'cjs' })).code;
  const values = { createClient: () => client, Deno: { serve: register, env: { get: (key: keyof typeof env) => env[key] } }, serve: register, fetch, ...(!source.includes('const corsHeaders') ? { corsHeaders: {} } : {}), ...extra };
  new Function(...Object.keys(values), js)(...Object.values(values));
  return { handler, fetch };
}

describe('selected security fixes', () => {
  it('feedback rejects identifiers targeting another submission', () => {
    expect(() => feedbackSubmission({ ...feedback, feedback_id: crypto.randomUUID() })).toThrow();
    expect(() => feedbackSubmission({ ...feedback, id: crypto.randomUUID() })).toThrow();
  });
  it('feedback validates ratings and derives its average', () => {
    expect(feedbackSubmission(feedback).avg_rating).toBe(4);
    expect(() => feedbackSubmission({ ...feedback, ratings: { q1_buchung: 6 } })).toThrow();
  });
  it('feedback notification rejects old row-targeting requests without database access', async () => {
    const from = vi.fn();
    const { handler, fetch } = await loadHandler('supabase/functions/notify-feedback/index.ts', { from }, { feedbackSubmission });
    const response = await handler(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ feedback_id: crypto.randomUUID() }) }));
    expect(response.status).toBe(400); expect(from).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it('feedback stores a fresh row before notifying and ignores caller-supplied notification state', async () => {
    let row: any;
    const from = vi.fn(() => ({
      insert: (value: any) => { row = value; return { select: () => ({ single: async () => ({ data: { ...row, created_at: new Date().toISOString() }, error: null }) }) }; },
      update: () => ({ eq: () => ({ is: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: row.id } }) }) }) }) }),
    }));
    const { handler, fetch } = await loadHandler('supabase/functions/notify-feedback/index.ts', { from }, { feedbackSubmission });
    const response = await handler(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ ...feedback, staff_notified_at: 'attacker' }) }));
    expect(response.status).toBe(200); expect(row.id).toMatch(/^[0-9a-f-]{36}$/); expect(row.staff_notified_at).toBeUndefined(); expect(fetch).toHaveBeenCalledTimes(1);
  });
  it('application accepts actual PDF bytes and rejects private file paths', async () => {
    const form = application();
    const data = await applicationSubmission(form);
    expect(atob(attachmentContent(data.resume.bytes))).toBe('%PDF-1.7\nTest');
    form.set('resumePath', 'another-applicant/resume.pdf');
    await expect(applicationSubmission(form)).rejects.toThrow();
  });
  it('application requires valid file content, not merely a PDF filename', async () => {
    const form = application(); form.set('resume', new File(['not a PDF'], 'resume.pdf'));
    await expect(applicationSubmission(form)).rejects.toThrow();
  });
  it('application rejects legacy JSON requests without private downloads or sends', async () => {
    const from = vi.fn();
    const { handler, fetch } = await loadHandler('supabase/functions/send-application-email/index.ts', { from }, { applicationSubmission, attachmentContent });
    const response = await handler(new Request('https://example.invalid', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ resumePath: 'victim.pdf' }) }));
    expect(response.status).toBe(400); expect(from).not.toHaveBeenCalled(); expect(fetch).not.toHaveBeenCalled();
  });
  it('application stores server-generated paths and attaches only the request bytes', async () => {
    const upload = vi.fn().mockResolvedValue({ error: null });
    const download = vi.fn(); const insert = vi.fn().mockResolvedValue({ error: null });
    const client = { storage: { from: () => ({ upload, download }) }, from: () => ({ insert }) };
    const { handler, fetch } = await loadHandler('supabase/functions/send-application-email/index.ts', client, { applicationSubmission, attachmentContent });
    const response = await handler(new Request('https://example.invalid', { method: 'POST', body: application() }));
    expect(response.status).toBe(200); expect(download).not.toHaveBeenCalled();
    expect(upload.mock.calls[0][0]).toMatch(/^[0-9a-f-]{36}\/resume-[0-9a-f-]{36}\.pdf$/);
    expect(insert.mock.calls[0][0].resume_url).toBe(upload.mock.calls[0][0]);
    const mail = JSON.parse(fetch.mock.calls[0][1].body);
    expect(atob(mail.attachments[0].content)).toBe('%PDF-1.7\nTest');
  });
  it('unsubscribe failure logs neither email nor database error details', async () => {
    const privateEmail = 'private@example.com';
    const record = { email: privateEmail, used_at: null };
    const chain: any = { select: () => chain, eq: () => chain, is: () => chain, update: () => chain, maybeSingle: async () => ({ data: record }) };
    const client = { from: (table: string) => table === 'suppressed_emails' ? { upsert: async () => ({ error: { message: privateEmail, details: privateEmail } }) } : chain };
    const log = vi.spyOn(console, 'error').mockImplementation(() => {});
    try {
      const { handler } = await loadHandler('supabase/functions/handle-email-unsubscribe/index.ts', client);
      const response = await handler(new Request('https://example.invalid', { method: 'POST', body: JSON.stringify({ token: 'test-only' }) }));
      expect(response.status).toBe(500); expect(log).toHaveBeenCalledWith('Failed to suppress email');
      expect(JSON.stringify(log.mock.calls)).not.toContain(privateEmail);
    } finally { log.mockRestore(); }
  });
});