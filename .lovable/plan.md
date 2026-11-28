# Abnahme-Audit Aushubrechner und OG-Bild (28.11.2026)

Freigabeempfehlung: Nicht freigeben. Zuerst Rechnerlogik und OG-Bild/Prerender korrigieren, danach erneut prüfen.

## Belegte Ergebnisse
| Prüfpunkt | Ergebnis | Beleg |
|---|---|---|
| Unit-Tests Aushubrechner | Pass (9/9) | `bunx vitest run src/test` → src/test/excavationCalculator.test.ts 9 Tests |
| Gesamte Testsuite | Fail (9 von 1420) | signDirectBooking (1), rentalWorkspace (7), customerEmailHandlers (1); betreffen nicht den Rechner |
| Fehlende Grabtiefe über 1 m wird als Prüfen markiert | Fail | excavationCalculator.ts Z. 106: nur Hinweistext, `check` bleibt false |
| Bekannte unzureichende Grabtiefe unter 1 m | Fail | Z. 105: Tiefe wird erst ab DEPTH_CHECK_FROM_M bewertet |
| Ungeeignete Rückfallgeräte als Hauptempfehlung | Fail | Z. 130: `main = all[0].a` auch wenn ok=false |
| Kranalternative nur nach fachlicher Prüfung | Fail | Z. 128/132: Kranhinweis automatisch, ohne Prüfkennzeichen |
| Maschinenpaket/Warenkorb nur geeignete Geräte | Fail (laut Code-Hinweis, Z. 130 speist main) | lines übernimmt main ohne Eignungsfilter |
| Dumper mit unbekannter Breite | Fail laut Code-Hinweis; nicht separat nachgelesen | – |
| OG-Datei vorhanden, HTTP 200, image/png, absolute URL | Pass | public/images/og/default-slt-rental.png; curl → 200, content-type image/png |
| OG-Größe 1200×630 | Fail | Datei ist 1376×768 |
| Eigenes OG-Bild für Tools | Fail | /tools und /tools/aushubrechner nutzen default-slt-rental.png |
| Prerender /tools/aushubrechner: Canonical/og:url | Fail | Live-HTML zeigt Canonical und og:url der Startseite und Startseiten-Titel |
| Prerender /tools: Canonical | Pass | `https://www.slt-rental.de/tools/` |
| Twitter-Tags | Pass (Startseitenwerte, für Aushubseite daher fachlich Fail) | twitter:card summary_large_image vorhanden |

## Nicht getestet
Browser-Tests im Preview (drei Standorte, Standortwechsel, Produktlinks/Bilder, Testfälle 40 m²×30 cm, Graben, Kreis, Nutzlast, 20 m²×120 cm, 80/100 cm Zufahrt, manipulierte URL, Extremwerte, Mobilansicht, Share-Link mit Expertenwerten, lokaler Warenkorb), Vergleich mit public-rental-quote, Abgrenzung auf Anfrage/Rentware, visuelle Prüfung von Wort-Bild-Marke und Farben. Diese Punkte gelten nicht als bestanden.

## Vorgeschlagene Korrekturen (nach Freigabe)
1. assessExcavator: Tiefe immer bewerten, wenn bekannt; fehlende Grabtiefe über 1 m mit check=true.
2. recommendExcavators: ungeeignete Geräte nie als main; stattdessen "Beratung nötig" mit Kranhinweis als Prüfbedarf.
3. Maschinenpaket/Warenkorb nur ok && !check.
4. Dumper ohne Breite bei angegebener Zufahrt als ungeprüft.
5. Eigenes Tools-OG-Bild 1200×630 und Prerender-Eintrag für /tools/aushubrechner.
6. Danach Browser-Smoke-Tests aller oben genannten Fälle.
