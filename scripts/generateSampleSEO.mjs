// Probe-Generator: Generiert SEO-Texte für 5 Stichproben-Produkte via Lovable AI Gateway.
// Mit Anti-Halluzinations-Check. KEIN Schreiben in productSEOData.ts in dieser Phase.
//
// Nutzung: node scripts/generateSampleSEO.mjs

import fs from "node:fs";

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
if (!LOVABLE_API_KEY) {
  console.error("LOVABLE_API_KEY nicht gesetzt");
  process.exit(1);
}

const MODEL = "google/gemini-3-flash-preview";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";

// USE_CASE_LIBRARY parsen: Wir laden die TS-Datei textuell.
function loadUseCaseLibrary() {
  const src = fs.readFileSync("src/data/useCaseLibrary.ts", "utf8");
  // Block "export const USE_CASE_LIBRARY: ... = { ... };"
  const start = src.indexOf("USE_CASE_LIBRARY");
  // Wir brauchen es nur für das Lookup im Prompt, also bauen wir es in JS nach via eval-light parsing.
  // Einfachster Weg: dynamic import via ts? Nein, kein TS-Loader. Wir parsen den Body grob.
  // Stattdessen: Wir extrahieren via Regex die Subkategorie-Blöcke.
  const lib = {};
  // Match alphanum oder quoted keys vor `: {`
  const blockRe = /(?:^|\n)\s+(?:"([^"]+)"|([a-zA-Z_][\w-]*))\s*:\s*\{\s*\n([\s\S]*?)\n\s+\},/g;
  let m;
  while ((m = blockRe.exec(src)) !== null) {
    const key = m[1] || m[2];
    const body = m[3];
    const pool = { bauProfi: [], privatGarten: [], eventGastronomie: [] };
    for (const field of Object.keys(pool)) {
      const re = new RegExp(`${field}\\s*:\\s*\\[([\\s\\S]*?)\\]`);
      const mm = body.match(re);
      if (mm) {
        const items = [...mm[1].matchAll(/"([^"]+)"/g)].map(x => x[1]);
        pool[field] = items;
      }
    }
    lib[key] = pool;
  }
  return lib;
}

const USE_CASE_LIBRARY = loadUseCaseLibrary();
console.log(`USE_CASE_LIBRARY geladen: ${Object.keys(USE_CASE_LIBRARY).length} Subkategorien`);

const allProducts = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json", "utf8"));

// Stichproben-Auswahl
const sampleIds = [
  "bobcat-e10z",                    // Minibagger GRÜN
  "planen-1300",                    // Anhänger GELB
  "aggregat-2-8kva",                // Aggregat GRÜN
  "partyzelt-3x3m",                 // Möbel/Zelt GELB
  "bosch-bohrschrauber-gsr12v-15",  // Werkzeug ROT
];
const samples = sampleIds.map(id => {
  const p = allProducts.find(x => x.id === id);
  if (!p) throw new Error(`Produkt nicht gefunden: ${id}`);
  return p;
});

