import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Rechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { Info } from "lucide-react";

interface RechnungseinstellungenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  einstellungen: Rechnungseinstellungen | null;
  onSave: (mwstSatz: number, bearbeitungsgebuehr: number) => void;
  isPending: boolean;
}

export function RechnungseinstellungenDialog({
  open,
  onOpenChange,
  einstellungen,
  onSave,
  isPending,
}: RechnungseinstellungenDialogProps) {
  const [mwstSatz, setMwstSatz] = useState<string>("20");
  const [bearbeitungsgebuehr, setBearbeitungsgebuehr] = useState<string>("0");

  useEffect(() => {
    if (einstellungen) {
      setMwstSatz(String(einstellungen.mwst_satz));
      setBearbeitungsgebuehr(String(einstellungen.bearbeitungsgebuehr));
    }
  }, [einstellungen]);

  const handleSave = () => {
    const mwst = parseFloat(mwstSatz.replace(",", ".")) || 0;
    const gebuehr = parseFloat(bearbeitungsgebuehr.replace(",", ".")) || 0;
    onSave(mwst, gebuehr);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rechnungseinstellungen bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="mwst">MwSt-Satz (%)</Label>
            <Input
              id="mwst"
              type="text"
              inputMode="decimal"
              value={mwstSatz}
              onChange={(e) => setMwstSatz(e.target.value)}
              placeholder="z.B. 20"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gebuehr">Bearbeitungsgebühr (€)</Label>
            <Input
              id="gebuehr"
              type="text"
              inputMode="decimal"
              value={bearbeitungsgebuehr}
              onChange={(e) => setBearbeitungsgebuehr(e.target.value)}
              placeholder="z.B. 5,00"
            />
          </div>

          <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-md">
            <Info className="h-4 w-4 mt-0.5 shrink-0" />
            <p>
              Änderungen gelten nur für neue Rechnungen. Bestehende Rechnungen
              bleiben unverändert.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSave} disabled={isPending}>
            {isPending ? "Speichern..." : "Speichern"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
