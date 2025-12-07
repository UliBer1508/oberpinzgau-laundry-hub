import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, X, ChevronDown, User, CalendarDays, Package, FileText, Clock, AlertTriangle } from "lucide-react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { useBestellungenMitDetails, type BestellungMitDetails } from "@/hooks/useBestellungenMitDetails";
import { useUpdateBestellungStatus, useUpdateBestellung, useWaeschekraefteForSelect, type BestellungStatus } from "@/hooks/useBestellungen";
import { BestellungStatusBadge } from "./BestellungStatusBadge";
import type { RechnungStatus } from "@/hooks/useRechnungen";
import { RechnungStatusBadge } from "@/components/rechnungen/RechnungStatusBadge";
import { formatPreis } from "@/lib/formatPreis";
import { toast } from "sonner";

interface BestellungenUebersichtDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_OPTIONS: { value: BestellungStatus | "alle"; label: string }[] = [
  { value: "alle", label: "Alle Status" },
  { value: "neu", label: "Neu" },
  { value: "in_bearbeitung", label: "In Bearbeitung" },
  { value: "ausgeliefert", label: "Ausgeliefert" },
  { value: "abgeholt", label: "Abgeholt" },
  { value: "abgeschlossen", label: "Abgeschlossen" },
  { value: "storniert", label: "Storniert" },
];

const AVAILABLE_STATUS: BestellungStatus[] = [
  "neu",
  "in_bearbeitung",
  "ausgeliefert",
  "abgeholt",
  "abgeschlossen",
  "storniert",
];

