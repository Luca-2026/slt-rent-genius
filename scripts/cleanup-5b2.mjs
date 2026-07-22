#!/usr/bin/env node
// Etappe 5b.2 – Legacy-Aufräumen (read-only für Prerender-Output).
// Entfernt aus productSEOData.ts:
//  - Interface-Felder excelName, primaryKeywords, is247
//  - Alle Entry-Zeilen mit diesen Feldern
//  - Alle "mh-…"-Einträge (toter Lookup nach Mülheim-Entkopplung, Etappe 3)
import fs from "node:fs";
import path from "node:path";

const file = path.resolve("src/data/productSEOData.ts");
let src = fs.readFileSync(file, "utf8");
const before = src;

// 1) Interface-Felder entfernen
src = src.replace(/^\s*excelName: string;\r?\n/m, "");
src = src.replace(/^\s*primaryKeywords: string;\r?\n/m, "");
src = src.replace(/^\s*is247: boolean;\r?\n/m, "");

// 2) mh-*-Einträge komplett entfernen: von '  "mh-…": {' bis inklusive nächstem '  },'
const mhRegex = /^ {2}"mh-[^"]+": \{[\s\S]*?^ {2}\},\r?\n/gm;
const mhCount = (src.match(mhRegex) || []).length;
src = src.replace(mhRegex, "");

// 3) Einzelne Property-Zeilen aus jedem Entry entfernen
const stripField = (name) => {
  const re = new RegExp(`^ {4}${name}:[^\\n]*\\n`, "gm");
  const c = (src.match(re) || []).length;
  src = src.replace(re, "");
  return c;
};
const nExcel = stripField("excelName");
const nKw = stripField("primaryKeywords");
const nIs247 = stripField("is247");

if (src === before) {
  console.error("No changes made – abort.");
  process.exit(1);
}
fs.writeFileSync(file, src);
console.log(JSON.stringify({ mhEntriesRemoved: mhCount, excelNameRemoved: nExcel, primaryKeywordsRemoved: nKw, is247Removed: nIs247 }, null, 2));
