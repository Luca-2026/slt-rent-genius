# Rental cart rules
- Additional cart items inherit periods through withCartPeriod, validated for their pickup location; set quantities remain counts of sets and display through setSize helpers to avoid multiplying prices by contained pieces.
- Live cart estimates use cartQuoteItems to include the current draft and saved accessories once; locate the draft quote by ID, never array position; cartQuoteTotal keeps sub-cent net precision and Sorglos prices sync via signSetupQuotePatch, so every step shows the same cent-exact total.
- Cart continuation and pickup confirmation use rentalCart helpers: category navigation retains the first item's pickup location, and final public submission requires explicit self-pickup confirmation when delivery is not selected.
- Deposits: quote before CMS/no VAT. Signs: signRentalGrossCents matches SQL duration pricing; cart persists address/quote, changes invalidate price; lead/terms enforced server-side to prevent drift.
- CartAccessories resolves only curated catalog accessories before insurance; DeliveryAddressFields uses protected geo-address Places lookups for suggestions and postal completion.
- Checkout contact validation shares booking-contact with the server; useCartDraft preserves contact inputs only within the original cart deadline/request, with in-page fallback for blocked storage; consent must be confirmed again.
- Cart quotes: only server 400 validation errors (and sign carts) block; transient quote failures retry once, then show a non-blocking note so unpriced requests still reach staff for an offer.
