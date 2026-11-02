export const feedbackRatingKeys = [
  "q1_buchung", "q2_beratung", "q3_preis", "q4_abholung", "q5_zustand",
  "q6_einweisung", "q7_miete", "q8_support", "q9_ruecknahme", "q10_rechnung",
] as const;

export function hasCompleteFeedback(ratings: Record<string, unknown>): boolean {
  return feedbackRatingKeys.every(key => {
    const value = ratings[key];
    return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;
  });
}