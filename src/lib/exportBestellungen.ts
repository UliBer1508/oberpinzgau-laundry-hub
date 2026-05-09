import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { Bestellung } from "@/hooks/useBestellungen";

const STATUS_LABEL: Record<string, string> = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  ausgeliefert: "Ausgeliefert",
  abgeholt: "Abgeholt",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
};

const ZAHLUNG_LABEL: Record<string, string> = {
  bezahlt: "Bezahlt",
  offen: "Ausstehend",
  mahnung: "Mahnung",
  storniert: "Storniert",
};

const fmtDate = (d: string | null | undefined) =>
  d ? format(new Date(d), "dd.MM.yyyy") : "";

export function exportBestellungenToExcel(bestellungen: Bestellung[]) {
  const rows = bestellungen.map((b) => {
    const r = (b as any).rechnung as
      | { rechnungsnummer: string; status: string }
      | null;
    return {
      "Bestellnr.": b.bestellnummer,
      Kunde: b.kundeName,
      Objekt: b.objektName ?? "",
      Status: STATUS_LABEL[b.status ?? ""] ?? b.status ?? "",
      Lieferdatum: fmtDate(b.lieferdatum),
      Lieferzeit: b.lieferzeit ?? "",
      Abholdatum: fmtDate(b.abholdatum),
      Wäschekraft: b.waeschekraftName ?? "",
      Positionen: b.positionenCount,
      "Betrag (€)": b.gesamtpreis ?? "",
      "Rechnungsnr.": r?.rechnungsnummer ?? "",
      Zahlungsstatus: r ? ZAHLUNG_LABEL[r.status] ?? r.status : "",
      Gastname: b.gastname ?? "",
      Personen: b.anzahl_personen ?? "",
      "Check-in": fmtDate(b.check_in),
      "Check-out": fmtDate(b.check_out),
      Priorität: b.prioritaet ?? 0,
      Notizen: b.notizen ?? "",
      "Erstellt am": fmtDate(b.created_at),
    };
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 18 }, { wch: 24 }, { wch: 24 }, { wch: 14 }, { wch: 12 },
    { wch: 10 }, { wch: 12 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
    { wch: 16 }, { wch: 14 }, { wch: 20 }, { wch: 9 }, { wch: 12 },
    { wch: 12 }, { wch: 9 }, { wch: 30 }, { wch: 12 },
  ];

  // Format Betrag column (J) as currency
  const range = XLSX.utils.decode_range(ws["!ref"] || "A1");
  for (let R = 1; R <= range.e.r; R++) {
    const cell = ws[XLSX.utils.encode_cell({ r: R, c: 9 })];
    if (cell && typeof cell.v === "number") {
      cell.t = "n";
      cell.z = '#,##0.00 "€"';
    }
  }

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Bestellungen");
  XLSX.writeFile(wb, `bestellungen_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
