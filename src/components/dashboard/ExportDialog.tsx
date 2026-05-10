import { useState } from "react";
import { Printer, FileSpreadsheet, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { exportXlsx, printList, type ExportColumn } from "@/lib/exportHelpers";
import { format } from "date-fns";

export type ExportType = "bestellungen" | "arbeitsauftraege" | "rechnungen";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  type: ExportType;
}

const BESTELL_STATUS = [
  { value: "neu", label: "Neu" },
  { value: "in_bearbeitung", label: "In Bearbeitung" },
  { value: "ausgeliefert", label: "Ausgeliefert" },
  { value: "abgeholt", label: "Abgeholt" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "storniert", label: "Storniert" },
];

const RECHNUNG_STATUS = [
  { value: "offen", label: "Offen" },
  { value: "bezahlt", label: "Bezahlt" },
  { value: "mahnung", label: "Mahnung" },
  { value: "storniert", label: "Storniert" },
];

const TITLES: Record<ExportType, string> = {
  bestellungen: "Bestellungen",
  arbeitsauftraege: "Arbeitsaufträge",
  rechnungen: "Rechnungen",
};

function isoToday(offset = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
}

export function ExportDialog({ open, onOpenChange, type }: Props) {
  const isRechnung = type === "rechnungen";
  const allStatus = isRechnung ? RECHNUNG_STATUS : BESTELL_STATUS;
  const defaults = isRechnung
    ? ["offen", "mahnung"]
    : ["neu", "in_bearbeitung"];

  const [statuses, setStatuses] = useState<string[]>(defaults);
  const [von, setVon] = useState<string>("");
  const [bis, setBis] = useState<string>("");
  const [loading, setLoading] = useState<null | "print" | "excel">(null);

  const toggle = (v: string) =>
    setStatuses((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const setQuick = (mode: "heute" | "morgen" | "woche" | "alle") => {
    if (mode === "alle") return setVon(""), setBis("");
    if (mode === "heute") return setVon(isoToday()), setBis(isoToday());
    if (mode === "morgen") return setVon(isoToday(1)), setBis(isoToday(1));
    if (mode === "woche") {
      setVon(isoToday());
      setBis(isoToday(6));
    }
  };

  async function loadRows(): Promise<{ rows: Record<string, unknown>[]; columns: ExportColumn[] }> {
    if (isRechnung) {
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

  async function handleAction(mode: "print" | "excel") {
    setLoading(mode);
    try {
      const { rows, columns } = await loadRows();
      if (!rows.length) {
        toast.info("Keine Einträge gefunden");
        return;
      }
      const title = TITLES[type];
      if (mode === "print") {
        printList({ title, columns, rows });
      } else {
        exportXlsx(rows, columns, `${title}_${format(new Date(), "yyyy-MM-dd")}.xlsx`);
        toast.success(`${rows.length} Einträge exportiert`);
      }
    } catch (e: any) {
      toast.error("Export fehlgeschlagen", { description: e.message });
    } finally {
      setLoading(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{TITLES[type]} exportieren</DialogTitle>
          <DialogDescription>
            Status & Zeitraum auswählen, dann drucken oder als Excel exportieren.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <div className="grid grid-cols-2 gap-2">
              {allStatus.map((s) => (
                <label
                  key={s.value}
                  className="flex items-center gap-2 rounded-md border p-2 cursor-pointer hover:bg-muted/50"
                >
                  <Checkbox
                    checked={statuses.includes(s.value)}
                    onCheckedChange={() => toggle(s.value)}
                  />
                  <span className="text-sm">{s.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Zeitraum</Label>
            <div className="flex flex-wrap gap-1">
              <Button type="button" size="sm" variant="outline" onClick={() => setQuick("heute")}>
                Heute
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setQuick("morgen")}>
                Morgen
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setQuick("woche")}>
                Diese Woche
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={() => setQuick("alle")}>
                Alle
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Von</Label>
                <Input type="date" value={von} onChange={(e) => setVon(e.target.value)} />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bis</Label>
                <Input type="date" value={bis} onChange={(e) => setBis(e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="outline"
            onClick={() => handleAction("print")}
            disabled={loading !== null}
          >
            {loading === "print" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Printer className="h-4 w-4" />
            )}
            Drucken
          </Button>
          <Button onClick={() => handleAction("excel")} disabled={loading !== null}>
            {loading === "excel" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FileSpreadsheet className="h-4 w-4" />
            )}
            Excel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
