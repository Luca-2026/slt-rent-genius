# Paket 2A – Rollen- und Berechtigungsverwaltung (Architekturvorschlag zur Freigabe)

Nur Analyse. Keine Code-, DB-, Rechte- oder Deploymentänderung in diesem Schritt.

## 1. Ist-Befund (heute gelesen und belegt)

- Rollen: Enum `app_role` = admin, user, standort_mitarbeiter, buchhaltung, readonly, niederlassungsleiter. Tabelle `user_roles`: 3 admin, 1 niederlassungsleiter, 2 standort_mitarbeiter; buchhaltung/readonly ohne Nutzer und fachlich kaum verdrahtet.
- Standort: genau ein Feld `staff_profiles.location` (kein Mehrfachstandort, kein Hauptstandort-Begriff). Normalisierung über `slt_normalize_location`, Kasse über `cash_register_for_location` (Mülheim → Krefeld), Umsatz über `revenue_branch`/`revenue_scope`.
- Zentrale Prüffunktionen (SECURITY DEFINER): `has_role`, `is_super_admin` (= admin), `is_staff_member`, `can_edit_operations` (admin/NL/Standort), `can_manage_credit_checks`, `can_issue_rental_coupon`, `can_manage_b2b_onboarding`, `can_send_rental_return_reminder`, `can_approve_rental_payout` (admin + `rental_payout_approvers`), `apply_staff_credit_limit`, `change_rental_inquiry_location`, `record_rental_staff_payments`, `can_access_todo_list`; Finanzscope in `supabase/functions/_shared/finance-scope.ts`.
- Umfang: 235 RLS-Policies (84 mit `has_role`, 23 mit `can_edit_operations`), 22 Storage-Policies, 182 SECURITY-DEFINER-Funktionen, 86 Edge Functions (66 mit Service-Role, ca. 27 mit expliziter Rollenprüfung), 34 Mitarbeiterseiten unter `src/pages/b2b`.
- Frontend: Rollen über `useAuth` (isAdmin/isSuperAdmin) und `useStaffAccess` (RPC `can_edit_operations`, `has_role niederlassungsleiter`); stärkste Nutzung in Customers, StaffHome, StaffTasks, B2BPortalLayout, RevenueAnalytics, InquiryInvoices, AdminDashboard, StaffNav.
- Rollen werden bereits serverseitig geprüft, nicht über E-Mail-Listen (AGENTS.md). Es gibt aber keine Einzelrechte: Jede Fachregel kodiert ihre Rollenkombination selbst.
- Vorbereitet, nicht aktiv: 0213 Finanz (Bar-Storno fail-closed), 0214 URL-History. 0215/0216 aktiv.

Grenze: Die vollständige Matrix Policy für Policy, Funktion für Funktion und Edge Function für Edge Function ist hier nur gezählt und an Stichproben belegt. Die lückenlose Einzelinventur ist Phase 0 (maschinell erzeugt, siehe 4).

## 2. Soll-Architektur

```text
user ──> staff_role_assignments (Rollenprofil, je Standort) ──> role_permissions
     ──> staff_permission_overrides (allow | deny, optional Standort, optional Betragsgrenze)
     ──> staff_locations (home=true genau einmal, weitere = Zusatzrechte)
                     │
           public.has_permission(uid, perm, location, amount?)  ← einzige Entscheidung
                     │
     RLS-Policies · RPCs · Edge Functions (_shared/authz.ts) · UI (Anzeige nur)
```

- Ein Rechtekatalog `permissions` (stabile Schlüssel wie `rental.cancel`, `refund.deposit`, `refund.goodwill`, `credit_limit.change`, `payout.special`, `inventory.correct`, `revenue.location.view`, `customer.delete_final`, `roles.manage`).
- Auswertung: explizites Deny > explizites Allow > Rollenprofil > kein Recht. Standortbezug: Recht gilt nur für den Hauptstandort oder ausdrücklich zugewiesene weitere Standorte; Admin global.
- Bestehende Rollen werden zu Standardprofilen mit genau ihren heutigen Rechten (keine Änderung beim Umstieg). `user_roles` bleibt Quelle der Profilzuordnung; keine zweite Autorisierung daneben.
- Bestehende Funktionen (`can_edit_operations` usw.) bleiben mit gleicher Signatur und rufen intern `has_permission` auf; so ändert sich bei 235 Policies anfangs nichts.
- Eskalationsschutz: nur `roles.manage` (Admin) vergibt Rechte; niemand kann sich selbst Rechte geben oder mehr vergeben, als er hat; Rechteänderungen append-only im Audit; letzte Admin-Rolle nicht entfernbar.
- Betragsgrenzen nur optional pro Person; Standard ist „bis zum nachgewiesenen Anspruch“, den weiterhin die bestehenden Anspruchs-, Beleg-, Status- und Doppelzahlungsprüfungen bestimmen. Kulanz ist ein eigenes Recht.
- Krefeld/Mülheim: getrennte Standorte für Rechte und Auswertung; Kasse bleibt über `cash_register_for_location` gemeinsam.

## 3. Soll-Matrix (Änderung markiert mit ★)

