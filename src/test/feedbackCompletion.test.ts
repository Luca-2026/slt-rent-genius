import { describe, expect, it } from "vitest";
import { feedbackRatingKeys, hasCompleteFeedback } from "../../supabase/functions/_shared/feedback-completion";
import { FEEDBACK_QUESTIONS } from "@/data/feedbackQuestions";
import { requestedCoupon } from "@/lib/requestedCoupon";

describe("Complete internal feedback", () => {
  it("requires all ten answers including one-star ratings", () => {
    const ratings = Object.fromEntries(FEEDBACK_QUESTIONS.map(q => [q.key, 1]));
    expect(feedbackRatingKeys).toHaveLength(10);
    expect(hasCompleteFeedback(ratings)).toBe(true);
    for (const key of feedbackRatingKeys) {
      const partial = { ...ratings };
      delete partial[key];
      expect(hasCompleteFeedback(partial)).toBe(false);
    }
  });
  it("rejects invalid stars, not low ratings", () => {
    const ratings = Object.fromEntries(feedbackRatingKeys.map(key => [key, 5]));
    for (const value of [0, 6, 1.5, "5", null]) expect(hasCompleteFeedback({ ...ratings, q1_buchung: value })).toBe(false);
  });
  it("keeps a requested code unverified and normalizes it", () => {
    expect(requestedCoupon({ requested_coupon_code: "abcdef0123456789abcd" })).toBe("ABCDEF0123456789ABCD");
    expect(requestedCoupon({ requested_coupon_code: "invalid" })).toBe("");
    expect(requestedCoupon(null)).toBe("");
  });
});