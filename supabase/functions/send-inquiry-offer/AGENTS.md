# Offer dispatch
- Persist the complete offer snapshot with an optimistic updated_at check before replacing acceptance/payment links or sending customer mail; storage failure must never report successful dispatch.
- Return an explicit saved-but-not-sent error when the mail provider does not accept dispatch, so staff retry the unchanged offer instead of creating a revision.