# KI-Anfrage-Import: aus E-Mail/Transkript zum fertigen Angebotsentwurf

## Ziel
Du fügst eine Kunden-E-Mail oder ein Transkript der Telefon-KI (Lena) als Text ein. Die KI liest daraus Kundendaten, Standort, Zeitraum und gewünschte Artikel, ordnet die Artikel echten CMS-Produkten zu und übernimmt vorhandene Preise. Du prüfst, ergänzt fehlende Preise und sendest das Angebot wie gewohnt. Nichts geht ohne deine Freigabe raus.

## Ablauf für dich
```text
Mietanfragen -> "Aus Text erstellen (KI)"
  -> Text einfügen -> "Auswerten"
  -> Prüfansicht: Kundendaten | Zeitraum | Artikelzuordnung | offene Fragen
  -> "Anfrage anlegen & Angebot öffnen"
  -> bekanntes Angebotsformular, vorbefüllt -> prüfen -> senden
```

## Grundregeln (Zuverlässigkeit)
- Die KI erfindet nichts: fehlende Angaben bleiben leer und werden gelb als "bitte ergänzen" markiert.
- Artikel nur aus dem echten CMS-Katalog des gewählten Standorts. Findet sie keinen passenden Artikel, erscheint die Zeile als "nicht zugeordnet" mit Originaltext und Auswahlfeld.
- Bei mehreren Treffern: beste Wahl vorausgewählt, Alternativen per Klick.
- Preise kommen ausschließlich aus dem CMS (Tag/Wochenende/Woche/Monat je nach Dauer), nie von der KI. Ohne CMS-Preis bleibt das Feld leer und rot markiert; Senden erst, wenn alle Preise gesetzt sind.
- Summen rechnet immer das bestehende System.
- Bestehender Kunde (E-Mail/Telefon im CRM gefunden) wird vorgeschlagen statt Dublette.
- Der Originaltext wird an der Anfrage gespeichert (Nachvollziehbarkeit).

## Schritte (jeweils mit Test und Bericht, Freigabe durch dich)

**Schritt 1 – Auswertung (Server)**
Neue Backend-Funktion liest den Text und liefert ein festes, geprüftes Ergebnis: Kunde (Name, Firma, E-Mail, Telefon, Adresse, privat/gewerblich), Standort, Mietbeginn/-ende, Lieferung ja/nein + Adresse, Positionen (Originalwortlaut, Menge), Notizen, offene Fragen.
Test: 6 reale Beispieltexte (E-Mail, Lena-Transkript, unvollständig, mehrere Artikel, Firma, ohne Datum) – Ergebnis Feld für Feld geprüft.

**Schritt 2 – Katalogzuordnung und Preise (Server)**
Positionen werden serverseitig gegen das CMS des Standorts abgeglichen (Name, Kategorie, Synonyme wie "Minibagger 1,8 t", "Rüttelplatte"). Nur echte Produkt-IDs werden zurückgegeben; Preis und Einheit aus dem CMS nach Mietdauer.
Test: Zuordnungsquote und Fehlzuordnungen an den Beispieltexten; Preisberechnung gegen CMS-Werte.

**Schritt 3 – Prüfansicht im Portal**
Button "Aus Text erstellen (KI)" in Mietanfragen, Einfügefeld, Prüfansicht mit allen Feldern editierbar, Ampel je Feld, Artikel-Auswahl, CRM-Treffer.
Test: im Browser mit echtem Mitarbeiterzugang durchklicken, mobil und Desktop.

**Schritt 4 – Anfrage anlegen und Angebot vorbefüllen**
Legt die Anfrage (Quelle "E-Mail/Telefon (KI-Import)") an, speichert den Originaltext, öffnet das bestehende Angebotsformular vorbefüllt. Bestandsprüfung, Entwurfsspeicherung und Versand wie bisher.
Test: kompletter Durchlauf bis zum echten Versand an luca@sandhoff.org.

**Schritt 5 – Dauerbetrieb**
Fehlerfälle sauber: kein Guthaben/Limit, Zeitüberschreitung, leerer Text, sehr lange Texte, Doppelklick. Klare Meldungen statt Absturz; automatische Tests für Zuordnung und Preislogik.

## Verhältnis zum bestehenden Plan
Der offene Schritt "KI: Änderungswünsche in ein bestehendes Angebot einarbeiten" nutzt dieselbe Auswertung und Katalogzuordnung und wird danach mit wenig Zusatzaufwand ergänzt.

## Technische Details
- Edge Function `parse-inquiry-text`: Lovable AI Gateway, Modell `openai/gpt-6-astra`, Responses API gestreamt, strukturierte Ausgabe per Zod-Schema; Mitarbeiter-Rollenprüfung; Eingabe max. ca. 20.000 Zeichen.
- Katalogabgleich serverseitig: KI liefert nur Suchbegriffe, Server wählt Kandidaten aus CMS-Produkten (inkl. Standort-Rentwarecode/Verfügbarkeit) und lässt die KI nur zwischen echten IDs wählen; unbekannte IDs werden verworfen.
- Preislogik als gemeinsames, getestetes Modul (Vitest), identisch zur Angebotsberechnung.
- Neue Spalten an `rental_inquiries`: `source_text`, `import_source`.
- UI: `AiInquiryImportDialog` + Übergabe an `InquiryOfferForm` über vorhandene Vorbefüllung.
- Fehlerbehandlung nach Gateway-Regeln (402/403/429 klar anzeigen, keine Endlos-Wiederholung).
