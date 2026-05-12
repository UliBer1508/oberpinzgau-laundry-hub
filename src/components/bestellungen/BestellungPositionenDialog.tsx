import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Minus, Trash2, Layers } from "lucide-react";
import { toast } from "sonner";
import type { Bestellung, BestellPosition } from "@/hooks/useBestellungen";
import {
  useBestellungPositionen,
  useAddPositionToBestellung,
  useRemovePositionFromBestellung,
  useUpdatePositionMenge,
  useAddWaeschesetToBestellung,
} from "@/hooks/useBestellungen";
import { useWaescheartikelForSelect } from "@/hooks/useWaeschesets";
import { useWaeschesetsByObjekt } from "@/hooks/useWaeschesets";
import { formatPreis } from "@/lib/formatPreis";

const FARB_STYLES: Record<string, string> = {
  weiß: "bg-gray-100 border-gray-300",
  beige: "bg-amber-100 border-amber-300",
  blau: "bg-blue-100 border-blue-300",
  grün: "bg-green-100 border-green-300",
  rot: "bg-red-100 border-red-300",
  grau: "bg-slate-200 border-slate-400",
  schwarz: "bg-gray-800 border-gray-900",
};

interface BestellungPositionenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bestellung: Bestellung | null;
}

export function BestellungPositionenDialog({
  open,
  onOpenChange,
  bestellung,
}: BestellungPositionenDialogProps) {
  const [selectedArtikel, setSelectedArtikel] = useState("");
  const [menge, setMenge] = useState(1);
  const [selectedSet, setSelectedSet] = useState("");

  const { data: positionen = [], isLoading } = useBestellungPositionen(bestellung?.id || null);
  const { data: artikel = [] } = useWaescheartikelForSelect();
  const { data: waeschesets = [] } = useWaeschesetsByObjekt(bestellung?.objekt_id || null);

  const addPosition = useAddPositionToBestellung();
  const removePosition = useRemovePositionFromBestellung();
  const updateMenge = useUpdatePositionMenge();
  const addWaescheset = useAddWaeschesetToBestellung();

  const availableArtikel = artikel.filter(
    (a) => !positionen.some((p) => p.artikel_id === a.id)
  );

  const gesamtpreis = useMemo(() => {
    return positionen.reduce((sum, pos) => {
      if (pos.preis !== null) {
        return sum + pos.menge * pos.preis;
      }
      return sum;
    }, 0);
  }, [positionen]);

  const hasAnyPrice = positionen.some((p) => p.preis !== null);

  const handleAddArtikel = async () => {
    if (!selectedArtikel || !bestellung) return;

    try {
      await addPosition.mutateAsync({
        bestellung_id: bestellung.id,
        artikel_id: selectedArtikel,
        menge,
      });
      setSelectedArtikel("");
      setMenge(1);
      toast.success("Artikel hinzugefügt");
    } catch {
      toast.error("Fehler beim Hinzufügen");
    }
  };

  const handleRemovePosition = async (position: BestellPosition) => {
    if (!bestellung) return;

    try {
      await removePosition.mutateAsync({
        id: position.id,
        bestellung_id: bestellung.id,
      });
      toast.success("Artikel entfernt");
    } catch {
      toast.error("Fehler beim Entfernen");
    }
  };

  const handleUpdateMenge = async (position: BestellPosition, newMenge: number) => {
    if (!bestellung || newMenge < 1) return;

    try {
      await updateMenge.mutateAsync({
        id: position.id,
        menge: newMenge,
        bestellung_id: bestellung.id,
      });
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleAddWaescheset = async () => {
    if (!selectedSet || !bestellung) return;

    try {
      const result = await addWaescheset.mutateAsync({
        bestellung_id: bestellung.id,
        set_id: selectedSet,
      });
      setSelectedSet("");
      toast.success(`${result.count} Artikel aus Kunden-Wäscheset übernommen`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Fehler beim Übernehmen");
    }
  };

  const getFarbStyle = (farbe: string | null) => {
    if (!farbe) return "";
    const key = farbe.toLowerCase();
    return FARB_STYLES[key] || "";
  };

  if (!bestellung) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            Positionen: {bestellung.bestellnummer}
            {bestellung.objektName && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                ({bestellung.objektName})
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Wäscheset übernehmen */}
          {bestellung.objekt_id && waeschesets && waeschesets.length > 0 && (
            <div className="rounded-lg border bg-muted/30 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium">
                <Layers className="h-4 w-4" />
                Kunden-Wäscheset übernehmen
              </h4>
              <div className="flex gap-2">
                <Select value={selectedSet} onValueChange={setSelectedSet}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Kunden-Wäscheset auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {waeschesets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={handleAddWaescheset}
                  disabled={!selectedSet || addWaescheset.isPending}
                >
                  Übernehmen
                </Button>
              </div>
            </div>
          )}

          {/* Positionen-Tabelle */}
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Art.-Nr.</TableHead>
                  <TableHead>Bezeichnung</TableHead>
                  <TableHead>Kategorie</TableHead>
                  <TableHead>Farbe</TableHead>
                  <TableHead className="w-[140px]">Menge</TableHead>
                  <TableHead className="text-right">E-Preis</TableHead>
                  <TableHead className="text-right">Summe</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      Lädt...
                    </TableCell>
                  </TableRow>
                ) : positionen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                      Keine Positionen vorhanden
                    </TableCell>
                  </TableRow>
                ) : (
                  positionen.map((position) => {
                    const positionSumme = position.preis !== null ? position.menge * position.preis : null;
                    return (
                      <TableRow key={position.id}>
                        <TableCell className="font-mono text-sm">
                          {position.artikelNummer}
                        </TableCell>
                        <TableCell>{position.artikelName}</TableCell>
                        <TableCell>{position.kategorie || "-"}</TableCell>
                        <TableCell>
                          {position.farbe ? (
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-4 w-4 rounded border ${getFarbStyle(position.farbe)}`}
                              />
                              <span className="text-sm">{position.farbe}</span>
                            </div>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateMenge(position, position.menge - 1)}
                              disabled={position.menge <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              value={position.menge}
                              onChange={(e) =>
                                handleUpdateMenge(position, parseInt(e.target.value, 10) || 1)
                              }
                              className="h-7 w-14 text-center"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleUpdateMenge(position, position.menge + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm">
                          {formatPreis(position.preis)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatPreis(positionSumme)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => handleRemovePosition(position)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
              {hasAnyPrice && positionen.length > 0 && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={6} className="text-right font-medium">
                      Gesamtpreis:
                    </TableCell>
                    <TableCell className="text-right font-bold">
                      {formatPreis(gesamtpreis)}
                    </TableCell>
                    <TableCell />
                  </TableRow>
                </TableFooter>
              )}
            </Table>
          </div>

          {/* Artikel hinzufügen */}
          <div className="rounded-lg border bg-muted/30 p-4">
            <h4 className="mb-3 text-sm font-medium">Artikel hinzufügen</h4>
            <div className="flex gap-2">
              <Select value={selectedArtikel} onValueChange={setSelectedArtikel}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Artikel auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {availableArtikel.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.artikelnummer} - {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={menge}
                onChange={(e) => setMenge(parseInt(e.target.value, 10) || 1)}
                className="w-20"
              />
              <Button
                onClick={handleAddArtikel}
                disabled={!selectedArtikel || addPosition.isPending}
              >
                <Plus className="mr-2 h-4 w-4" />
                Hinzufügen
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
