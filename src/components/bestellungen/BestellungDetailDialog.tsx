import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Building2, 
  Calendar, 
  CalendarDays, 
  Clock, 
  FileText, 
  MapPin, 
  Package, 
  Phone, 
  Mail, 
  User, 
  Users,
  Receipt,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Truck,
  CircleDot,
  ExternalLink
} from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useBestellungDetail, type BestellungDetailData } from "@/hooks/useBestellungDetail";
import { formatPreis } from "@/lib/formatPreis";
import { BestellungStatusBadge } from "./BestellungStatusBadge";
import type { BestellungStatus } from "@/hooks/useBestellungen";

interface BestellungDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bestellungId: string | null;
  onViewRechnung?: (rechnungId: string) => void;
}

const STATUS_LABELS: Record<string, string> = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  ausgeliefert: "Ausgeliefert",
  abgeholt: "Abgeholt",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
};

const RECHNUNG_STATUS_COLORS: Record<string, string> = {
  offen: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  bezahlt: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  storniert: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  mahnung: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
};

function getHistoryIcon(status: string) {
  switch (status) {
    case "neu": return <CircleDot className="h-4 w-4 text-blue-500" />;
    case "in_bearbeitung": return <Timer className="h-4 w-4 text-yellow-500" />;
    case "ausgeliefert": return <Truck className="h-4 w-4 text-purple-500" />;
    case "abgeholt": return <Package className="h-4 w-4 text-indigo-500" />;
    case "abgeschlossen": return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case "storniert": return <XCircle className="h-4 w-4 text-red-500" />;
    default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

export function BestellungDetailDialog({
  open,
  onOpenChange,
  bestellungId,
  onViewRechnung,
}: BestellungDetailDialogProps) {
  const { data: detail, isLoading } = useBestellungDetail(bestellungId);

  if (!open) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-3xl p-0 flex flex-col"
      >
        <SheetHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">
                Bestellung {detail?.bestellnummer || "..."}
              </SheetTitle>
              {detail && (
                <p className="text-sm text-muted-foreground mt-1">
                  Erstellt am {format(new Date(detail.created_at), "dd.MM.yyyy 'um' HH:mm", { locale: de })} Uhr
                </p>
              )}
            </div>
            {detail?.status && (
              <BestellungStatusBadge status={detail.status as BestellungStatus} />
            )}
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Lädt Details...</p>
            </div>
          ) : detail ? (
            <div className="p-6 space-y-6">
              {/* Kunde & Objekt */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Kunde */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                    <Building2 className="h-4 w-4" />
                    Kunde
                  </h3>
                  {detail.kunde ? (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <p className="font-medium text-lg">{detail.kunde.name}</p>
                      {detail.kunde.firma && (
                        <p className="text-muted-foreground">{detail.kunde.firma}</p>
                      )}
                      <p className="text-sm text-muted-foreground">
                        Kundennummer: {detail.kunde.kundennummer}
                      </p>
                      {detail.kunde.strasse && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>
                            {detail.kunde.strasse}
                            {detail.kunde.plz && detail.kunde.ort && (
                              <>, {detail.kunde.plz} {detail.kunde.ort}</>
                            )}
                          </span>
                        </div>
                      )}
                      {detail.kunde.telefon && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{detail.kunde.telefon}</span>
                        </div>
                      )}
                      {detail.kunde.email && (
                        <div className="flex items-center gap-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{detail.kunde.email}</span>
                        </div>
                      )}
                      <Badge variant="outline" className="mt-2">
                        {detail.kunde.bestellmodus === "mit_buchung" ? "Mit Buchungsdaten" : "Nur Sets"}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Kein Kunde zugeordnet</p>
                  )}
                </div>

                {/* Objekt */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                    <Building2 className="h-4 w-4" />
                    Objekt
                  </h3>
                  {detail.objekt ? (
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <p className="font-medium text-lg">{detail.objekt.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Objektnummer: {detail.objekt.objektnummer}
                      </p>
                      {detail.objekt.strasse && (
                        <div className="flex items-start gap-2 text-sm">
                          <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                          <span>
                            {detail.objekt.strasse}
                            {detail.objekt.plz && detail.objekt.ort && (
                              <>, {detail.objekt.plz} {detail.objekt.ort}</>
                            )}
                          </span>
                        </div>
                      )}
                      {detail.objekt.ansprechpartner && (
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{detail.objekt.ansprechpartner}</span>
                        </div>
                      )}
                      {detail.objekt.telefon && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{detail.objekt.telefon}</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Kein Objekt zugeordnet</p>
                  )}
                </div>
              </div>

              {/* Buchungsdaten */}
              {(detail.gastname || detail.check_in || detail.anzahl_personen) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                      <CalendarDays className="h-4 w-4" />
                      Buchungsdaten
                    </h3>
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {detail.gastname && (
                          <div>
                            <p className="text-xs text-muted-foreground">Gastname</p>
                            <p className="font-medium">{detail.gastname}</p>
                          </div>
                        )}
                        {detail.check_in && (
                          <div>
                            <p className="text-xs text-muted-foreground">Check-in</p>
                            <p className="font-medium">
                              {format(new Date(detail.check_in), "dd.MM.yyyy", { locale: de })}
                            </p>
                          </div>
                        )}
                        {detail.check_out && (
                          <div>
                            <p className="text-xs text-muted-foreground">Check-out</p>
                            <p className="font-medium">
                              {format(new Date(detail.check_out), "dd.MM.yyyy", { locale: de })}
                            </p>
                          </div>
                        )}
                        {detail.anzahl_personen && (
                          <div>
                            <p className="text-xs text-muted-foreground">Personen</p>
                            <p className="font-medium flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              {detail.anzahl_personen}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}

              {/* Termine */}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                  <Calendar className="h-4 w-4" />
                  Termine
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Lieferdatum</p>
                    <p className="font-medium">
                      {detail.lieferdatum 
                        ? format(new Date(detail.lieferdatum), "dd.MM.yyyy", { locale: de })
                        : "-"
                      }
                    </p>
                    {detail.lieferzeit && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {detail.lieferzeit}
                      </p>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Abholdatum</p>
                    <p className="font-medium">
                      {detail.abholdatum 
                        ? format(new Date(detail.abholdatum), "dd.MM.yyyy", { locale: de })
                        : "-"
                      }
                    </p>
                    {detail.abholzeit && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {detail.abholzeit}
                      </p>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Wäschekraft</p>
                    {detail.waeschekraft ? (
                      <p className="font-medium flex items-center gap-1">
                        <User className="h-4 w-4" />
                        {detail.waeschekraft.name}
                      </p>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">Priorität</p>
                    <p className="font-medium">
                      {detail.prioritaet === 1 && <Badge variant="destructive">Hoch</Badge>}
                      {detail.prioritaet === 0 && <span className="text-muted-foreground">Normal</span>}
                      {detail.prioritaet === -1 && <span className="text-muted-foreground">Niedrig</span>}
                      {detail.prioritaet === null && <span className="text-muted-foreground">-</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Positionen */}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                  <Package className="h-4 w-4" />
                  Positionen ({detail.positionen.length})
                </h3>
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50">
                      <tr>
                        <th className="text-left px-4 py-2 font-medium">Artikel</th>
                        <th className="text-right px-4 py-2 font-medium">Menge</th>
                        <th className="text-right px-4 py-2 font-medium">Einzelpreis</th>
                        <th className="text-right px-4 py-2 font-medium">Summe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.positionen.map((pos) => (
                        <tr key={pos.id} className="border-t">
                          <td className="px-4 py-2">
                            <div>
                              <p className="font-medium">{pos.artikel?.name || "Unbekannt"}</p>
                              <p className="text-xs text-muted-foreground">{pos.artikel?.artikelnummer}</p>
                            </div>
                          </td>
                          <td className="text-right px-4 py-2">{pos.menge}×</td>
                          <td className="text-right px-4 py-2">{formatPreis(pos.artikel?.preis ?? null)}</td>
                          <td className="text-right px-4 py-2 font-medium">
                            {formatPreis(pos.artikel?.preis != null ? pos.menge * pos.artikel.preis : null)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted/30">
                      <tr className="border-t font-medium">
                        <td colSpan={3} className="text-right px-4 py-2">Netto:</td>
                        <td className="text-right px-4 py-2">
                          {formatPreis(
                            detail.positionen.reduce((sum, p) => {
                              const preis = p.artikel?.preis ?? 0;
                              return sum + (p.menge * preis);
                            }, 0)
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Rechnung */}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                  <Receipt className="h-4 w-4" />
                  Rechnung
                </h3>
                {detail.rechnung ? (
                  <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-lg">{detail.rechnung.rechnungsnummer}</p>
                        <p className="text-sm text-muted-foreground">
                          vom {format(new Date(detail.rechnung.rechnungsdatum), "dd.MM.yyyy", { locale: de })}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={RECHNUNG_STATUS_COLORS[detail.rechnung.status] || ""}>
                          {detail.rechnung.status === "offen" && "Offen"}
                          {detail.rechnung.status === "bezahlt" && "Bezahlt"}
                          {detail.rechnung.status === "storniert" && "Storniert"}
                          {detail.rechnung.status === "mahnung" && "Mahnung"}
                        </Badge>
                        {onViewRechnung && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => onViewRechnung(detail.rechnung!.id)}
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Öffnen
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Netto</p>
                        <p className="font-medium">{formatPreis(detail.rechnung.nettobetrag)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">MwSt</p>
                        <p className="font-medium">{formatPreis(detail.rechnung.mwst_betrag)}</p>
                      </div>
                      {detail.rechnung.bearbeitungsgebuehr > 0 && (
                        <div>
                          <p className="text-muted-foreground">Bearbeitungsgebühr</p>
                          <p className="font-medium">{formatPreis(detail.rechnung.bearbeitungsgebuehr)}</p>
                        </div>
                      )}
                      <div>
                        <p className="text-muted-foreground">Brutto</p>
                        <p className="font-semibold text-lg">{formatPreis(detail.rechnung.bruttobetrag)}</p>
                      </div>
                    </div>
                    {detail.rechnung.bezahlt_am && (
                      <p className="text-sm text-green-600 dark:text-green-400">
                        ✓ Bezahlt am {format(new Date(detail.rechnung.bezahlt_am), "dd.MM.yyyy", { locale: de })}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 text-center text-muted-foreground">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>Noch keine Rechnung erstellt</p>
                    <p className="text-xs">Rechnung wird automatisch bei Auslieferung erstellt</p>
                  </div>
                )}
              </div>

              {/* Verlauf / History */}
              <Separator />
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                  <Clock className="h-4 w-4" />
                  Bearbeitungsverlauf
                </h3>
                {detail.history.length > 0 ? (
                  <div className="space-y-0 border-l-2 border-muted ml-2 pl-4">
                    {detail.history.map((h, idx) => (
                      <div key={h.id} className={`relative pb-4 ${idx === detail.history.length - 1 ? "pb-0" : ""}`}>
                        <div className="absolute -left-[1.4rem] top-0 h-6 w-6 flex items-center justify-center bg-background rounded-full border-2 border-muted">
                          {getHistoryIcon(h.status)}
                        </div>
                        <div className="ml-2">
                          <p className="font-medium">{STATUS_LABELS[h.status] || h.status}</p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(h.zeitpunkt), "dd.MM.yyyy 'um' HH:mm", { locale: de })} Uhr
                            {h.bearbeiter_name && <> • {h.bearbeiter_name}</>}
                          </p>
                          {h.notiz && (
                            <p className="text-sm mt-1 text-muted-foreground italic">"{h.notiz}"</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-4 text-center text-muted-foreground">
                    <p>Noch keine Verlaufseinträge</p>
                    <p className="text-xs">Statusänderungen werden automatisch protokolliert</p>
                  </div>
                )}
              </div>

              {/* Notizen */}
              {(detail.notizen || detail.bearbeitung_notizen) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground uppercase tracking-wide">
                      <FileText className="h-4 w-4" />
                      Notizen
                    </h3>
                    {detail.notizen && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <p className="text-xs text-muted-foreground mb-1">Bestellnotizen</p>
                        <p className="whitespace-pre-wrap">{detail.notizen}</p>
                      </div>
                    )}
                    {detail.bearbeitung_notizen && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mb-1">Bearbeitungsnotizen</p>
                        <p className="whitespace-pre-wrap">{detail.bearbeitung_notizen}</p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Bestellung nicht gefunden</p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
