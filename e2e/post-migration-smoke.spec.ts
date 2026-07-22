/**
 * Post-migration smoke test.
 * Runs after every migration to catch regressions across public catalog,
 * B2B customer area, admin inventory and registration flow.
 *
 * Executed via Playwright directly (see scripts/run-post-migration-smoke.mjs)
 * — kept as .spec.ts for editor tooling, but not wired into vitest.
 */
export {};
