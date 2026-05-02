// Sprint 4 – Merge longDescription into src/data/localSeoData.ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const FILE = path.join(ROOT, "src/data/localSeoData.ts");
const CACHE_DIR = path.join(__dirname, ".cache/localarea-results");

const cache = {};
for (const f of fs.readdirSync(CACHE_DIR)) {
  if (!f.endsWith(".json") || f.startsWith("_")) continue;
  const data = JSON.parse(fs.readFileSync(path.join(CACHE_DIR, f), "utf8"));
  cache[data.slug] = data.longDescription;
}
console.log(`Loaded ${Object.keys(cache).length} cached entries`);

let src = fs.readFileSync(FILE, "utf8");
const before = src;

// For each area object, find its slug then ensure longDescription is set after keywords array
let added = 0, updated = 0;

for (const [slug, text] of Object.entries(cache)) {
  // Escape for embedding in TS string literal (double-quoted, single-line)
  const escaped = text
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\r\n/g, "\n")
    .replace(/\n/g, "\\n");

  // Find the area block by slug
  const slugRe = new RegExp(`(\\{\\s*\\n\\s*slug:\\s*"${slug}",[\\s\\S]*?keywords:\\s*\\[[^\\]]*\\],?)([\\s\\S]*?\\n\\s*\\},)`);
  const m = src.match(slugRe);
  if (!m) {
    console.log(`! could not locate block for ${slug}`);
    continue;
  }
  const head = m[1];
  const tail = m[2];

  // Check if longDescription already exists in tail
  if (/longDescription:/.test(tail)) {
    // replace the existing value
    const newTail = tail.replace(/longDescription:\s*"(?:[^"\\]|\\.)*",?/, `longDescription: "${escaped}",`);
    src = src.replace(m[0], head + newTail);
    updated++;
  } else {
    // Insert longDescription right after keywords line
    const insertion = `${head}\n    longDescription: "${escaped}",`;
    src = src.replace(m[0], insertion + tail);
    added++;
  }
}

fs.writeFileSync(FILE, src);
console.log(`Merged: added=${added}, updated=${updated}`);
console.log(`File grew from ${before.length} to ${src.length} chars`);
