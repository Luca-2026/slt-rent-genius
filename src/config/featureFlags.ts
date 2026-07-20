/**
 * Zentrale Feature-Flags für die Frontend-Umstellung auf das CMS.
 * Etappe 4: Katalog/Detailseiten lesen ausschließlich aus `managed_products_public`.
 * Der statische Fallback greift NUR bei DB-/Netzwerkfehlern (oder – solange der
 * Flag existiert – während des initialen Ladens vor dem ersten erfolgreichen Fetch),
 * damit es keine Weißseiten gibt.
 *
 * Etappe 6 wird den Flag entfernen und die statischen Daten aus dem Bundle nehmen.
 */
export const USE_STATIC_FALLBACK = true;