export function BestellungenUebersichtDialog({
  open,
  onOpenChange,
}: BestellungenUebersichtDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<BestellungStatus | "alle">("alle");

  const { data: bestellungen = [], isLoading } = useBestellungenMitDetails();
  const { data: waeschekraefte = [] } = useWaeschekraefteForSelect();
  const updateStatus = useUpdateBestellungStatus();
  const updateBestellung = useUpdateBestellung();

  const filteredBestellungen = useMemo(() => {
    return bestellungen.filter((b) => {
      const matchesSearch =
        searchTerm === "" ||
        b.bestellnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.kundeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.objektName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.gastname?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = selectedStatus === "alle" || b.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [bestellungen, searchTerm, selectedStatus]);

  const handleStatusChange = async (id: string, status: BestellungStatus) => {
    try {
      await updateStatus.mutateAsync({ id, status });
      toast.success("Status aktualisiert");
    } catch {
      toast.error("Fehler beim Aktualisieren");
    }
  };

  const handleWaeschekraftChange = async (bestellungId: string, waeschekraftId: string | null) => {
    try {
      await updateBestellung.mutateAsync({
        id: bestellungId,
        waeschekraft_id: waeschekraftId,
      });
      toast.success("Wäschekraft zugewiesen");
    } catch {
      toast.error("Fehler beim Zuweisen");
    }
  };

  const handlePrioritaetToggle = async (bestellung: BestellungMitDetails) => {
    try {
      await updateBestellung.mutateAsync({
        id: bestellung.id,
        prioritaet: bestellung.prioritaet === 1 ? 0 : 1,
      });
      toast.success(bestellung.prioritaet === 1 ? "Priorität entfernt" : "Als Priorität markiert");
    } catch {
      toast.error("Fehler beim Ändern der Priorität");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[98vw] h-[95vh] max-w-none flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold">
              Bestellungs-Gesamtübersicht
            </DialogTitle>
            <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Suchen (Bestellnummer, Kunde, Objekt, Gast)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={selectedStatus}
              onValueChange={(v) => setSelectedStatus(v as BestellungStatus | "alle")}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-sm text-muted-foreground">
              {filteredBestellungen.length} von {bestellungen.length} Bestellungen
            </div>
          </div>
        </DialogHeader>

        {/* Table */}
        <ScrollArea className="flex-1">
          <div className="min-w-[1800px]">
            <Table>
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[100px]">Bestellung</TableHead>
                  <TableHead className="w-[180px]">Kunde / Objekt</TableHead>
                  <TableHead className="w-[160px]">Gast / Buchung</TableHead>
                  <TableHead className="w-[140px]">Termine</TableHead>
                  <TableHead className="w-[280px]">Artikel</TableHead>
                  <TableHead className="w-[100px] text-right">Preis</TableHead>
                  <TableHead className="w-[140px]">Rechnung</TableHead>
                  <TableHead className="w-[140px]">Status</TableHead>
                  <TableHead className="w-[160px]">Wäschekraft</TableHead>
                  <TableHead className="w-[180px]">Letzte Bearbeitung</TableHead>
                  <TableHead className="w-[60px]">Prio</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                      Lädt Bestellungen...
                    </TableCell>
                  </TableRow>
                ) : filteredBestellungen.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="h-32 text-center text-muted-foreground">
                      Keine Bestellungen gefunden.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBestellungen.map((bestellung) => (
                    <UebersichtTableRow
                      key={bestellung.id}
                      bestellung={bestellung}
                      waeschekraefte={waeschekraefte}
                      onStatusChange={handleStatusChange}
                      onWaeschekraftChange={handleWaeschekraftChange}
                      onPrioritaetToggle={handlePrioritaetToggle}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

interface UebersichtTableRowProps {
  bestellung: BestellungMitDetails;
  waeschekraefte: { id: string; name: string; personalnummer: string }[];
  onStatusChange: (id: string, status: BestellungStatus) => void;
  onWaeschekraftChange: (bestellungId: string, waeschekraftId: string | null) => void;
  onPrioritaetToggle: (bestellung: BestellungMitDetails) => void;
}

function UebersichtTableRow({
  bestellung,
  waeschekraefte,
  onStatusChange,
  onWaeschekraftChange,
  onPrioritaetToggle,
}: UebersichtTableRowProps) {
  return (
    <TableRow className={bestellung.prioritaet === 1 ? "bg-destructive/5" : ""}>
      {/* Bestellung */}
      <TableCell>
        <div className="font-medium">{bestellung.bestellnummer}</div>
        <div className="text-xs text-muted-foreground">
          {format(new Date(bestellung.created_at), "dd.MM.yy HH:mm", { locale: de })}
        </div>
      </TableCell>

      {/* Kunde / Objekt */}
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium text-sm">{bestellung.kundeName}</div>
          {bestellung.kundeFirma && (
            <div className="text-xs text-muted-foreground">{bestellung.kundeFirma}</div>
          )}
          {bestellung.objektName && (
            <div className="text-xs text-primary">{bestellung.objektName}</div>
          )}
        </div>
      </TableCell>

      {/* Gast / Buchung */}
      <TableCell>
        {bestellung.gastname || bestellung.check_in ? (
          <div className="space-y-1">
            {bestellung.gastname && (
              <div className="font-medium text-sm">{bestellung.gastname}</div>
            )}
            {bestellung.check_in && bestellung.check_out && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                {format(new Date(bestellung.check_in), "dd.MM.", { locale: de })}
                {" - "}
                {format(new Date(bestellung.check_out), "dd.MM.yy", { locale: de })}
              </div>
            )}
            {bestellung.anzahl_personen && bestellung.anzahl_personen > 1 && (
              <div className="text-xs text-muted-foreground">
                {bestellung.anzahl_personen} Personen
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </TableCell>

      {/* Termine */}
      <TableCell>
        <div className="space-y-1 text-sm">
          {bestellung.lieferdatum && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">L:</span>
              <span>{format(new Date(bestellung.lieferdatum), "dd.MM.yy", { locale: de })}</span>
              {bestellung.lieferzeit && (
                <span className="text-muted-foreground">{bestellung.lieferzeit}</span>
              )}
            </div>
          )}
          {bestellung.abholdatum && (
            <div className="flex items-center gap-1">
              <span className="text-muted-foreground">A:</span>
              <span>{format(new Date(bestellung.abholdatum), "dd.MM.yy", { locale: de })}</span>
              {bestellung.abholzeit && (
                <span className="text-muted-foreground">{bestellung.abholzeit}</span>
              )}
            </div>
          )}
          {!bestellung.lieferdatum && !bestellung.abholdatum && (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </TableCell>

      {/* Artikel */}
      <TableCell>
        {bestellung.positionen.length > 0 ? (
          <div className="space-y-0.5">
            {bestellung.positionen.slice(0, 4).map((pos) => (
              <div key={pos.id} className="text-xs flex items-center gap-1">
                <Badge variant="secondary" className="h-4 px-1 text-xs font-normal">
                  {pos.menge}×
                </Badge>
                <span className="truncate max-w-[200px]">{pos.artikelName}</span>
              </div>
            ))}
            {bestellung.positionen.length > 4 && (
              <div className="text-xs text-muted-foreground">
                +{bestellung.positionen.length - 4} weitere
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Keine Artikel</span>
        )}
      </TableCell>

      {/* Preis */}
      <TableCell className="text-right">
        <div className="font-medium">{formatPreis(bestellung.nettoPreis)}</div>
        {bestellung.rechnung && (
          <div className="text-xs text-muted-foreground">
            Brutto: {formatPreis(bestellung.rechnung.bruttobetrag)}
          </div>
        )}
      </TableCell>

      {/* Rechnung */}
      <TableCell>
        {bestellung.rechnung ? (
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <FileText className="h-3 w-3 text-muted-foreground" />
              {bestellung.rechnung.rechnungsnummer}
            </div>
            <RechnungStatusBadge status={bestellung.rechnung.status as RechnungStatus} />
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-1 hover:bg-muted">
              <BestellungStatusBadge status={bestellung.status} />
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {AVAILABLE_STATUS.map((status) => (
              <DropdownMenuItem
                key={status}
                onClick={() => onStatusChange(bestellung.id, status)}
                disabled={status === bestellung.status}
              >
                <BestellungStatusBadge status={status} />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* Wäschekraft */}
      <TableCell>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-auto p-1 hover:bg-muted">
              {bestellung.waeschekraftName ? (
                <span className="flex items-center gap-1 text-sm">
                  <User className="h-3 w-3" />
                  {bestellung.waeschekraftName}
                </span>
              ) : (
                <span className="text-muted-foreground text-sm">Zuweisen...</span>
              )}
              <ChevronDown className="h-3 w-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => onWaeschekraftChange(bestellung.id, null)}>
              <span className="text-muted-foreground">Keine Zuweisung</span>
            </DropdownMenuItem>
            {waeschekraefte.map((wk) => (
              <DropdownMenuItem
                key={wk.id}
                onClick={() => onWaeschekraftChange(bestellung.id, wk.id)}
              >
                {wk.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>

      {/* Letzte Bearbeitung */}
      <TableCell>
        {bestellung.letzteBearbeitung ? (
          <div className="space-y-0.5">
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3 text-muted-foreground" />
              {format(new Date(bestellung.letzteBearbeitung.zeitpunkt), "dd.MM. HH:mm", { locale: de })}
            </div>
            {bestellung.letzteBearbeitung.bearbeiter_name && (
              <div className="text-xs text-muted-foreground">
                {bestellung.letzteBearbeitung.bearbeiter_name}
              </div>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">-</span>
        )}
      </TableCell>

      {/* Priorität */}
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className={`h-8 w-8 ${bestellung.prioritaet === 1 ? "text-destructive" : "text-muted-foreground"}`}
          onClick={() => onPrioritaetToggle(bestellung)}
        >
          <AlertTriangle className="h-4 w-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}
