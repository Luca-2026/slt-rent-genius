// Gezielter Re-Run für 14 Cluster-IDs mit verschärftem Differenzierungs-Prompt.
// Überschreibt Cache-Files. Anschließend muss mergeIntoSEOData.mjs erneut laufen.

import fs from "node:fs";
import path from "node:path";

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const MODEL = "google/gemini-3-flash-preview";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MAX_ATTEMPTS = 3;
const RESULTS_DIR = "scripts/.cache/seo-results";
if (!LOVABLE_API_KEY) { console.error("LOVABLE_API_KEY fehlt"); process.exit(1); }

const products = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json","utf8"));
const productMap = new Map(products.map(p=>[p.id,p]));

// === Cluster-spezifisches Profil ===
// size_class: kompakte Charakterisierung (Volumen + Nutzlast)
// must_use_cases: ID-eigene, NICHT austauschbare Use-Case-Hinweise (Bau/Privat/Event)
// differentiator: Pflicht-Schlüsselbegriff(e), die im Text vorkommen MÜSSEN
const PROFILES = {
  // ---- PLANE (8) ----
  "planen-s-750": {
    size_class: "Kleinster Planenanhänger, ca. 1,5 m³ Ladevolumen, 750 kg zGG (≈400–500 kg Nutzlast). Für kleine, kompakte Ladung.",
    differentiator: ["klein", "kompakt"],
    bau: "Transport von Werkzeugkoffern, Elektrowerkzeug, kleinen Materialmengen und Verbrauchsmaterial zur Baustelle.",
    privat: "Transport einzelner Pakete, kleinerer Möbelstücke, Heimwerkerbedarf oder Sperrmüll vom Wertstoffhof.",
    event: "Transport von Technikkoffern, kleinem DJ-Equipment oder Standausstattung zu Veranstaltungen.",
  },
  "planen-m-750": {
    size_class: "Mittlerer Planenanhänger M, ca. 2,5 m³ Ladevolumen, 750 kg zGG. Zwischengröße für moderate Ladung.",
    differentiator: ["M", "mittlere"],
    bau: "Transport von Handmaschinen, Putzmaterial in Gebinden und mittleren Werkzeugmengen zwischen Lager und Baustelle.",
    privat: "Studentenumzug, Transport einzelner Möbel oder Gartengeräte, Abholung von Möbelstücken aus dem Möbelhaus.",
    event: "Transport von Cateringbedarf, Bestuhlungs-Komponenten oder Standmaterial mittlerer Größe.",
  },
  "planen-l-750": {
    size_class: "Großer Planenanhänger L, ca. 3,5 m³ Ladevolumen, 750 kg zGG. Volumenstark, aber begrenzte Nutzlast – ideal für leichteres Sperrgut.",
    differentiator: ["L", "groß", "Volumen"],
    bau: "Transport voluminöser, leichter Materialien wie Dämmstoffe, Verschalungsmaterial oder leichte Trockenbau-Elemente.",
    privat: "Kleinerer Umzug einer 1-Zimmer-Wohnung, Transport mehrerer Möbelstücke oder voluminösen Gartenmaterials.",
    event: "Transport von Faltzelt-Sets, Stehtischen und Bestuhlung in größerer Stückzahl.",
  },
  "planen-xl-750": {
    size_class: "XL Planenanhänger, ca. 4,5 m³ Ladevolumen, 750 kg zGG. Sehr volumenstark, strikt für leichtes Sperrgut.",
    differentiator: ["XL"],
    bau: "Transport leichter, sperriger Bauteile wie Verpackungsmaterial, Dämmplatten oder Profile.",
    privat: "Umzug einer kleinen Wohnung mit voluminösem Hausrat oder Transport großer, leichter Möbelstücke wie Kleiderschränke.",
    event: "Transport kompletter Stand-Sets, Faltpavillon-Konstruktionen oder Theke samt Zubehör.",
  },
  "planen-xxl-750": {
    size_class: "XXL Planenanhänger, ca. 5,5 m³ Ladevolumen, 750 kg zGG. Maximaler Volumen-Anhänger der 750-kg-Klasse – ausschließlich für sehr leichte, sperrige Ladung.",
    differentiator: ["XXL", "leicht", "sperrig"],
    bau: "Transport sehr voluminöser Leichtbauteile, Verpackungseinheiten oder Verschnittmaterial in großer Menge.",
    privat: "Wohnungsumzug mit viel leichtem Hausrat, Transport von Kleiderschränken, Matratzen oder Fahrrädern in größerer Zahl.",
    event: "Transport kompletter Pavillon-Aufbauten inklusive Boden, Wänden und leichter Möblierung.",
  },
  "planen-1300": {
    size_class: "Planenanhänger 1300 kg zGG. Höhere Nutzlast als die 750-kg-Modelle, geeignet für schwerere Ladung bei mittlerem Volumen.",
    differentiator: ["1300", "Nutzlast"],
    bau: "Transport von Sackware (Zement, Mörtel), Werkzeug-Sets oder Material mit höherem Gewicht zur Baustelle.",
    privat: "Wohnungsumzug mit schwererem Mobiliar, Transport schwerer Gartenmaterialien wie Pflastersteine oder Erde in Säcken.",
    event: "Transport von Veranstaltungstechnik mit höherem Gewicht, etwa Lautsprecheranlagen, Bühnenpodeste oder Stromverteiler.",
  },
  "planen-3500": {
    size_class: "Planenanhänger 3500 kg zGG. Profi-Klasse mit hoher Nutzlast für schweres und voluminöses Material zugleich.",
    differentiator: ["3500", "Profi", "Gewerbe"],
    bau: "Gewerblicher Materialtransport: Paletten mit Steinen, Estrich, Putz oder vorgefertigten Bauteilen zwischen Lager und Baustelle.",
    privat: "Größerer Umzug mit komplettem Hausrat oder Transport schwerer Materialien für ein eigenes Bauprojekt – passender Führerschein vorausgesetzt.",
    event: "Transport kompletter Bühnen- oder Tontechnik-Sets samt Cases zu Festivals und größeren Veranstaltungen.",
  },
  "planen-xxl-3500": {
    size_class: "Größter Planenanhänger mit XXL-Volumen und 3500 kg zGG. Kombiniert maximales Volumen mit maximaler Nutzlast – Profi-Logistik.",
    differentiator: ["XXL", "3500", "Profi"],
    bau: "Logistik-Transport ganzer Paletten-Sets, kompletter Bauteile oder vorgefertigter Wandelemente.",
    privat: "Komplettumzug eines Einfamilienhauses bei einer einzigen Fahrt – passender Führerschein vorausgesetzt.",
    event: "Komplette Tournee-Logistik: Transport ganzer Backline-Setups, Bühnenkomponenten und Veranstaltungstechnik.",
  },
  // ---- AUTOTRANSPORT (3) ----
  "autotransport-1500": {
    size_class: "Autotransporter mit 1500 kg zGG. Leichte Klasse – geeignet für Kleinwagen, Roadster und leichte Klassiker.",
    differentiator: ["1500", "Kleinwagen"],
    bau: "—",
    privat: "Überführung von Kleinwagen, Cabrios oder leichten Oldtimern, etwa nach einem Privatkauf oder zur Werkstatt.",
    event: "Transport von Kleinwagen, Show-Fahrzeugen oder Rallye-Kleinwagen zu Treffen und Veranstaltungen.",
  },
  "autotransport-2700": {
    size_class: "Autotransporter mit 2700 kg zGG. Mittlere Klasse – geeignet für Mittelklassewagen, kompakte SUVs und schwerere Limousinen.",
    differentiator: ["2700", "Mittelklasse", "SUV"],
    bau: "—",
    privat: "Überführung von Mittelklassewagen, kompakten SUVs oder Pannenfahrzeugen mit höherem Gewicht.",
    event: "Transport schwererer Fahrzeuge zu Auto-Treffen, Tracks oder Show-Events.",
  },
  "autotransportkipp-2700": {
    size_class: "Autotransporter mit Kippfunktion, 2700 kg zGG. Die kippbare Ladefläche ersetzt klassische Auffahrrampen und ermöglicht das Aufladen tiefergelegter Fahrzeuge.",
    differentiator: ["Kippfunktion", "kippbar", "ohne Rampen"],
    bau: "—",
    privat: "Überführung tiefergelegter Sportwagen oder Tuning-Fahrzeuge, die mit klassischen Rampen nicht aufgeladen werden können – die Kippfunktion ermöglicht ein flaches Auffahren.",
    event: "Transport von Show-Cars und tiefergelegten Tuning-Fahrzeugen zu Treffen, ohne Risiko des Aufsetzens beim Aufladen dank kippbarer Ladefläche.",
  },
  // ---- KASTEN (3) ----
  "kasten-750": {
    size_class: "Klassischer offener Kastenanhänger, 750 kg zGG. Offene Ladefläche ohne Witterungsschutz, ohne Aufbau für sperriges Material.",
    differentiator: ["offen", "klein"],
    bau: "Transport von kleinen Mengen Schüttgut, Bauschutt oder Werkzeug auf der Baustelle – auch ohne BE-Führerschein.",
    privat: "Hofarbeiten, Transport von Erde, Mulch, Pflastersteinen oder kleinen Mengen Bauschutt zum Wertstoffhof.",
    event: "—",
  },
  "kasten-laubgitter-750": {
    size_class: "Kastenanhänger 750 kg zGG mit Laubgitter-Aufsatz. Erweiterte Ladehöhe speziell für sperriges, leichtes Material.",
    differentiator: ["Laubgitter", "Aufsatz"],
    bau: "Transport von Verschnitt, Verpackungsmaterial oder Dämmstoffresten dank erhöhter Seitenwände.",
    privat: "Laubabfuhr im Herbst, Transport von Grünschnitt, Heckenschnitt oder Gartenabfällen zum Wertstoffhof.",
    event: "—",
  },
  "kasten-laubgitter-1300": {
    size_class: "Kastenanhänger 1300 kg zulässiges Gesamtgewicht mit Laubgitter-Aufsatz. Größere Variante mit höherer Nutzlast und mehr Volumen für schwereres Sperrmaterial. WICHTIG: Erwähne KEINE anderen Gewichtsklassen oder Vergleichszahlen wie 750 kg – nur 1300 kg ist relevant.",
    differentiator: ["Laubgitter", "1300"],
    bau: "Transport größerer Mengen an Verschnitt, leichten Abbruchmaterialien oder Dämmstoffen in einer Fuhre.",
    privat: "Großzügige Garten-Entrümpelung, Transport großer Mengen Grünschnitt oder kompletter Heckenrückschnitte.",
    event: "—",
  },
};

