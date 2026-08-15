# B2B-Portal unter app.slt-rental.de

## Was im Code bereits vorbereitet ist
- `src/lib/portalDomain.ts` – Hostnamen-Konstanten, Portal-Erkennung, Auth-Redirect-Helfer
- `src/components/PortalHostRouting.tsx` – auf `app.slt-rental.de`: `/` → `/b2b/login/`, alle öffentlichen Routen → `www.slt-rental.de`, `noindex,nofollow`
- `public/.htaccess` + `scripts/build-htaccess.mjs` (Block „2a. Portal-Subdomain"):
  - `X-Robots-Tag: noindex, nofollow` nur für die Subdomain
  - Root → `/b2b/login/`
  - alle Nicht-`/b2b`-Seiten → 301 auf `www.slt-rental.de` (Assets/Bilder/PDFs bleiben lokal)
  - `www`-Zwang greift nur noch für `slt-rental.de` exakt, nicht für Subdomains
- Passwort-Reset nutzt jetzt den aktuellen Host (bleibt auf der Subdomain)

## Schritte bei Serverprofis (Kundencenter)

1. **Subdomain anlegen**
   - Kundencenter → *Webhosting* → betroffenes Paket → *Domains / Subdomains* → **Subdomain hinzufügen**
   - Name: `app`, Domain: `slt-rental.de`
   - Dokumentenstamm/Zielverzeichnis: **dasselbe Verzeichnis wie www.slt-rental.de** (z. B. `/html` bzw. `/httpdocs`).
     Falls das Panel kein gemeinsames Verzeichnis erlaubt: eigenes Verzeichnis anlegen und denselben `dist/`-Inhalt hochladen.

2. **DNS prüfen/setzen**
   - Bei Serverprofis-DNS wird der A-Record automatisch gesetzt.
   - Externer DNS: A-Record `app` → IP des Webspace (gleiche IP wie `www`), TTL 3600.
   - Kontrolle: `dig app.slt-rental.de +short` bzw. dnschecker.org

3. **SSL aktivieren**
   - Kundencenter → *SSL-Zertifikate* → Let's Encrypt für `app.slt-rental.de` ausstellen
   - „HTTPS erzwingen" aktivieren (die `.htaccess` macht das zusätzlich)

4. **Build hochladen**
   - `npm run build` → Inhalt von `dist/` inkl. `.htaccess` ins Zielverzeichnis
   - Bei getrenntem Verzeichnis: identischen Build in beide Verzeichnisse spiegeln

5. **Funktionstest**
   - `https://app.slt-rental.de/` → leitet auf `/b2b/login/`
   - `https://app.slt-rental.de/mieten/krefeld/` → 301 auf `www.slt-rental.de/mieten/krefeld/`
   - Login, Dashboard, PDF-Downloads, Bild-Assets laden
   - Header prüfen: `curl -sI https://app.slt-rental.de/b2b/login/ | grep -i x-robots-tag`

## Backend (mache ich, sobald die Subdomain live ist)
- Redirect-Allow-List im Backend um `https://app.slt-rental.de/**` erweitern (sonst brechen Passwort-Reset & Einladungslinks)
- E-Mail-Templates/Edge Functions (`admin-reset-password`, `invite-authorized-person`, `admin-manage-staff`) auf die Portal-URL umstellen
- Interne Links (Header „B2B-Login", Footer, Kunden-Mails) optional auf `app.slt-rental.de` umstellen

## Bewusst nicht gemacht
- Kein eigener Build für das Portal (doppelte Pflege, kein Mehrwert bei dieser Größe)
- Keine Sitemap/Indexierung für die Subdomain – Portal bleibt bewusst noindex
