#!/usr/bin/env node
// Sprint 6 – Aufgabe 1: 404-Mapping-Audit
// ---------------------------------------------------------------
// Read-only Analyse der echten 404-URLs aus GSC.
// Liest dist/.prerender-routes.json (von exportRoutes.ts erzeugt)
// und schlägt pro alter URL eine neue Ziel-URL vor.
//
// Output: scripts/.cache/404-mapping.json + Konsolen-Report
//
// Run via:  node scripts/audit-404-mapping.mjs
// ---------------------------------------------------------------

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ---------------------------------------------------------------
// Eingabe: 116+ alte 404-URLs (aus Tabelle.csv, GSC-Export)
// ---------------------------------------------------------------

const LEGACY_404_URLS = [
  "/produkte/gabel-deluxe-14",
  "/produkte/etc-source-four-750-zoom",
  "/produkte/club-audio-soundsystem",
  "/produkte/vz-zusatz-neutral-ra1-gr-2",
  "/produkte/2000-kg-planenanhanger",
  "/produkte/schussel-deluxe",
  "/produkte/cee-32a-uv-auf-6x-16a-schuko",
  "/produkte/erdungsspies-mit-3m-leitung",
  "/produkte/1300-kg-planenanhanger",
  "/produkte/mobile-diesel-adblue-tankstelle-400l-50l",
  "/produkte/milos-m290-p4-ubpqc-base-black",
  "/produkte/cee-kabel-63a-rot-20-m",
  "/produkte/750-kg-planenanhanger-xxl",
  "/produkte/defender-midi-5-kabelbrucke",
  "/produkte/major-dmx-xlr-kabel-3-pol-5m",
  "/produkte/nivtec-teleskopfuss-80cm",
  "/produkte/major-dmx-xlr-kabel-3-pol-3m",
  "/produkte/schussel-simply-15-10er-set",
  "/produkte/vz-1000-22-ra1-gr-1",
  "/produkte/230w-led-moving-head",
  "/produkte/stehtisch",
  "/produkte/ms01-tiefloffel-20cm-14l-symlock",
  "/produkte/cee-16a-uv-mit-anschlusskabel-auf-5x-16a-schuko",
  "/produkte/vz-1000-12-ra1-gr-1",
  "/produkte/partyzelt-8x6m",
  "/produkte/fugenschneider-50cm",
  "/produkte/meyer-sound-ultra-x40",
  "/produkte/nivtec-2m-x-1m-systempodest",
  "/produkte/minibagger-xe20e",
  "/produkte/vz-1000-22-ra1-gr-2",
  "/produkte-bonn/750-kg-planenanhaenger-300x150x180",
  "/produkte/bierzeltgarnitur",
  "/produkte/slt-led-fluter-rgbwauv",
  "/produkte/das-audio-vantec-18a",
  "/produkte/12m-scherenbuhne",
  "/produkte/elektrische-warmhalteplatte",
  "/produkte/ms01-hydraulikhammer",
  "/produkte/ms01-grabenraumloffel-hydr-100cm-80l",
  "/produkte-bonn/1300-kg-planenanhaenger",
  "/produkte/ruttelplatte-100-kg",
  "/produkte/powercon-true1-top-linkable-5-m",
  "/produkte/major-ethercon-kabel-3-m-cat-7",
  "/produkte/pioneer-djm-900-nxs2",
  "/produkte/1500-kg-autotransportanhanger",
  "/produkte/750-kg-kofferanhanger",
  "/produkte/minibagger-1-1-t",
  "/produkte-bonn/3500-kg-plattformanhanger",
  "/produkte/eventzelt-6x8m-extra-hoch",
  "/produkte/led-scheinwerfer",
  "/produkte/rotationslaser-grl-400h",
  "/produkte/titanex-adapter-63a-32a",
  "/produkte/anschlussschrank-55-kva",
  "/produkte/ms01-grabenraumloffel-hydr-80cm-52l",
  "/produkte/vz-1000-12-ra1-gr-2",
  "/produkte/cee-kabel-16a-rot-3-m",
  "/produkte/midas-m32r-digital-mischpult",
  "/produkte/vz-283-11-ra1",
  "/produkte/zelt-4x6m",
  "/produkte/halteverbotsschilder-set",
  "/produkte/rollgerust-7-4-m-breit",
  "/kategorie/krefeld-anhaengerZus",
  "/produkte/minibagger-xe20e",
  "/produkte/zeltboden-anthrazit",
  "/produkte/3kw-elektro-heizlufter",
  "/produkte/akku-baustrahler-gli-18v-2200-c",
  "/produkte/stuhl-weiss",
  "/produkte/messer-simply-20-10er-set",
  "/produkte/diamantbohrer-gdb-180-we",
  "/produkte/midas-dl16-digital-stagebox",
  "/produkte/shure-funkmikrofon-beta58",
  "/produkte/major-ethercon-kabel-cat-5e-20m",
  "/produkte/eventzelt-6x12m-extra-hoch",
  "/kategorien-krefeld/buehnen",
  "/produkte/2-kw-elektro-heizpilz",
  "/produkte-duisburg/750-kg-planenanhaenger-m",
  "/produkte/pioneer-cdj-2000-nxs",
  "/produkte/powercon-linkkabel-5-m",
  "/produkte/gutschein",
  "/produkte/baumstumpffrase-12ps",
  "/produkte/diamantbohrer-gdb-180-we",
  "/produkte/ms01-tiefloffel-50cm-45l-symlock",
  "/produkte/milos-m290-p4-qtu-500-black",
  "/produkte/akku-lautsprecher",
  "/produkte/2700-kg-autotransportkippanhanger-468x210",
  "/produkte-bonn/750-kg-planenanhaenger-m",
  "/produkte/1500-kg-kofferanhanger",
  "/produkte/9kw-elektro-heizlufter",
  "/produkte/milos-m290-p4-qtu-2000-black",
  "/produkte/750-kg-planenanhanger-xl",
  "/produkte/750-kg-motorradanhanger-3-fach",
  "/produkte/3500-kg-plattformanhanger",
  "/produkte/vz-308-ra1",
  "/produkte/45-kva-stromaggregat",
  "/produkte/cee-16a-uv-auf-3x-16a-schuko",
  "/produkte/showtec-sunstrip-active-mkii",
  "/produkte/tragbare-powerstation-268-wh",
  "/produkte/ortungsgerat-gms-120",
  "/produkte/750-kg-planenanhanger-m",
  "/produkte/vz-267-ra1",
  "/produkte/d-a-s-audio-action-508a",
  "/produkte/bautrockner-bis-20-m2",
  "/kategorie/krefeld-anhaengerTarife:1",
  "/kategorie/bonn-anhaengerDie",
  "/produkte/erdbohrer-benzin",
  "/produkte/akku-fur-soundbox",
  "/produkte/750-kg-planenanhanger-s",
  "/kategorien/moebel-zelte",
  "/produkte/led-bar",
  "/produkte-bonn/1500-kg-kofferanhanger",
  "/produkte/minibagger-2-7-t",
  "/produkte/akku-kettensage-40cm",
  "/produkte/100-kva-stromaggregatTarife:1",
  "/kategorien/rigging",
  "/kategorien/arbeitsbuehnen",
  "/produkte/minibagger-2-6-t",
  "/produkte/750-kg-planenanhanger",
  "/produkte/minibagger-1100-kg",
  "/produkte/major-lastkabel-30m",
  "/produkte/treppenturm-6-3-m",
  "/produkte/major-lastkabel-10m",
  "/produkte/zelt-4x12m",
  "/produkte/7-kva-stromaggregat",
  "/produkte/meyer-sound-upm-1p",
  "/standort/muehlheim",
  // /produkte/100-kva-stromaggregatTarife:1 wird über /kategorie-Pattern abgedeckt
];

