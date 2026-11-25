# Baustromrechner, Tool-Seite und Warenkorb-Verknüpfung

## Ziel
Ein Baustromrechner nach dem Muster des Bautrockner-Rechners, eine gemeinsame Tool-Seite mit teilbaren Links für beide Rechner und ein Knopf, der die vorgeschlagenen Geräte direkt in den Warenkorb des gewählten Standorts legt.

## 1. Grundlagen (Normen, nur als Richtwert)
Bevor Zahlen in den Rechner kommen, prüfe ich jede Quelle einzeln nach. Es fließen nur Werte ein, die belegt sind:
- **DIN VDE 0100-704**: Anforderungen an Stromversorgungen auf Baustellen, also Fehlerstromschutz und Steckdosenkreise.
- **DIN EN IEC 61439-4**: Baustromverteiler mit den Stufen Anschluss-, Haupt-, Gruppen- und Endverteiler. Das passt zu unserem Sortiment (AV 44 kVA, HV125 86 kVA, GV250 173 kVA, EV32 22 kVA, EV63 44 kVA).
- **DGUV Information 203-006**: Auswahl und Betrieb elektrischer Anlagen auf Baustellen, Prüffristen.
- **DIN VDE 0100-520 / -430**: Spannungsfall und Leitungsquerschnitt. Daraus folgt, welche CEE-Kabellänge bei 16, 32 oder 63 A noch sinnvoll ist.
- **ISO 8528**: Leistungsangaben von Stromerzeugern, wichtig für die Auswahl der Aggregate (2,8 bis 100 kVA).

Auf der Ergebnisseite steht deutlich: Das ist ein Richtwert und ersetzt keine Planung durch eine Elektrofachkraft.

## 2. So rechnet der Baustromrechner
1. **Eingabe**: Geräteliste aus Vorlagen (z. B. Kran, Bautrockner, Heizlüfter, Container, Kreissäge) mit Anzahl, wahlweise eigene Leistung in kW. Dazu die Angabe, ob es einen Netzanschluss gibt oder ein Aggregat nötig ist, sowie die Entfernung zum Anschluss.
2. **Rechnung**: Summe der Leistung mal Gleichzeitigkeitsfaktor, umgerechnet in kVA (cos φ). Daraus ergibt sich die Stromstärke je Abgang.
3. **Empfehlung**:
   - passende Verteilerstufe (Anschluss-, Haupt- oder Endverteiler) und Anzahl
   - CEE-Kabel nach Stromstärke und Länge (16 / 32 / 63 A, 3 bis 50 m)
   - Eventverteiler für Schuko-Verbraucher
   - ohne Netzanschluss: Aggregat mit Leistungsreserve
4. **Preis**: grobe Mietpreisspanne nach unseren Staffelpreisen für die gewünschte Mietdauer, so wie beim Bautrockner. Für Artikel ohne gepflegten Preis steht „auf Anfrage“.

## 3. Tool-Seite
- Neue öffentliche Seite **/tools** mit Karten für „Bautrockner-Rechner“ und „Baustromrechner“.
- Jeder Rechner bekommt einen eigenen teilbaren Link, z. B. /tools/bautrockner-rechner und /tools/baustromrechner. Der Standort lässt sich wählen und im Link mitgeben (?standort=bonn).
- Eigene Seitentitel, Beschreibungen und www-Canonicals; Verlinkung aus Fußzeile/Navigation und von den passenden Artikel- und Kategorieseiten.
- Auf den Artikelseiten bleiben die Rechner eingebettet.

## 4. Verknüpfung mit Warenkorb und Artikeln
- Unter jedem Ergebnis: **„Alle empfohlenen Geräte in den Warenkorb“**. Das nutzt den bestehenden Warenkorb mit 15-Minuten-Countdown und CMS-Preisvorschau, Mietzeitraum und Mengen werden übernommen.
- Jede empfohlene Position verlinkt auf die Artikelseite am gewählten Standort.
- Es werden nur Artikel vorgeschlagen, die am Standort veröffentlicht sind und laut „Bestand je Standort“ geführt werden. Nicht veröffentlichte Artikel wie der Turbolüfter erscheinen ohne Knopf als Hinweis „auf Anfrage“.
- Anhänger und Aggregate mit Rentware-Code laufen weiter über Rentware; dort steht ein Link zur Artikelseite statt des Warenkorb-Knopfs.

## 5. Prüfung
- Tests für Leistungssumme, Verteiler- und Kabelauswahl, Aggregatgröße und Warenkorb-Übernahme.
- Browsercheck mobil, auf dem Tablet und am Desktop an allen drei Standorten, mit echtem Warenkorb-Durchlauf bis vor das Absenden.

## Offene Punkte für Luca
- Gleichzeitigkeitsfaktor und die Leistungswerte der Gerätevorlagen: Ich schlage Werte aus den Quellen vor, du gibst sie frei.
- Sollen die Aggregate vom Rechner empfohlen werden oder nur die Verteiler und Kabel?

## Technische Details
- `src/lib/powerCalculator.ts` als reine Rechenlogik mit Tests, Preisbildung über `resolveProductPrices`/`tierPriceBau` wie in `dryingCalculator.ts`.
- Gemeinsame Rechner-Hülle mit Standortwahl und Prop `embedded`; Routen `/tools`, `/tools/:slug`.
- Die Warenkorb-Übernahme läuft über die vorhandene Hinzufügen-Funktion von RentalRequestCart. Die Regeln aus `src/components/rental/AGENTS.md` (Frist, Server-Angebot) bleiben unverändert.
