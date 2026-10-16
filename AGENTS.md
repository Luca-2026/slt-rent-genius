# Agent rules
- Subdirectories have their own AGENTS.md; read it before changing files there.
- src/components/b2b/admin/AGENTS.md steuert die CMS-Artikelmaske: Preisschema je Artikel, Hauptkategorie und die Preisregeln (Pflicht, Rückfallstufen, Alt-Textfelder).
- WhatsApp: locationWhatsAppContacts.ts + BonnWhatsAppContact; WhatsAppIcon.tsx = Markenglyph.
- Customer payment-term eligibility is shared through _shared/customer-payment-terms.ts in forms and send functions; validate before number allocation to prevent UI bypasses without modifying issued snapshots.
- Signing overlays: ref counting + route gating hide cart/cookies while signing.
<!-- LOVABLE:BEGIN -->
- Inject the portal first-paint guard through the Vite HTML plugin before body parsing; hide only prerender fallback content on the exact portal host to preserve public SEO and the React portal.
<!-- LOVABLE:END -->
- Kundengruppen-Filter nur über src/lib/customerSegment.ts (Filter: Privat vs. Geschäftskunden inkl. B2B-Portal) – einheitliche Logik in allen Portal-Listen.
- Portal-Startseite /b2b/start (StaffHome) ist Landeseite für Admin/Mitarbeiter; Kennzahlen nur über src/lib/dashboardMetrics.ts (getestet) – eine Umsatzdefinition für alle Ansichten.
- Revenue uses src/lib/dashboardMetrics.ts and revenueAnalytics.ts: countsAsRevenue includes typed cancelled originals and credits in both sources so they offset; location/category/article totals must agree.
- Accepted-offer monitoring uses isAwaitingOfferConfirmation in dashboardMetrics for every acceptance channel without an age cutoff; online signature details are optional evidence, not an inclusion filter.
- Offene Kundenanfragen (Freischaltung, Kreditlimit, Löschung) nur über src/lib/customerActions.ts (getestet) – gleiche Regel in Kundenkartei und Startseite; Portalkunden werden in der Kundenkartei über die Kundenakte bearbeitet.
- Verkaufspreisrahmen nur über src/lib/salesPricing.ts (getestet): Mindestpreis = EK netto × (1 + Gemeinkosten, Standard 10 %), Bonusbasis = Verkaufspreis − Mindestpreis; EK liegt in sales_article_costs (nur Mitarbeiter lesbar), nie in den öffentlichen Artikeltabellen.
- Dokumentnummern je Geschäftsart (Miete/Verkauf) über generate_offer_number_for / generate_inquiry_invoice_number_for, B2B-Portal = Mietkreis – nur zwei Kreise je Dokumentart. Abschlags-/Schlussrechnungen nur über _shared/installments.ts (getestet): Schlussrechnung zieht nicht stornierte Abschläge netto ab, damit Umsatz nicht doppelt zählt.
- Reihenfolge der Technischen Daten nur über spec_order (Spalte je Artikeltabelle) + src/lib/specOrder.ts – jsonb sortiert Schlüssel selbst, daher ginge die CMS-Drag-&-Drop-Reihenfolge sonst verloren.
- Rollenrechte: Vollzugriff = Rolle admin (is_super_admin prüft nur noch die Rolle); Inventar/CMS/Verkaufsartikel/Protokolle per can_edit_operations (admin, niederlassungsleiter, standort_mitarbeiter) bzw. canManageInventory im Frontend; Einkaufspreise/Gemeinkosten, Umsatzauswertung, Team und Audit-Log nur admin – Rechte zentral in DB-Funktionen statt E-Mail-Listen.
- CMS rental prices are net: display only via src/lib/priceDisplay.ts + useCustomerType; offers use them unchanged; JSON-LD gross – one conversion point.
- Kundenrabatte (Kategorie) in Angeboten nur über src/lib/customerDiscounts.ts (getestet): Vorbelegung nur bei neuen Mietangeboten, Sonderpreis hat Vorrang, manuelle Rabatte bleiben – gleiche Regel in Mietanfragen und Portalbuchungen.
- Mietanfragen ohne bestätigten Auftrag (neu, in Bearbeitung, Angebot gesendet) mit abgelaufenem Mietzeitraum setzt die DB-Funktion close_expired_rental_inquiries täglich per pg_cron auf erledigt – gespeicherter Status, damit Liste, Zähler und Startseite übereinstimmen.
- Standortwechsel nur über DB-Funktion change_rental_inquiry_location (can_edit_operations, zieht location_email und b2b_reservations atomar mit, Notiz in internal_notes); versendete Angebote bleiben Snapshot. Kundeninfo nur über Edge Function send-location-notice (Konsistenzprüfung, Testkunden-Routing) – kein Freitextversand.
- Kunden werden standardmäßig geduzt; address_form am Kunden (crm_customers, Portalkunden über b2b_profile_id, Fallback rental_inquiries) schaltet auf Sie. Anrede und Form nur über _shared/salutation.ts (resolveAddressForm, salutationLine, byForm) in allen Kunden-E-Mails – Angebot, Rechnung, Auftragsbestätigung, Protokoll, Zahlungserinnerung; Angebotsbedingungen bleiben Sie-Form.
- Anrufzeiten nur über callDateLabel.ts (Berliner Kalendertag).
- Listen-Filter in localStorage; interne Links auf /b2b/mietanfragen/:id.
- Gerätebelegung nur über DB-Funktionen check_availability/confirm_order (Mietaufträge, vor der Auftragsbestätigungs-E-Mail); Doppelbelegung verhindert der Exclusion-Constraint auf b2b_instance_allocations; Überführung setzt den Gerätestandort dauerhaft um (kein Rücktransport); Entscheidungen in rental_inquiry_events. Artikel ohne Einzelgeräte und ohne CMS-Bestand gelten als nicht geprüft.
- Auftrags-ID order_code: DB-Trigger vergibt, unveränderlich; Anzeige via OrderCodeBadge/orderCode; Bank-Zweck „Auftrag CODE“ („#“ kein SEPA-Zeichen).
