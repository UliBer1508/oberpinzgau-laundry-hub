import { useState, useEffect } from "react";
import { FileDown, MapPin, Package } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  useRoutenvorlagen,
  useBestellungenFuerVorlage,
} from "@/hooks/useRoutenvorlagen";

interface VorlageLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tourDatum: string;
  onLoad: (bestellungIds: string[]) => void;
}

export function VorlageLoadDialog({
  open,
  onOpenChange,
  tourDatum,
  onLoad,
}: VorlageLoadDialogProps) {
  const [selectedVorlageId, setSelectedVorlageId] = useState<string>("");

  const { data: vorlagen = [] } = useRoutenvorlagen();
  const { data: bestellungen = [], isLoading } = useBestellungenFuerVorlage(
    selectedVorlageId || null,
    tourDatum
  );

  // Reset bei Öffnen
  useEffect(() => {
    if (open) {
      setSelectedVorlageId("");
    }
  }, [open]);

  const aktiveVorlagen = vorlagen.filter((v) => v.aktiv);

  const handleLoad = () => {
    if (bestellungen.length === 0) return;

    const bestellungIds = bestellungen.map((b) => b.id);
    onLoad(bestellungIds);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Von Vorlage laden
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Routenvorlage auswählen</Label>
            <Select
              value={selectedVorlageId}
              onValueChange={setSelectedVorlageId}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Vorlage wählen..." />
              </SelectTrigger>
              <SelectContent>
                {aktiveVorlagen.map((vorlage) => (
                  <SelectItem key={vorlage.id} value={vorlage.id}>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{vorlage.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {vorlage.kundenCount} Kunden
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedVorlageId && (
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium mb-2">
                Gefundene Bestellungen für {tourDatum}:
              </div>

              {isLoading ? (
                <div className="text-sm text-muted-foreground">Laden...</div>
              ) : bestellungen.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  Keine Bestellungen der Vorlagen-Kunden für dieses Datum
                  gefunden.
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-auto">
                  {bestellungen.map((b, index) => (
                    <div
                      key={b.id}
                      className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50"
                    >
                      <Badge variant="outline" className="min-w-[1.5rem] justify-center">
                        {index + 1}
                      </Badge>
                      <Package className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">
                          {b.bestellnummer}
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {(b.kunden as any)?.firma || (b.kunden as any)?.name} -{" "}
                          {(b.objekte as any)?.name || "Kein Objekt"}
                        </div>
                      </div>
                      <Badge variant="secondary">{b.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            onClick={handleLoad}
            disabled={bestellungen.length === 0 || isLoading}
          >
            <FileDown className="h-4 w-4 mr-2" />
            {bestellungen.length} Bestellungen laden
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
