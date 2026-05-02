// Sprint 4 – Local-Area Content Generator
// Generates a unique 150-180 word longDescription per Local-Area via Lovable AI.
// Resume-fähig: skips slugs already cached in scripts/.cache/localarea-results/

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const CACHE_DIR = path.join(ROOT, "scripts/.cache/localarea-results");
fs.mkdirSync(CACHE_DIR, { recursive: true });

const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
if (!LOVABLE_API_KEY) {
  console.error("LOVABLE_API_KEY missing");
  process.exit(1);
}

const MODEL = "google/gemini-3-flash-preview";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

// --- Load Local Areas (parse the TS source as text, simple extraction) ---
const tsSrc = fs.readFileSync(path.join(ROOT, "src/data/localSeoData.ts"), "utf8");
// Use dynamic import via a tiny shim using esbuild? Simpler: regex-extract object literals.
// Easier route: use tsx if available, fallback to ts-node-less eval is brittle. Use bunx tsx-runtime via subprocess.

async function loadAreas() {
  // Use a child process running tsx to dump JSON
  const { execSync } = await import("node:child_process");
  const dumpScript = `
    import { localAreas } from "${path.join(ROOT, "src/data/localSeoData.ts").replace(/\\/g, "/")}";
    process.stdout.write(JSON.stringify(localAreas));
  `;
  const tmp = path.join(ROOT, "scripts/.cache/_dump_areas.mjs");
  fs.writeFileSync(tmp, dumpScript);
  const out = execSync(`bunx tsx ${tmp}`, { cwd: ROOT, encoding: "utf8", maxBuffer: 10 * 1024 * 1024 });
  fs.unlinkSync(tmp);
  return JSON.parse(out);
}

// --- Bucket assignment ---
const BUCKET_A_SLUGS = new Set([
  "krefeld","meerbusch","willich","toenisvorst","kempen","moers","duisburg-west","neuss","viersen","kaarst","duesseldorf",
  "bonn","bad-godesberg","koenigswinter","bad-honnef","sankt-augustin","siegburg","troisdorf","alfter","bornheim","meckenheim","rheinbach","wachtberg","bad-neuenahr-ahrweiler","remagen","sinzig","grafschaft","swisttal",
]);
const BUCKET_B_SLUGS = new Set([
  "muelheim-an-der-ruhr","essen","oberhausen","duisburg-sued","bottrop","gelsenkirchen","ratingen","bochum-west","dinslaken",
]);

function bucketOf(slug) {
  if (BUCKET_A_SLUGS.has(slug)) return "A";
  if (BUCKET_B_SLUGS.has(slug)) return "B";
  return null;
}

// --- Prompts ---
function promptA(area) {
  const std = area.locationId === "krefeld" ? "Krefeld" : "Bonn";
  return `Du schreibst einen sachlichen Local-SEO-Text für einen B2B/B2C-Mietkatalog für Baumaschinen, Eventtechnik und Werkzeuge. Zielgruppe: Bauunternehmen, Privatkunden, Veranstalter im Rheinland.

STADT-FAKTEN (NUR DIESE NUTZEN, NICHTS ERFINDEN):
- Stadt: ${area.name}
- Region: ${area.region}
- Bevölkerung: ${area.population ?? "unbekannt"}
- Postleitzahlen: ${(area.postalCodes || []).join(", ")}
- Distanz zum SLT-Mietpark ${std}: ${area.distance} km
- Aktueller Kurztext: ${area.description}
- Bisherige Keywords: ${(area.keywords || []).join(", ")}

REGELN:
1. 150-180 Wörter Fließtext.
2. Erfinde KEINE Fakten zur Stadt. Was Du nicht aus den oben genannten Daten oder allgemeinem Wissen über deutsche Mittelstädte ableiten kannst, lasse weg.
3. Erwähne den Stadtnamen mindestens 2x, höchstens 4x. KEIN Stuffing.
4. Erwähne die Distanz zum nächsten Standort konkret (z.B. "${area.distance} km").
5. Sprich konkrete Zielgruppen an: Bauunternehmen, Privatkunden für Heim-/Gartenprojekte, Eventveranstalter.
6. KEINE Preise, KEINE Mietkonditionen, KEINE Lieferzeiten.
7. KEINE Werbephrasen ("marktführend", "Premium", "TÜV-zertifiziert").
8. KEIN identischer Satzanfang über mehrere Städte hinweg.
9. Sprache: sachliches Deutsch, neutrale Anrede mit "Sie".
10. Bei kleinen Städten (< 30.000 Einwohner) eher Privatkunden-fokussiert. Bei größeren Städten auch Gewerbe und Großprojekte.

Antworte AUSSCHLIESSLICH mit gültigem JSON: {"longDescription": "..."}`;
}

