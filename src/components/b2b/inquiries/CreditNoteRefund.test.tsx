import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
const { invoke } = vi.hoisted(() => ({ invoke: vi.fn() }));
vi.mock('@/lib/invokeWithAuth', () => ({ invokeWithAuth: invoke }));
vi.mock('@/hooks/use-toast', () => ({ useToast: () => ({ toast: vi.fn() }) }));
vi.mock('@/integrations/supabase/client', () => ({ supabase: { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }) }) }) } }));
import { CreditNoteRefund } from './CreditNoteRefund';
beforeEach(() => invoke.mockReset());
describe('Credit refund confirmation (mock only)', () => {
 it('checks eligibility before opening and never refunds on cancel', async () => {
  invoke.mockResolvedValue({ data: { success: true, status: 'available', amount_cents: 4000 }, error: null });
  render(<CreditNoteRefund creditId="test" onChanged={vi.fn()} />);
  fireEvent.click(screen.getByRole('button', { name: 'Über Stripe erstatten' }));
  await screen.findByRole('button', { name: 'Erstattung verbindlich auslösen' });
  expect(invoke).toHaveBeenCalledWith('offer-payment-admin', { action: 'credit_refund_info', credit_note_id: 'test' });
  fireEvent.click(screen.getByRole('button', { name: 'Abbrechen' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(invoke).toHaveBeenCalledTimes(1);
 });
});
