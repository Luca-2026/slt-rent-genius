UPDATE public.staff_timesheets
SET status = 'approved',
    approved_at = COALESCE(approved_at, submitted_at),
    approved_by_name = COALESCE(approved_by_name, 'Altbestand (vor Einführung der Freigabe)'),
    payroll_sent_at = COALESCE(payroll_sent_at, submitted_at),
    payroll_sent_to = COALESCE(payroll_sent_to, 'y.luetke-wiesmann@altmann-steuerberater.de')
WHERE status = 'submitted';