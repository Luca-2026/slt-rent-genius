import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Info, CheckCircle, ShieldAlert } from "lucide-react";

import stecker13pol from "@/assets/icons/stecker-13pol.svg";
import stecker7pol from "@/assets/icons/stecker-7pol.svg";
import schritt1 from "@/assets/icons/schritt-1-ausrichten.svg";
import schritt2 from "@/assets/icons/schritt-2-einstecken.svg";
import schritt3 from "@/assets/icons/schritt-3-verriegeln.svg";
import schritt4 from "@/assets/icons/schritt-4-pruefen.svg";
import schritt5 from "@/assets/icons/schritt-5-funktionspruefung.svg";
import schritt6 from "@/assets/icons/schritt-6-loesen.svg";

interface Props {
  collapsed?: boolean;
  showHeader?: boolean;
}

const steps = [
  {
    nr: 1,
    title: "Ausrichten",
    img: schritt1,
    text: "Suchen Sie die Führungskerbe (Nase) am runden Stecker und das entsprechende Gegenstück an der Fahrzeugdose. Nur wenn Kerbe und Aufnahme übereinstimmen, lässt sich der Stecker einführen. Niemals Gewalt anwenden.",
  },
  {
    nr: 2,
    title: "Einstecken",
    img: schritt2,
    text: "Stecker gerade und gleichmäßig in die Dose drücken — kein Kippen oder Drehen. Spüren Sie ungewöhnlichen Widerstand, prüfen Sie die Ausrichtung. Der Stecker muss vollständig eingeführt sein, bevor Sie verriegeln.",
  },
  {
    nr: 3,
    title: "Verriegeln (nur 13-polig)",
    img: schritt3,
    text: "Beim 13-poligen Stecker das äußere Gehäuse im Uhrzeigersinn drehen, bis es hörbar oder fühlbar einrastet. Beim 7-poligen Stecker gibt es keinen Drehmechanismus — hier zählt nur der feste Sitz durch korrektes Eindrücken.",
  },
  {
    nr: 4,
    title: "Sicherung prüfen",
    img: schritt4,
    text: "Mit leichtem Zug am Gehäuse (nicht am Kabel!) prüfen, ob der Stecker hält. Ein korrekt verriegelter Stecker gibt keinen Millimeter nach. Wackelt er, erneut ausrichten und verriegeln.",
  },
  {
    nr: 5,
    title: "Funktionsprüfung",
    img: schritt5,
    text: "Zündung einschalten und am Anhänger prüfen: Blinker links/rechts, Rücklicht und Bremslicht. Erst wenn alle Lichter funktionieren, ist die Verbindung betriebsbereit. Bei Ausfall Stecker erneut stecken oder Sicherungen prüfen.",
  },
  {
    nr: 6,
    title: "Lösen",
    img: schritt6,
    text: "Beim 13-pol. Stecker das Gehäuse gegen den Uhrzeigersinn drehen, bis die Verriegelung freigibt — dann gerade herausziehen. Beim 7-pol. Stecker direkt herausziehen. Niemals am Kabel ziehen.",
  },
];

const checklistItems = [
  "Führungskerbe ausgerichtet, Stecker vollständig eingesteckt",
  "13-pol.: Gehäuse im Uhrzeigersinn bis zum Einrasten gedreht",
  "Leichter Zugtest — kein Wackeln, kein Nachgeben",
  "Blinker links und rechts am Anhänger leuchten",
  "Rücklicht am Anhänger leuchtet",
  "Bremslicht am Anhänger leuchtet",
  "Nie am Kabel ziehen — nur am Gehäuse anfassen",
];

const hintCards = [
  {
    color: "border-yellow-400/50 bg-yellow-50",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    Icon: AlertTriangle,
    title: "7-pol. Stecker",
    text: "Kein Drehmechanismus — festen Sitz durch leichten Zugtest besonders sorgfältig prüfen.",
  },
  {
    color: "border-primary/30 bg-primary/5",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    Icon: Info,
    title: "Adapter nötig?",
    text: "Auto 13-pol. / Anhänger 7-pol. → Adapter erforderlich. Ohne Adapter kein korrekter Anschluss.",
  },
  {
    color: "border-green-400/50 bg-green-50",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    Icon: CheckCircle,
    title: "Immer prüfen",
    text: "Nach jeder Verbindung: Blinker, Rücklicht, Bremslicht testen — erst dann losfahren.",
  },
  {
    color: "border-destructive/30 bg-destructive/5",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive",
    Icon: ShieldAlert,
    title: "Schutzkappe",
    text: "Dose am Fahrzeug bei Nichtgebrauch mit Kappe schützen — verhindert Rost und Schmutz.",
  },
];

