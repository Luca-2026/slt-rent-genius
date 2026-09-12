import { locations } from "../src/data/rentalData";
import { resolveLegacyProduct, resolveLegacyCategory } from "../src/data/legacyRedirects";
const k = locations.find((l) => l.id === "krefeld")!;
for (const p of k.products["verdichtung"] || []) console.log(p.id, "|", p.name, "|", p.weightKg);
console.log("---");
for (const s of ["ruttelplatte-100-kg","ruettelplatte-100kg","minibagger-1-8t","bautrockner","anhaenger-3500kg","xyz-unbekannt"])
  console.log(s, "->", JSON.stringify(resolveLegacyProduct(s)));
console.log(resolveLegacyCategory("krefeld-heizung-trocknung"), resolveLegacyCategory("bonn-anhaenger","krefeld"));
