# Admin-Nachrichten an B2B-Kunden

## Ziel
Admins können aus dem B2B-Admin-Bereich Nachrichten an Firmenkunden senden. Die Nachricht erscheint:
1. Im Kunden-Dashboard als ungelesene Nachricht (Badge + Inbox-Bereich)
2. Per E-Mail an den Kunden (Empfänger: `contact_email` des B2B-Profils)
3. Per E-Mail in Kopie an `b2b@slt-rental.de` (damit wir den Versand dokumentiert haben)

## Datenbank

Neue Tabelle `b2b_admin_messages`:
- `id` (uuid)
- `b2b_profile_id` (uuid → b2b_profiles)
- `sender_user_id` (uuid, Admin der gesendet hat)
- `subject` (text)
- `body` (text)
- `read_at` (timestamptz, null = ungelesen)
- `created_at` / `updated_at`

GRANTs + RLS:
- Admins: full access (via `has_role(auth.uid(),'admin')`)
- Kunden (Profil-Inhaber + authorized persons): SELECT eigene + UPDATE nur `read_at`

## Edge Function
`send-admin-message` (neue Funktion, verify_jwt=false, manuelle Auth-Prüfung):
- Eingabe: `b2b_profile_id`, `subject`, `body`
- Prüft: Aufrufer hat `admin`-Rolle
- Insert in `b2b_admin_messages`
- Sendet E-Mail via Resend an `contact_email` + CC `b2b@slt-rental.de`
- E-Mail im bestehenden Design-Stil (siehe `notify-b2b-reservation`)

## Frontend

### Admin-Seite
Neuer Dialog/Button "Nachricht senden" in `AdminDashboard` Kundenliste (pro Kunde):
- Formular: Betreff + Nachricht (Textarea)
- Ruft Edge Function auf

### Kunden-Dashboard
- Neue Komponente `AdminMessagesInbox` auf `src/pages/b2b/Dashboard.tsx`
- Lädt `b2b_admin_messages` für eigenes Profil
- Zeigt ungelesene Nachrichten oben mit Badge
- Klick auf Nachricht öffnet Detail-Dialog und markiert als gelesen
- Realtime-Subscription für Live-Updates
- Badge im B2B-Sidebar/Header bei ungelesenen Nachrichten

## Dateien
- Migration: neue Tabelle + RLS + Realtime publication
- `supabase/functions/send-admin-message/index.ts`
- `supabase/config.toml`: Eintrag für neue Function
- `src/components/b2b/admin/SendMessageDialog.tsx` (neu)
- Integration in `AdminDashboard` Kundenzeile
- `src/components/b2b/AdminMessagesInbox.tsx` (neu) + Einbindung in `Dashboard.tsx`
- Unread-Badge in `B2BPortalLayout` (Sidebar-Menüpunkt "Nachrichten" optional)

## Nicht im Scope
- Antworten vom Kunden zurück (nur einseitig Admin → Kunde)
- Anhänge
- Threading
