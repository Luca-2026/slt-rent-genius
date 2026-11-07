/** Provider facts are retained even when an external refund conflicts with a local claim. */
export async function reconcileStripeRefund(service: any, refund: any, live: boolean) {
  const intent = typeof refund.payment_intent === 'string' ? refund.payment_intent : refund.payment_intent?.id;
  // Stripe Refund objects omit livemode. The caller supplies the mode from the
  // verified webhook event or the authenticated Stripe client, not refund input.
  if (!intent || (refund.livemode !== undefined && refund.livemode !== live) || refund.currency !== 'eur' || !Number.isInteger(refund.amount) || refund.amount <= 0) throw new Error('Ungültiger Stripe-Erstattungsbeleg');
  const { error } = await service.rpc('record_stripe_refund_receipt', { _id: refund.id, _intent: intent, _amount: refund.amount, _currency: refund.currency, _live: live, _status: refund.status ?? 'pending' });
  if (error) throw new Error('Erstattungsbeleg konnte nicht gespeichert werden');
  const { data: deposits, error: readError } = await service.from('deposit_refunds').select('id,amount_cents').eq('stripe_refund_id', refund.id);
  if (readError) throw new Error('Erstattungszuordnung konnte nicht gelesen werden');
  const depositId = deposits?.find((d: any) => d.amount_cents === refund.amount)?.id ?? refund.metadata?.deposit_refund_id;
  if (depositId) {
    const { error: syncError } = await service.rpc('sync_deposit_refund', { _id: depositId, _intent: intent, _refund_id: refund.id, _status: refund.status ?? 'pending', _amount: refund.amount });
    if (syncError) throw new Error('Kautionserstattungsstatus konnte nicht gespeichert werden');
    if (refund.status === 'succeeded') {
      const { data: link, error: linkError } = await service.from('offer_payment_links').select('inquiry_id,inquiry_table').eq('payment_intent_id', intent).eq('status', 'paid').limit(1).maybeSingle();
      if (linkError) throw new Error('Kautionsabrechnung konnte nicht zugeordnet werden');
      if (link?.inquiry_table === 'rental_inquiries') {
        const { data: settlements, error: settlementError } = await service.from('deposit_settlements').select('id,balance').eq('rental_inquiry_id', link.inquiry_id).eq('payout_method', 'stripe').eq('payout_status', 'pending');
        if (settlementError) throw new Error('Kautionsabrechnung konnte nicht gelesen werden');
        for (const s of settlements ?? []) {
          const { data: verified, error: verifyError } = await service.rpc('deposit_payout_verified', { _inquiry: link.inquiry_id, _cents: Math.round(Number(s.balance) * 100) });
          if (verifyError) throw new Error('Kautionsauszahlung konnte nicht bestätigt werden');
          if (verified) {
            const { error: payoutError } = await service.from('deposit_settlements').update({ payout_status: 'paid', payout_date: new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()) }).eq('id', s.id).eq('payout_status', 'pending');
            if (payoutError) throw new Error('Kautionsauszahlungsstatus konnte nicht gespeichert werden');
          }
        }
      }
    }
  }
  if (refund.metadata?.credit_note_id) {
    const { error: syncError } = await service.rpc('sync_credit_note_refund_v2', { _credit_id: refund.metadata.credit_note_id, _intent: intent, _refund_id: refund.id, _status: refund.status ?? 'pending', _amount: refund.amount });
    if (syncError) throw new Error('Mieterstattungsstatus konnte nicht gespeichert werden');
  }
}

export async function reconcileRefundsBeforeExecution(service: any, stripe: any, intent: string, live: boolean) {
  for await (const refund of stripe.refunds.list({ payment_intent: intent, limit: 100 })) await reconcileStripeRefund(service, refund, live);
  const { error } = await service.rpc('assert_stripe_refund_execution_capacity', { _intent: intent });
  if (error) throw new Error(error.message || 'Erstattungskapazität konnte nicht bestätigt werden');
}