function buildPrompt(product, profile) {
  const specsTxt = product.specifications
    ? Object.entries(product.specifications).map(([k,v])=>`- ${k}: ${v}`).join("\n")
    : "(keine)";

  const useCaseLines = [
    profile.bau && profile.bau !== "—" ? `BAU (verpflichtend an dieser ID-Variante orientieren): ${profile.bau}` : "BAU: leerer String (für dieses Produkt nicht relevant).",
    profile.privat && profile.privat !== "—" ? `PRIVAT (verpflichtend an dieser ID-Variante orientieren): ${profile.privat}` : "PRIVAT: leerer String.",
    profile.event && profile.event !== "—" ? `EVENT (verpflichtend an dieser ID-Variante orientieren): ${profile.event}` : "EVENT: leerer String.",
  ].join("\n");

  return `Du schreibst sachliche, faktentreue Produkttexte für einen B2B/B2C-Mietkatalog (NRW).

WICHTIG: Dies ist ein Re-Run, weil die vorherige Version dieses Produkts ZU ÄHNLICH zu seinen Geschwister-Varianten war.
Deine wichtigste Aufgabe ist DIFFERENZIERUNG anhand der unten genannten Größen-/Nutzlast-/Funktions-Klasse.

PRODUKT-FAKTEN (NUR DIESE NUTZEN, NICHTS ERFINDEN):
- Name: ${product.name}
- Hersteller/Modell: ${product.modelName || "(nicht angegeben)"}
- Kurzbeschreibung: ${product.description || "(keine)"}
- Detailbeschreibung: ${product.detailedDescription || "(keine)"}
- Subkategorie: ${product.category || "(unbekannt)"}
- Specs:
${specsTxt}

GRÖSSEN-/VARIANTEN-KLASSE (zwingend in metaDescription, h2s und useCases erkennbar machen):
${profile.size_class}

DIFFERENZIERUNGS-PFLICHT-BEGRIFFE (mindestens einer dieser Begriffe muss in metaTitle ODER metaDescription vorkommen):
${profile.differentiator.join(", ")}

USE-CASE-LEITLINIEN — strikt an dieser Variante orientieren, NICHT generische Anhänger-Floskeln:
${useCaseLines}

REGELN:
1. Erfinde KEINE Maße/Gewichte/Leistungen/Zertifizierungen/Normen, die nicht in den Fakten stehen.
2. Use Cases müssen die Größen-/Nutzlast-/Funktions-Spezifik dieses Produkts widerspiegeln (z.B. "kompakt", "XXL-Volumen", "1300 kg Nutzlast", "Kippfunktion ohne Rampen") – KEINE austauschbaren Anhänger-Allgemeinplätze.
3. Keine Preise, Mietkonditionen, Lieferzeiten.
4. Keine Werbephrasen ("besser als", "marktführend", "Premiumqualität", "TÜV-zertifiziert").
5. Sprache: sachliches Deutsch, neutrale Anrede.
6. metaTitle: max 60 Zeichen, enthält Produktname.
7. metaDescription: max 155 Zeichen.
8. h2s: 3–4 Section-Headlines, mindestens eine davon muss die Größen-/Varianten-Klasse referenzieren.
9. useCaseBau/Privat/Event: 1–2 Sätze oder leerer String – klar an oben genannten Use-Case-Leitlinien orientiert.
10. faq: genau 3 Einträge, faktentreu, mindestens eine FAQ muss die Größen-/Nutzlast-/Funktions-Spezifik dieses Modells aufgreifen.

Antworte NUR als JSON-Objekt:
{"metaTitle":"...","metaDescription":"...","h2s":["..."],"useCaseBau":"...","useCasePrivat":"...","useCaseEvent":"...","faq":[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]}`;
}

