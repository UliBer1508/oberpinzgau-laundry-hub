import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  User, 
  Building2, 
  CalendarDays, 
  Package, 
  MapPin,
  Save,
  X,
  Loader2
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { 
  type ManagementBestellung, 
  useManagementPositionen,
  useUpdateManagementStatus,
  useUpdateWaeschekraft,
  useUpdateBearbeitungNotizen
} from "@/hooks/useManagementBestellungen";
import { useWaeschekraefteForSelect } from "@/hooks/useBestellungen";
import { toast } from "sonner";

interface BestellungDetailPanelProps {
  bestellung: ManagementBestellung | null;
  onClose: () => void;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  neu: { label: "Neu", className: "bg-blue-100 text-blue-700" },
  in_bearbeitung: { label: "In Bearbeitung", className: "bg-amber-100 text-amber-700" },
  ausgeliefert: { label: "Ausgeliefert", className: "bg-purple-100 text-purple-700" },
  abgeholt: { label: "Abgeholt", className: "bg-emerald-100 text-emerald-700" },
  abgeschlossen: { label: "Abgeschlossen", className: "bg-gray-100 text-gray-700" },
  storniert: { label: "Storniert", className: "bg-red-100 text-red-700" },
};

export function BestellungDetailPanel({ bestellung, onClose }: BestellungDetailPanelProps) {
  const [notizen, setNotizen] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: positionen, isLoading: loadingPositionen } = useManagementPositionen(bestellung?.id || null);
  const { data: waeschekraefte } = useWaeschekraefteForSelect();
  const updateStatus = useUpdateManagementStatus();
  const updateWaeschekraft = useUpdateWaeschekraft();
  const updateNotizen = useUpdateBearbeitungNotizen();

  useEffect(() => {
    if (bestellung) {
      setNotizen(bestellung.bearbeitung_notizen || "");
      setHasChanges(false);
    }
  }, [bestellung]);

  const handleNotizenChange = (value: string) => {
    setNotizen(value);
    setHasChanges(value !== (bestellung?.bearbeitung_notizen || ""));
  };

  const handleSaveNotizen = () => {
    if (!bestellung) return;
    
    updateNotizen.mutate(
      { id: bestellung.id, bearbeitung_notizen: notizen },
      {
        onSuccess: () => {
          toast.success("Notizen gespeichert");
          setHasChanges(false);
        },
        onError: () => toast.error("Fehler beim Speichern"),
      }
    );
  };

  const handleStatusChange = (newStatus: string) => {
    if (!bestellung) return;
    
    updateStatus.mutate(
      { id: bestellung.id, status: newStatus as "neu" | "in_bearbeitung" | "ausgeliefert" | "abgeholt" | "abgeschlossen" | "storniert" },
      {
        onSuccess: () => toast.success("Status aktualisiert"),
        onError: () => toast.error("Fehler beim Aktualisieren"),
      }
    );
  };

  const handleWaeschekraftChange = (value: string) => {
    if (!bestellung) return;
    
    updateWaeschekraft.mutate(
      { id: bestellung.id, waeschekraft_id: value === "none" ? null : value },
      {
        onSuccess: () => toast.success("Wäschekraft zugewiesen"),
        onError: () => toast.error("Fehler bei der Zuweisung"),
      }
    );
  };

  const status = bestellung?.status || "neu";
  const statusInfo = statusConfig[status] || statusConfig.neu;

  return (
    <Sheet open={!!bestellung} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <SheetTitle className="font-mono text-lg">
                {bestellung?.bestellnummer}
              </SheetTitle>
              <Badge className={cn("text-xs", statusInfo.className)}>
                {statusInfo.label}
              </Badge>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="p-4 space-y-6">
            {/* Kunde & Objekt */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Stammdaten
              </h3>
              
              <div className="space-y-2">
                <div className="flex items-start gap-3">
                  <User className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{bestellung?.kundeName}</div>
                    <div className="text-sm text-muted-foreground">
                      {bestellung?.kundeNummer}
                    </div>
                  </div>
                </div>

                {bestellung?.objektName && (
                  <div className="flex items-start gap-3">
                    <Building2 className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{bestellung.objektName}</div>
                      {(bestellung.objektStrasse || bestellung.objektOrt) && (
                        <div className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[bestellung.objektStrasse, bestellung.objektOrt].filter(Boolean).join(", ")}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </section>

            <Separator />

            {/* Termine */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Termine
              </h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Lieferung</div>
                  {bestellung?.lieferdatum ? (
                    <div>
                      <div className="font-medium">
                        {format(new Date(bestellung.lieferdatum), "EEEE", { locale: de })}
                      </div>
                      <div className="text-sm">
                        {format(new Date(bestellung.lieferdatum), "d. MMMM yyyy", { locale: de })}
                      </div>
                      {bestellung.lieferzeit && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {bestellung.lieferzeit} Uhr
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Nicht geplant</div>
                  )}
                </div>

                <div className="rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground mb-1">Abholung</div>
                  {bestellung?.abholdatum ? (
                    <div>
                      <div className="font-medium">
                        {format(new Date(bestellung.abholdatum), "EEEE", { locale: de })}
                      </div>
                      <div className="text-sm">
                        {format(new Date(bestellung.abholdatum), "d. MMMM yyyy", { locale: de })}
                      </div>
                      {bestellung.abholzeit && (
                        <div className="text-sm text-muted-foreground mt-1">
                          {bestellung.abholzeit} Uhr
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-muted-foreground">Nicht geplant</div>
                  )}
                </div>
              </div>
            </section>

            <Separator />

            {/* Zuweisung */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Zuweisung
              </h3>
              
              <Select
                value={bestellung?.waeschekraft_id || "none"}
                onValueChange={handleWaeschekraftChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wäschekraft auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Nicht zugewiesen —</SelectItem>
                  {waeschekraefte?.map((wk) => (
                    <SelectItem key={wk.id} value={wk.id}>
                      {wk.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>

            <Separator />

            {/* Positionen */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                  Positionen
                </h3>
                <Badge variant="outline" className="font-mono">
                  {positionen?.length || 0} Artikel
                </Badge>
              </div>
              
              {loadingPositionen ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : positionen && positionen.length > 0 ? (
                <div className="space-y-2">
                  {positionen.map((pos) => (
                    <div
                      key={pos.id}
                      className="flex items-center gap-3 rounded-lg border p-2"
                    >
                      {pos.bild_url ? (
                        <img
                          src={pos.bild_url}
                          alt={pos.artikelName}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                          <Package className="h-5 w-5 text-muted-foreground" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{pos.artikelName}</div>
                        <div className="text-xs text-muted-foreground">
                          {pos.artikelNummer}
                          {pos.farbe && ` • ${pos.farbe}`}
                        </div>
                      </div>
                      <Badge variant="secondary" className="font-mono">
                        x{pos.menge}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  Keine Positionen vorhanden
                </div>
              )}
            </section>

            <Separator />

            {/* Notizen */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Bearbeitungsnotizen
              </h3>
              
              <Textarea
                placeholder="Interne Notizen zur Bearbeitung..."
                value={notizen}
                onChange={(e) => handleNotizenChange(e.target.value)}
                rows={4}
              />

              {hasChanges && (
                <Button
                  onClick={handleSaveNotizen}
                  disabled={updateNotizen.isPending}
                  className="w-full"
                >
                  {updateNotizen.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Notizen speichern
                </Button>
              )}
            </section>

            <Separator />

            {/* Status ändern */}
            <section className="space-y-3">
              <h3 className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">
                Status ändern
              </h3>
              
              <Select value={status} onValueChange={handleStatusChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </section>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}