function promptB(area) {
  return `Du schreibst einen sachlichen Local-SEO-Text für einen B2B/B2C-Mietkatalog im Ruhrgebiet. Zielgruppe: Bauunternehmen, Industrie-Dienstleister, Logistik, Veranstalter, Privatkunden.

STADT-FAKTEN (NUR DIESE NUTZEN, NICHTS ERFINDEN):
- Stadt: ${area.name}
- Region: ${area.region}
- Bevölkerung: ${area.population ?? "unbekannt"}
- Postleitzahlen: ${(area.postalCodes || []).join(", ")}
- Distanz zum SLT-Service-Standort Mülheim an der Ruhr: ${area.distance} km
- Aktueller Kurztext: ${area.description}
- Bisherige Keywords: ${(area.keywords || []).join(", ")}

WICHTIGER KONTEXT – Die Mülheim-Standort-Story:
SLT Rental hat in Mülheim an der Ruhr einen Service-Standort für Beratung und Übergabe. Das physische Inventar steht im Zentrallager Krefeld und wird auf Anfrage nach Mülheim disponiert – meist innerhalb von 24 Stunden. Dieser Text soll diese Realität ehrlich kommunizieren: Beratung in Mülheim, Lieferung aus Krefeld, kurze Wege ins Ruhrgebiet.

REGELN:
1. 150-180 Wörter Fließtext.
2. Erfinde KEINE Fakten zur Stadt.
3. Erwähne den Stadtnamen mindestens 2x, höchstens 4x.
4. Erwähne die Mülheim-Service-Story mindestens einmal: Beratung und Übergabe in Mülheim, Disposition aus dem Zentrallager in Krefeld, kurze Wege.
5. Erwähne ggf. die Verkehrsanbindung (A40 / A52 / A3) als plausiblen Anker, falls passend zur Stadt.
6. Spreche Ruhrgebiets-typische Zielgruppen an: Industrie-Dienstleister, Logistik-Firmen, Bauunternehmen, Veranstalter, Privatkunden.
7. KEINE Preise, KEINE Mietkonditionen, KEINE Lieferzeiten als Versprechen.
8. KEINE Werbephrasen.
9. KEIN identischer Satzanfang über mehrere Städte hinweg.
10. Sprache: sachliches Deutsch, neutrale Anrede mit "Sie".

Antworte AUSSCHLIESSLICH mit gültigem JSON: {"longDescription": "..."}`;
}

