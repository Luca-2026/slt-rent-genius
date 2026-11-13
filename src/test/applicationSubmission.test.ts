// @vitest-environment node
import { describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { applicationSubmission } from "../../supabase/functions/send-application-email/submission";

function application(date?: string) {
  const form = new FormData();
  Object.entries({ jobId: "ausbildung-buero", jobTitle: "TEST Bewerbung", firstName: "Test", lastName: "Bewerbung", email: "test@example.invalid", phone: "0123456789" }).forEach(([key, value]) => form.set(key, value));
  if (date !== undefined) form.set("earliestStartDate", date);
  form.set("resume", new File(["%PDF-1.4\nTEST"], "test.pdf", { type: "application/pdf" }));
  return form;
}

describe("application date persistence", () => {
  it.each(["", "   ", undefined])("stores an absent start date (%j) as SQL null", async (date) => {
    const submission = await applicationSubmission(application(date));
    expect(submission.fields.earliestStartDate).toBeNull();
    const db = new PGlite();
    try {
      await db.exec("CREATE TABLE applications (earliest_start_date DATE)");
      await db.query("INSERT INTO applications VALUES ($1)", [submission.fields.earliestStartDate]);
      expect((await db.query("SELECT earliest_start_date FROM applications")).rows).toEqual([{ earliest_start_date: null }]);
    } finally { await db.close(); }
  });

  it("preserves a valid selected start date", async () => {
    expect((await applicationSubmission(application("2027-01-01"))).fields.earliestStartDate).toBe("2027-01-01");
  });

  it.each(["2027-02-29", "2026-02-30", "tomorrow", "2027-13-01", "2027-1-1"])("rejects invalid date %s before uploading documents", async (date) => {
    await expect(applicationSubmission(application(date))).rejects.toThrow("Invalid application");
  });

  it("normalizes blank optional text without weakening required fields", async () => {
    const form = application();
    form.set("salaryExpectation", "   ");
    expect((await applicationSubmission(form)).fields.salaryExpectation).toBeNull();
    form.set("firstName", "   ");
    await expect(applicationSubmission(form)).rejects.toThrow("Invalid application");
  });
});