// ---------------------------------------------------------------
// Hilfen
// ---------------------------------------------------------------

const SNAPSHOT_PATH = resolve(process.cwd(), "dist/.prerender-routes.json");
const OUT_DIR = resolve(process.cwd(), "scripts/.cache");
const OUT_PATH = resolve(OUT_DIR, "404-mapping.json");

if (!existsSync(SNAPSHOT_PATH)) {
  console.error(
    `[audit-404] FEHLT: ${SNAPSHOT_PATH}\n` +
      `   Zuerst:  npx vite-node scripts/exportRoutes.ts`,
  );
  process.exit(1);
}

const snapshot = JSON.parse(readFileSync(SNAPSHOT_PATH, "utf-8"));

// Index der Produkt-Routen je Standort: { krefeld: Map<productId, fullPath>, ... }
const productIndex = {
  krefeld: new Map(),
  bonn: new Map(),
  muelheim: new Map(),
};
const productAll = []; // [{ loc, catId, productId, path }]
const categoryIndex = {
  krefeld: new Set(),
  bonn: new Set(),
  muelheim: new Set(),
};

for (const r of snapshot.routes) {
  if (r.routeType === "product") {
    // path = /mieten/{loc}/{cat}/{productId}
    const parts = r.path.split("/").filter(Boolean);
    if (parts.length >= 4) {
      const loc = parts[1];
      const productId = parts[3];
      if (productIndex[loc]) productIndex[loc].set(productId, r.path);
      productAll.push({ loc, catId: parts[2], productId, path: r.path });
    }
  } else if (r.routeType === "category") {
    const parts = r.path.split("/").filter(Boolean);
    if (parts.length === 3) categoryIndex[parts[1]]?.add(parts[2]);
  }
}

