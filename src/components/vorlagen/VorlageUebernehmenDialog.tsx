import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowDownToLine, Layers } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useVorlagenSets, useApplyVorlageToObjekt } from "@/hooks/useVorlagenSets";
import { useKundenForWaeschesets, useObjekteByKunde } from "@/hooks/useWaeschesets";

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}

export function VorlageUebernehmenDialog({ open, onOpenChange }: Props) {
  const { toast } = useToast();
  const { data: vorlagen = [] } = useVorlagenSets();
  const { data: kunden = [] } = useKundenForWaeschesets();
  const [vorlageId, setVorlageId] = useState("");
  const [kundeId, setKundeId] = useState("");
  const [objektId, setObjektId] = useState("");
  const [name, setName] = useState("");
  const { data: objekte = [] } = useObjekteByKunde(kundeId || null);
  const applyMut = useApplyVorlageToObjekt();

  const aktive = useMemo(() => vorlagen.filter((v) => v.aktiv), [vorlagen]);
  const selectedVorlage = useMemo(() => vorlagen.find((v) => v.id === vorlageId), [vorlagen, vorlageId]);
  const selectedKunde = useMemo(() => kunden.find((k) => k.id === kundeId), [kunden, kundeId]);
  const selectedObjekt = useMemo(() => objekte.find((o) => o.id === objektId), [objekte, objektId]);

  useEffect(() => {
    if (!open) {
      setVorlageId(""); setKundeId(""); setObjektId(""); setName("");
    }
  }, [open]);

  useEffect(() => { setObjektId(""); }, [kundeId]);

  useEffect(() => {
    if (selectedVorlage && selectedKunde && selectedObjekt) {
      const k = selectedKunde.firma || selectedKunde.name;
      setName(`${k} - ${selectedObjekt.name} (${selectedVorlage.name})`);
    } else if (selectedVorlage) {
      setName(selectedVorlage.name);
    }
  }, [selectedVorlage, selectedKunde, selectedObjekt]);

  const canSubmit = vorlageId && objektId && name.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await applyMut.mutateAsync({
        vorlage_id: vorlageId,
        objekt_id: objektId,
        name: name.trim(),
        beschreibung: selectedVorlage?.beschreibung ?? null,
      });
      toast({ title: "Vorlage übernommen", description: `Set „${name}" wurde angelegt.` });
      onOpenChange(false);
    } catch {
      toast({ title: "Fehler beim Übernehmen", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Teuni-Vorlage übernehmen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Vorlage auswählen</Label>
            <ScrollArea className="h-48 rounded-md border">
              <div className="p-2 space-y-1">
                {aktive.length === 0 && (
                  <p className="text-sm text-muted-foreground p-3">Keine aktiven Vorlagen verfügbar.</p>
                )}
                {aktive.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setVorlageId(v.id)}
                    className={`w-full text-left rounded-md border p-3 text-sm transition-colors ${vorlageId === v.id ? "border-primary bg-primary/5" : "hover:bg-muted"}`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4 text-muted-foreground" />
                        {v.name}
                      </div>
                      {v.kategorie && <Badge variant="secondary">{v.kategorie}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{v.artikelCount} Artikel</div>
                    {v.beschreibung && <div className="text-xs text-muted-foreground mt-1 line-clamp-1">{v.beschreibung}</div>}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Kunde</Label>
              <Select value={kundeId} onValueChange={setKundeId}>
                <SelectTrigger><SelectValue placeholder="Kunde wählen…" /></SelectTrigger>
                <SelectContent>
                  {kunden.map((k) => (
                    <SelectItem key={k.id} value={k.id}>{k.firma || k.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Zielobjekt</Label>
              <Select value={objektId} onValueChange={setObjektId} disabled={!kundeId}>
                <SelectTrigger>
                  <SelectValue placeholder={kundeId ? "Objekt wählen…" : "Erst Kunden wählen"} />
                </SelectTrigger>
                <SelectContent>
                  {objekte.map((o) => (
                    <SelectItem key={o.id} value={o.id}>{o.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Name des neuen Sets</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleSubmit} disabled={!canSubmit || applyMut.isPending}>
            <ArrowDownToLine className="h-4 w-4 mr-1" />
            Übernehmen
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