// --- Validator ---
function countWords(s) {
  return s.trim().split(/\s+/).filter(Boolean).length;
}
function countOccurrences(text, needle) {
  const re = new RegExp(needle.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi");
  return (text.match(re) || []).length;
}

const FORBIDDEN = [
  /\bmarktführend\b/i,
  /\bPremium\b/i,
  /\bzertifiziert\b/i,
  /\bDIN\s*\d+\b/i,
  /\bISO\s*\d+\b/i,
  /\bTÜV\b/i,
  /€/,
  /\bEUR\b/,
  /\bTagespreis\b/i,
  /\bpro Tag\b/i,
  /\bgarantiert\b/i,
  /\b100\s?%\b/,
  /\bimmer verfügbar\b/i,
];

function validate(area, bucket, text) {
  const errors = [];
  const wc = countWords(text);
  if (wc < 130 || wc > 200) errors.push(`word_count=${wc} (need 130-200)`);

  const nameHits = countOccurrences(text, area.name);
  if (nameHits < 2) errors.push(`name_count=${nameHits} (<2)`);
  if (nameHits > 5) errors.push(`name_count=${nameHits} (>5)`);

  for (const re of FORBIDDEN) {
    if (re.test(text)) errors.push(`forbidden:${re}`);
  }

  if (bucket === "A") {
    const distRe = new RegExp(`\\b${area.distance}\\s?km\\b`, "i");
    if (area.distance > 0 && !distRe.test(text)) {
      errors.push(`distance "${area.distance} km" missing`);
    }
  }

  if (bucket === "B") {
    if (!/Mülheim/i.test(text)) errors.push("Mülheim missing");
    if (!/Krefeld/i.test(text)) errors.push("Krefeld missing");
    const anchors = ["Beratung","Übergabe","Disposition","Service-Standort","Lieferung","Zentrallager"];
    if (!anchors.some(a => new RegExp(a, "i").test(text))) {
      errors.push("no service-anchor word");
    }
  }

  return errors;
}

// --- AI call ---
async function callAI(prompt) {
  const resp = await fetch(GATEWAY, {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: "Du antwortest ausschließlich mit gültigem JSON, keine Code-Fences." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!resp.ok) {
    const t = await resp.text();
    throw new Error(`AI ${resp.status}: ${t.slice(0, 200)}`);
  }
  const json = await resp.json();
  const content = json.choices?.[0]?.message?.content || "";
  return content;
}

function extractLongDesc(content) {
  let s = content.trim();
  s = s.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
  try {
    const obj = JSON.parse(s);
    return obj.longDescription || "";
  } catch {
    const m = s.match(/"longDescription"\s*:\s*"([\s\S]*?)"\s*}/);
    return m ? m[1] : "";
  }
}

// --- Main ---
async function main() {
  const areas = await loadAreas();
  console.log(`Loaded ${areas.length} areas`);

  const results = [];
  const skips = [];
  let cached = 0, generated = 0;

  for (const area of areas) {
    const bucket = bucketOf(area.slug);
    if (!bucket) {
      skips.push({ slug: area.slug, name: area.name, reason: "not in any bucket" });
      continue;
    }
    const cacheFile = path.join(CACHE_DIR, `${area.slug}.json`);
    if (fs.existsSync(cacheFile)) {
      const cachedData = JSON.parse(fs.readFileSync(cacheFile, "utf8"));
      results.push(cachedData);
      cached++;
      continue;
    }

    const prompt = bucket === "A" ? promptA(area) : promptB(area);
    let success = false;
    let lastErrors = [];
    let text = "";

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const content = await callAI(prompt);
        text = extractLongDesc(content);
        if (!text) {
          lastErrors = ["empty longDescription"];
          continue;
        }
        const errors = validate(area, bucket, text);
        if (errors.length === 0) {
          success = true;
          break;
        }
        lastErrors = errors;
        console.log(`  [${area.slug}] attempt ${attempt} fail: ${errors.join("; ")}`);
      } catch (e) {
        lastErrors = [e.message];
        console.log(`  [${area.slug}] attempt ${attempt} error: ${e.message}`);
      }
      await new Promise(r => setTimeout(r, 800));
    }

    if (success) {
      const data = { slug: area.slug, name: area.name, bucket, longDescription: text, wordCount: countWords(text) };
      fs.writeFileSync(cacheFile, JSON.stringify(data, null, 2));
      results.push(data);
      generated++;
      console.log(`✓ ${area.slug} [${bucket}] (${data.wordCount}w)`);
    } else {
      skips.push({ slug: area.slug, name: area.name, bucket, reason: lastErrors.join("; ") });
      console.log(`✗ ${area.slug} SKIPPED: ${lastErrors.join("; ")}`);
    }
    await new Promise(r => setTimeout(r, 600));
  }

  // Write skip log
  fs.writeFileSync(path.join(CACHE_DIR, "_skips.json"), JSON.stringify(skips, null, 2));

  const totalProcessed = results.length + skips.filter(s => s.bucket).length;
  const rejectionRate = totalProcessed ? (skips.filter(s => s.bucket).length / totalProcessed) * 100 : 0;

  console.log(`\n=== SUMMARY ===`);
  console.log(`Cached: ${cached}, Newly generated: ${generated}, Skipped: ${skips.length}`);
  console.log(`Rejection rate: ${rejectionRate.toFixed(1)}%`);
  if (rejectionRate > 25) {
    console.log(`⚠ Rejection rate >25% – STOP and review.`);
    process.exit(2);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