// ---- Slug-Normalisierung ----
// Häufige GSC-Slug-Sünden: ä→a, ö→o, ü→u, ß→ss, doppel-Bindestriche, "-"-prefix/suffix.
function normalizeSlug(s) {
  return s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

// Compound-Splits, die GSC-Slugs vs. neue Produkt-IDs angleichen.
// Linke Seite = altes Wort; rechte Seite = ersetzt durch (Whitespace-getrennte
// Sub-Tokens). Bewusst nur Anhänger/Strom/Bagger-Domäne, keine Erfindungen.
const COMPOUND_SPLITS = {
  planenanhanger: "planen anhanger",
  planenanhaenger: "planen anhanger",
  kofferanhanger: "koffer anhanger",
  kofferanhaenger: "koffer anhanger",
  motorradanhanger: "motorrad anhanger",
  motorradanhaenger: "motorrad anhanger",
  autotransportanhanger: "autotransport anhanger",
  autotransportanhaenger: "autotransport anhanger",
  autotransportkippanhanger: "autotransport kipp anhanger",
  plattformanhanger: "plattform anhanger",
  plattformanhaenger: "plattform anhanger",
  baumaschinenanhanger: "baumaschinen anhanger",
  stromaggregat: "stromaggregat aggregat",
  scherenbuhne: "scheren buehne",
  scherenbuehne: "scheren buehne",
  warmhalteplatte: "warmhalte platte",
  heizlufter: "heizluefter heizung",
  heizpilz: "heiz pilz",
  baumstumpffrase: "baumstumpf fraese",
  baumstumpffraese: "baumstumpf fraese",
  treppenturm: "treppen turm",
  rollgerust: "roll geruest",
  rollgeruest: "roll geruest",
};

// Tokenize → entferne sehr kurze, splitte bekannte Compounds, behalte Zahlen
function tokenize(slug) {
  const norm = normalizeSlug(slug);
  const expanded = norm
    .split("-")
    .map((t) => COMPOUND_SPLITS[t] ?? t)
    .join(" ")
    .split(/\s+/);
  return expanded.filter((t) => t.length >= 2);
}

function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const v0 = new Array(b.length + 1);
  const v1 = new Array(b.length + 1);
  for (let i = 0; i <= b.length; i++) v0[i] = i;
  for (let i = 0; i < a.length; i++) {
    v1[0] = i + 1;
    for (let j = 0; j < b.length; j++) {
      const cost = a[i] === b[j] ? 0 : 1;
      v1[j + 1] = Math.min(v1[j] + 1, v0[j + 1] + 1, v0[j] + cost);
    }
    for (let j = 0; j <= b.length; j++) v0[j] = v1[j];
  }
  return v1[b.length];
}

// Wichtige Tokens (Größe/Gewicht) gewichten höher
const WEIGHTED_TOKENS = new Set([
  "750", "1300", "1500", "2000", "2700", "3500",
  "kg", "kva", "kw",
  "planen", "planenanhanger", "kofferanhanger", "autotransport", "motorrad",
  "minibagger", "stromaggregat",
]);

function tokenScore(oldTokens, candTokens) {
  if (!oldTokens.length || !candTokens.length) return 0;
  const candSet = new Set(candTokens);
  let hits = 0;
  let weight = 0;
  let maxWeight = 0;
  for (const t of oldTokens) {
    const w = WEIGHTED_TOKENS.has(t) ? 2 : 1;
    maxWeight += w;
    if (candSet.has(t)) {
      hits += 1;
      weight += w;
    }
  }
  // Mische ratio (hits/oldlen) mit weighted ratio.
  const ratio = hits / oldTokens.length;
  const wRatio = weight / maxWeight;
  return 0.4 * ratio + 0.6 * wRatio;
}

