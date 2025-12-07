/**
 * Formats a price in German currency format (XX,XX €)
 */
export function formatPreis(preis: number | null): string {
  if (preis === null || preis === undefined) return "-";
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(preis);
}
