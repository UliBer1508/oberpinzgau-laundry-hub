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
import { Separator } from "@/components/ui/separator";
import { Rechnung, RechnungStatus, useRechnungPositionen } from "@/hooks/useRechnungen";
import { useRechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { RechnungStatusBadge } from "./RechnungStatusBadge";
import { formatPreis } from "@/lib/formatPreis";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CheckCircle, AlertTriangle, XCircle, Phone, Mail } from "lucide-react";

interface RechnungDetailDialogProps {
  rechnung: Rechnung | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange: (id: string, status: RechnungStatus) => void;
}

export function RechnungDetailDialog({
  rechnung,
  open,
  onOpenChange,
  onStatusChange,
}: RechnungDetailDialogProps) {
  const { data: positionen = [], isLoading } = useRechnungPositionen(rechnung?.id || null);
  const { data: einstellungen } = useRechnungseinstellungen();

  if (!rechnung) return null;

  const hasFirmaData = einstellungen?.firma_name || einstellungen?.firma_bezeichnung;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Rechnung {rechnung.rechnungsnummer}
            <RechnungStatusBadge status={rechnung.status} />
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Briefkopf: Kunde links, Firma rechts */}
          <div className="grid grid-cols-2 gap-8">
            {/* Linke Seite: Kundendaten */}
            <div className="space-y-3">
              {/* Kundennummer Hinweis */}
              {rechnung.kunde_kundennummer && (
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold">Kunden-Nr. {rechnung.kunde_kundennummer}</p>
                  <p className="text-muted-foreground italic">
                    (Bei Zahlung/Rücksendung/Gutschrift bitte unbedingt angeben!)
                  </p>
                </div>
              )}

              {/* Kundenadresse */}
              <div className="border rounded-md p-3 text-sm">
                {rechnung.kunde_firma && <p className="font-medium">{rechnung.kunde_firma}</p>}
                <p>{rechnung.kunde_name}</p>
                {rechnung.kunde_strasse && <p>{rechnung.kunde_strasse}</p>}
                {(rechnung.kunde_plz || rechnung.kunde_ort) && (
                  <p>
                    {rechnung.kunde_plz} {rechnung.kunde_ort}
                  </p>
                )}
              </div>
            </div>

            {/* Rechte Seite: Firmendaten */}
            <div className="text-right text-sm">
              {hasFirmaData ? (
                <div className="space-y-1">
                  {einstellungen?.firma_bezeichnung && (
                    <p className="font-semibold">{einstellungen.firma_bezeichnung}</p>
                  )}
                  {einstellungen?.firma_name && (
                    <p>{einstellungen.firma_name}</p>
                  )}
                  {einstellungen?.firma_strasse && (
                    <p>{einstellungen.firma_strasse}</p>
                  )}
                  {(einstellungen?.firma_plz || einstellungen?.firma_ort) && (
                    <p>
                      {einstellungen.firma_plz} {einstellungen.firma_ort}
                    </p>
                  )}
                  <div className="pt-2 text-muted-foreground space-y-0.5">
                    {einstellungen?.firma_telefon && (
                      <p className="flex items-center justify-end gap-1">
                        <Phone className="h-3 w-3" />
                        {einstellungen.firma_telefon}
                      </p>
                    )}
                    {einstellungen?.firma_email && (
                      <p className="flex items-center justify-end gap-1">
                        <Mail className="h-3 w-3" />
                        {einstellungen.firma_email}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground italic">
                  Firmendaten nicht hinterlegt
                </p>
              )}
            </div>
          </div>

          <Separator />

          {/* Rechnungsdaten */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Rechnungsdatum</p>
              <p className="font-medium">
                {format(new Date(rechnung.rechnungsdatum), "dd.MM.yyyy", { locale: de })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Fällig am</p>
              <p className="font-medium">
                {rechnung.faelligkeitsdatum
                  ? format(new Date(rechnung.faelligkeitsdatum), "dd.MM.yyyy", { locale: de })
                  : "-"}
              </p>
            </div>
            {rechnung.bezahlt_am && (
              <div>
                <p className="text-muted-foreground">Bezahlt am</p>
                <p className="font-medium">
                  {format(new Date(rechnung.bezahlt_am), "dd.MM.yyyy", { locale: de })}
                </p>
              </div>
            )}
            <div>
              <p className="text-muted-foreground">Bestellung</p>
              <p className="font-medium">{rechnung.bestellnummer}</p>
            </div>
          </div>

          <Separator />

          {/* Positionen */}
          <div>
            <p className="text-sm text-muted-foreground mb-2">Positionen</p>
            {isLoading ? (
              <p className="text-muted-foreground text-sm">Lade Positionen...</p>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Art.-Nr.</TableHead>
                      <TableHead>Bezeichnung</TableHead>
                      <TableHead className="text-right">Menge</TableHead>
                      <TableHead className="text-right">E-Preis</TableHead>
                      <TableHead className="text-right">Gesamt</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positionen.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          Keine Positionen
                        </TableCell>
                      </TableRow>
                    ) : (
                      positionen.map((pos) => (
                        <TableRow key={pos.id}>
                          <TableCell className="font-mono text-sm">{pos.artikelnummer}</TableCell>
                          <TableCell>{pos.bezeichnung}</TableCell>
                          <TableCell className="text-right">{pos.menge}</TableCell>
                          <TableCell className="text-right">{formatPreis(pos.einzelpreis)}</TableCell>
                          <TableCell className="text-right">{formatPreis(pos.gesamtpreis)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">
                        Netto
                      </TableCell>
                      <TableCell className="text-right">{formatPreis(rechnung.nettobetrag)}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} className="text-right">
                        MwSt ({rechnung.mwst_satz}%)
                      </TableCell>
                      <TableCell className="text-right">{formatPreis(rechnung.mwst_betrag)}</TableCell>
                    </TableRow>
                    {Number(rechnung.bearbeitungsgebuehr) > 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-right">
                          Bearbeitungsgebühr
                        </TableCell>
                        <TableCell className="text-right">{formatPreis(rechnung.bearbeitungsgebuehr)}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell colSpan={4} className="text-right font-bold">
                        Brutto
                      </TableCell>
                      <TableCell className="text-right font-bold">
                        {formatPreis(rechnung.bruttobetrag)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            )}
          </div>

          {/* Notizen */}
          {rechnung.notizen && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-2">Notizen</p>
                <p className="text-sm">{rechnung.notizen}</p>
              </div>
            </>
          )}

          {/* Aktionen */}
          <Separator />
          <div className="flex gap-2 justify-end">
            {rechnung.status !== 'bezahlt' && (
              <Button
                variant="default"
                onClick={() => {
                  onStatusChange(rechnung.id, 'bezahlt');
                  onOpenChange(false);
                }}
              >
                <CheckCircle className="mr-2 h-4 w-4" />
                Als bezahlt markieren
              </Button>
            )}
            {rechnung.status === 'offen' && (
              <Button
                variant="outline"
                onClick={() => {
                  onStatusChange(rechnung.id, 'mahnung');
                  onOpenChange(false);
                }}
              >
                <AlertTriangle className="mr-2 h-4 w-4" />
                Mahnung
              </Button>
            )}
            {rechnung.status !== 'storniert' && (
              <Button
                variant="destructive"
                onClick={() => {
                  onStatusChange(rechnung.id, 'storniert');
                  onOpenChange(false);
                }}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Stornieren
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
