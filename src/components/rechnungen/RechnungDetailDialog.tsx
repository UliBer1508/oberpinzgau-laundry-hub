import { useState, useRef } from "react";
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
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Rechnung, RechnungStatus, useRechnungPositionen, useUpdateMahnungStatus } from "@/hooks/useRechnungen";
import { useRechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { RechnungStatusBadge } from "./RechnungStatusBadge";
import { RechnungDruckansicht } from "./RechnungDruckansicht";
import { formatPreis } from "@/lib/formatPreis";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { CheckCircle, AlertTriangle, XCircle, Send, Printer, Eye, EyeOff } from "lucide-react";
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
  const [showPrintView, setShowPrintView] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  if (!rechnung) return null;

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

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rechnung ${rechnung.rechnungsnummer}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; }
            @page { size: A4; margin: 15mm; }
            @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-3">
                Rechnung {rechnung.rechnungsnummer}
                <RechnungStatusBadge status={rechnung.status} />
                {isOverdue && (
                  <Badge variant="destructive" className="text-xs">
                    Überfällig
                  </Badge>
                )}
              </DialogTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPrintView(!showPrintView)}
                >
                  {showPrintView ? <EyeOff className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
                  {showPrintView ? "Bearbeiten" : "Vorschau"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                >
                  <Printer className="h-4 w-4 mr-1" />
                  Drucken
                </Button>
              </div>
            </div>
          </DialogHeader>

          {showPrintView ? (
            /* Druckansicht nach Vorlage */
            <div ref={printRef} className="border rounded-lg overflow-hidden">
              <RechnungDruckansicht
                rechnung={rechnung}
                positionen={positionen}
                einstellungen={einstellungen || null}
              />
            </div>
          ) : (
            /* Standard-Bearbeitungsansicht */
            <div className="space-y-6">
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

              <Separator />

              {/* Kunde */}
              <div className="text-sm">
                <p className="text-muted-foreground mb-1">Kunde</p>
                <p className="font-medium">
                  {rechnung.kunde_firma && `${rechnung.kunde_firma} - `}
                  {rechnung.kunde_name}
                  {rechnung.kunde_kundennummer && ` (${rechnung.kunde_kundennummer})`}
                </p>
                {(rechnung.kunde_strasse || rechnung.kunde_plz || rechnung.kunde_ort) && (
                  <p className="text-muted-foreground">
                    {rechnung.kunde_strasse}, {rechnung.kunde_plz} {rechnung.kunde_ort}
                  </p>
                )}
              </div>

              <Separator />

              {/* Beträge */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Netto</p>
                  <p className="font-medium">{formatPreis(rechnung.nettobetrag)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">MwSt ({rechnung.mwst_satz}%)</p>
                  <p className="font-medium">{formatPreis(rechnung.mwst_betrag)}</p>
                </div>
                {Number(rechnung.bearbeitungsgebuehr) > 0 && (
                  <div>
                    <p className="text-muted-foreground">Bearbeitungsgebühr</p>
                    <p className="font-medium">{formatPreis(rechnung.bearbeitungsgebuehr)}</p>
                  </div>
                )}
                <div>
                  <p className="text-muted-foreground">Brutto</p>
                  <p className="font-bold text-lg">{formatPreis(rechnung.bruttobetrag)}</p>
                </div>
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
          )}
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
