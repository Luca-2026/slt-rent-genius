# Sales copy verification — 18 November 2026

- Confirmed the reported code path: a prefilled copy used its own form as the saved baseline, so copies without a cost difference never triggered creation.
- Copies now use the empty-form baseline until their first successful write. Existing saved articles retain their normal baseline; stable copy identity, hidden publication state, cost permissions and serialized autosave remain unchanged.
- Immediate Save waits for cost loading. Pointer-down preserves focus so the focusout autosave cannot disable the button between pointer-down and click, swallowing the explicit save. Keyboard activation remains normal.
- 28 focused tests passed. Four regression cases cover unchanged new/used copies with and without cost-editing permission and no source cost record; each writes the copy once and preserves source identity.
- Actual Luca staff catalog: copied a new article and a used article without changing fields, clicked Save immediately, confirmed the dialog closed, reloaded and reopened each stored copy. New copy unpublished, used copy hidden. No runtime errors. This live session has admin cost rights; non-cost-editing cases are covered by isolated tests, not another live staff session.
- Interrupted live attempts exposed the swallowed-click issue and created four hidden test copies; those exact copies and both final verification copies were removed through the catalog. Database readback confirms zero remaining copies created during the test interval. Original article counts returned to their initial values.
- Build OK. No rental article, settled record, permission or setting changed. Not published.

Previous unrelated limitation remains: the reported browser multi-field autofill/blockade was not reproduced in Chromium; native Safari with the user's saved autofill profile is unavailable. This fix addresses the independently confirmed copy-creation issue.