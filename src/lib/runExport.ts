import { supabase } from "@/integrations/supabase/client";
import { exportXlsx, printList, type ExportColumn } from "@/lib/exportHelpers";
import { format } from "date-fns";

export type ExportType = "bestellungen" | "arbeitsauftraege" | "rechnungen";
export type DateMode = "heute" | "morgen" | "woche" | "alle" | "custom";
export type ExportAction = "print" | "excel";

export interface ExportPreset {
  statuses: string[];
  date_mode: DateMode;
  von: string | null;
  bis: string | null;
  action: ExportAction;
}

const TITLES: Record<ExportType, string> = {
  bestellungen: "Bestellungen",
  arbeitsauftraege: "Arbeitsaufträge",
  rechnungen: "Rechnungen",
};

function isoOffset(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function resolveDateRange(
  mode: DateMode,
  von: string | null,
  bis: string | null,
): { von: string; bis: string } {
  switch (mode) {
    case "heute":
      return { von: isoOffset(0), bis: isoOffset(0) };
    case "morgen":
      return { von: isoOffset(1), bis: isoOffset(1) };
    case "woche":
      return { von: isoOffset(0), bis: isoOffset(6) };
    case "alle":
      return { von: "", bis: "" };
    case "custom":
      return { von: von ?? "", bis: bis ?? "" };
  }
}

export async function loadExportRows(
  type: ExportType,
  preset: ExportPreset,
): Promise<{ rows: Record<string, unknown>[]; columns: ExportColumn[] }> {
  const { von, bis } = resolveDateRange(preset.date_mode, preset.von, preset.bis);
  const { statuses } = preset;

  if (type === "rechnungen") {
    let q = supabase
      .from("rechnungen")
      .select("rechnungsnummer, kunde_name, kunde_firma, rechnungsdatum, faelligkeitsdatum, bruttobetrag, status")
      .order("rechnungsdatum", { ascending: false });
    if (statuses.length) q = q.in("status", statuses);
    if (von) q = q.gte("rechnungsdatum", von);
    if (bis) q = q.lte("rechnungsdatum", bis);
    const { data, error } = await q;
    if (error) throw error;
    const rows = (data ?? []).map((r) => ({
      rechnungsnummer: r.rechnungsnummer,
      kunde: r.kunde_firma || r.kunde_name,
      rechnungsdatum: r.rechnungsdatum,
      faelligkeitsdatum: r.faelligkeitsdatum ?? "",
      bruttobetrag: Number(r.bruttobetrag).toFixed(2),
      status: r.status,
    }));
    return {
      rows,
      columns: [
        { key: "rechnungsnummer", label: "Rechnungsnr." },
        { key: "kunde", label: "Kunde" },
        { key: "rechnungsdatum", label: "Datum" },
        { key: "faelligkeitsdatum", label: "Fällig" },
        { key: "bruttobetrag", label: "Brutto (€)" },
        { key: "status", label: "Status" },
      ],
    };
  }

  let q = supabase
    .from("waeschebestellungen")
    .select(
      "bestellnummer, status, lieferdatum, abholdatum, anzahl_personen, kunden(name, kundennummer), objekte(name), waeschekraefte(name)",
    )
    .order("lieferdatum", { ascending: true, nullsFirst: false });
  if (statuses.length) q = q.in("status", statuses as never);
  if (von) q = q.gte("lieferdatum", von);
  if (bis) q = q.lte("lieferdatum", bis);
  if (type === "arbeitsauftraege") q = q.not("waeschekraft_id", "is", null);

  const { data, error } = await q;
  if (error) throw error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows = (data ?? []).map((r: any) => ({
    bestellnummer: r.bestellnummer,
    kunde: r.kunden?.name ?? "",
    objekt: r.objekte?.name ?? "",
    lieferdatum: r.lieferdatum ?? "",
    abholdatum: r.abholdatum ?? "",
    personen: r.anzahl_personen ?? "",
    waeschekraft: r.waeschekraefte?.name ?? "",
    status: r.status,
  }));
  return {
    rows,
    columns: [
      { key: "bestellnummer", label: "Bestellnr." },
      { key: "kunde", label: "Kunde" },
      { key: "objekt", label: "Objekt" },
      { key: "lieferdatum", label: "Lieferdatum" },
      { key: "abholdatum", label: "Abholdatum" },
      { key: "personen", label: "Personen" },
      { key: "waeschekraft", label: "Wäschekraft" },
      { key: "status", label: "Status" },
    ],
  };
}

export async function executeExport(
  type: ExportType,
  preset: ExportPreset,
): Promise<number> {
  const { rows, columns } = await loadExportRows(type, preset);
  if (!rows.length) return 0;
  const title = TITLES[type];
  if (preset.action === "print") {
    printList({ title, columns, rows });
  } else {
    exportXlsx(rows, columns, `${title}_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
  }
  return rows.length;
}

export const EXPORT_TITLES = TITLES;
