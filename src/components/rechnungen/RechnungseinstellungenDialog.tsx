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
import { Textarea } from "@/components/ui/textarea";
import { Rechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { Info, Building2, Calculator, Mail, Landmark, FileText } from "lucide-react";
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
    zahlungsfrist_tage: number;
    mahnung_nach_tagen: number;
    mahnung_betreff: string | null;
    mahnung_text: string | null;
    firma_hg: string | null;
    firma_fn: string | null;
    firma_uid: string | null;
    bank_name: string | null;
    bank_iban: string | null;
    bank_bic: string | null;
    zahlungskondition_text: string | null;
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
  // Berechnungseinstellungen
  const [mwstSatz, setMwstSatz] = useState<string>("20");
  const [bearbeitungsgebuehr, setBearbeitungsgebuehr] = useState<string>("0");
  const [zahlungsfristTage, setZahlungsfristTage] = useState<string>("14");
  const [mahnungNachTagen, setMahnungNachTagen] = useState<string>("7");
  
  // Firmendaten
  const [firmaName, setFirmaName] = useState<string>("");
  const [firmaBezeichnung, setFirmaBezeichnung] = useState<string>("");
  const [firmaStrasse, setFirmaStrasse] = useState<string>("");
  const [firmaPlz, setFirmaPlz] = useState<string>("");
  const [firmaOrt, setFirmaOrt] = useState<string>("");
  const [firmaTelefon, setFirmaTelefon] = useState<string>("");
  const [firmaEmail, setFirmaEmail] = useState<string>("");
  
  // Registerdaten (Neu)
  const [firmaHg, setFirmaHg] = useState<string>("");
  const [firmaFn, setFirmaFn] = useState<string>("");
  const [firmaUid, setFirmaUid] = useState<string>("");
  
  // Bankverbindung (Neu)
  const [bankName, setBankName] = useState<string>("");
  const [bankIban, setBankIban] = useState<string>("");
  const [bankBic, setBankBic] = useState<string>("");
  
  // Zahlungskondition (Neu)
  const [zahlungskonditionText, setZahlungskonditionText] = useState<string>("");
  
  // Mahnwesen
  const [mahnungBetreff, setMahnungBetreff] = useState<string>("");
  const [mahnungText, setMahnungText] = useState<string>("");

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
      setZahlungsfristTage(String(einstellungen.zahlungsfrist_tage || 14));
      setMahnungNachTagen(String(einstellungen.mahnung_nach_tagen || 7));
      setMahnungBetreff(einstellungen.mahnung_betreff || "Zahlungserinnerung - Rechnung {rechnungsnummer}");
      setMahnungText(einstellungen.mahnung_text || "");
      // Neue Felder
      setFirmaHg(einstellungen.firma_hg || "");
      setFirmaFn(einstellungen.firma_fn || "");
      setFirmaUid(einstellungen.firma_uid || "");
      setBankName(einstellungen.bank_name || "");
      setBankIban(einstellungen.bank_iban || "");
      setBankBic(einstellungen.bank_bic || "");
      setZahlungskonditionText(einstellungen.zahlungskondition_text || "Zahlungsfrist: {zahlungsfrist_tage} Tage netto");
    }
  }, [einstellungen]);

  const handleSave = () => {
    const mwst = parseFloat(mwstSatz.replace(",", ".")) || 0;
    const gebuehr = parseFloat(bearbeitungsgebuehr.replace(",", ".")) || 0;
    const zahlungsfrist = parseInt(zahlungsfristTage, 10) || 14;
    const mahnungNach = parseInt(mahnungNachTagen, 10) || 7;
    
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
      zahlungsfrist_tage: zahlungsfrist,
      mahnung_nach_tagen: mahnungNach,
      mahnung_betreff: mahnungBetreff || null,
      mahnung_text: mahnungText || null,
      // Neue Felder
      firma_hg: firmaHg || null,
      firma_fn: firmaFn || null,
      firma_uid: firmaUid || null,
      bank_name: bankName || null,
      bank_iban: bankIban || null,
      bank_bic: bankBic || null,
      zahlungskondition_text: zahlungskonditionText || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
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
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zahlungsfrist">Zahlungsfrist (Tage)</Label>
                <Input
                  id="zahlungsfrist"
                  type="number"
                  min="1"
                  value={zahlungsfristTage}
                  onChange={(e) => setZahlungsfristTage(e.target.value)}
                  placeholder="z.B. 14"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mahnungNachTagen">Mahnfrist (Tage nach Fälligkeit)</Label>
                <Input
                  id="mahnungNachTagen"
                  type="number"
                  min="0"
                  value={mahnungNachTagen}
                  onChange={(e) => setMahnungNachTagen(e.target.value)}
                  placeholder="z.B. 7"
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

          <Separator />

          {/* Registerdaten */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Registerdaten
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firmaHg">Handelsgericht (HG)</Label>
                <Input
                  id="firmaHg"
                  value={firmaHg}
                  onChange={(e) => setFirmaHg(e.target.value)}
                  placeholder="z.B. Salzburg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firmaFn">Firmenbuchnummer (FN)</Label>
                <Input
                  id="firmaFn"
                  value={firmaFn}
                  onChange={(e) => setFirmaFn(e.target.value)}
                  placeholder="z.B. 123456a"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firmaUid">UID-Nummer</Label>
                <Input
                  id="firmaUid"
                  value={firmaUid}
                  onChange={(e) => setFirmaUid(e.target.value)}
                  placeholder="z.B. ATU12345678"
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Bankverbindung */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Landmark className="h-4 w-4" />
              Bankverbindung (für QR-Code)
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="z.B. Volksbank"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankIban">IBAN</Label>
                <Input
                  id="bankIban"
                  value={bankIban}
                  onChange={(e) => setBankIban(e.target.value)}
                  placeholder="z.B. AT024501012100025688"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankBic">BIC</Label>
                <Input
                  id="bankBic"
                  value={bankBic}
                  onChange={(e) => setBankBic(e.target.value)}
                  placeholder="z.B. VBOEATWWSAL"
                />
              </div>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Mit diesen Daten wird ein EPC-QR-Code auf der Rechnung generiert, den Kunden mit Banking-Apps scannen können.
            </p>
          </div>

          <Separator />

          {/* Zahlungskondition */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Zahlungskondition
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="zahlungskonditionText">Konditionstext</Label>
              <Input
                id="zahlungskonditionText"
                value={zahlungskonditionText}
                onChange={(e) => setZahlungskonditionText(e.target.value)}
                placeholder="z.B. Zahlungsfrist: {zahlungsfrist_tage} Tage netto"
              />
              <p className="text-xs text-muted-foreground">
                Platzhalter: {"{zahlungsfrist_tage}"}
              </p>
            </div>
          </div>

          <Separator />

          {/* Mahnwesen */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Mahnwesen
            </h4>
            
            <div className="space-y-2">
              <Label htmlFor="mahnungBetreff">E-Mail-Betreff</Label>
              <Input
                id="mahnungBetreff"
                value={mahnungBetreff}
                onChange={(e) => setMahnungBetreff(e.target.value)}
                placeholder="z.B. Zahlungserinnerung - Rechnung {rechnungsnummer}"
              />
              <p className="text-xs text-muted-foreground">
                Platzhalter: {"{rechnungsnummer}"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mahnungText">E-Mail-Text</Label>
              <Textarea
                id="mahnungText"
                value={mahnungText}
                onChange={(e) => setMahnungText(e.target.value)}
                placeholder="Mahnung-Text mit Platzhaltern..."
                rows={8}
              />
              <p className="text-xs text-muted-foreground">
                Platzhalter: {"{kunde_name}"}, {"{rechnungsnummer}"}, {"{rechnungsdatum}"}, {"{bruttobetrag}"}, {"{faelligkeitsdatum}"}, {"{firma_name}"}
              </p>
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