| Bereich | Standort | NL | Buchhaltung | Nur Lesen | Admin |
|---|---|---|---|---|---|
| Vermietung, Verkauf, Kunden, Übergabe/Rücknahme, Schäden | ja | ja | lesen ★ | lesen ★ | ja |
| Zahlungen, Stornos, Vertragsänderungen | ja | ja | lesen/korrigieren ★ | – | ja |
| Rechnungen, Korrekturen, Gutschriften | ja (zu prüfen ★) | ja | ja ★ | – | ja |
| Kautions-/Miet-/Gutschrifterstattung bis Anspruch | ja (zu prüfen ★) | ja | ja ★ | – | ja |
| Kulanz | optional ★ | ja ★ | – | – | ja |
| Kassenbuch/DATEV/Kassenabgleich | – | lesen | ja ★ | – | ja |
| Standortumsatz | optional ★ | eigener | alle ★ | – | alle |
| Standortwechsel, B2B-Freischaltung, Bonität, Gutscheine, Bestandskorrektur | optional ★ | ja (wie heute teils) | – | – | ja |
| Kreditlimit (bis 2.000 € NL, darüber Admin) | – | wie heute | – | – | ja |
| Sonderauszahlungen | – | – | – | – | Admin + Freigeberliste (wie heute) |
| EK-Preise, Personal, Audit, CMS | nur nach Freigabe | nur nach Freigabe | nur nach Freigabe | – | ja |
| System/Zahlungseinstellungen, Rechtevergabe, endgültige Löschung, Publish | – | – | – | – | nur Admin |

Bar-Storno-Erstattung bleibt gesperrt bis 0213 fachlich freigegeben ist; die Matrix schaltet nichts frei.

## 4. Umsetzungsphasen

0. Inventur maschinell: Skript liest alle Policies, Funktionen, Trigger, Views, Storage-Policies, Edge Functions (Service-Role, Auth-Prüfung, Webhook-/Cron-Schutz) und UI-Rollenchecks und erzeugt eine Ist-Matrix als Bericht. Ergebnis wird mit euch abgeglichen.
1. Schema additiv: `permissions`, `role_permissions`, `staff_permission_overrides`, `staff_locations` (Backfill aus `staff_profiles.location` als Hauptstandort), `has_permission`. Seeds = exakt heutiges Verhalten. Äquivalenztest: alte Prüffunktion und neue liefern für alle Nutzer, Rollen und Standorte dasselbe.
2. Bestehende `can_*`-Funktionen und `_shared/finance-scope.ts` intern auf `has_permission` umstellen, Signaturen und ACLs gleich.
3. Admin-Oberfläche „Rollen & Rechte“: Profile, Einzelrechte, Deny, Standorte, optionale Grenzen, Änderungsprotokoll.
4. Neue Rechte (★) einzeln nach fachlicher Freigabe aktivieren; Buchhaltung/Nur Lesen erstmals verdrahten.
5. UI-Checks auf ein `usePermission`-Hook umstellen (nur Anzeige; Entscheidung bleibt serverseitig).

Rollback je Phase: Phase 1 rein additiv (Tabellen löschbar), Phase 2 hält alte Funktionskörper als Rücknahme-SQL vor; Feature-Schalter, damit `has_permission` auf Altlogik zurückfällt.

## 5. Test- und Abnahmeplan

- Äquivalenzmatrix alt/neu für jeden Nutzer × Recht × Standort (muss vor Phase 2 identisch sein).
- Deny-Vorrang, Mehrfachstandort, Hauptstandort, Selbsteskalation, letzte-Admin-Sperre, Grenzen.
- Bestehende Finanz-, Refund-, Kassen-, Verfügbarkeits- und Kreditlimit-Tests unverändert grün; Parallelitätstests auf echter PostgreSQL.
- Isolierte Testkonten je Profil, Browserdurchlauf aller 34 Mitarbeiterseiten; keine produktiven Konten oder Schreibvorgänge.
- Edge Functions: Aufruf je Rolle mit erwarteter 401/403/200.

## 6. Offene fachliche Entscheidungen

1. Dürfen Standortmitarbeiter heute schon Rechnungskorrekturen und Erstattungen ausführen, oder ist das eine Rechteerweiterung? (Matrix ★ „zu prüfen“)
2. Was genau darf Buchhaltung korrigieren (Belege stornieren ja, Beträge ändern nein)?
3. Welche Informationen sind für „Nur Lesen“ freigegeben?
4. Kulanz: welche Rollen standardmäßig, mit oder ohne Grenze?
5. Mehrfachstandort: wer bekommt ihn (z. B. Benedikt Krefeld+Mülheim)?

## 7. Risiken, Aufwand

- Größtes Risiko: Policies, die Rollen direkt statt über Funktionen prüfen (84 Stück); werden in Phase 0 einzeln erfasst, sonst entstünde eine Lücke.
- Service-Role-Funktionen (66) umgehen RLS; jede braucht den Prüfaufruf in `_shared/authz.ts`.
- Aufwand grob: Phase 0–2 mehrere Arbeitsrunden, Phase 3–5 je eine bis zwei. Credits nicht belastbar schätzbar.

Befund vs. Annahme: Abschnitt 1 ist belegt; Matrixwerte mit ★ und Aufwand sind Vorschläge.