// === Prompt-Builder ===
function buildPrompt(product) {
  const cat = product.category || "(unbekannt)";
  const usePool = USE_CASE_LIBRARY[cat] || { bauProfi: [], privatGarten: [], eventGastronomie: [] };
  const specsTxt = product.specifications
    ? Object.entries(product.specifications).map(([k, v]) => `- ${k}: ${v}`).join("\n")
    : "(keine)";
  const allowedUseCases = JSON.stringify(usePool, null, 2);

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
${allowedUseCases}

REGELN:
1. Erfinde KEINE Maße, Gewichte, Leistungsangaben, Hersteller-Eigenschaften oder Zertifizierungen, die nicht in den Fakten stehen.
2. Wenn ein Spec-Wert nicht im Input steht, erwähne ihn nicht.
3. Use Cases AUSSCHLIESSLICH aus der Liste oben. Falls eine Liste leer ist (z.B. bauProfi: []), lasse useCaseBau leer ("").
4. Keine Preise, Mietkonditionen, Lieferzeiten oder Verfügbarkeits-Behauptungen.
5. Keine vergleichenden/werblichen Behauptungen ("besser als", "Premiumqualität", "marktführend").
6. Sprache: sachliches Deutsch, B2B-tauglich, "Du"-Form vermeiden (neutrale Formulierung).
7. metaTitle: max 60 Zeichen, enthält Produktname.
8. metaDescription: max 155 Zeichen, sachlich.
9. h2s: 3–4 prägnante Section-Headlines.
10. useCaseBau/Privat/Event: jeweils 1–2 Sätze, NUR wenn die zugehörige Use-Case-Liste nicht leer ist; sonst leerer String.
11. faq: genau 3 Einträge, faktentreu zum Produkt.

Antworte als reines JSON-Objekt, keine Erklärung davor/danach, kein Codeblock-Fence:
{
  "metaTitle": "...",
  "metaDescription": "...",
  "h2s": ["...", "...", "..."],
  "useCaseBau": "...",
  "useCasePrivat": "...",
  "useCaseEvent": "...",
  "faq": [
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."},
    {"question": "...", "answer": "..."}
  ]
}`;
}

// === Anti-Halluzinations-Check ===
function validate(generated, product) {
  const issues = [];
  const fullText = [
    generated.metaTitle, generated.metaDescription,
    ...(generated.h2s || []),
    generated.useCaseBau, generated.useCasePrivat, generated.useCaseEvent,
    ...(generated.faq || []).map(f => `${f.question} ${f.answer}`),
  ].join(" ");

  // Spec-Werte aus Input
  const allowedNumbers = new Set();
  const inputText = [
    product.name, product.description || "", product.detailedDescription || "",
    ...Object.values(product.specifications || {}),
  ].join(" ");
  // Extrahiere Zahlen mit Einheit aus Input
  const inputUnits = [...inputText.matchAll(/(\d+[.,]?\d*)\s*(cm|mm|m\b|kg|kVA|kW|V\b|Watt|W\b|l\b|Liter|t\b|U\/min|Hz|bar|°|°C|Ah)/gi)].map(m => `${m[1].replace(",", ".")}${m[2].toLowerCase()}`);
  for (const u of inputUnits) allowedNumbers.add(u);

  // Prüfe Output auf Zahlen mit Einheit, die NICHT im Input sind
  const outputUnits = [...fullText.matchAll(/(\d+[.,]?\d*)\s*(cm|mm|m\b|kg|kVA|kW|V\b|Watt|W\b|l\b|Liter|t\b|U\/min|Hz|bar|°|°C|Ah)/gi)];
  for (const m of outputUnits) {
    const norm = `${m[1].replace(",", ".")}${m[2].toLowerCase()}`;
    if (!allowedNumbers.has(norm)) {
      // Whitelist gängiger Standard-Größen (z.B. 230V/400V Stromnetz)
      if (["230v", "400v", "50hz", "16a", "32a"].includes(norm)) continue;
      issues.push(`Erfundene Spec im Output: ${m[0]} (nicht im Input)`);
    }
  }

  // Hersteller-Behauptungen
  if (!product.modelName && !(product.specifications?.["Hersteller"])) {
    // Wenn keine Marke im Input → keine spezifischen Marken im Output
    const brands = ["Bosch", "Bobcat", "Doosan", "Kärcher", "Wacker", "Stihl", "Husqvarna", "Honda", "Yamaha", "Atlas", "Hilti"];
    for (const b of brands) {
      if (new RegExp(`\\b${b}\\b`, "i").test(fullText) && !new RegExp(`\\b${b}\\b`, "i").test(product.name)) {
        issues.push(`Hersteller "${b}" erwähnt, aber nicht im Input`);
      }
    }
  }

  // Wortzählung Gesamttext (Use-Cases + Meta)
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  if (wordCount < 80) issues.push(`Output zu kurz: ${wordCount} Wörter`);
  if (wordCount > 400) issues.push(`Output zu lang: ${wordCount} Wörter`);

  return { ok: issues.length === 0, issues, wordCount };
}

// === AI Call ===
async function callAI(prompt) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI Gateway ${resp.status}: ${t.slice(0, 200)}`);
  }
  const data = await resp.json();
  let txt = data.choices?.[0]?.message?.content || "";
  // Clean code fences if model insists
  txt = txt.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  return JSON.parse(txt);
}

// === Main ===
console.log(`\nGeneriere ${samples.length} Probe-Texte mit ${MODEL}...\n`);

const results = [];
for (const product of samples) {
  console.log(`\n──── ${product.id} (${product.name}) ────`);
  const prompt = buildPrompt(product);
  let attempt = 0;
  let result = null;
  let lastIssues = [];
  while (attempt < 3) {
    attempt++;
    try {
      const generated = await callAI(prompt);
      const v = validate(generated, product);
      if (v.ok) {
        console.log(`  ✓ Versuch ${attempt} erfolgreich (${v.wordCount} Wörter)`);
        result = { product, generated, attempt, wordCount: v.wordCount };
        break;
      } else {
        console.log(`  ✗ Versuch ${attempt} verworfen: ${v.issues.join("; ")}`);
        lastIssues = v.issues;
      }
    } catch (e) {
      console.log(`  ✗ Versuch ${attempt} Fehler: ${e.message}`);
      lastIssues = [e.message];
    }
  }
  if (!result) {
    console.log(`  ⚠ SKIP nach 3 Versuchen`);
    results.push({ product, skipped: true, lastIssues });
  } else {
    results.push(result);
  }
}

fs.writeFileSync("scripts/.cache/sample-results.json", JSON.stringify(results, null, 2));
console.log("\n\n========== ERGEBNISSE ==========\n");
for (const r of results) {
  console.log(`\n┌─────────────────────────────────────────────────────────────`);
  console.log(`│ ${r.product.id}  —  ${r.product.name}`);
  console.log(`│ Kategorie: ${r.product.category || "?"}  |  Specs: ${Object.keys(r.product.specifications || {}).length}`);
  console.log(`└─────────────────────────────────────────────────────────────`);
  if (r.skipped) {
    console.log(`SKIP: ${r.lastIssues.join("; ")}`);
    continue;
  }
  const g = r.generated;
  console.log(`metaTitle (${g.metaTitle.length}): ${g.metaTitle}`);
  console.log(`metaDescription (${g.metaDescription.length}): ${g.metaDescription}`);
  console.log(`h2s: ${JSON.stringify(g.h2s)}`);
  console.log(`useCaseBau: ${g.useCaseBau || "(leer)"}`);
  console.log(`useCasePrivat: ${g.useCasePrivat || "(leer)"}`);
  console.log(`useCaseEvent: ${g.useCaseEvent || "(leer)"}`);
  console.log(`FAQ:`);
  for (const f of g.faq) {
    console.log(`  Q: ${f.question}`);
    console.log(`  A: ${f.answer}`);
  }
  console.log(`(Wortanzahl: ${r.wordCount}, Versuche: ${r.attempt})`);
}
