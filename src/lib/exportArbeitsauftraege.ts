import * as XLSX from "xlsx";
import { format } from "date-fns";
import type { ManagementBestellung } from "@/hooks/useManagementBestellungen";

const STATUS_LABEL: Record<string, string> = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  ausgeliefert: "Ausgeliefert",
  abgeholt: "Abgeholt",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
};

const PRIO_LABEL: Record<number, string> = {
  0: "Normal",
  1: "Hoch",
  2: "Dringend",
};

const fmtDate = (d: string | null | undefined) =>
  d ? format(new Date(d), "dd.MM.yyyy") : "";

const fmtDateTime = (d: string | null | undefined) =>
  d ? format(new Date(d), "dd.MM.yyyy HH:mm") : "";

export function exportArbeitsauftraegeToExcel(bestellungen: ManagementBestellung[]) {
  const rows = bestellungen.map((b, idx) => ({
    "Reihenfolge": b.reihenfolge ?? idx + 1,
    "Priorität": PRIO_LABEL[b.prioritaet ?? 0] ?? "Normal",
    "Bestellnr.": b.bestellnummer,
    Kunde: b.kundeName,
    Objekt: b.objektName ?? "",
    Adresse: [b.objektStrasse, b.objektOrt].filter(Boolean).join(", "),
    Status: STATUS_LABEL[b.status ?? ""] ?? b.status ?? "",
    Lieferdatum: fmtDate(b.lieferdatum),
    Lieferzeit: b.lieferzeit ?? "",
    Abholdatum: fmtDate(b.abholdatum),
    Abholzeit: b.abholzeit ?? "",
    "Bearbeitung bis": fmtDateTime(b.bearbeitung_deadline),
    Wäschekraft: b.waeschekraftName ?? "",
    Artikel: (b.positionen || [])
      .map((p) => `${p.menge}× ${p.artikelName}${p.farbe ? ` (${p.farbe})` : ""}`)
      .join("; "),
    Notizen: b.notizen ?? "",
  }));

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [
    { wch: 11 }, { wch: 10 }, { wch: 12 }, { wch: 22 }, { wch: 22 },
    { wch: 30 }, { wch: 14 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
    { wch: 10 }, { wch: 18 }, { wch: 18 }, { wch: 50 }, { wch: 30 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Arbeitsaufträge");
  XLSX.writeFile(wb, `arbeitsauftraege_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
}
