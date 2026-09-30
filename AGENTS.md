# Agent rules
- Kundengruppen-Filter nur über src/lib/customerSegment.ts (Filter: Privat vs. Geschäftskunden inkl. B2B-Portal) – einheitliche Logik in allen Portal-Listen.
- Portal-Startseite /b2b/start (StaffHome) ist Landeseite für Admin/Mitarbeiter; Kennzahlen nur über src/lib/dashboardMetrics.ts (getestet) – eine Umsatzdefinition für alle Ansichten.
- Umsatzauswertung /b2b/auswertungen nur über src/lib/revenueAnalytics.ts (getestet, nutzt countsAsRevenue aus dashboardMetrics) – Standort-, Kategorie- und Artikelsummen ergeben immer denselben Gesamtumsatz.
- Offene Kundenanfragen (Freischaltung, Kreditlimit, Löschung) nur über src/lib/customerActions.ts (getestet) – gleiche Regel in Kundenkartei und Startseite; Portalkunden werden in der Kundenkartei über die Kundenakte bearbeitet.
- Verkaufspreisrahmen nur über src/lib/salesPricing.ts (getestet): Mindestpreis = EK netto × (1 + Gemeinkosten, Standard 10 %), Bonusbasis = Verkaufspreis − Mindestpreis; EK liegt in sales_article_costs (nur Mitarbeiter lesbar), nie in den öffentlichen Artikeltabellen.
