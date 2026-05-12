import { useEffect, useState } from "react";
import { Printer, FileSpreadsheet, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { executeExport, type DateMode, type ExportType } from "@/lib/runExport";
import { useExportPresets } from "@/hooks/useExportPresets";
import { useAuth } from "@/contexts/AuthContext";

export type { ExportType };

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

export function ExportDialog({ open, onOpenChange, type }: Props) {
  const { user } = useAuth();
  const { presets, savePreset, deletePreset } = useExportPresets();
  const stored = presets[type];

  const isRechnung = type === "rechnungen";
  const allStatus = isRechnung ? RECHNUNG_STATUS : BESTELL_STATUS;
  const defaults = isRechnung ? ["offen", "mahnung"] : ["neu", "in_bearbeitung"];

  const [statuses, setStatuses] = useState<string[]>(defaults);
  const [mode, setMode] = useState<DateMode>("alle");
  const [von, setVon] = useState<string>("");
  const [bis, setBis] = useState<string>("");
  const [loading, setLoading] = useState<null | "print" | "excel">(null);
  const [savePref, setSavePref] = useState(false);

  // Preset beim Öffnen einspielen
  useEffect(() => {
    if (!open) return;
    if (stored) {
      setStatuses(stored.statuses ?? defaults);
      setMode((stored.date_mode as DateMode) ?? "alle");
      setVon(stored.von ?? "");
      setBis(stored.bis ?? "");
      setSavePref(true);
    } else {
      setStatuses(defaults);
      setMode("alle");
      setVon("");
      setBis("");
      setSavePref(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, stored?.id]);

  const toggle = (v: string) =>
    setStatuses((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));

  const setQuick = (m: DateMode) => {
    setMode(m);
    if (m !== "custom") {
      setVon("");
      setBis("");
    }
  };

  async function handleAction(action: "print" | "excel") {
    setLoading(action);
    try {
      const count = await executeExport(type, {
        statuses,
        date_mode: mode,
        von: mode === "custom" ? von || null : null,
        bis: mode === "custom" ? bis || null : null,
        action,
      });
      if (!count) {
        toast.info("Keine Einträge gefunden");
      } else if (action === "excel") {
        toast.success(`${count} Einträge exportiert`);
      }

      if (savePref && user) {
        try {
          await savePreset({
            type,
            preset: {
              statuses,
              date_mode: mode,
              von: mode === "custom" ? von || null : null,
              bis: mode === "custom" ? bis || null : null,
              action,
            },
          });
        } catch (e) {
          console.warn("Preset speichern fehlgeschlagen", e);
        }
      } else if (!savePref && stored) {
        try {
          await deletePreset(type);
        } catch (e) {
          console.warn("Preset löschen fehlgeschlagen", e);
        }
      }
      onOpenChange(false);
    } catch (e) {
      toast.error("Export fehlgeschlagen", { description: (e as Error).message });
    } finally {
      setLoading(null);
    }
  }

  async function handleRemove() {
    try {
      await deletePreset(type);
      toast.success("Voreinstellung entfernt");
      setSavePref(false);
    } catch (e) {
      toast.error("Entfernen fehlgeschlagen", { description: (e as Error).message });
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
              {(["heute", "morgen", "woche", "alle"] as DateMode[]).map((m) => (
                <Button
                  key={m}
                  type="button"
                  size="sm"
                  variant={mode === m ? "default" : "outline"}
                  onClick={() => setQuick(m)}
                >
                  {m === "heute" ? "Heute" : m === "morgen" ? "Morgen" : m === "woche" ? "Diese Woche" : "Alle"}
                </Button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs text-muted-foreground">Von</Label>
                <Input
                  type="date"
                  value={mode === "custom" ? von : ""}
                  onChange={(e) => {
                    setMode("custom");
                    setVon(e.target.value);
                  }}
                />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Bis</Label>
                <Input
                  type="date"
                  value={mode === "custom" ? bis : ""}
                  onChange={(e) => {
                    setMode("custom");
                    setBis(e.target.value);
                  }}
                />
              </div>
            </div>
          </div>

          {user && (
            <div className="flex items-start justify-between gap-3 rounded-md border bg-muted/30 p-3">
              <div className="space-y-0.5">
                <Label className="text-sm">Als Schnellaktion speichern</Label>
                <p className="text-xs text-muted-foreground">
                  Beim nächsten Klick auf die Karte wird direkt mit diesen Einstellungen exportiert.
                </p>
              </div>
              <Switch checked={savePref} onCheckedChange={setSavePref} />
            </div>
          )}

          {stored && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-destructive hover:text-destructive"
              onClick={handleRemove}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Gespeicherte Voreinstellung entfernen
            </Button>
          )}
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