export function AnhaengersteckerAnleitung({ collapsed = false, showHeader = true }: Props) {
  const [checked, setChecked] = useState<boolean[]>(new Array(checklistItems.length).fill(false));
  const [isOpen, setIsOpen] = useState(!collapsed);

  const toggle = (i: number) => {
    setChecked((prev) => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  };

  const content = (
    <div className="space-y-8">
      {/* A — Stecker-Typen */}
      <div>
        <h3 className="text-lg font-bold text-headline mb-4">Stecker-Typen</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-5 flex flex-col items-center text-center">
              <img src={stecker13pol} alt="13-poliger Stecker" className="w-[90px] h-[90px] mb-3" />
              <h4 className="font-semibold text-headline mb-1">13-poliger Stecker</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Standard bei modernen PKW. Runder Stecker mit 12 Pins im Kreis + 1 Mittelpin. Verriegelt aktiv durch Drehen des äußeren Rings im Uhrzeigersinn.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5 flex flex-col items-center text-center">
              <img src={stecker7pol} alt="7-poliger Stecker" className="w-[90px] h-[90px] mb-3" />
              <h4 className="font-semibold text-headline mb-1">7-poliger Stecker</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Ältere Fahrzeuge & Anhänger. Ebenfalls rund, 7 Pins. Führungsnase vorhanden, kein Dreh-Einrasten — festen Sitz manuell prüfen.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* B — 6 Schritte */}
      <div>
        <h3 className="text-lg font-bold text-headline mb-4">Schritt-für-Schritt-Anleitung</h3>
        <div className="space-y-4">
          {steps.map((step) => (
            <Card key={step.nr}>
              <CardContent className="p-4 flex flex-col sm:flex-row items-center sm:items-start gap-4">
                <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center bg-muted rounded-lg">
                  <img src={step.img} alt={`Schritt ${step.nr}: ${step.title}`} className="w-[64px] h-[64px]" />
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-semibold text-headline mb-1">
                    <span className="text-primary mr-1.5">Schritt {step.nr}</span>
                    {step.title}
                  </h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* C — 4 Hinweis-Karten */}
      <div>
        <h3 className="text-lg font-bold text-headline mb-4">Wichtige Hinweise</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {hintCards.map((hint) => (
            <Card key={hint.title} className={`${hint.color}`}>
              <CardContent className="p-4 flex items-start gap-3">
                <div className={`w-9 h-9 rounded-lg ${hint.iconBg} flex items-center justify-center flex-shrink-0`}>
                  <hint.Icon className={`h-4 w-4 ${hint.iconColor}`} />
                </div>
                <div>
                  <h4 className="font-semibold text-headline text-sm mb-0.5">{hint.title}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">{hint.text}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* D — Checkliste */}
      <div>
        <h3 className="text-lg font-bold text-headline mb-4">Checkliste vor der Abfahrt</h3>
        <Card>
          <CardContent className="p-5 space-y-3">
            {checklistItems.map((item, i) => (
              <label
                key={i}
                className={`flex items-start gap-3 cursor-pointer transition-opacity ${checked[i] ? "opacity-60" : ""}`}
              >
                <Checkbox
                  checked={checked[i]}
                  onCheckedChange={() => toggle(i)}
                  className="mt-0.5"
                />
                <span className={`text-sm leading-relaxed ${checked[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>
                  {item}
                </span>
              </label>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  if (showHeader) {
    return (
      <section id="stecker-anleitung" className="scroll-mt-20">
        <h2 className="text-xl lg:text-2xl font-bold text-headline mb-6">
          Anleitung: Stecker richtig anschließen
        </h2>
        {content}
      </section>
    );
  }

  // Collapsible on product pages
  return (
    <details
      open={isOpen}
      onToggle={(e) => setIsOpen((e.target as HTMLDetailsElement).open)}
      className="border border-border rounded-xl overflow-hidden"
    >
      <summary className="flex items-center justify-between px-4 py-3 bg-muted/50 cursor-pointer hover:bg-muted transition-colors font-semibold text-headline text-sm select-none">
        Anleitung: Stecker richtig anschließen
        <span className="text-xs text-muted-foreground ml-2">{isOpen ? "▲" : "▼"}</span>
      </summary>
      <div className="p-4 pt-6">
        {content}
      </div>
    </details>
  );
}
