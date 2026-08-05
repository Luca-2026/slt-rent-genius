// ─── Feste Testdaten für PDF-Regressionstests ───────────────────────────
// Bewusst deterministisch: keine Datums-/Zufallswerte zur Laufzeit, keine
// Bild-URLs (kein Netzwerkzugriff im Test).

export const TEST_PROFILE = {
  id: "00000000-0000-0000-0000-000000000001",
  company_name: "Musterbau GmbH",
  contact_person: "Erika Musterfrau",
  street: "Teststraße 12",
  postal_code: "40213",
  city: "Düsseldorf",
  country: "Deutschland",
  email: "einkauf@musterbau.example",
  phone: "0211 1234567",
  vat_id: "DE123456789",
  customer_number: "K-10042",
};

export const TEST_ITEMS = [
  {
    product_name: "Minibagger 1,8 t",
    description: "Inkl. Tieflöffel 30/60 cm, Grabenräumlöffel",
    quantity: 1,
    unit_price: 180,
    discount_percent: 10,
    rental_start: "2026-08-10 08:00",
    rental_end: "2026-08-14 16:00",
    category_slug: "baumaschinen",
  },
  {
    product_name: "Bautrockner 70 l/Tag",
    description: "Kondenstrockner für Estrich- und Wasserschäden",
    quantity: 3,
    unit_price: 24.5,
    rental_start: "2026-08-10 08:00",
    rental_end: "2026-08-17 08:00",
    category_slug: "trocknung",
  },
];

export const TEST_SERVICES = [
  {
    id: "mbv",
    name: "Maschinenbruchversicherung",
    description: "Selbstbeteiligung 500 €",
    pricePercent: 12,
    amount: 64.8,
    allocations: [{ itemIndex: 0, amount: 64.8 }],
  },
  {
    id: "reinigung",
    name: "Endreinigung",
    pricePercent: null,
    amount: 35,
  },
];

/** Eingabedaten für generateOfferPdf – fix, für den Referenz-Snapshot. */
export const OFFER_FIXTURE = {
  offerNumber: "ANG-2026-0815",
  offerDate: "2026-08-01",
  validUntil: "2026-08-15",
  profile: TEST_PROFILE,
  items: TEST_ITEMS.map((i) => ({ ...i })),
  deliveryCost: 120,
  deliveryCostDelivery: 60,
  deliveryCostReturn: 60,
  servicesSurcharge: 99.8,
  servicesWithPrices: TEST_SERVICES,
  netAmount: 1039.3,
  vatRate: 19,
  vatAmount: 197.47,
  grossAmount: 1236.77,
  isReverseCharge: false,
  notes: "Abholung nach telefonischer Absprache.",
  validDays: 14,
  deposit: 250,
  staffName: "Max Mustermann",
  issuingLocation: "krefeld",
  returnLocation: "krefeld",
  deliveryAddress: { street: "Baustelle Nord 4", postal_code: "47807", city: "Krefeld" },
  paymentTerms: "vorkasse",
};

/** Eingabedaten für generateDocumentPdf (Rechnung) – fix. */
export const INVOICE_FIXTURE = {
  title: "RECHNUNG",
  documentNumber: "RE-2026-0421",
  date: "2026-08-18",
  profile: TEST_PROFILE,
  productItems: TEST_ITEMS.map((i, idx) => ({
    name: i.product_name,
    description: i.description,
    quantity: i.quantity,
    unit: "Tage",
    unitPrice: i.unit_price,
    totalPrice: i.unit_price * i.quantity,
    discount: i.discount_percent ?? 0,
    rentalStart: i.rental_start,
    rentalEnd: i.rental_end,
    itemIndex: idx,
    imageUrl: null,
  })),
  serviceItems: [
    { name: "Maschinenbruchversicherung", description: "Selbstbeteiligung 500 €", amount: 64.8, parentItemIndex: 0 },
    { name: "Endreinigung", amount: 35 },
  ],
  surchargeItems: [{ name: "Lieferung & Abholung", description: "Krefeld – Baustelle Nord", amount: 120 }],
  sections: [
    { label: "Mietzeitraum", value: "10.08.2026 – 17.08.2026" },
    { label: "Auftragsnummer", value: "AUF-2026-0099" },
  ],
  signatures: { staffName: "Max Mustermann" },
  totals: {
    net: 1039.3,
    vatRate: 19,
    vat: 197.47,
    gross: 1236.77,
    deliveryCost: 120,
    isReverseCharge: false,
    paymentDueDays: 14,
    dueDate: "2026-09-01",
    depositTotal: 250,
  },
  isProforma: false,
  deliveryAddress: { street: "Baustelle Nord 4", postal_code: "47807", city: "Krefeld" },
};
