// Batch-Generator: Verarbeitet die Produkt-IDs aus generation-plan.json
// in Batches, persistiert nach jedem Produkt (resume-fähig), überspringt ROT.
//
// Nutzung:
//   node scripts/generateBatch.mjs <BATCH_INDEX>
// Beispiel: node scripts/generateBatch.mjs 0
//
// Resume: Wenn ein Produkt im Cache existiert, wird es übersprungen.

import fs from "node:fs";
import path from "node:path";

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
const MODEL = "google/gemini-3-flash-preview";
const ENDPOINT = "https://ai.gateway.lovable.dev/v1/chat/completions";
const BATCH_SIZE = 50;
const MAX_ATTEMPTS = 3;
const RESULTS_DIR = "scripts/.cache/seo-results";
const SKIP_LOG = "scripts/.cache/skip-log.json";

if (!LOVABLE_API_KEY) { console.error("LOVABLE_API_KEY fehlt"); process.exit(1); }

const batchIndex = parseInt(process.argv[2] || "0", 10);

fs.mkdirSync(RESULTS_DIR, { recursive: true });

// === Load Library ===
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
const audit = JSON.parse(fs.readFileSync("scripts/.cache/audit.json", "utf8"));
const auditMap = new Map(audit.map(a => [a.id, a.grade]));
const plan = JSON.parse(fs.readFileSync("scripts/.cache/generation-plan.json", "utf8"));

const allTodoIds = [...plan.toGenerateNew, ...plan.toOverwrite];
const total = allTodoIds.length;
const start = batchIndex * BATCH_SIZE;
const end = Math.min(start + BATCH_SIZE, total);
const batch = allTodoIds.slice(start, end);

console.log(`Batch ${batchIndex}: IDs ${start}..${end - 1} of ${total}`);

// === Validator (vom V2 übernommen) ===
const UNIT_ALIAS = { "watt":"w","w":"w","liter":"l","l":"l","kilogramm":"kg","kg":"kg","tonnen":"t","t":"t","millimeter":"mm","mm":"mm","zentimeter":"cm","cm":"cm","meter":"m","m":"m","volt":"v","v":"v","ampere":"a","a":"a","kva":"kva","kw":"kw","ah":"ah","hertz":"hz","hz":"hz","u/min":"rpm","rpm":"rpm","min-1":"rpm","1/min":"rpm","bar":"bar","°c":"°c","°":"°" };

