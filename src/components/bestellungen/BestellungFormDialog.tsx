import { useEffect, useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Bestellung, BestellungInsert } from "@/hooks/useBestellungen";
import {
  useKundenForSelect,
  useObjekteByKunde,
  useWaeschekraefteForSelect,
  useGenerateBestellnummer,
} from "@/hooks/useBestellungen";

interface BestellungFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bestellung: Bestellung | null;
  onSave: (data: BestellungInsert) => void;
}

export function BestellungFormDialog({
  open,
  onOpenChange,
  bestellung,
  onSave,
}: BestellungFormDialogProps) {
  const isEdit = !!bestellung;
  const { data: kunden = [] } = useKundenForSelect();
  const { data: waeschekraefte = [] } = useWaeschekraefteForSelect();
  const { data: nextBestellnummer } = useGenerateBestellnummer();

  const [formData, setFormData] = useState({
    bestellnummer: "",
    kunde_id: "",
    objekt_id: "",
    waeschekraft_id: "",
    lieferdatum: "",
    lieferzeit: "",
    abholdatum: "",
    abholzeit: "",
    notizen: "",
  });

  const { data: objekte = [] } = useObjekteByKunde(formData.kunde_id || null);

  useEffect(() => {
    if (bestellung) {
      setFormData({
        bestellnummer: bestellung.bestellnummer,
        kunde_id: bestellung.kunde_id,
        objekt_id: bestellung.objekt_id || "",
        waeschekraft_id: bestellung.waeschekraft_id || "",
        lieferdatum: bestellung.lieferdatum || "",
        lieferzeit: bestellung.lieferzeit || "",
        abholdatum: bestellung.abholdatum || "",
        abholzeit: bestellung.abholzeit || "",
        notizen: bestellung.notizen || "",
      });
    } else {
      setFormData({
        bestellnummer: nextBestellnummer || "",
        kunde_id: "",
        objekt_id: "",
        waeschekraft_id: "",
        lieferdatum: "",
        lieferzeit: "",
        abholdatum: "",
        abholzeit: "",
        notizen: "",
      });
    }
  }, [bestellung, nextBestellnummer, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      bestellnummer: formData.bestellnummer,
      kunde_id: formData.kunde_id,
      objekt_id: formData.objekt_id || null,
      waeschekraft_id: formData.waeschekraft_id || null,
      lieferdatum: formData.lieferdatum || null,
      lieferzeit: formData.lieferzeit || null,
      abholdatum: formData.abholdatum || null,
      abholzeit: formData.abholzeit || null,
      notizen: formData.notizen || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Bestellung bearbeiten" : "Neue Bestellung"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bestellnummer">Bestellnummer</Label>
              <Input
                id="bestellnummer"
                value={formData.bestellnummer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, bestellnummer: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kunde">Kunde *</Label>
              <Select
                value={formData.kunde_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, kunde_id: value, objekt_id: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {kunden.map((kunde) => (
                    <SelectItem key={kunde.id} value={kunde.id}>
                      {kunde.name} ({kunde.kundennummer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="objekt">Objekt</Label>
              <Select
                value={formData.objekt_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, objekt_id: value }))
                }
                disabled={!formData.kunde_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder={formData.kunde_id ? "Objekt auswählen" : "Erst Kunde wählen"} />
                </SelectTrigger>
                <SelectContent>
                  {objekte.map((objekt) => (
                    <SelectItem key={objekt.id} value={objekt.id}>
                      {objekt.name} ({objekt.objektnummer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="waeschekraft">Wäschekraft</Label>
              <Select
                value={formData.waeschekraft_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, waeschekraft_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wäschekraft zuweisen" />
                </SelectTrigger>
                <SelectContent>
                  {waeschekraefte.map((wk) => (
                    <SelectItem key={wk.id} value={wk.id}>
                      {wk.name} ({wk.personalnummer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lieferdatum">Lieferdatum</Label>
              <Input
                id="lieferdatum"
                type="date"
                value={formData.lieferdatum}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lieferdatum: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lieferzeit">Lieferzeit</Label>
              <Input
                id="lieferzeit"
                type="time"
                value={formData.lieferzeit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lieferzeit: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="abholdatum">Abholdatum</Label>
              <Input
                id="abholdatum"
                type="date"
                value={formData.abholdatum}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, abholdatum: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="abholzeit">Abholzeit</Label>
              <Input
                id="abholzeit"
                type="time"
                value={formData.abholzeit}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, abholzeit: e.target.value }))
                }
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              value={formData.notizen}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notizen: e.target.value }))
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={!formData.kunde_id || !formData.bestellnummer}>
              {isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