// === Validator (vom Batch-Generator übernommen, leicht entschärft: Differenzierungs-Pflicht statt Spec-Härte) ===
const UNIT_ALIAS = { "watt":"w","w":"w","liter":"l","l":"l","kilogramm":"kg","kg":"kg","tonnen":"t","t":"t","millimeter":"mm","mm":"mm","zentimeter":"cm","cm":"cm","meter":"m","m":"m","volt":"v","v":"v","ampere":"a","a":"a","kva":"kva","kw":"kw","ah":"ah","hertz":"hz","hz":"hz","u/min":"rpm","rpm":"rpm","min-1":"rpm","1/min":"rpm","bar":"bar","°c":"°c","°":"°" };
function normalizeNumber(s){s=s.trim();if(s.includes(".")&&s.includes(","))s=s.replace(/\./g,"").replace(",",".");else if(s.includes(",")){const p=s.split(",");if(p.length===2&&p[1].length===3&&/^\d+$/.test(p[1]))s=s.replace(/,/g,"");else s=s.replace(",",".");}else if(s.includes(".")){const p=s.split(".");if(p.length===2&&p[1].length===3)s=s.replace(/\./g,"");}return parseFloat(s);}
const normalizeUnit=u=>UNIT_ALIAS[u.toLowerCase().trim()]||u.toLowerCase().trim();
function toCanonical(num,unit){if(unit==="m")return{val:num*1000,base:"mm"};if(unit==="cm")return{val:num*10,base:"mm"};if(unit==="mm")return{val:num,base:"mm"};if(unit==="t")return{val:num*1000,base:"kg"};if(unit==="kg")return{val:num,base:"kg"};return{val:num,base:unit};}
function extractMeasurements(t){const re=/(\d+(?:[.,]\d+)*)\s*(Watt|W\b|Volt|V\b|Ampere|A\b|kVA|kW|Liter|l\b|Kilogramm|kg|Millimeter|mm|Zentimeter|cm|Meter|m\b|Tonnen|t\b|U\/min|min-1|1\/min|rpm|Hertz|Hz|Ah|bar|°C|°)/gi;const out=[];let m;while((m=re.exec(t))!==null){const n=normalizeNumber(m[1]);const u=normalizeUnit(m[2]);if(isNaN(n))continue;out.push({num:n,unit:u,canonical:toCanonical(n,u),raw:m[0]});}return out;}
function tokenizeText(t){return new Set(t.toLowerCase().match(/[a-z0-9äöüß][a-z0-9äöüß-]{2,}/gi)||[]);}
const STD_WL=["230v","400v","50hz","16a","32a","63a","125a"];
const BANNED=[/\bzertifizier(t|ung)\b/i,/\bDIN[\s-]?\d+/i,/\bISO[\s-]?\d+/i,/\bTÜV\b/i,/\bmarktführend\b/i];