function normalizeNumber(s) {
  s = s.trim();
  if (s.includes(".") && s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if (s.includes(",")) {
    const p = s.split(",");
    if (p.length === 2 && p[1].length === 3 && /^\d+$/.test(p[1])) s = s.replace(/,/g, "");
    else s = s.replace(",", ".");
  } else if (s.includes(".")) {
    const p = s.split(".");
    if (p.length === 2 && p[1].length === 3) s = s.replace(/\./g, "");
  }
  return parseFloat(s);
}
const normalizeUnit = u => UNIT_ALIAS[u.toLowerCase().trim()] || u.toLowerCase().trim();
function toCanonical(num, unit) {
  if (unit === "m") return { val: num*1000, base: "mm" };
  if (unit === "cm") return { val: num*10, base: "mm" };
  if (unit === "mm") return { val: num, base: "mm" };
  if (unit === "t") return { val: num*1000, base: "kg" };
  if (unit === "kg") return { val: num, base: "kg" };
  return { val: num, base: unit };
}
function extractMeasurements(t) {
  const re = /(\d+(?:[.,]\d+)*)\s*(Watt|W\b|Volt|V\b|Ampere|A\b|kVA|kW|Liter|l\b|Kilogramm|kg|Millimeter|mm|Zentimeter|cm|Meter|m\b|Tonnen|t\b|U\/min|min-1|1\/min|rpm|Hertz|Hz|Ah|bar|°C|°)/gi;
  const out = []; let m;
  while ((m = re.exec(t)) !== null) {
    const n = normalizeNumber(m[1]);
    const u = normalizeUnit(m[2]);
    if (isNaN(n)) continue;
    out.push({ num:n, unit:u, canonical: toCanonical(n,u), raw: m[0] });
  }
  return out;
}
function tokenizeText(t) { return new Set(t.toLowerCase().match(/[a-z0-9äöüß][a-z0-9äöüß-]{2,}/gi) || []); }
const STD_WL = ["230v","400v","50hz","16a","32a","63a","125a"];
const KNOWN_BRANDS = ["Bosch","Bobcat","Doosan","Kärcher","Wacker","Stihl","Husqvarna","Honda","Yamaha","Atlas","Hilti","Ford","Manfrotto","Milos","Mennekes","Eibenstock","Einhell","ADJ","Krause","Hailo","Layher","Kaiserthal","Brennenstuhl","ABUS"];
const BANNED = [/\bzertifizier(t|ung)\b/i,/\bDIN[\s-]?\d+/i,/\bISO[\s-]?\d+/i,/\bTÜV\b/i,/\bmarktführend\b/i,/\bweltweit führend\b/i];

function validate(g, p) {
  const issues = [];
  const fullText = [g.metaTitle, g.metaDescription, ...(g.h2s||[]), g.useCaseBau, g.useCasePrivat, g.useCaseEvent, ...(g.faq||[]).map(f=>`${f.question} ${f.answer}`)].filter(Boolean).join(" ");
  const inputText = [p.name, p.modelName, p.description, p.detailedDescription, ...Object.entries(p.specifications||{}).map(([k,v])=>`${k} ${v}`)].filter(Boolean).join(" ");
  const inputM = extractMeasurements(inputText);
  const allowedTokens = tokenizeText(inputText);

  for (const om of extractMeasurements(fullText)) {
    const norm = `${om.num}${om.unit}`;
    if (STD_WL.includes(norm.toLowerCase().replace(/\s/g,""))) continue;
    const match = inputM.find(im => {
      if (im.canonical.base !== om.canonical.base) return false;
      const a=im.canonical.val, b=om.canonical.val;
      if (a===0&&b===0) return true;
      const tol = Math.max(Math.abs(a),Math.abs(b))*0.02;
      return Math.abs(a-b)<=tol;
    });
    if (!match) {
      const rd = String(om.num).replace(/\..*/,"");
      if (allowedTokens.has(rd)) continue;
      issues.push(`Erfundene Spec: "${om.raw}"`);
    }
  }
  const brandSafe = `${p.name||""} ${p.modelName||""} ${Object.entries(p.specifications||{}).map(([k,v])=>`${k}:${v}`).join(" ")}`;
  for (const b of KNOWN_BRANDS) {
    if (new RegExp(`\\b${b}\\b`,"i").test(fullText) && !new RegExp(`\\b${b}\\b`,"i").test(brandSafe))
      issues.push(`Marke "${b}" erfunden`);
  }
  for (const re of BANNED) {
    if (re.test(fullText) && !re.test(inputText)) issues.push(`Verbotene Behauptung: ${re}`);
  }
  const wc = fullText.split(/\s+/).filter(Boolean).length;
  if (wc < 80) issues.push(`Zu kurz: ${wc}w`);
  if (wc > 400) issues.push(`Zu lang: ${wc}w`);
  return { ok: issues.length===0, issues, wordCount: wc };
}

function buildPrompt(product) {
  const cat = product.category || "(unbekannt)";
  const usePool = UCL[cat] || { bauProfi: [], privatGarten: [], eventGastronomie: [] };
  const specsTxt = product.specifications
    ? Object.entries(product.specifications).map(([k,v])=>`- ${k}: ${v}`).join("\n")
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
4. Keine Werbephrasen ("besser als", "marktführend", "Premiumqualität", "TÜV-zertifiziert").
5. Sprache: sachliches Deutsch, neutrale Anrede.
6. metaTitle: max 60 Zeichen, enthält Produktname.
7. metaDescription: max 155 Zeichen.
8. h2s: 3–4 Section-Headlines.
9. useCaseBau/Privat/Event: 1–2 Sätze oder leerer String.
10. faq: genau 3 Einträge, faktentreu.

Antworte NUR als JSON-Objekt:
{"metaTitle":"...","metaDescription":"...","h2s":["..."],"useCaseBau":"...","useCasePrivat":"...","useCaseEvent":"...","faq":[{"question":"...","answer":"..."},{"question":"...","answer":"..."},{"question":"...","answer":"..."}]}`;
}

async function callAI(prompt) {
  const resp = await fetch(ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type":"application/json" },
    body: JSON.stringify({ model: MODEL, messages: [{ role:"user", content: prompt }] }),
  });
  if (!resp.ok) throw new Error(`${resp.status}`);
  const d = await resp.json();
  let txt = d.choices?.[0]?.message?.content || "";
  txt = txt.replace(/^```(?:json)?\s*/i,"").replace(/```\s*$/i,"").trim();
  return JSON.parse(txt);
}

// === Skip log laden ===
let skipLog = [];
if (fs.existsSync(SKIP_LOG)) skipLog = JSON.parse(fs.readFileSync(SKIP_LOG, "utf8"));

let okCount = 0, skipCount = 0, cachedCount = 0, redCount = 0;
const t0 = Date.now();

for (const id of batch) {
  const cachePath = path.join(RESULTS_DIR, `${id}.json`);
  if (fs.existsSync(cachePath)) { cachedCount++; continue; }

  const product = allProducts.find(p => p.id === id);
  if (!product) {
    console.log(`  ?? ${id} fehlt in products-full`);
    continue;
  }

  // ROT überspringen
  if (auditMap.get(id) === "RED") {
    console.log(`  ⊘ SKIP (ROT): ${id}`);
    redCount++;
    if (!skipLog.find(s => s.id === id)) skipLog.push({ id, name: product.name, reason: "RED-grade" });
    continue;
  }

  let res = null;
  let lastIssues = [];
  for (let a = 1; a <= MAX_ATTEMPTS; a++) {
    try {
      const gen = await callAI(buildPrompt(product));
      const v = validate(gen, product);
      if (v.ok) {
        res = { id, generated: gen, attempt: a, wordCount: v.wordCount };
        break;
      }
      lastIssues = v.issues;
    } catch (e) {
      lastIssues = [e.message];
    }
  }
  if (res) {
    fs.writeFileSync(cachePath, JSON.stringify(res, null, 2));
    okCount++;
    if (okCount % 10 === 0) console.log(`  ${okCount} ok, ${skipCount} skip, ${cachedCount} cached`);
  } else {
    skipCount++;
    if (!skipLog.find(s => s.id === id)) skipLog.push({ id, name: product.name, reason: lastIssues.join("; ") });
    console.log(`  ⊘ SKIP (validator): ${id}  →  ${lastIssues.slice(0,2).join("; ")}`);
  }
}

fs.writeFileSync(SKIP_LOG, JSON.stringify(skipLog, null, 2));
const dt = ((Date.now()-t0)/1000).toFixed(1);
console.log(`\nBatch ${batchIndex} fertig in ${dt}s.  ok=${okCount} skip=${skipCount} red=${redCount} cached=${cachedCount}`);
console.log(`Gesamt-Plan: ${total}, dieser Batch: ${batch.length}`);
const cachedTotal = fs.readdirSync(RESULTS_DIR).filter(f => f.endsWith(".json")).length;
console.log(`Generierte Texte gesamt im Cache: ${cachedTotal}`);
