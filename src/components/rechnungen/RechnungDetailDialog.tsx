import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Badge } from "@/components/ui/badge";
import { Rechnung, RechnungStatus, useRechnungPositionen, useUpdateMahnungStatus } from "@/hooks/useRechnungen";
import { useRechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { RechnungStatusBadge } from "./RechnungStatusBadge";
import { formatPreis } from "@/lib/formatPreis";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CheckCircle, AlertTriangle, XCircle, Phone, Mail, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const { data: positionen = [], isLoading } = useRechnungPositionen(rechnung?.id || null);
  const { data: einstellungen } = useRechnungseinstellungen();
  const updateMahnung = useUpdateMahnungStatus();
  const [mahnungConfirmOpen, setMahnungConfirmOpen] = useState(false);

  if (!rechnung) return null;

  const hasFirmaData = einstellungen?.firma_name || einstellungen?.firma_bezeichnung;

  // Prüfen ob Rechnung überfällig ist
  const isOverdue = rechnung.status === 'offen' && 
    rechnung.faelligkeitsdatum && 
    new Date(rechnung.faelligkeitsdatum) < new Date();

  // Mahnung-E-Mail öffnen
  const handleSendMahnung = () => {
    if (!rechnung.kunde_email) {
      toast({
        title: "Keine E-Mail-Adresse",
        description: "Für diesen Kunden ist keine E-Mail-Adresse hinterlegt.",
        variant: "destructive",
      });
      return;
    }

    // Platzhalter ersetzen
    const replacePlaceholders = (text: string) => {
      return text
        .replace(/{kunde_name}/g, rechnung.kunde_name)
        .replace(/{rechnungsnummer}/g, rechnung.rechnungsnummer)
        .replace(/{rechnungsdatum}/g, format(new Date(rechnung.rechnungsdatum), "dd.MM.yyyy", { locale: de }))
        .replace(/{bruttobetrag}/g, formatPreis(rechnung.bruttobetrag))
        .replace(/{faelligkeitsdatum}/g, rechnung.faelligkeitsdatum 
          ? format(new Date(rechnung.faelligkeitsdatum), "dd.MM.yyyy", { locale: de }) 
          : "-")
        .replace(/{firma_name}/g, einstellungen?.firma_bezeichnung || einstellungen?.firma_name || "");
    };

    const subject = encodeURIComponent(replacePlaceholders(einstellungen?.mahnung_betreff || "Zahlungserinnerung - Rechnung {rechnungsnummer}"));
    const body = encodeURIComponent(replacePlaceholders(einstellungen?.mahnung_text || ""));

    // mailto: Link öffnen
    window.location.href = `mailto:${rechnung.kunde_email}?subject=${subject}&body=${body}`;

    // Bestätigungs-Dialog öffnen
    setMahnungConfirmOpen(true);
  };

  const handleConfirmMahnung = () => {
    updateMahnung.mutate(
      { id: rechnung.id },
      {
        onSuccess: () => {
          toast({
            title: "Mahnung vermerkt",
            description: "Die Mahnung wurde als gesendet markiert.",
          });
          setMahnungConfirmOpen(false);
        },
        onError: () => {
          toast({
            title: "Fehler",
            description: "Mahnung konnte nicht gespeichert werden.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              Rechnung {rechnung.rechnungsnummer}
              <RechnungStatusBadge status={rechnung.status} />
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  Überfällig
                </Badge>
              )}
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
                  {rechnung.kunde_email && (
                    <p className="text-muted-foreground mt-1 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {rechnung.kunde_email}
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
                <p className={`font-medium ${isOverdue ? 'text-destructive' : ''}`}>
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

            {/* Mahnungs-Info */}
            {(rechnung.mahnung_anzahl ?? 0) > 0 && (
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">
                    {rechnung.mahnung_anzahl} Mahnung{(rechnung.mahnung_anzahl ?? 0) > 1 ? "en" : ""} gesendet
                  </span>
                  {rechnung.mahnung_gesendet_am && (
                    <span className="text-muted-foreground">
                      (zuletzt: {format(new Date(rechnung.mahnung_gesendet_am), "dd.MM.yyyy HH:mm", { locale: de })})
                    </span>
                  )}
                </div>
              </div>
            )}

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
            <div className="flex gap-2 justify-end flex-wrap">
              {(rechnung.status === 'offen' || rechnung.status === 'mahnung') && rechnung.kunde_email && (
                <Button
                  variant="outline"
                  onClick={handleSendMahnung}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Mahnung per E-Mail
                </Button>
              )}
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

      {/* Mahnung Bestätigungs-Dialog */}
      <AlertDialog open={mahnungConfirmOpen} onOpenChange={setMahnungConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mahnung als gesendet markieren?</AlertDialogTitle>
            <AlertDialogDescription>
              Haben Sie die E-Mail über Ihren E-Mail-Client gesendet? 
              Wenn ja, wird die Mahnung in der Rechnung vermerkt.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Nein, abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmMahnung}>
              Ja, gesendet
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}