// ---- Pfad-Klassifikation ----
function classify(url) {
  // Strip junk-Suffixe (Tarife:1, Zus, Die, Ebenso) wie .htaccess es schon tut
  const cleaned = url
    .replace(/(Tarife[^/]*|Zus|Die|Ebenso)$/i, "")
    .replace(/^\/+/, "/");

  if (cleaned.startsWith("/produkte-bonn/"))
    return { type: "product", loc: "bonn", slug: cleaned.replace("/produkte-bonn/", "") };
  if (cleaned.startsWith("/produkte-duisburg/"))
    return { type: "product", loc: "muelheim", slug: cleaned.replace("/produkte-duisburg/", "") };
  if (cleaned.startsWith("/produkte-muelheim/"))
    return { type: "product", loc: "muelheim", slug: cleaned.replace("/produkte-muelheim/", "") };
  if (cleaned.startsWith("/produkte/"))
    return { type: "product", loc: "krefeld", slug: cleaned.replace("/produkte/", "") };

  if (cleaned.startsWith("/kategorien-krefeld/"))
    return { type: "category", loc: "krefeld", slug: cleaned.replace("/kategorien-krefeld/", "") };
  if (cleaned.startsWith("/kategorien-bonn/"))
    return { type: "category", loc: "bonn", slug: cleaned.replace("/kategorien-bonn/", "") };
  if (cleaned.startsWith("/kategorien-muelheim/"))
    return { type: "category", loc: "muelheim", slug: cleaned.replace("/kategorien-muelheim/", "") };
  if (cleaned.startsWith("/kategorien/"))
    return { type: "category", loc: "krefeld", slug: cleaned.replace("/kategorien/", "") };

  // /kategorie/krefeld-anhaenger oder /kategorie/bonn-anhaenger
  const kategorieCompound = cleaned.match(/^\/kategorie\/(krefeld|bonn|muelheim)-(.+)$/);
  if (kategorieCompound) {
    return { type: "category", loc: kategorieCompound[1], slug: kategorieCompound[2] };
  }
  if (cleaned.startsWith("/kategorie/"))
    return { type: "category", loc: "krefeld", slug: cleaned.replace("/kategorie/", "") };

  // /standort/muehlheim, /standort/krefeld
  const standort = cleaned.match(/^\/standort\/([^/]+)$/);
  if (standort) {
    return { type: "standort", loc: standort[1] };
  }

  return { type: "unknown", raw: cleaned };
}

// ---- Mapping je URL ----
function mapProduct(loc, slug) {
  const norm = normalizeSlug(slug);
  // Direct match: gleicher Slug existiert in diesem Standort
  const idx = productIndex[loc];
  if (idx?.has(norm)) {
    return {
      to: idx.get(norm),
      confidence: 1.0,
      method: "direct",
      tokens_matched: [norm],
    };
  }
  // Direct match in anderem Standort?
  for (const otherLoc of ["krefeld", "bonn", "muelheim"]) {
    if (otherLoc === loc) continue;
    const otherIdx = productIndex[otherLoc];
    if (otherIdx?.has(norm)) {
      return {
        to: otherIdx.get(norm),
        confidence: 0.85,
        method: "direct-cross-location",
        tokens_matched: [norm],
        note: `Slug existiert in /${otherLoc}, nicht in /${loc} – Cross-Location-Redirect`,
      };
    }
  }

  // Token-Match: bestes Match in `loc`
  const oldTokens = tokenize(slug);
  let best = null;
  for (const cand of productAll) {
    if (cand.loc !== loc) continue;
    const candTokens = tokenize(cand.productId);
    const score = tokenScore(oldTokens, candTokens);
    if (!best || score > best.score) {
      best = { ...cand, score, candTokens };
    }
  }
  // Falls in `loc` schwach → in allen Standorten suchen
  if (!best || best.score < 0.5) {
    let bestAll = null;
    for (const cand of productAll) {
      const candTokens = tokenize(cand.productId);
      const score = tokenScore(oldTokens, candTokens);
      if (!bestAll || score > bestAll.score) {
        bestAll = { ...cand, score, candTokens };
      }
    }
    if (bestAll && (!best || bestAll.score > best.score + 0.15)) {
      best = bestAll;
    }
  }

  if (best && best.score >= 0.6) {
    const matched = oldTokens.filter((t) => best.candTokens.includes(t));
    return {
      to: best.path,
      confidence: Math.min(0.9, 0.55 + best.score * 0.4),
      method: "token",
      tokens_matched: matched,
      note: best.loc !== loc ? `Cross-Location: zielt auf ${best.loc}` : undefined,
    };
  }

  // Levenshtein über productIds in `loc`
  let bestLev = null;
  for (const cand of productAll) {
    if (cand.loc !== loc) continue;
    const dist = levenshtein(norm, cand.productId);
    const ratio = 1 - dist / Math.max(norm.length, cand.productId.length);
    if (!bestLev || ratio > bestLev.ratio) bestLev = { ...cand, ratio, dist };
  }
  if (bestLev && bestLev.ratio >= 0.6) {
    return {
      to: bestLev.path,
      confidence: 0.4 + (bestLev.ratio - 0.6) * 0.5, // 0.4..0.6
      method: "levenshtein",
      tokens_matched: [],
      note: `Edit-distance ${bestLev.dist} zu "${bestLev.productId}"`,
    };
  }

  // Token-Match auch schwach? Behalte als low-confidence-Vorschlag (<0.5)
  if (best && best.score >= 0.35) {
    const matched = oldTokens.filter((t) => best.candTokens.includes(t));
    return {
      to: best.path,
      confidence: 0.3 + best.score * 0.3,
      method: "token-weak",
      tokens_matched: matched,
      note: "Schwacher Token-Match – manueller Review empfohlen",
    };
  }

  // Fallback
  const fallbackPath = `/mieten/${loc}`;
  return {
    to: fallbackPath,
    confidence: 0.1,
    method: "fallback",
    tokens_matched: [],
    note: "Kein Match – Fallback auf Standort-Hub",
  };
}