function validate(g, p, profile) {
  const issues = [];
  const fullText = [g.metaTitle, g.metaDescription, ...(g.h2s||[]), g.useCaseBau, g.useCasePrivat, g.useCaseEvent, ...(g.faq||[]).map(f=>`${f.question} ${f.answer}`)].filter(Boolean).join(" ");
  // Profil-Inputs (size_class + Use-Case-Hinweise) gelten als gültige Faktenbasis,
  // weil sie von uns kuratiert in den Prompt eingespeist werden.
  const profileText = [profile.size_class, profile.bau, profile.privat, profile.event].filter(x=>x&&x!=="—").join(" ");
  const inputText = [p.name, p.modelName, p.description, p.detailedDescription, ...Object.entries(p.specifications||{}).map(([k,v])=>`${k} ${v}`), profileText].filter(Boolean).join(" ");
  const inputM = extractMeasurements(inputText);
  const allowedTokens = tokenizeText(inputText);

  for (const om of extractMeasurements(fullText)) {
    const norm = `${om.num}${om.unit}`;
    if (STD_WL.includes(norm.toLowerCase().replace(/\s/g,""))) continue;
    const match = inputM.find(im=>{
      if(im.canonical.base!==om.canonical.base)return false;
      const a=im.canonical.val,b=om.canonical.val;
      if(a===0&&b===0)return true;
      const tol=Math.max(Math.abs(a),Math.abs(b))*0.02;
      return Math.abs(a-b)<=tol;
    });
    if (!match) {
      const rd=String(om.num).replace(/\..*/,"");
      if (allowedTokens.has(rd)) continue;
      issues.push(`Erfundene Spec: "${om.raw}"`);
    }
  }
  for (const re of BANNED) { if (re.test(fullText) && !re.test(inputText)) issues.push(`Verbotene Behauptung: ${re}`); }

  // Differenzierungs-Check: mind. 1 differentiator-Begriff in title oder description
  const titleDesc = `${g.metaTitle} ${g.metaDescription}`.toLowerCase();
  const hasDiff = profile.differentiator.some(d => titleDesc.includes(d.toLowerCase()));
  if (!hasDiff) issues.push(`Differentiator fehlt (erwartet: ${profile.differentiator.join("/")})`);

  const wc = fullText.split(/\s+/).filter(Boolean).length;
  if (wc < 80) issues.push(`Zu kurz: ${wc}w`);
  if (wc > 400) issues.push(`Zu lang: ${wc}w`);
  return { ok: issues.length===0, issues, wordCount: wc };
}

