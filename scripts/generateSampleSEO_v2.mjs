// Probe-Generator V2 — Validator entschärft.
// Normalisierungen:
//  - Tausenderseparator entfernt (1.000 = 1000 = 1,000)
//  - Einheiten-Aliase normalisiert (Watt=W, Liter=l, Kilogramm=kg, Millimeter=mm, …)
//  - Whitelist Tokens aus name/modelName + specifications-VALUES
//  - Rundungs-Toleranz mm↔m, mm↔cm, kg↔t (innerhalb ±2% akzeptiert)
//  - Standard-Stromnetz-Werte gewhitelistet

import fs from "node:fs";

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const MODEL = "google/gemini-3-flash-preview";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

if (!LOVABLE_API_KEY) { console.error("LOVABLE_API_KEY fehlt"); process.exit(1); }

// === USE_CASE_LIBRARY laden ===
function loadUseCaseLibrary() {
  const src = fs.readFileSync("src/data/useCaseLibrary.ts", "utf8");
  const lib = {};
  const blockRe = /(?:^|\n)\s+(?:"([^"]+)"|([a-zA-Z_][\w-]*))\s*:\s*\{\s*\n([\s\S]*?)\n\s+\},/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const key = m[1] || m[2];
    const body = m[3];
    const pool = { bauProfi: [], privatGarten: [], eventGastronomie: [] };
    for (const f of Object.keys(pool)) {
      const re = new RegExp(`${f}\\s*:\\s*\\[([\\s\\S]*?)\\]`);
      const mm = body.match(re);
      if (mm) pool[f] = [...mm[1].matchAll(/"([^"]+)"/g)].map(x => x[1]);
    }
    lib[key] = pool;
  }
  return lib;
}

const UCL = loadUseCaseLibrary();
const allProducts = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json", "utf8"));

// === NORMALISIERUNG ===
const UNIT_ALIAS = {
  "watt": "w", "w": "w",
  "liter": "l", "l": "l",
  "kilogramm": "kg", "kg": "kg",
  "tonnen": "t", "t": "t",
  "millimeter": "mm", "mm": "mm",
  "zentimeter": "cm", "cm": "cm",
  "meter": "m", "m": "m",
  "volt": "v", "v": "v",
  "ampere": "a", "a": "a",
  "kva": "kva", "kw": "kw", "ah": "ah",
  "hertz": "hz", "hz": "hz",
  "u/min": "rpm", "rpm": "rpm", "min-1": "rpm", "1/min": "rpm",
  "bar": "bar",
  "°c": "°c", "°": "°",
};

function normalizeNumber(rawNum) {
  // "1.176" → 1176 ; "1,82" → 1.82 ; "1000" → 1000
  // Wenn Punkt UND Komma vorhanden: deutsches Format → Punkt = Tausender, Komma = Dezimal
  let s = rawNum.trim();
  if (s.includes(".") && s.includes(",")) {
    s = s.replace(/\./g, "").replace(",", ".");
  } else if (s.includes(",")) {
    // Komma: könnte Dezimal sein (1,5) oder Tausender (1,000) — Heuristik: 3 Ziffern nach Komma → Tausender
    const parts = s.split(",");
    if (parts.length === 2 && parts[1].length === 3 && /^\d+$/.test(parts[1])) {
      s = s.replace(/,/g, "");
    } else {
      s = s.replace(",", ".");
    }
  } else if (s.includes(".")) {
    // Punkt: 3-stellig nach Punkt → Tausender; sonst Dezimal
    const parts = s.split(".");
    if (parts.length === 2 && parts[1].length === 3) {
      s = s.replace(/\./g, "");
    }
  }
  return parseFloat(s);
}

function normalizeUnit(u) {
  return UNIT_ALIAS[u.toLowerCase().trim()] || u.toLowerCase().trim();
}

// Konvertiere zu kanonischer Basiseinheit für Toleranz-Vergleich
function toCanonical(num, unit) {
  // Längen → mm
  if (unit === "m") return { val: num * 1000, base: "mm" };
  if (unit === "cm") return { val: num * 10, base: "mm" };
  if (unit === "mm") return { val: num, base: "mm" };
  // Masse → kg
  if (unit === "t") return { val: num * 1000, base: "kg" };
  if (unit === "kg") return { val: num, base: "kg" };
  // Volumen → l
  if (unit === "l") return { val: num, base: "l" };
  // Sonst: nicht konvertierbar
  return { val: num, base: unit };
}

