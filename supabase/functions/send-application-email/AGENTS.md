# Application intake
- Normalize blank optional fields to null and validate nonblank calendar dates in submission.ts before any upload; this supports existing public clients without storing invalid DATE values.
- Run submission persistence regressions with `bunx vitest run --config vitest.application.config.ts`; native File/FormData and PGlite require Node without browser setup.