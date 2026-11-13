const MAX_FILE_BYTES = 10 * 1024 * 1024;
const MIME_TYPES: Record<string, string> = {
  pdf: 'application/pdf', doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

export async function applicationSubmission(form: FormData) {
  if (form.has('resumePath') || form.has('coverLetterPath') || form.has('application_id')) throw new Error('Invalid application');
  const text = (key: string, max: number, required = false) => {
    const value = form.get(key);
    if (value === null && !required) return null;
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('Invalid application');
    return value.trim() || null;
  };
  const email = text('email', 255, true);
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('Invalid application');
  const earliestStartDate = text('earliestStartDate', 100);
  if (earliestStartDate) {
    const parsed = new Date(`${earliestStartDate}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(earliestStartDate) || !Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== earliestStartDate) throw new Error('Invalid application');
  }
  const rawAnswers = text('jobSpecificAnswers', 10000) || '{}';
  const answers = JSON.parse(rawAnswers);
  if (!answers || typeof answers !== 'object' || Array.isArray(answers) || Object.entries(answers).some(([key, value]) => key.length > 100 || typeof value !== 'string' || value.length > 2000)) throw new Error('Invalid application');
  const document = async (key: string, required: boolean) => {
    const file = form.get(key);
    if (file === null && !required) return null;
    if (!(file instanceof File) || file.size === 0 || file.size > MAX_FILE_BYTES) throw new Error('Invalid document');
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (!MIME_TYPES[ext]) throw new Error('Invalid document');
    const bytes = new Uint8Array(await file.arrayBuffer());
    // Only bytes from this request are stored/attached, never a private object chosen by its path.
    const pdf = ext === 'pdf' && new TextDecoder().decode(bytes.slice(0, 5)) === '%PDF-';
    const doc = ext === 'doc' && [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1].every((v, i) => bytes[i] === v);
    const docx = ext === 'docx' && bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
    if (!pdf && !doc && !docx) throw new Error('Invalid document');
    return { bytes, ext, contentType: MIME_TYPES[ext], filename: file.name.replace(/[^\p{L}\p{N} ._()-]/gu, '_').slice(0, 160) };
  };
  const fields = {
    jobId: text('jobId', 120, true), jobTitle: text('jobTitle', 200, true),
    firstName: text('firstName', 50, true), lastName: text('lastName', 50, true),
    email, phone: text('phone', 30, true), street: text('street', 200),
    postalCode: text('postalCode', 10), city: text('city', 100),
    earliestStartDate, salaryExpectation: text('salaryExpectation', 200),
    motivation: text('motivation', 3000), preferredLocation: text('preferredLocation', 100),
  };
  const resume = await document('resume', true);
  const coverLetter = await document('coverLetter', false);
  if (!resume) throw new Error('Invalid document');
  if (resume.bytes.byteLength + (coverLetter?.bytes.byteLength || 0) > 18 * 1024 * 1024) throw new Error('Documents too large');
  return { fields, answers, resume, coverLetter };
}

export function attachmentContent(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}