function extractMeasurements(text) {
  // Fängt z.B. "1.176 kg", "1820 mm", "16 l", "230 V"
  const re = /(\d+(?:[.,]\d+)*)\s*(Watt|W\b|Volt|V\b|Ampere|A\b|kVA|kW|Liter|l\b|Kilogramm|kg|Millimeter|mm|Zentimeter|cm|Meter|m\b|Tonnen|t\b|U\/min|min-1|1\/min|rpm|Hertz|Hz|Ah|bar|°C|°)/gi;
  const out = [];
  let m;
  while ((m = re.exec(text)) !== null) {
    const num = normalizeNumber(m[1]);
    const unit = normalizeUnit(m[2]);
    if (isNaN(num)) continue;
    out.push({ num, unit, canonical: toCanonical(num, unit), raw: m[0] });
  }
  return out;
}

function tokenizeText(text) {
  // Wörter ≥ 3 Zeichen, lowercased
  return new Set(text.toLowerCase().match(/[a-z0-9äöüß][a-z0-9äöüß-]{2,}/gi) || []);
}

const STD_WHITELIST = ["230v", "400v", "50hz", "16a", "32a", "63a", "125a"];

function validate(generated, product) {
  const issues = [];
  const fullText = [
    generated.metaTitle, generated.metaDescription,
    ...(generated.h2s || []),
    generated.useCaseBau, generated.useCasePrivat, generated.useCaseEvent,
    ...(generated.faq || []).map(f => `${f.question} ${f.answer}`),
  ].filter(Boolean).join(" ");

  // === Erlaubte Maße aus Input (alle Quellen) ===
  const inputText = [
    product.name, product.modelName, product.description, product.detailedDescription,
    ...Object.entries(product.specifications || {}).map(([k, v]) => `${k} ${v}`),
  ].filter(Boolean).join(" ");
  const inputMeasurements = extractMeasurements(inputText);

  // === Erlaubte Tokens ===
  const allowedTokens = tokenizeText([product.name, product.modelName, product.description, product.detailedDescription, ...Object.values(product.specifications || {})].filter(Boolean).join(" "));

  // === Output-Maße prüfen ===
  const outputMeasurements = extractMeasurements(fullText);
  for (const om of outputMeasurements) {
    const norm = `${om.num}${om.unit}`;
    if (STD_WHITELIST.includes(norm.toLowerCase().replace(/\s/g, ""))) continue;

    // Match in Input mit ±2% Toleranz auf kanonischer Einheit
    const match = inputMeasurements.find(im => {
      if (im.canonical.base !== om.canonical.base) return false;
      const a = im.canonical.val, b = om.canonical.val;
      if (a === 0 && b === 0) return true;
      const tolerance = Math.max(Math.abs(a), Math.abs(b)) * 0.02;
      return Math.abs(a - b) <= tolerance;
    });
    if (!match) {
      // Letzte Chance: kommt die rohe Zahl als Token irgendwo im Input vor?
      const rawDigits = String(om.num).replace(/\..*/, "");
      if (allowedTokens.has(rawDigits)) continue;
      issues.push(`Erfundene Spec: "${om.raw}"`);
    }
  }

  // === Hersteller-Behauptungen ===
  const knownBrands = ["Bosch", "Bobcat", "Doosan", "Kärcher", "Wacker", "Stihl", "Husqvarna", "Honda", "Yamaha", "Atlas", "Hilti", "Ford", "Manfrotto", "Milos", "Mennekes", "Eibenstock", "Einhell", "ADJ"];
  const brandSafeText = `${product.name || ""} ${product.modelName || ""} ${Object.entries(product.specifications || {}).map(([k, v]) => `${k}:${v}`).join(" ")}`;
  for (const b of knownBrands) {
    if (new RegExp(`\\b${b}\\b`, "i").test(fullText) && !new RegExp(`\\b${b}\\b`, "i").test(brandSafeText)) {
      issues.push(`Marke "${b}" erfunden (nicht in name/modelName/specs)`);
    }
  }

  // === Verbotene Werbephrasen ===
  const banned = [/\bzertifizier(t|ung)\b/i, /\bDIN[\s-]?\d+/i, /\bISO[\s-]?\d+/i, /\bTÜV\b/i, /\bmarktführend\b/i, /\bweltweit führend\b/i];
  for (const re of banned) {
    if (re.test(fullText) && !re.test(inputText)) {
      issues.push(`Verbotene Behauptung: ${re}`);
    }
  }

  // === Wortzählung ===
  const wc = fullText.split(/\s+/).filter(Boolean).length;
  if (wc < 80) issues.push(`Zu kurz: ${wc} Wörter`);
  if (wc > 400) issues.push(`Zu lang: ${wc} Wörter`);

  return { ok: issues.length === 0, issues, wordCount: wc };
}