function mapCategory(loc, slug) {
  const norm = normalizeSlug(slug);
  const cats = categoryIndex[loc] ?? new Set();
  if (cats.has(norm)) {
    return { to: `/mieten/${loc}/${norm}`, confidence: 1.0, method: "direct", tokens_matched: [norm] };
  }
  // Bekannte Aliase
  const ALIAS = {
    rigging: "traversen-rigging",
    buehnen: "buehne",
    "moebel-zelte": "moebel",
    arbeitsbuehnen: "hebebuehnen",
    bagger: "erdbewegung",
    "bagger-dumper": "erdbewegung",
    strom: "aggregate",
  };
  const aliased = ALIAS[norm];
  if (aliased && cats.has(aliased)) {
    return {
      to: `/mieten/${loc}/${aliased}`,
      confidence: 0.85,
      method: "alias",
      tokens_matched: [norm, aliased],
    };
  }
  // Token-match gegen vorhandene Kategorien
  const oldTokens = tokenize(slug);
  let best = null;
  for (const cat of cats) {
    const candTokens = tokenize(cat);
    const score = tokenScore(oldTokens, candTokens);
    if (!best || score > best.score) best = { cat, score, candTokens };
  }
  if (best && best.score >= 0.5) {
    const matched = oldTokens.filter((t) => best.candTokens.includes(t));
    return {
      to: `/mieten/${loc}/${best.cat}`,
      confidence: Math.min(0.85, 0.5 + best.score * 0.4),
      method: "token",
      tokens_matched: matched,
    };
  }
  return {
    to: `/mieten/${loc}`,
    confidence: 0.15,
    method: "fallback",
    tokens_matched: [],
    note: "Kategorie unbekannt – Fallback Standort-Hub",
  };
}

function mapStandort(loc) {
  const ALIAS = { muehlheim: "muelheim", duisburg: "muelheim" };
  const target = ALIAS[loc] ?? loc;
  if (["krefeld", "bonn", "muelheim"].includes(target)) {
    return {
      to: `/standorte/${target}`,
      confidence: target === loc ? 1.0 : 0.9,
      method: target === loc ? "direct" : "alias",
      tokens_matched: [target],
    };
  }
  return {
    to: "/standorte",
    confidence: 0.2,
    method: "fallback",
    tokens_matched: [],
    note: `Unbekannter Standort "${loc}" – Fallback Standorte-Übersicht`,
  };
}

// ---------------------------------------------------------------
// Run audit
// ---------------------------------------------------------------

