// Sprint 4 – Anti-Doorway Jaccard cluster check
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CACHE_DIR = path.join(__dirname, ".cache/localarea-results");

const KREFELD = ["krefeld","meerbusch","willich","toenisvorst","kempen","moers","duisburg-west","neuss","viersen","kaarst","duesseldorf"];
const BONN = ["bonn","bad-godesberg","koenigswinter","bad-honnef","sankt-augustin","siegburg","troisdorf","alfter","bornheim","meckenheim","rheinbach","wachtberg","bad-neuenahr-ahrweiler","remagen","sinzig","grafschaft","swisttal"];
const MUELHEIM = ["muelheim-an-der-ruhr","essen","oberhausen","duisburg-sued","bottrop","gelsenkirchen","ratingen","bochum-west","dinslaken"];

const STOP = new Set("der die das und oder aber auch ein eine einer einem einen eines im in an auf für mit von zu zur zum als wie sich ist sind wird werden hat haben den dem des bei aus nach über unter so dass nicht nur noch sehr ihre ihr ihrer ihren ihres unsere unser unseren unserer unseres sie ihm ihn".split(/\s+/));

function tokens(text) {
  return new Set(
    text.toLowerCase().replace(/[^\p{L}\s]/gu, " ").split(/\s+/).filter(w => w.length > 3 && !STOP.has(w))
  );
}
function jaccard(a, b) {
  const A = tokens(a), B = tokens(b);
  const inter = [...A].filter(x => B.has(x)).length;
  const uni = new Set([...A, ...B]).size;
  return uni ? inter / uni : 0;
}
function loadText(slug) {
  const f = path.join(CACHE_DIR, `${slug}.json`);
  if (!fs.existsSync(f)) return null;
  return JSON.parse(fs.readFileSync(f, "utf8")).longDescription;
}
function clusterAvg(name, slugs) {
  const texts = slugs.map(s => ({ s, t: loadText(s) })).filter(x => x.t);
  let sum = 0, n = 0, max = 0, maxPair = null;
  for (let i = 0; i < texts.length; i++) {
    for (let j = i + 1; j < texts.length; j++) {
      const sim = jaccard(texts[i].t, texts[j].t);
      sum += sim; n++;
      if (sim > max) { max = sim; maxPair = [texts[i].s, texts[j].s]; }
    }
  }
  const avg = n ? sum / n : 0;
  console.log(`${name}: n=${texts.length}, pairs=${n}, avg=${(avg*100).toFixed(1)}%, max=${(max*100).toFixed(1)}% (${maxPair?.join(" vs ")})`);
  return avg;
}

const a = clusterAvg("Bucket A – Krefeld (11)", KREFELD);
const b = clusterAvg("Bucket A – Bonn (17)", BONN);
const c = clusterAvg("Bucket B – Mülheim (9)", MUELHEIM);

const fail = [a, b, c].some(v => v > 0.35);
if (fail) { console.log("\n⚠ Cluster über 35% – STOPP"); process.exit(2); }
console.log("\n✓ Alle Cluster unter 35% Jaccard");
