#!/usr/bin/env bun
// Generates SEO drafts (meta_description + faqs) for products missing SEO.
// Uses Lovable AI Gateway directly (same prompts as admin-generate-product-content).
// Writes results to scripts/.cache/seo-drafts.json — SQL apply is a separate step.
import fs from "node:fs";
import { execSync } from "node:child_process";

const API_KEY = process.env.LOVABLE_API_KEY;
if (!API_KEY) throw new Error("LOVABLE_API_KEY missing");

const rows = JSON.parse(execSync(
  `psql -Atc "SELECT json_agg(row_to_json(t)) FROM (SELECT slug, name, category, detailed_description, specifications, features FROM b2b_managed_products WHERE (seo_meta_description IS NULL OR seo_meta_description='') AND (jsonb_array_length(coalesce(seo_faqs,'[]'::jsonb))=0) AND (seo_draft_meta_description IS NULL) ORDER BY slug) t"`,
  { encoding: "utf8" }
).trim());

console.log("Products to draft:", rows.length);

const BRAND = `Du bist SEO-Redakteur für SLT Rental (Vermieter von Maschinen und Event-Ausstattung in NRW).
Ton: professionell, direkt, "Du"-Ansprache. KEINE erfundenen technischen Daten, Zahlen, Maße, Leistungswerte oder Gewichte. Nur Fakten aus dem Kontext verwenden.
Kein Marketing-Blabla, keine Emojis, keine Superlative.`;

function ctx(p){
  const specs = p.specifications && Object.keys(p.specifications||{}).length
    ? Object.entries(p.specifications).map(([k,v])=>`- ${k}: ${v}`).join("\n") : "";
  const feats = Array.isArray(p.features) && p.features.length
    ? p.features.map(f=>`- ${f}`).join("\n") : "";
  return [
    `Artikel: ${p.name}`,
    `Kategorie: ${p.category}`,
    p.detailed_description ? `Beschreibung: ${p.detailed_description}` : "",
    specs ? `Technische Daten:\n${specs}` : "",
    feats ? `Features:\n${feats}` : "",
  ].filter(Boolean).join("\n");
}

async function ai(prompt){
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method:"POST",
    headers:{Authorization:`Bearer ${API_KEY}`,"Content-Type":"application/json"},
    body: JSON.stringify({
      model:"google/gemini-2.5-flash",
      messages:[
        {role:"system",content:"Du bist ein präziser SEO-Redakteur. Halte dich strikt an das Format. Erfinde niemals technische Werte."},
        {role:"user",content:prompt},
      ],
    }),
  });
  if(!r.ok) throw new Error(`AI ${r.status}: ${await r.text()}`);
  const j = await r.json();
  return (j.choices?.[0]?.message?.content||"").trim();
}

const outPath = "scripts/.cache/seo-drafts.json";
const existing = fs.existsSync(outPath) ? JSON.parse(fs.readFileSync(outPath,"utf8")) : {};

let done=0, fail=0;
for(const p of rows){
  if(existing[p.slug]){ done++; continue; }
  const c = ctx(p);
  try {
    const meta = await ai(`${BRAND}
Schreibe eine SEO-Meta-Description (max 155 Zeichen) für die Produktdetail-Seite.
Kontext:
${c}

Nur den Text ausgeben, keine Anführungszeichen. Keine erfundenen Werte.`);
    await new Promise(r=>setTimeout(r,400));
    const faqRaw = await ai(`${BRAND}
Erstelle 3 FAQ-Einträge zum Artikel. Ausgabe als JSON-Array: [{"q":"...","a":"..."}, ...].
Fragen aus Sicht eines Mieters (Anwendung, Voraussetzungen, Buchung). Antworten NUR mit Fakten aus dem Kontext oder allgemeinen SLT-Standards. Keine erfundenen Details, Maße oder Leistungsdaten. Wenn eine Frage nicht ohne Erfindung beantwortbar wäre, ersetze sie durch eine allgemeine Buchungs-/Ablauf-Frage.
Kontext:
${c}

Nur das JSON-Array ausgeben, keine Erklärung, kein Markdown.`);
    let faqs = [];
    try {
      const cleaned = faqRaw.replace(/^```(?:json)?/im,"").replace(/```$/m,"").trim();
      const parsed = JSON.parse(cleaned);
      if(Array.isArray(parsed)) faqs = parsed.filter(f=>f && typeof f.q==="string" && typeof f.a==="string").slice(0,4);
    } catch(e){ /* keep empty */ }
    existing[p.slug] = { meta: meta.slice(0,180), faqs, generated_at: new Date().toISOString() };
    done++;
    if(done % 5 === 0){
      fs.writeFileSync(outPath, JSON.stringify(existing,null,2));
      console.log(`progress: ${done}/${rows.length}`);
    }
    await new Promise(r=>setTimeout(r,500));
  } catch(e){
    fail++;
    console.error(`FAIL ${p.slug}: ${e.message}`);
    if(String(e.message).includes("402")||String(e.message).includes("429")){
      fs.writeFileSync(outPath, JSON.stringify(existing,null,2));
      throw e;
    }
  }
}
fs.writeFileSync(outPath, JSON.stringify(existing,null,2));
console.log(`Done: ${done} ok, ${fail} failed`);
