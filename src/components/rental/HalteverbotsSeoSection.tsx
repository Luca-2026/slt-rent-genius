import { CheckCircle2, XCircle, FileText, Download, AlertTriangle, Clock, ShieldCheck } from "lucide-react";

interface HalteverbotsSeoSectionProps {
  locationId: "krefeld" | "bonn" | "muelheim" | string;
}

const CITY_NAME: Record<string, string> = {
  krefeld: "Krefeld",
  bonn: "Bonn",
  muelheim: "Mülheim an der Ruhr",
};

const STANDORT_EMAIL: Record<string, string> = {
  krefeld: "krefeld@slt-rental.de",
  bonn: "bonn@slt-rental.de",
  muelheim: "muelheim@slt-rental.de",
};

export function HalteverbotsSeoSection({ locationId }: HalteverbotsSeoSectionProps) {
  const city = CITY_NAME[locationId] || "Krefeld";
  const email = STANDORT_EMAIL[locationId] || "krefeld@slt-rental.de";


  return (
    <div className="bg-card rounded-xl border border-border p-5 space-y-8">
      <header>
        <h2 className="text-2xl font-bold text-headline mb-2">
          Halteverbotszone in {city} einrichten – der komplette Ratgeber
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ob Umzug, Anlieferung, Baustelle oder Veranstaltung: Damit Du in {city} legal und
          rechtssicher Parkplätze freihältst, brauchst Du eine behördliche Genehmigung und
          DIN-konforme mobile Halteverbotsschilder. Dieser Leitfaden erklärt Schritt für
          Schritt, wann Du eine Halteverbotszone brauchst, wie Du sie beantragst, wie sie
          aufgestellt wird und was Du beim Aufstellprotokoll beachten musst – als
          Selbstaufsteller oder bequem über unser Sorglos-Paket.
        </p>
      </header>

      {/* Überblick */}
      <section>
        <h3 className="text-lg font-semibold text-headline mb-3">
          1. Wann brauchst Du eine Halteverbotszone?
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Eine mobile Halteverbotszone (Verkehrszeichen 283 nach StVO) ist immer dann
          sinnvoll, wenn Du sicherstellen musst, dass an einer bestimmten Stelle keine
          Fahrzeuge parken. Typische Anlässe in {city}:
        </p>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm">
          {[
            "Umzug mit LKW oder Möbelwagen",
            "Anlieferung größerer Möbel oder Baumaterial",
            "Baustelle oder Sanierung mit Container/Gerüst",
            "Hochzeit, Feier oder Veranstaltung mit Catering",
            "Filmaufnahmen, Foto-Shoot, TV-Produktion",
            "Bauarbeiten an Fassade oder Dach (Hubsteiger)",
          ].map((u) => (
            <li key={u} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{u}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Genehmigung */}
      <section className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-headline mb-3">
          2. Genehmigung der Stadt {city} einholen
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Eine Halteverbotszone darf in Deutschland nur mit einer Sondernutzungserlaubnis
          bzw. einer verkehrsrechtlichen Anordnung der zuständigen Straßenverkehrsbehörde
          eingerichtet werden. Beantrage die Genehmigung mindestens{" "}
          <strong>10–14 Werktage vor dem Wunschtermin</strong>. Folgende Angaben werden
          benötigt:
        </p>
        <ul className="space-y-1.5 text-sm text-muted-foreground mb-4">
          <li>• Anschrift mit Hausnummer der Halteverbotszone</li>
          <li>• Datum und Uhrzeit (von / bis)</li>
          <li>• Länge der Zone in Metern bzw. Anzahl Stellplätze</li>
          <li>• Anlass (Umzug, Baustelle, Veranstaltung …)</li>
          <li>• Auftraggeber/Verantwortlicher mit Kontaktdaten</li>
        </ul>
        {antrag && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <p className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" />
              Online-Beantragung in {city}
            </p>
            <a
              href={antrag.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline break-all"
            >
              <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
              {antrag.label}
            </a>
            <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
              Tipp: Lass Dir die Genehmigung als PDF zuschicken und drucke sie für die
              Aufstellung sowie für Polizei und Abschleppdienst aus. Eine Kopie schickst Du
              bitte zusätzlich an{" "}
              <a href="mailto:mieten@slt-rental.de" className="underline">
                mieten@slt-rental.de
              </a>
              , falls wir aufstellen sollen.
            </p>
          </div>
        )}
      </section>

      {/* Schilder abholen */}
      <section className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-headline mb-3">
          3. Halteverbotsschilder bei SLT Rental in {city} abholen
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Unser 18-teiliges Komplett-Set passt mit den klappbaren Standfüßen in jeden Pkw
          und besteht aus:
        </p>
        <ul className="grid sm:grid-cols-2 gap-2 text-sm mb-3">
          {[
            "2 × Halteverbotsschild (VZ 283, RA1)",
            "2 × besonders standfeste Fußplatten",
            'Zusatzschilder „Anfang/Ende" mit Pfeil',
            "Zusatzschilder Datum & Uhrzeit (StVO Größe 1, beschriftbar)",
            "Diebstahlsicherung",
            "Werkzeug- & Zubehörtasche",
          ].map((u) => (
            <li key={u} className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent flex-shrink-0 mt-0.5" />
              <span className="text-foreground">{u}</span>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Mietpreis: <strong className="text-foreground">ab 39 € für 1–10 Tage</strong>{" "}
          Mietzeit (Selbstabholer). Auf Wunsch buchst Du unser{" "}
          <strong className="text-foreground">Premium-Festpreis-Paket „Sorglos" (199 €)</strong>{" "}
          inkl. Antrag bei der Stadt sowie Auf- und Abbau (zzgl. Verwaltungsgebühren der
          Stadt {city} je nach Aufstellzeit).
        </p>
      </section>

      {/* Aufstellung */}
      <section className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-headline mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          4. Aufstellung – mindestens 72 Stunden vor Geltungsbeginn
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Damit Du bei einem Verstoß <strong>kostenpflichtig abschleppen lassen</strong>{" "}
          darfst, muss die Halteverbotszone laut Rechtsprechung mindestens{" "}
          <strong>72 Stunden vor Geltungsbeginn</strong> sichtbar aufgestellt sein.
          Fahrzeuge, die zum Zeitpunkt der Aufstellung bereits geparkt waren, dürfen nicht
          umgesetzt werden – diese Kennzeichen werden im Aufstellprotokoll notiert.
        </p>
        <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
          <li>
            Schild 1 am <strong>Anfang</strong> der Zone aufstellen, mit Pfeil/Zusatzschild
            in Geltungsrichtung.
          </li>
          <li>
            Schild 2 am <strong>Ende</strong> der Zone aufstellen, mit Pfeil/Zusatzschild
            entgegen der Geltungsrichtung.
          </li>
          <li>
            <strong>Zusatzschild Datum & Uhrzeit</strong> beschriften und gut sichtbar
            anbringen.
          </li>
          <li>
            <strong>Diebstahlsicherung</strong> anlegen, Stand prüfen (windsicher!).
          </li>
          <li>
            <strong>Aufstellprotokoll</strong> ausfüllen und alle Zonen-Fotos sowie
            Kennzeichen vorgefundener Fahrzeuge dokumentieren.
          </li>
        </ol>
      </section>

      {/* Protokoll & Downloads */}
      <section className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-headline mb-3 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          5. Aufstellprotokoll & Anleitung als PDF
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Lade Dir unser offizielles Aufstellprotokoll (konform zu § 45 StVO und VwV-StVO)
          sowie die kompakte Schritt-für-Schritt-Anleitung als PDF herunter. Beides ist
          Voraussetzung für eine rechtssichere Selbstaufstellung und die Abschleppberechtigung.
        </p>
        <div className="grid sm:grid-cols-2 gap-3">
          <a
            href="/downloads/halteverbot/SLT-Rental_Aufstellprotokoll_Halteverbotszone.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 hover:border-primary hover:bg-primary/5 p-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                Aufstellprotokoll Halteverbotszone (PDF)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Pflichtformular für Abschleppberechtigung – am PC ausfüllen oder leer
                ausdrucken.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-1.5">
                <Download className="h-3 w-3" /> PDF herunterladen
              </span>
            </div>
          </a>
          <a
            href="/downloads/halteverbot/SLT-Rental_Halteverbotszone-selbst-aufstellen.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="group flex items-start gap-3 rounded-lg border border-border bg-muted/30 hover:border-primary hover:bg-primary/5 p-4 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
              <FileText className="h-5 w-5 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground group-hover:text-primary">
                One-Pager: Halteverbotszone selbst aufstellen (PDF)
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                Kompakte Anleitung in 5 Schritten – ideal zum Mitnehmen vor Ort.
              </p>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-primary mt-1.5">
                <Download className="h-3 w-3" /> PDF herunterladen
              </span>
            </div>
          </a>
        </div>
      </section>

      {/* Do / Don't */}
      <section className="border-t border-border pt-6 grid md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-primary" /> So machst Du es richtig
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {[
              "Behördliche Genehmigung vor der Aufstellung einholen",
              "Original DIN-konforme Schilder mit Zusatzschild Datum/Uhrzeit",
              "Mind. 72 Stunden vorher gut sichtbar aufstellen",
              "Aufstellprotokoll mit Foto und Kennzeichen anfertigen",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-destructive" /> Bitte vermeiden
          </h4>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            {[
              "Selbstgebastelte Schilder oder Ausdrucke verwenden",
              "Parkplätze mit Stühlen, Mülltonnen oder Flatterband sperren",
              "Ohne Genehmigung der Stadt aufstellen",
              "Schilder verdeckt, schief oder ohne Datum platzieren",
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Konsequenzen */}
      <section className="border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-headline mb-3">
          6. Konsequenzen bei Parkverstoß im Halteverbot
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          Wer im Halteverbot parkt, riskiert nicht nur ein Verwarnungs- bzw. Bußgeld nach
          dem aktuellen Bußgeldkatalog der StVO, sondern muss bei korrekt aufgestellter
          Zone (mind. 72 Stunden vorher) auch mit dem kostenpflichtigen{" "}
          <strong>Abschleppen</strong> rechnen. Werden durch das Falschparken
          Rettungskräfte behindert, können sogar straf­rechtliche Konsequenzen drohen.
          Halte Dich daher an die Verkehrsregeln – sie schützen Dich und andere.
        </p>
      </section>
    </div>
  );
}
