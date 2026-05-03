// Single Source of Truth – Lieferkostenberechnung
// Reihenfolge gemäß Spec v5 (Abschnitt 3):
// 1. Grundpreis  2. Sperrgut/m  3. Hin+Rück  4. 2 Maschinen
// 5. Möbel-Stück  6. Aufbau-Service  7. Express  8. Wochenende

import { TARIFE } from "@/data/lieferkosten/tarife";
import { ZUSATZKOSTEN } from "@/data/lieferkosten/zusatzkosten";
import { isWeekendOrHolidayNRW } from "./feiertage-nrw";
import type { CalculatePriceParams, PriceResult, PriceBreakdownLine } from "./types";

export function calculatePrice(params: CalculatePriceParams): PriceResult {
  const {
    kategorie,
    tarif,
    km,
    liefermodus = "hin-rueck",
    zweiMaschinen = false,
    moebelStueck = 0,
    geruestArbeitshoehe = ZUSATZKOSTEN.geruest.geruest_basis_meter,
    geruestAufbauService = false,
    express = false,
    lieferdatum,
  } = params;

  const breakdown: PriceBreakdownLine[] = [];

  // Selbstabholung → 0
  if (liefermodus === "selbstabholung") {
    return {
      total: 0,
      oneWayBase: 0,
      distanceUsed: 0,
      breakdown: [{ label: "Selbstabholung Lager Krefeld", betrag: 0, laufendeSumme: 0 }],
    };
  }

  // Out of range
  if (km > 50) {
    return {
      total: 0,
      oneWayBase: 0,
      distanceUsed: km,
      breakdown: [],
      outOfRange: true,
      hinweis: "Lieferungen über 50 km Entfernung erstellen wir Ihnen ein individuelles Angebot.",
    };
  }

  const tarifData = TARIFE[tarif];
  if (!tarifData) {
    return { total: 0, oneWayBase: 0, distanceUsed: 0, breakdown: [], outOfRange: true, hinweis: "Tarif nicht verfügbar" };
  }

  // 1. Grundpreis – nächsthöhere km-Stufe
  const distances = tarifData.distances;
  let priceEntry = distances[distances.length - 1];
  for (const e of distances) {
    if (km <= e.km) {
      priceEntry = e;
      break;
    }
  }
  let summe = priceEntry.brutto;
  breakdown.push({
    label: `Grundlieferung (Tarif ${tarif}, ${priceEntry.km} km, Einzelstrecke)`,
    betrag: summe,
    laufendeSumme: summe,
  });

  // 2. Sperrgut/m – nur Gerüst, falls Höhe > 4,4 m
  if (kategorie === "leitern-gerueste") {
    const meterUeber = Math.max(0, geruestArbeitshoehe - ZUSATZKOSTEN.geruest.geruest_basis_meter);
    if (meterUeber > 0) {
      const aufpreis = meterUeber * ZUSATZKOSTEN.geruest.aufschlag_pro_meter;
      summe += aufpreis;
      breakdown.push({
        label: `+ Sperrgut-Aufschlag (${meterUeber.toFixed(1)} m × ${ZUSATZKOSTEN.geruest.aufschlag_pro_meter} €)`,
        betrag: aufpreis,
        laufendeSumme: summe,
      });
    }
  }

  // 3. Hin+Rück
  if (liefermodus === "hin-rueck") {
    const f = ZUSATZKOSTEN.alle.rueckweg_faktor;
    summe = summe * f;
    breakdown.push({
      label: `× Hin- und Rückweg (×${f})`,
      betrag: summe,
      isMultiplier: true,
      multiplierWert: f,
      laufendeSumme: summe,
    });
  }

  // 4. 2 Maschinen
  if (zweiMaschinen && tarifData.multiplier_2_maschinen > 1) {
    const f = tarifData.multiplier_2_maschinen;
    summe = summe * f;
    breakdown.push({
      label: `× 2 Maschinen (×${f})`,
      betrag: summe,
      isMultiplier: true,
      multiplierWert: f,
      laufendeSumme: summe,
    });
  }

  // 5. Möbel-Stück (Aufschlag nur für Stücke ab/über der Schwelle)
  if (kategorie === "moebel-zelte" && moebelStueck >= ZUSATZKOSTEN.moebel.schwelle_stueck) {
    const zaehlbar = moebelStueck - (ZUSATZKOSTEN.moebel.schwelle_stueck - 1); // ab dem 5. Stück
    const aufpreis = zaehlbar * ZUSATZKOSTEN.moebel.moebel_aufschlag_je_stueck;
    summe += aufpreis;
    breakdown.push({
      label: `+ Möbel-Aufschlag (${zaehlbar} × ${ZUSATZKOSTEN.moebel.moebel_aufschlag_je_stueck} €)`,
      betrag: aufpreis,
      laufendeSumme: summe,
    });
  }

  // 6. Aufbau-Service (Gerüst)
  if (kategorie === "leitern-gerueste" && geruestAufbauService) {
    const basis = ZUSATZKOSTEN.geruest.aufbau_basis;
    const proM = ZUSATZKOSTEN.geruest.aufbau_pro_meter;
    const aufbau = basis + geruestArbeitshoehe * proM;
    summe += aufbau;
    breakdown.push({
      label: `+ Aufbau-Service (Basis ${basis} € + ${geruestArbeitshoehe.toFixed(1)} m × ${proM} €)`,
      betrag: aufbau,
      laufendeSumme: summe,
    });
  }

  // 7. Express
  if (express) {
    const p = ZUSATZKOSTEN.alle.express_pauschale;
    summe += p;
    breakdown.push({
      label: `+ Express-Lieferung`,
      betrag: p,
      laufendeSumme: summe,
    });
  }

  // 8. Wochenende
  if (lieferdatum && isWeekendOrHolidayNRW(lieferdatum)) {
    const f = ZUSATZKOSTEN.alle.wochenende_faktor;
    summe = summe * f;
    breakdown.push({
      label: `× Wochenend-/Feiertags-Zuschlag (×${f})`,
      betrag: summe,
      isMultiplier: true,
      multiplierWert: f,
      laufendeSumme: summe,
    });
  }

  return {
    total: summe,
    oneWayBase: priceEntry.brutto,
    distanceUsed: priceEntry.km,
    breakdown,
  };
}

export function formatEuro(n: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
  }).format(n);
}
