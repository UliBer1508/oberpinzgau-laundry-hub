import { useEffect, useState, useMemo } from "react";
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
import { CalendarDays, Package, User } from "lucide-react";
import type { Bestellung, BestellungInsert } from "@/hooks/useBestellungen";
import {
  useKundenForSelect,
  useObjekteByKunde,
  useGenerateBestellnummer,
  useWaeschekraefteForSelect,
} from "@/hooks/useBestellungen";
import { useWaeschesetsByObjekt } from "@/hooks/useWaeschesets";

interface BestellungFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bestellung: Bestellung | null;
  onSave: (data: BestellungInsert, formData?: BestellungFormData) => void;
}

export interface BestellungFormData {
  waescheset_id: string;
  anzahl_personen: number;
}

export function BestellungFormDialog({
  open,
  onOpenChange,
  bestellung,
  onSave,
}: BestellungFormDialogProps) {
  const isEdit = !!bestellung;
  const { data: kunden = [] } = useKundenForSelect();
  const { data: nextBestellnummer } = useGenerateBestellnummer();
  const { data: waeschekraefte = [] } = useWaeschekraefteForSelect();

  const [formData, setFormData] = useState({
    bestellnummer: "",
    kunde_id: "",
    objekt_id: "",
    waescheset_id: "",
    waeschekraft_id: "",
    lieferdatum: "",
    lieferzeit: "",
    abholdatum: "",
    abholzeit: "",
    notizen: "",
    // Buchungsfelder für bestellmodus 'mit_buchung'
    gastname: "",
    check_in: "",
    check_out: "",
    anzahl_personen: 1,
  });

  const { data: objekte = [] } = useObjekteByKunde(formData.kunde_id || null);
  const { data: waeschesets = [] } = useWaeschesetsByObjekt(formData.objekt_id || null);

  // Ermitteln des Bestellmodus für den ausgewählten Kunden
  const selectedKunde = useMemo(() => {
    return kunden.find((k) => k.id === formData.kunde_id);
  }, [kunden, formData.kunde_id]);

  const bestellmodus = selectedKunde?.bestellmodus || "mit_buchung";

  useEffect(() => {
    if (bestellung) {
      setFormData({
        bestellnummer: bestellung.bestellnummer,
        kunde_id: bestellung.kunde_id,
        objekt_id: bestellung.objekt_id || "",
        waescheset_id: "",
        waeschekraft_id: bestellung.waeschekraft_id || "",
        lieferdatum: bestellung.lieferdatum || "",
        lieferzeit: bestellung.lieferzeit || "",
        abholdatum: bestellung.abholdatum || "",
        abholzeit: bestellung.abholzeit || "",
        notizen: bestellung.notizen || "",
        gastname: (bestellung as any).gastname || "",
        check_in: (bestellung as any).check_in || "",
        check_out: (bestellung as any).check_out || "",
        anzahl_personen: (bestellung as any).anzahl_personen || 1,
      });
    } else {
      setFormData({
        bestellnummer: nextBestellnummer || "",
        kunde_id: "",
        objekt_id: "",
        waescheset_id: "",
        waeschekraft_id: "",
        lieferdatum: "",
        lieferzeit: "",
        abholdatum: "",
        abholzeit: "",
        notizen: "",
        gastname: "",
        check_in: "",
        check_out: "",
        anzahl_personen: 1,
      });
    }
  }, [bestellung, nextBestellnummer, open]);

  // Synchronisiere Lieferdatum mit Check-in bei 'mit_buchung'
  // Lieferdatum = 1 Tag vor Check-in (Wäsche muss vor Ankunft da sein)
  useEffect(() => {
    if (bestellmodus === "mit_buchung" && formData.check_in) {
      const checkInDate = new Date(formData.check_in);
      checkInDate.setDate(checkInDate.getDate() - 1);
      const lieferdatum = checkInDate.toISOString().split('T')[0];
      
      setFormData((prev) => ({
        ...prev,
        lieferdatum: lieferdatum,
      }));
    }
  }, [formData.check_in, bestellmodus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bestellungData: BestellungInsert = {
      bestellnummer: formData.bestellnummer,
      kunde_id: formData.kunde_id,
      objekt_id: formData.objekt_id || null,
      waeschekraft_id: formData.waeschekraft_id || null,
      lieferdatum: formData.lieferdatum || null,
      lieferzeit: formData.lieferzeit || null,
      abholdatum: formData.abholdatum || null,
      abholzeit: formData.abholzeit || null,
      notizen: formData.notizen || null,
      // Buchungsdaten direkt in der Bestellung speichern
      gastname: bestellmodus === "mit_buchung" ? (formData.gastname || null) : null,
      check_in: bestellmodus === "mit_buchung" ? (formData.check_in || null) : null,
      check_out: bestellmodus === "mit_buchung" ? (formData.check_out || null) : null,
      anzahl_personen: formData.anzahl_personen,
    };

    const additionalFormData: BestellungFormData = {
      waescheset_id: formData.waescheset_id,
      anzahl_personen: formData.anzahl_personen,
    };

    onSave(bestellungData, additionalFormData);
  };

  const isFormValid = () => {
    if (!formData.kunde_id || !formData.bestellnummer) return false;
    if (bestellmodus === "mit_buchung") {
      return formData.objekt_id && formData.check_in && formData.check_out;
    }
    return true;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
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
                  setFormData((prev) => ({ 
                    ...prev, 
                    kunde_id: value, 
                    objekt_id: "",
                    check_in: "",
                    check_out: "",
                    gastname: "",
                    anzahl_personen: 1,
                  }))
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

          <div className="space-y-2">
            <Label htmlFor="objekt">Objekt {bestellmodus === "mit_buchung" && "*"}</Label>
            <Select
              value={formData.objekt_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, objekt_id: value, waescheset_id: "" }))
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

          {/* Wäscheset-Auswahl */}
          {formData.objekt_id && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="waescheset">Wäscheset</Label>
              </div>
              <Select
                value={formData.waescheset_id}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, waescheset_id: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wäscheset auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {waeschesets.length === 0 ? (
                    <SelectItem value="_none" disabled>
                      Keine Wäschesets für dieses Objekt
                    </SelectItem>
                  ) : (
                    waeschesets.map((set) => (
                      <SelectItem key={set.id} value={set.id}>
                        {set.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Wäschekraft-Zuweisung */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="waeschekraft">Wäschekraft</Label>
            </div>
            <Select
              value={formData.waeschekraft_id}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, waeschekraft_id: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Wäschekraft zuweisen (optional)" />
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

          {/* Buchungsfelder - bei bestellmodus 'mit_buchung' */}
          {bestellmodus === "mit_buchung" && (
            <div className="space-y-4 rounded-lg border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-primary">
                <CalendarDays className="h-4 w-4" />
                Buchungsdaten
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="check_in">Check-in *</Label>
                  <Input
                    id="check_in"
                    type="date"
                    value={formData.check_in}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, check_in: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="check_out">Check-out *</Label>
                  <Input
                    id="check_out"
                    type="date"
                    value={formData.check_out}
                    min={formData.check_in}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, check_out: e.target.value }))
                    }
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="gastname">Gastname</Label>
                  <Input
                    id="gastname"
                    value={formData.gastname}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, gastname: e.target.value }))
                    }
                    placeholder="Name des Gastes"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="anzahl_personen">Anzahl Gäste</Label>
                  <Input
                    id="anzahl_personen"
                    type="number"
                    min={1}
                    value={formData.anzahl_personen}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, anzahl_personen: parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {/* Liefer-/Abholdaten - immer anzeigen */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="lieferdatum">
                Lieferdatum
                {bestellmodus === "mit_buchung" && formData.check_in && (
                  <span className="ml-1 text-xs text-muted-foreground">(Check-in - 1 Tag)</span>
                )}
              </Label>
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
            <Button type="submit" disabled={!isFormValid()}>
              {isEdit ? "Speichern" : "Erstellen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
