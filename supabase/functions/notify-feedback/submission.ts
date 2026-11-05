const ratingKeys = new Set([
  'q1_buchung', 'q2_beratung', 'q3_preis', 'q4_abholung', 'q5_zustand',
  'q6_einweisung', 'q7_miete', 'q8_support', 'q9_ruecknahme', 'q10_rechnung',
]);

export function feedbackSubmission(raw: unknown) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw new Error('Invalid feedback');
  const b = raw as Record<string, unknown>;
  // This endpoint only creates a new submission; it never acts on a caller-chosen row.
  if ('feedback_id' in b || 'id' in b) throw new Error('Invalid feedback');
  const text = (key: string, max: number, required = false) => {
    const value = b[key];
    if (value == null && !required) return null;
    if (typeof value !== 'string' || value.length > max || (required && !value.trim())) throw new Error('Invalid feedback');
    return value.trim();
  };
  const email = text('customer_email', 180, true)!;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) throw new Error('Invalid feedback');
  const location = text('location', 60, true)!;
  if (!['krefeld', 'bonn', 'muelheim'].includes(location)) throw new Error('Invalid feedback');
  const ratings = b.ratings;
  const answers = b.answers;
  if (!ratings || typeof ratings !== 'object' || Array.isArray(ratings) || !answers || typeof answers !== 'object' || Array.isArray(answers)) throw new Error('Invalid feedback');
  const rs = ratings as Record<string, number>;
  const as = answers as Record<string, string>;
  if (Object.entries(rs).some(([k, v]) => !ratingKeys.has(k) || !Number.isInteger(v) || v < 1 || v > 5)) throw new Error('Invalid feedback');
  if (Object.entries(as).some(([k, v]) => (!ratingKeys.has(k) && k !== 'gesamt_kommentar') || typeof v !== 'string' || v.length > 3000)) throw new Error('Invalid feedback');
  const values = Object.values(rs);
  if (!values.length && !as.gesamt_kommentar?.trim()) throw new Error('Invalid feedback');
  const recommend = b.recommend_score ?? null;
  if (recommend !== null && (typeof recommend !== 'number' || !Number.isInteger(recommend) || recommend < 0 || recommend > 10)) throw new Error('Invalid feedback');
  return {
    source: text('source', 60) || 'link', location,
    order_ref: text('order_ref', 80, true), rented_items: text('rented_items', 500, true),
    customer_name: text('customer_name', 120), customer_email: email,
    customer_type: text('customer_type', 60), ratings: rs, answers: as,
    recommend_score: recommend,
    avg_rating: values.length ? Number((values.reduce((a, v) => a + v, 0) / values.length).toFixed(2)) : null,
    google_review_confirmed: false, status: 'new',
  };
}