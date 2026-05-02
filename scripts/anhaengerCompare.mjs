// Quervergleich Anhänger-Subkategorien nach dem Merge
import fs from "node:fs";
const src = fs.readFileSync("src/data/productSEOData.ts","utf8");
const products = JSON.parse(fs.readFileSync("scripts/.cache/products-full.json","utf8"));
const productMap = new Map(products.map(p=>[p.id,p]));

// Parse SEO entries
const entries = new Map();
const re = /^  "([^"]+)":\s*\{\n([\s\S]*?)\n  \},/gm;
let m;
while ((m=re.exec(src))!==null) {
  const id=m[1], body=m[2];
  const get = k => (body.match(new RegExp(`${k}:\\s*"([^"]*)"`))||[])[1]||"";
  entries.set(id, {
    useCaseBau: get("useCaseBau"),
    useCasePrivat: get("useCasePrivat"),
    useCaseEvent: get("useCaseEvent"),
  });
}

// Group all anhänger products by subcategory pattern
function classify(p) {
  const n=(p.name||"").toLowerCase();
  const id=p.id.toLowerCase();
  const cat=(p.category||"").toLowerCase();
  if (!/anh[äa]nger|trailer/i.test(n+" "+cat+" "+id)) return null;
  if (/plane|hochlader.*plane|spriegel/i.test(n)) return "PLANE";
  if (/auto.*transport|fahrzeug.*transport|car.transport/i.test(n+" "+id)) return "AUTOTRANSPORT";
  if (/kasten|hochlader|tieflader.*kasten/i.test(n) && !/plane/i.test(n)) return "KASTEN";
  if (/dumper|kipp|3.*seiten.*kipper|rückwärts/i.test(n+" "+id)) return "DUMPER";
  if (/baumaschin|maschinen.*transport|tieflader|stage|bühne/i.test(n+" "+id)) return "BAUMASCHINE";
  return "SONSTIGE";
}

const buckets = {};
for (const p of products) {
  const c = classify(p);
  if (!c) continue;
  if (!entries.has(p.id)) continue;
  (buckets[c] = buckets[c] || []).push(p);
}

function jaccard(a,b) {
  const ta=new Set((a||"").toLowerCase().match(/[\wäöüß]+/g)||[]);
  const tb=new Set((b||"").toLowerCase().match(/[\wäöüß]+/g)||[]);
  if (!ta.size||!tb.size) return 0;
  let i=0; for (const t of ta) if (tb.has(t)) i++;
  return i/(ta.size+tb.size-i);
}

for (const [cat, list] of Object.entries(buckets)) {
  console.log("\n"+"=".repeat(70));
  console.log(`### ${cat}  (${list.length} Produkte)`);
  console.log("=".repeat(70));
  for (const p of list) {
    const e = entries.get(p.id);
    console.log(`\n◆ ${p.name}  [${p.id}]`);
    console.log(`  BAU:    ${e.useCaseBau || "—"}`);
    console.log(`  PRIVAT: ${e.useCasePrivat || "—"}`);
    console.log(`  EVENT:  ${e.useCaseEvent || "—"}`);
  }
  // Avg pairwise Jaccard on useCaseBau
  if (list.length>=2) {
    let sum=0, n=0;
    for (let i=0;i<list.length;i++) for (let j=i+1;j<list.length;j++) {
      const a=entries.get(list[i].id).useCaseBau;
      const b=entries.get(list[j].id).useCaseBau;
      if (a&&b) { sum+=jaccard(a,b); n++; }
    }
    const avg = n? sum/n : 0;
    console.log(`\n  >> Ø Jaccard-Ähnlichkeit useCaseBau: ${(avg*100).toFixed(1)}%  (${n} Paare)`);
    if (avg > 0.5) {
      console.log(`  ⚠️  HOHE Cluster-Ähnlichkeit — Re-Run-Kandidat:`);
      console.log(`     IDs: ${list.map(p=>p.id).join(", ")}`);
    }
  }
}
