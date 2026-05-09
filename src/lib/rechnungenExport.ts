import * as XLSX from "xlsx";
import type { Rechnung } from "@/hooks/useRechnungen";

const formatDate = (d: string | null) =>
  d ? new Date(d).toLocaleDateString("de-DE") : "";

const statusLabel: Record<string, string> = {
  offen: "Offen",
  bezahlt: "Bezahlt",
  storniert: "Storniert",
  mahnung: "Mahnung",
};

export function exportRechnungenToExcel(rechnungen: Rechnung[]) {
  const rows = rechnungen.map((r) => ({
    Rechnungsnummer: r.rechnungsnummer,
    Rechnungsdatum: formatDate(r.rechnungsdatum),
    Fälligkeitsdatum: formatDate(r.faelligkeitsdatum),
    Status: statusLabel[r.status] ?? r.status,
    Kundennummer: r.kunde_kundennummer ?? "",
    Kunde: r.kunde_name,
    Firma: r.kunde_firma ?? "",
    "E-Mail": r.kunde_email ?? "",
    Straße: r.kunde_strasse ?? "",
    PLZ: r.kunde_plz ?? "",
    Ort: r.kunde_ort ?? "",
    Bestellnummer: r.bestellnummer ?? "",
    "Netto (€)": Number(r.nettobetrag),
    "MwSt-Satz (%)": Number(r.mwst_satz),
    "MwSt (€)": Number(r.mwst_betrag),
    "Bearbeitungsgebühr (€)": Number(r.bearbeitungsgebuehr),
    "Brutto (€)": Number(r.bruttobetrag),
    "Bezahlt am": formatDate(r.bezahlt_am),
    "Mahnungen": r.mahnung_anzahl ?? 0,
    "Mahnung gesendet am": formatDate(r.mahnung_gesendet_am),
    Notizen: r.notizen ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);

  // Spaltenbreiten
  const colWidths = Object.keys(rows[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...rows.map((r) => String((r as any)[key] ?? "").length)
    ) + 2,
  }));
  (ws as any)["!cols"] = colWidths;

  // Zahlenformate für Geldbeträge
  const moneyCols = ["M", "O", "P", "Q"]; // Netto, MwSt, Gebühr, Brutto
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = 1; R <= range.e.r; R++) {
    moneyCols.forEach((col) => {
      const cell = ws[`${col}${R + 1}`];
      if (cell && typeof cell.v === "number") cell.z = "#,##0.00 €";
    });
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Rechnungen");

  const dateStr = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Rechnungen_${dateStr}.xlsx`);
}
