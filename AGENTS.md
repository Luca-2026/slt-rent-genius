# Agent rules
- Kundengruppen-Filter nur über src/lib/customerSegment.ts (Filter: Privat vs. Geschäftskunden inkl. B2B-Portal) – einheitliche Logik in allen Portal-Listen.
- Portal-Startseite /b2b/start (StaffHome) ist Landeseite für Admin/Mitarbeiter; Kennzahlen nur über src/lib/dashboardMetrics.ts (getestet) – eine Umsatzdefinition für alle Ansichten.
