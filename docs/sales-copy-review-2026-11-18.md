# Sales copy verification — 18 November 2026

- Confirmed the reported code path: a prefilled copy used its own form as the saved baseline, so copies without a cost difference never triggered creation.
- Copies now use the empty-form baseline until their first successful write. Existing saved articles retain their normal baseline; stable copy identity, hidden publication state, cost permissions and serialized autosave remain unchanged.
- Immediate Save waits for cost loading. Pointer-down preserves focus so the focusout autosave cannot disable the button between pointer-down and click, swallowing the explicit save. Keyboard activation remains normal.
- 28 focused tests passed. Four regression cases cover unchanged new/used copies with and without cost-editing permission and no source cost record; each writes the copy once and preserves source identity.
- Actual Luca staff catalog: copied a new article and a used article without changing fields, clicked Save immediately, confirmed the dialog closed, reloaded and reopened each stored copy. New copy unpublished, used copy hidden. No runtime errors. This live session has admin cost rights; non-cost-editing cases are covered by isolated tests, not another live staff session.
- Interrupted live attempts exposed the swallowed-click issue and created four hidden test copies; those exact copies and both final verification copies were removed through the catalog. Database readback confirms zero remaining copies created during the test interval. Original article counts returned to their initial values.
- Build OK. No rental article, settled record, permission or setting changed. Not published.

Previous unrelated limitation remains: the reported browser multi-field autofill/blockade was not reproduced in Chromium; native Safari with the user's saved autofill profile is unavailable. This fix addresses the independently confirmed copy-creation issue.

## Wider copy-flow review
Rule: saving a sales copy creates a separate article even without edits and never changes the original.

- New and used catalog copy buttons: current entry-point and editor props read again; both use the same corrected editor and a fresh copy UUID. No alternate sales copy entry point found in src.
- Copy helper: full current code read; deep-clones source facts, clears reference identifiers and uses an independent ID/slug with hidden publication state.
- Immediate Save, Close, automatic save, draft restoration and subsequent editing: current initialization, close/save, cost-loading and write sections read again; the copy is initially unsaved, both close/save flush serialized writes, and acknowledgements replace the baseline only after successful writes. Existing article edits retain their saved baseline.
- Cost-right differences: current loading/write paths read; copying no longer depends on a cost difference, and existing cost-write permission remains unchanged. Both permission variants covered by regression tests; only admin rights exercised live.
- Retry/offline: full current useArticleAutosave read; failed writes do not acknowledge the snapshot, online recovery retries and stable articleIdentity reuses the same copy ID. No live network-failure injection performed in this request.
- Catalog after creation / page reload: admin and public catalog loaders read; admin reads include hidden copies, public selection intentionally includes visible articles only. Actual staff readback was verified for both new and used copies.
- Background page generation: both sales-table GET sections read; they do not create, update or delete copies. No copy scheduler or Edge Function referencing either article table found by current code search.
- Active database functions/triggers: fresh live inspection found no public function body referencing either article table. The sole noninternal article trigger updates new_machines.updated_at only; no alternate copy mechanism or suppression of creation.

No additional confirmed violation of the copy-creation rule found. No further app code changed during this wider review. Existing settled records, rental articles, permissions and settings unchanged; publication still pending.