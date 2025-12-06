import { useState } from "react";
import { Plus, Minus, Trash2, Package } from "lucide-react";
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  useWaeschesetArtikel,
  useWaescheartikelForSelect,
  useAddArtikelToSet,
  useRemoveArtikelFromSet,
  useUpdateArtikelMenge,
  type Waescheset,
  type WaeschesetArtikel,
} from "@/hooks/useWaeschesets";
import { useToast } from "@/hooks/use-toast";

const FARB_STYLES: Record<string, string> = {
  "Weiß": "bg-white border border-gray-300",
  "Beige": "bg-amber-100",
  "Grau": "bg-gray-400",
  "Blau": "bg-blue-500",
  "Grün": "bg-green-500",
  "Anthrazit": "bg-gray-700",
};

interface WaeschesetArtikelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: Waescheset | null;
}

export function WaeschesetArtikelDialog({
  open,
  onOpenChange,
  set,
}: WaeschesetArtikelDialogProps) {
  const { toast } = useToast();
  const [selectedArtikel, setSelectedArtikel] = useState<string>("");
  const [menge, setMenge] = useState<number>(1);

  const { data: setArtikel = [], isLoading } = useWaeschesetArtikel(
    open ? set?.id ?? null : null
  );
  const { data: alleArtikel = [] } = useWaescheartikelForSelect();

  const addArtikel = useAddArtikelToSet();
  const removeArtikel = useRemoveArtikelFromSet();
  const updateMenge = useUpdateArtikelMenge();

  // Filter out already added articles
  const verfuegbareArtikel = alleArtikel.filter(
    (artikel) => !setArtikel.some((sa) => sa.artikel_id === artikel.id)
  );

  const handleAddArtikel = async () => {
    if (!set || !selectedArtikel) return;

    try {
      await addArtikel.mutateAsync({
        set_id: set.id,
        artikel_id: selectedArtikel,
        menge,
      });
      setSelectedArtikel("");
      setMenge(1);
      toast({ title: "Artikel hinzugefügt" });
    } catch {
      toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
    }
  };

  const handleRemoveArtikel = async (artikel: WaeschesetArtikel) => {
    if (!set) return;

    try {
      await removeArtikel.mutateAsync({ id: artikel.id, set_id: set.id });
      toast({ title: "Artikel entfernt" });
    } catch {
      toast({ title: "Fehler beim Entfernen", variant: "destructive" });
    }
  };

  const handleUpdateMenge = async (artikel: WaeschesetArtikel, newMenge: number) => {
    if (!set || newMenge < 1) return;

    try {
      await updateMenge.mutateAsync({
        id: artikel.id,
        menge: newMenge,
        set_id: set.id,
      });
    } catch {
      toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
    }
  };

  const getFarbStyle = (farbe: string | null) => {
    if (!farbe) return "bg-gray-200";
    return FARB_STYLES[farbe] || "bg-gray-200";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            <span>Artikel im Set: {set?.name}</span>
            <Badge variant="outline" className="ml-2">
              {set?.objektName}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Article list */}
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              Lade Artikel...
            </div>
          ) : setArtikel.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
              <Package className="h-10 w-10 text-muted-foreground/50" />
              <p className="mt-2 text-sm text-muted-foreground">
                Noch keine Artikel im Set. Fügen Sie unten Artikel hinzu.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Art.-Nr.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Kategorie</TableHead>
                    <TableHead>Farbe</TableHead>
                    <TableHead className="text-center">Menge</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {setArtikel.map((artikel) => (
                    <TableRow key={artikel.id}>
                      <TableCell className="font-mono text-sm">
                        {artikel.artikelNummer}
                      </TableCell>
                      <TableCell className="font-medium">
                        {artikel.artikelName}
                      </TableCell>
                      <TableCell>
                        {artikel.kategorie ? (
                          <Badge variant="outline">{artikel.kategorie}</Badge>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        {artikel.farbe ? (
                          <div className="flex items-center gap-2">
                            <span
                              className={`h-4 w-4 rounded-full ${getFarbStyle(artikel.farbe)}`}
                            />
                            <span className="text-sm">{artikel.farbe}</span>
                          </div>
                        ) : (
                          "-"
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              handleUpdateMenge(artikel, artikel.menge - 1)
                            }
                            disabled={artikel.menge <= 1}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={artikel.menge}
                            onChange={(e) =>
                              handleUpdateMenge(
                                artikel,
                                parseInt(e.target.value) || 1
                              )
                            }
                            className="h-7 w-14 text-center"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() =>
                              handleUpdateMenge(artikel, artikel.menge + 1)
                            }
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleRemoveArtikel(artikel)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Add article section */}
          <div className="flex gap-2 rounded-lg border bg-muted/50 p-4">
            <Select value={selectedArtikel} onValueChange={setSelectedArtikel}>
              <SelectTrigger className="flex-1 bg-background">
                <SelectValue placeholder="Artikel auswählen..." />
              </SelectTrigger>
              <SelectContent>
                {verfuegbareArtikel.length === 0 ? (
                  <SelectItem value="none" disabled>
                    Keine weiteren Artikel verfügbar
                  </SelectItem>
                ) : (
                  verfuegbareArtikel.map((artikel) => (
                    <SelectItem key={artikel.id} value={artikel.id}>
                      {artikel.artikelnummer} - {artikel.name}
                      {artikel.kategorie && ` (${artikel.kategorie})`}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            <Input
              type="number"
              min={1}
              value={menge}
              onChange={(e) => setMenge(parseInt(e.target.value) || 1)}
              className="w-20 bg-background"
              placeholder="Menge"
            />
            <Button
              onClick={handleAddArtikel}
              disabled={!selectedArtikel || addArtikel.isPending}
            >
              <Plus className="mr-2 h-4 w-4" />
              Hinzufügen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
