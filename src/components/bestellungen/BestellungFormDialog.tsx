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
import { CalendarDays } from "lucide-react";
import type { Bestellung, BestellungInsert } from "@/hooks/useBestellungen";
import {
  useKundenForSelect,
  useObjekteByKunde,
  useGenerateBestellnummer,
} from "@/hooks/useBestellungen";

interface BestellungFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bestellung: Bestellung | null;
  onSave: (data: BestellungInsert, buchungData?: BuchungData) => void;
}

export interface BuchungData {
  gastname: string;
  check_in: string;
  check_out: string;
  anzahl_personen: number;
  objekt_id: string;
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

  const [formData, setFormData] = useState({
    bestellnummer: "",
    kunde_id: "",
    objekt_id: "",
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
        lieferdatum: bestellung.lieferdatum || "",
        lieferzeit: bestellung.lieferzeit || "",
        abholdatum: bestellung.abholdatum || "",
        abholzeit: bestellung.abholzeit || "",
        notizen: bestellung.notizen || "",
        gastname: "",
        check_in: "",
        check_out: "",
        anzahl_personen: 1,
      });
    } else {
      setFormData({
        bestellnummer: nextBestellnummer || "",
        kunde_id: "",
        objekt_id: "",
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

  // Synchronisiere Liefer-/Abholdatum mit Check-in/Check-out bei 'mit_buchung'
  useEffect(() => {
    if (bestellmodus === "mit_buchung") {
      setFormData((prev) => ({
        ...prev,
        lieferdatum: prev.check_in,
        abholdatum: prev.check_out,
      }));
    }
  }, [formData.check_in, formData.check_out, bestellmodus]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bestellungData: BestellungInsert = {
      bestellnummer: formData.bestellnummer,
      kunde_id: formData.kunde_id,
      objekt_id: formData.objekt_id || null,
      lieferdatum: formData.lieferdatum || null,
      lieferzeit: formData.lieferzeit || null,
      abholdatum: formData.abholdatum || null,
      abholzeit: formData.abholzeit || null,
      notizen: formData.notizen || null,
    };

    // Bei 'mit_buchung' Buchungsdaten mitsenden
    if (bestellmodus === "mit_buchung" && !isEdit) {
      const buchungData: BuchungData = {
        gastname: formData.gastname,
        check_in: formData.check_in,
        check_out: formData.check_out,
        anzahl_personen: formData.anzahl_personen,
        objekt_id: formData.objekt_id,
      };
      onSave(bestellungData, buchungData);
    } else {
      onSave(bestellungData);
    }
  };

  const isFormValid = () => {
    if (!formData.kunde_id || !formData.bestellnummer) return false;
    if (bestellmodus === "mit_buchung" && !isEdit) {
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

          {/* Buchungsfelder - nur bei bestellmodus 'mit_buchung' und Neuerstellung */}
          {bestellmodus === "mit_buchung" && !isEdit && (
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

          {/* Liefer-/Abholdaten - bei 'nur_sets' oder beim Bearbeiten */}
          {(bestellmodus === "nur_sets" || isEdit) && (
            <>
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
            </>
          )}

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
