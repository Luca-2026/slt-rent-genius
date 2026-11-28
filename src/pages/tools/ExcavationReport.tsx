import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import qrcode from "qrcode-generator";
import { locations } from "@/data/rentalData";
import { locationData } from "@/data/locationData";
import { useCustomerType } from "@/hooks/useCustomerType";
import { formatEuro, priceFor, vatNote } from "@/lib/priceDisplay";
import { shapeVolume, decodeShare, INITIAL_STATE, PROJECTS, SOILS, CRANE_NOTE, TRENCH_SAFETY_DEPTH_M, type Assessment, type Fit } from "@/lib/excavationCalculator";
import { useExcavationModel, productPath, statusLabel, SHAPE_LABELS, shapeText } from "@/components/rental/useExcavationModel";
import { useCalculatorPrices } from "@/components/rental/CalculatorRecommendations";
import { excavationLinePrice } from "@/lib/excavationPrice";
import { shareUrl } from "@/components/rental/ExcavationCalculator";

const BASE = "https://www.slt-rental.de";
const LOGO = "/images/slt-rental-logo.png";
const f = (v: number, d = 1) => v.toLocaleString("de-DE", { minimumFractionDigits: d, maximumFractionDigits: d });
const STATUS_CLS: Record<Fit, string> = { fit: "rep-fit", check: "rep-check", unfit: "rep-unfit" };

const CSS = `
@page { size: A4 portrait; margin: 14mm 14mm 16mm; @bottom-right { content: "Seite " counter(page) " von " counter(pages); font: 8pt Arial, sans-serif; color: #6b7280; } }
html, body { background: #e5e7eb; }
.rep { --b: #00507d; --g: #4b5563; --l: #eef3f7; font: 10pt/1.4 Arial, Helvetica, sans-serif; color: #1f2937; background: #fff; width: 210mm; min-height: 297mm; margin: 12px auto; padding: 14mm; box-sizing: border-box; position: relative; }
.rep * { box-sizing: border-box; }
.rep-wm { position: fixed; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none; z-index: 0; }
.rep-wm img { width: 120mm; opacity: .05; transform: rotate(-18deg); }
.rep > :not(.rep-wm) { position: relative; z-index: 1; }
.rep-head { display: flex; justify-content: space-between; gap: 8mm; align-items: flex-start; border-bottom: 1.2mm solid var(--b); padding-bottom: 4mm; }
.rep-head img { height: 16mm; width: auto; }
.rep h1 { font-size: 19pt; color: var(--b); margin: 0; }
.rep h2 { font-size: 11.5pt; color: var(--b); margin: 5mm 0 2mm; break-after: avoid; }
.rep-sub { color: var(--g); margin: 1mm 0 0; }
.rep-meta { text-align: right; color: var(--g); font-size: 9pt; }
.rep table { width: 100%; border-collapse: collapse; }
.rep td, .rep th { text-align: left; padding: 1.1mm 2mm; border-bottom: .2mm solid #d1d5db; vertical-align: top; }
.rep th { color: var(--g); font-weight: 600; width: 42%; }
.rep tr, .rep-card, .rep-kpi, .rep-box { break-inside: avoid; page-break-inside: avoid; }
.rep-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 3mm; }
.rep-kpi { border: .3mm solid var(--b); border-radius: 2mm; padding: 3mm; background: var(--l); }
.rep-kpi b { display: block; font-size: 15pt; color: var(--b); }
.rep-kpi span { font-size: 8.5pt; color: var(--g); }
.rep-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.5mm; } .rep-grid .rep-card { margin: 0; padding: 2mm; font-size: 8.5pt; } .rep-grid .rep-card img { width: 14mm; height: 14mm; }
.rep-card { display: flex; gap: 4mm; border: .3mm solid #d1d5db; border-radius: 2mm; padding: 3mm; margin-bottom: 2.5mm; }
.rep-card img { width: 22mm; height: 22mm; object-fit: contain; flex: none; border: .2mm solid #e5e7eb; border-radius: 1mm; background: #fff; }
.rep-card a { color: var(--b); font-weight: 700; text-decoration: none; word-break: break-word; }
.rep-tag { display: inline-block; font-size: 8pt; font-weight: 700; border-radius: 1mm; padding: .4mm 1.6mm; margin: 1mm 0; border: .3mm solid; }
.rep-fit { color: #00507d; border-color: #00507d; background: #eef3f7; }
.rep-check { color: #374151; border-color: #6b7280; background: #f3f4f6; border-style: dashed; }
.rep-unfit { color: #374151; border-color: #374151; background: #fff; }
.rep-muted { color: var(--g); font-size: 8.5pt; }
.rep-box { border-left: 1.2mm solid var(--b); background: var(--l); padding: 3mm 4mm; margin-top: 4mm; font-size: 9pt; }
.rep-cta { display: flex; gap: 5mm; justify-content: space-between; align-items: center; border: .4mm solid var(--b); border-radius: 2mm; padding: 4mm; margin-top: 6mm; break-inside: avoid; }
.rep-cta h2 { margin-top: 0; }
.rep-cta svg { width: 26mm; height: 26mm; }
.rep-claim { font-weight: 700; color: var(--b); font-size: 12pt; margin-top: 2mm; }
.rep-bar { position: sticky; top: 0; z-index: 5; display: flex; gap: 8px; justify-content: center; padding: 10px; background: #00507d; }
.rep-bar button { font: 600 14px Arial, sans-serif; padding: 8px 14px; border-radius: 6px; border: 0; background: #fff; color: #00507d; cursor: pointer; }
@media screen and (max-width: 820px) { .rep { width: 100%; min-height: 0; padding: 16px; margin: 0; } .rep-kpis { grid-template-columns: repeat(2, 1fr); } .rep-head { flex-direction: column; } .rep-meta { text-align: left; } }
@media print { html, body { background: #fff; } .rep { width: auto; min-height: 0; margin: 0; padding: 0; } .rep-bar { display: none; } * { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
`;