async function callAI(prompt) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization:`Bearer ${LOVABLE_API_KEY}`, "Content-Type":"application/json" },
    body: JSON.stringify({ model: MODEL, messages: [{ role:"user", content: prompt }] }),
  });
  if (!resp.ok) throw new Error(`${resp.status}`);
  const d = await resp.json();
  let txt = d.choices?.[0]?.message?.content || "";
  txt = txt.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/i,"").trim();
  return JSON.parse(txt);
}

let okCount=0, failed=[];
for (const id of Object.keys(PROFILES)) {
  const product = productMap.get(id);
  if (!product) { console.log(`?? ${id} fehlt in products-full`); continue; }
  const profile = PROFILES[id];
  let res=null, lastIssues=[];
  for (let a=1; a<=MAX_ATTEMPTS; a++) {
    try {
      const gen = await callAI(buildPrompt(product, profile));
      const v = validate(gen, product, profile);
      if (v.ok) { res = { id, generated: gen, attempt:a, wordCount:v.wordCount, rerun:true }; break; }
      lastIssues = v.issues;
    } catch(e) { lastIssues=[e.message]; }
  }
  if (res) {
    fs.writeFileSync(path.join(RESULTS_DIR, `${id}.json`), JSON.stringify(res, null, 2));
    okCount++;
    console.log(`  ✓ ${id}  (attempt ${res.attempt}, ${res.wordCount}w)`);
  } else {
    failed.push({ id, issues: lastIssues });
    console.log(`  ✗ ${id}  →  ${lastIssues.slice(0,2).join("; ")}`);
  }
}
console.log(`\nRe-Run fertig: ok=${okCount} failed=${failed.length}`);
if (failed.length) console.log(JSON.stringify(failed, null, 2));