// Manuelle Overrides nach Sprint-6-Review (Luca, 2026-05-02).
// Setzt das errechnete Mapping außer Kraft. confidence: 1.0 → wird wie
// Direct-Match in der .htaccess gerendert.
const MANUAL_OVERRIDES = {
  // Gruppe B: gezielte Korrekturen
  "/produkte/akku-lautsprecher": { to: "/mieten/krefeld/beschallung", note: "Manueller Override – Kategorie-Fallback (kein passendes Produkt)" },
  "/produkte/ms01-grabenraumloffel-hydr-100cm-80l": { to: "/mieten/krefeld/erdbewegung", note: "Manueller Override – Kategorie-Fallback (Größe weicht ab)" },
  "/produkte/1500-kg-autotransportanhanger": { to: "/mieten/krefeld/anhaenger", note: "Manueller Override – Kategorie-Fallback (Autotransport, nicht Koffer)" },
  "/produkte/ruttelplatte-100-kg": { to: "/mieten/krefeld/verdichtung", note: "Manueller Override – Kategorie-Fallback (Gewicht weicht ab)" },
  "/produkte/zelt-4x12m": { to: "/mieten/krefeld/moebel-zelte", note: "Manueller Override – Kategorie-Fallback (Maß weicht ab)" },
  // led-scheinwerfer + bautrockner-bis-20-m2 → Auto-Mapping bleibt (übernehmen wie vorgeschlagen)
};

const seen = new Set();
const mappings = [];
for (const url of LEGACY_404_URLS) {
  const key = url.toLowerCase();
  if (seen.has(key)) continue;
  seen.add(key);

  let result;
  if (MANUAL_OVERRIDES[url]) {
    const ov = MANUAL_OVERRIDES[url];
    result = { to: ov.to, confidence: 1.0, method: "manual", tokens_matched: [], note: ov.note };
  } else {
    const cls = classify(url);
    if (cls.type === "product") {
      result = mapProduct(cls.loc, cls.slug);
    } else if (cls.type === "category") {
      result = mapCategory(cls.loc, cls.slug);
    } else if (cls.type === "standort") {
      result = mapStandort(cls.loc);
    } else {
      result = { to: "/", confidence: 0.0, method: "fallback", tokens_matched: [], note: "Unklassifiziert" };
    }
  }

  mappings.push({
    from: url,
    to: result.to,
    confidence: Math.round(result.confidence * 100) / 100,
    method: result.method,
    tokens_matched: result.tokens_matched,
    ...(result.note ? { note: result.note } : {}),
  });
}

// Sortiere nach Confidence absteigend (für .htaccess-Reihenfolge)
mappings.sort((a, b) => b.confidence - a.confidence || a.from.localeCompare(b.from));

const byMethod = mappings.reduce((acc, m) => {
  acc[m.method] = (acc[m.method] || 0) + 1;
  return acc;
}, {});

const byConfidence = {
  "≥0.9 (Direct)": mappings.filter((m) => m.confidence >= 0.9).length,
  "0.7-0.89 (High Token)": mappings.filter((m) => m.confidence >= 0.7 && m.confidence < 0.9).length,
  "0.5-0.69 (Medium)": mappings.filter((m) => m.confidence >= 0.5 && m.confidence < 0.7).length,
  "0.3-0.49 (Low/Fuzzy)": mappings.filter((m) => m.confidence >= 0.3 && m.confidence < 0.5).length,
  "<0.3 (Fallback)": mappings.filter((m) => m.confidence < 0.3).length,
};

const payload = {
  generatedAt: new Date().toISOString(),
  total: mappings.length,
  byMethod,
  byConfidence,
  mappings,
};

mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(payload, null, 2), "utf-8");

// ---------------------------------------------------------------
// Console-Report
// ---------------------------------------------------------------

console.log(`\n========== 404-Mapping-Audit ==========`);
console.log(`Total URLs analysiert: ${mappings.length}`);
console.log(`\nVerteilung nach Confidence:`);
for (const [k, v] of Object.entries(byConfidence)) {
  console.log(`  ${k.padEnd(28)} ${v}`);
}
console.log(`\nVerteilung nach Methode:`);
for (const [k, v] of Object.entries(byMethod)) {
  console.log(`  ${k.padEnd(28)} ${v}`);
}

const lowConf = mappings.filter((m) => m.confidence < 0.5);
console.log(`\n--- Low-Confidence-Mappings (<0.5) – manueller Review nötig (${lowConf.length}):`);
for (const m of lowConf) {
  console.log(
    `  [${m.confidence.toFixed(2)} ${m.method.padEnd(18)}] ${m.from}\n` +
      `      → ${m.to}` +
      (m.note ? `   (${m.note})` : ""),
  );
}

console.log(`\n→ JSON geschrieben: ${OUT_PATH}`);
console.log(`========================================\n`);