/** Eigenständiger A4-Projektbericht ohne Website-Rahmen; Inhalt nur aus der geteilten Konfiguration. */
export default function ExcavationReport() {
  const [params] = useSearchParams();
  const locationId = locations.some((l) => l.id === params.get("standort")) ? params.get("standort")! : undefined;
  const decoded = decodeShare(params.get("aushub"));
  const s = decoded ?? INITIAL_STATE;
  const m = useExcavationModel(s, locationId);
  const { c, r, pick, dumpers, bestDumper, byId } = m;
  const { type } = useCustomerType();
  const slugs = [pick.main, pick.compact, pick.strong, bestDumper].filter(Boolean).map((x) => x!.id);
  const prices = useCalculatorPrices(slugs);
  const contact = locationData.find((l) => l.id === locationId);
  const link = shareUrl(s, locationId);
  const qr = useMemo(() => { try { const q = qrcode(0, "L"); q.addData(link); q.make(); return q.createSvgTag({ cellSize: 2, margin: 0, scalable: true }); } catch { return ""; } }, [link]);
  const root = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const printed = useRef(false);
  const today = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "Europe/Berlin" });

  // Erst drucken, wenn Preise und alle Bilder (Logo, Produkte) geladen sind.
  useEffect(() => {
    if (prices.isLoading && slugs.length) return;
    const imgs = [...(root.current?.querySelectorAll("img") ?? [])];
    let alive = true;
    Promise.all(imgs.map((i) => (i.complete ? Promise.resolve() : i.decode().catch(() => undefined)))).then(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [prices.isLoading, slugs.length, m.machines.length]);
  useEffect(() => {
    if (ready && !printed.current && params.get("vorschau") !== "1") { printed.current = true; setTimeout(() => window.print(), 300); }
  }, [ready, params]);

  const price = (id: string) => {
    const p = locationId ? excavationLinePrice(prices.data, id, locationId, 1, c.days) : null;
    return p == null ? "Preis auf Anfrage" : `Richtwert ${formatEuro(priceFor(p, type))} ${vatNote(type)} für ${c.days} ${c.days === 1 ? "Miettag" : "Miettage"}`;
  };
  const card = (label: string, a: Assessment | undefined, withPrice: boolean) => { if (!a || !locationId) return null; const mm = byId(a.id); return (
    <div className="rep-card" key={label + a.id}>
      {mm?.image ? <img src={mm.image} alt={a.name} /> : <div style={{ width: "22mm" }} />}
      <div>
        <div className="rep-muted">{label} · 1 ×</div>
        <a href={`${BASE}${productPath(locationId, a.id)}/`}>{a.name}</a>
        <div><span className={`rep-tag ${STATUS_CLS[a.status]}`}>{a.tooWide ? "Passt nicht durch Zufahrt" : statusLabel(a)}</span> <span className="rep-muted">{mm?.rentware ? "online buchbar" : mm?.onRequest ? "auf Anfrage" : "im Mietkatalog"}</span></div>
        {a.reasons.length > 0 && <div className="rep-muted">{a.reasons.join(" · ")}</div>}
        {withPrice && a.status === "fit" && <div style={{ fontWeight: 600, marginTop: "1mm" }}>{price(a.id)}</div>}
      </div>
    </div>); };
  const shown = new Set([pick.main, pick.compact, pick.strong, pick.smallest].filter(Boolean).map((a) => a!.id));
  const review = [...pick.review, ...pick.unfit].filter((a) => !shown.has(a.id));
  const deep = c.depthM != null && c.depthM > TRENCH_SAFETY_DEPTH_M;

  return (
    <>
      <Helmet><title>Deine Aushubplanung – SLT Rental</title><meta name="robots" content="noindex, nofollow" /><style>{CSS}</style></Helmet>
      <div className="rep-bar"><button type="button" onClick={() => window.print()}>Drucken / PDF speichern</button><button type="button" onClick={() => window.close()}>Schließen</button></div>
      <div className="rep" ref={root} data-ready={ready ? "1" : "0"} data-testid="excavation-report">
        <div className="rep-wm" aria-hidden="true"><img src={LOGO} alt="" /></div>
        <header className="rep-head">
          <div><img src={LOGO} alt="SLT Rental" /><h1 style={{ marginTop: "4mm" }}>Deine Aushubplanung</h1><p className="rep-sub">Projektübersicht &amp; Maschinenempfehlung</p></div>
          <div className="rep-meta">Erstellt am {today}<br />Standort: <strong>{m.locName ?? "noch nicht gewählt"}</strong></div>
        </header>
        {!decoded && params.get("aushub") && <p className="rep-box">Die übergebene Konfiguration war ungültig; der Bericht zeigt die Standardwerte.</p>}

        <h2>Projektparameter</h2>
        <table><tbody>
          <tr><th>Projektart</th><td>{PROJECTS[s.project]}</td></tr>
          {c.shapes.map((x, i) => <tr key={i}><th>Teilfläche {i + 1} – {SHAPE_LABELS[x.kind]}</th><td>{shapeText(x)} = {f(shapeVolume(x), 2)} m³</td></tr>)}
          <tr><th>Bodenart</th><td>{SOILS[s.soil].label}</td></tr>
          <tr><th>Dichte / Auflockerung</th><td>{f(c.density, 2)} t/m³ · {f(c.loosening, 0)} %{s.expert ? " (Expertenwerte)" : " (Planungswerte)"}</td></tr>
          <tr><th>Schmalste Zufahrt</th><td>{c.accessM ? `${f(c.accessM * 100, 0)} cm` : "nicht angegeben"}</td></tr>
          <tr><th>Miettage</th><td>{c.days}</td></tr>
          {s.expert && <tr><th>Füllgrad Mulde</th><td>{f(c.fill * 100, 0)} %</td></tr>}
        </tbody></table>
        {c.invalid.length > 0 && <p className="rep-box">Ungültige Angaben ({c.invalid.join(", ")}) wurden nicht berechnet.</p>}

        <h2>Ergebnis</h2>
        <div className="rep-kpis">
          <div className="rep-kpi"><b>{f(r.bank)} m³</b><span>Gewachsener Boden</span></div>
          <div className="rep-kpi"><b>{f(r.loose)} m³</b><span>Aufgelockerter Boden</span></div>
          <div className="rep-kpi"><b>{f(r.tons)} t</b><span>Geschätztes Erdgewicht</span></div>
          <div className="rep-kpi"><b>{f(r.extra)} m³</b><span>Mehrvolumen durch Auflockerung</span></div>
        </div>
        {bestDumper?.a.trips && <p className="rep-muted" style={{ marginTop: "2mm" }}>Mit {bestDumper.name}: {bestDumper.a.reason}.</p>}

        <h2>Maschinenempfehlung</h2>
        {!locationId ? <p>Wähle im Rechner einen Standort, damit wir passende Maschinen aus dem Standortkatalog zeigen können.</p> : <>
          {card("Empfehlung – nach vorliegenden Daten passend", pick.main, true)}
          {card("Kompaktere Alternative – passend", pick.compact, true)}
          {card("Stärkere Alternative – passend", pick.strong, true)}
          {card("Dumper – passend", bestDumper && { id: bestDumper.id, name: bestDumper.name, status: "fit", ok: true, check: false, reasons: [bestDumper.a.reason] }, true)}
          {card("Kleinster Bagger – zur Orientierung, Eignung nicht bestätigt", pick.smallest, false)}
          {!pick.main && !pick.hints.length && <p>Für deine Angaben können wir keinen Bagger nach vorliegenden Daten bestätigen – bitte stimme das Projekt mit uns ab.</p>}
          {pick.hints.map((h) => <p key={h} className="rep-muted">{h}</p>)}
          {(review.length > 0 || dumpers.some((d) => d.a.status !== "fit")) && <><h2>Alternativen – Eignung prüfen lassen</h2><div className="rep-grid">
            {review.map((a) => card(a.tooWide ? "Passt nicht durch Zufahrt" : a.status === "check" ? "Alternative – Eignung prüfen lassen" : "Nach Daten ungeeignet", a, false))}
            {dumpers.filter((d) => d.a.status !== "fit").map((d) => card("Dumper", { id: d.id, name: d.name, status: d.a.status, ok: d.a.status !== "unfit", check: d.a.status === "check", reasons: [d.a.reason] }, false))}
          </div></>}
          {pick.crane && <p className="rep-muted">{CRANE_NOTE}</p>}
          <p className="rep-muted">Preise: Richtwerte nach unserer Staffel, Stand {today}, ohne Lieferung, Versicherung, Kraftstoff und Kaution; ohne Wochenendtage. Verbindlich ist erst unser Angebot.</p>
        </>}

        <div className="rep-box"><strong>Unverbindliche Planungshilfe.</strong> Alle Werte sind Schätzungen; Dichte und Auflockerung sind allgemeine Planungswerte. {deep ? "Ab 1,25 m Tiefe sind nach DIN 4124 grundsätzlich Böschung oder Verbau nötig, bei ungünstigem Boden auch früher. " : ""}Vor dem Graben Leitungen erkunden und Abstand zu Gebäuden halten.</div>

        <section className="rep-cta">
          <div>
            <h2>Dein Projekt mit SLT Rental umsetzen</h2>
            {contact ? <p>SLT Rental {m.locName}<br />{contact.address}, {contact.city}<br />Tel. {contact.phone} · {contact.email}</p> : <p>Wähle einen Standort: Krefeld, Bonn oder Mülheim an der Ruhr – www.slt-rental.de/kontakt/</p>}
            <p className="rep-muted">Deine Berechnung online öffnen: <a href={link} style={{ color: "#00507d", wordBreak: "break-all" }}>Rechnerkonfiguration</a></p>
            <p className="rep-claim">Sei schlau, miet blau!</p>
          </div>
          {qr && <div aria-label="QR-Code zur Rechnerkonfiguration" dangerouslySetInnerHTML={{ __html: qr }} />}
        </section>
      </div>
    </>
  );
}