// === Prompt ===
function buildPrompt(product) {
  const cat = product.category || "(unbekannt)";
  const usePool = UCL[cat] || { bauProfi: [], privatGarten: [], eventGastronomie: [] };
  const specsTxt = product.specifications
    ? Object.entries(product.specifications).map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "(keine)";
  return `Du schreibst sachliche, faktentreue Produkttexte für einen B2B/B2C-Mietkatalog (NRW).

PRODUKT-FAKTEN (NUR DIESE NUTZEN, NICHTS ERFINDEN):
- Name: ${product.name}
- Hersteller/Modell: ${product.modelName || "(nicht angegeben)"}
- Kurzbeschreibung: ${product.description || "(keine)"}
- Detailbeschreibung: ${product.detailedDescription || "(keine)"}
- Subkategorie: ${cat}
- Specs:
${specsTxt}

ERLAUBTE USE CASES (NUR DARAUS WÄHLEN, NICHTS HINZUERFINDEN):
${JSON.stringify(usePool, null, 2)}

REGELN:
1. Erfinde KEINE Maße/Gewichte/Leistungen/Zertifizierungen/Normen, die nicht in den Fakten stehen.
2. Use Cases AUSSCHLIESSLICH aus der Liste oben. Falls eine Liste leer ist, gib für das jeweilige Feld einen leeren String zurück.
3. Keine Preise, Mietkonditionen, Lieferzeiten.
4. Keine vergleichenden Werbephrasen ("besser als", "marktführend", "Premiumqualität", "TÜV-zertifiziert" o. ä.).
5. Sprache: sachliches Deutsch, neutrale Anrede (kein "Du"/"Sie").
6. metaTitle: max 60 Zeichen, enthält Produktname.
7. metaDescription: max 155 Zeichen.
8. h2s: 3–4 Section-Headlines.
9. useCaseBau/Privat/Event: jeweils 1–2 Sätze, oder leerer String.
10. faq: genau 3 Einträge, faktentreu.

Antworte NUR als JSON-Objekt, kein Codeblock-Fence:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "h2s": ["..."],
  "useCaseBau": "...",
  "useCasePrivat": "...",
  "useCaseEvent": "...",
  "faq": [{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]
}`;
}

async function callAI(prompt) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, messages: [{ role: "user", content: prompt }] }),
  });
  if (!resp.ok) throw new Error(`${resp.status}: ${(await resp.text()).slice(0, 200)}`);
  const data = await resp.json();
  let txt = data.choices?.[0]?.message?.content || "";
  txt = txt.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(txt);
}

const sampleIds = [
  "bobcat-e10z",
  "planen-1300",
  "aggregat-2-8kva",
  "partyzelt-3x3m",
  "bosch-handkreissaege-gks18v-57g",
];

const results = [];
for (const id of sampleIds) {
  const product = allProducts.find(p => p.id === id);
  if (!product) { console.log(`?? ${id} not found`); continue; }
  console.log(`\n──── ${id} (${product.name}) ────`);
  const prompt = buildPrompt(product);
  let res = null, lastIssues = [];
  for (let a = 1; a <= 3; a++) {
    try {
      const gen = await callAI(prompt);
      const v = validate(gen, product);
      if (v.ok) {
        console.log(`  ✓ OK Versuch ${a} (${v.wordCount} Wörter)`);
        res = { product, generated: gen, attempt: a, wordCount: v.wordCount };
        break;
      } else {
        console.log(`  ✗ V${a}: ${v.issues.slice(0, 4).join("; ")}${v.issues.length > 4 ? "; …" : ""}`);
        lastIssues = v.issues;
      }
    } catch (e) {
      console.log(`  ✗ V${a} Fehler: ${e.message}`);
      lastIssues = [e.message];
    }
  }
  results.push(res || { product, skipped: true, lastIssues });
}

fs.writeFileSync("scripts/.cache/sample-results-v2.json", JSON.stringify(results, null, 2));

console.log("\n\n========== ERGEBNISSE V2 ==========");
for (const r of results) {
  console.log(`\n┌─── ${r.product.id}  —  ${r.product.name}`);
  console.log(`│ Kategorie: ${r.product.category || "?"} | Specs: ${Object.keys(r.product.specifications || {}).length}`);
  console.log(`└───`);
  if (r.skipped) { console.log(`SKIP: ${r.lastIssues.join("; ")}`); continue; }
  const g = r.generated;
  console.log(`metaTitle (${g.metaTitle.length}):  ${g.metaTitle}`);
  console.log(`metaDescription (${g.metaDescription.length}):  ${g.metaDescription}`);
  console.log(`h2s:  ${JSON.stringify(g.h2s)}`);
  console.log(`useCaseBau:     ${g.useCaseBau || "(leer)"}`);
  console.log(`useCasePrivat:  ${g.useCasePrivat || "(leer)"}`);
  console.log(`useCaseEvent:   ${g.useCaseEvent || "(leer)"}`);
  console.log(`FAQ:`);
  for (const f of g.faq) console.log(`   Q: ${f.question}\n   A: ${f.answer}`);
  console.log(`(${r.wordCount} Wörter, Versuch ${r.attempt})`);
}
