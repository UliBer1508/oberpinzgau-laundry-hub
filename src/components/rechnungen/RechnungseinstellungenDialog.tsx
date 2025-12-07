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
import { Info, Building2, Calculator } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface RechnungseinstellungenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  einstellungen: Rechnungseinstellungen | null;
  onSave: (data: {
    mwst_satz: number;
    bearbeitungsgebuehr: number;
    firma_name: string | null;
    firma_bezeichnung: string | null;
    firma_strasse: string | null;
    firma_plz: string | null;
    firma_ort: string | null;
    firma_telefon: string | null;
    firma_email: string | null;
  }) => void;
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
  const [firmaName, setFirmaName] = useState<string>("");
  const [firmaBezeichnung, setFirmaBezeichnung] = useState<string>("");
  const [firmaStrasse, setFirmaStrasse] = useState<string>("");
  const [firmaPlz, setFirmaPlz] = useState<string>("");
  const [firmaOrt, setFirmaOrt] = useState<string>("");
  const [firmaTelefon, setFirmaTelefon] = useState<string>("");
  const [firmaEmail, setFirmaEmail] = useState<string>("");

  useEffect(() => {
    if (einstellungen) {
      setMwstSatz(String(einstellungen.mwst_satz));
      setBearbeitungsgebuehr(String(einstellungen.bearbeitungsgebuehr));
      setFirmaName(einstellungen.firma_name || "");
      setFirmaBezeichnung(einstellungen.firma_bezeichnung || "");
      setFirmaStrasse(einstellungen.firma_strasse || "");
      setFirmaPlz(einstellungen.firma_plz || "");
      setFirmaOrt(einstellungen.firma_ort || "");
      setFirmaTelefon(einstellungen.firma_telefon || "");
      setFirmaEmail(einstellungen.firma_email || "");
    }
  }, [einstellungen]);

  const handleSave = () => {
    const mwst = parseFloat(mwstSatz.replace(",", ".")) || 0;
    const gebuehr = parseFloat(bearbeitungsgebuehr.replace(",", ".")) || 0;
    onSave({
      mwst_satz: mwst,
      bearbeitungsgebuehr: gebuehr,
      firma_name: firmaName || null,
      firma_bezeichnung: firmaBezeichnung || null,
      firma_strasse: firmaStrasse || null,
      firma_plz: firmaPlz || null,
      firma_ort: firmaOrt || null,
      firma_telefon: firmaTelefon || null,
      firma_email: firmaEmail || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rechnungseinstellungen bearbeiten</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Berechnungseinstellungen */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Berechnungseinstellungen
            </h4>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>

          <Separator />

          {/* Firmendaten */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Absender (Rechnungskopf)
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firmaBezeichnung">Firmenbezeichnung</Label>
                <Input
                  id="firmaBezeichnung"
                  value={firmaBezeichnung}
                  onChange={(e) => setFirmaBezeichnung(e.target.value)}
                  placeholder="z.B. Wäsche Pinzgau"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firmaName">Inhaber / Name</Label>
                <Input
                  id="firmaName"
                  value={firmaName}
                  onChange={(e) => setFirmaName(e.target.value)}
                  placeholder="z.B. Max Mustermann"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="firmaStrasse">Straße</Label>
              <Input
                id="firmaStrasse"
                value={firmaStrasse}
                onChange={(e) => setFirmaStrasse(e.target.value)}
                placeholder="z.B. Musterstraße 123"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firmaPlz">PLZ</Label>
                <Input
                  id="firmaPlz"
                  value={firmaPlz}
                  onChange={(e) => setFirmaPlz(e.target.value)}
                  placeholder="z.B. 5730"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="firmaOrt">Ort</Label>
                <Input
                  id="firmaOrt"
                  value={firmaOrt}
                  onChange={(e) => setFirmaOrt(e.target.value)}
                  placeholder="z.B. Mittersill"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firmaTelefon">Telefon</Label>
                <Input
                  id="firmaTelefon"
                  value={firmaTelefon}
                  onChange={(e) => setFirmaTelefon(e.target.value)}
                  placeholder="z.B. +43 664 1234567"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firmaEmail">E-Mail</Label>
                <Input
                  id="firmaEmail"
                  type="email"
                  value={firmaEmail}
                  onChange={(e) => setFirmaEmail(e.target.value)}
                  placeholder="z.B. info@firma.at"
                />
              </div>
            </div>
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
