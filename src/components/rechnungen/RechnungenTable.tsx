import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Eye, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Rechnung, RechnungStatus } from "@/hooks/useRechnungen";
import { RechnungStatusBadge } from "./RechnungStatusBadge";
import { formatPreis } from "@/lib/formatPreis";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface RechnungenTableProps {
  rechnungen: Rechnung[];
  isLoading: boolean;
  onViewDetails: (rechnung: Rechnung) => void;
  onStatusChange: (id: string, status: RechnungStatus) => void;
}

export function RechnungenTable({
  rechnungen,
  isLoading,
  onViewDetails,
  onStatusChange,
}: RechnungenTableProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-muted-foreground">Lade Rechnungen...</div>
      </div>
    );
  }

  // Prüfen ob Rechnung überfällig ist
  const isOverdue = (rechnung: Rechnung) => {
    return rechnung.status === 'offen' && 
      rechnung.faelligkeitsdatum && 
      new Date(rechnung.faelligkeitsdatum) < new Date();
  };

  const renderActions = (rechnung: Rechnung) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onViewDetails(rechnung)}>
          <Eye className="mr-2 h-4 w-4" />
          Details anzeigen
        </DropdownMenuItem>
        {rechnung.status !== 'bezahlt' && (
          <DropdownMenuItem onClick={() => onStatusChange(rechnung.id, 'bezahlt')}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Als bezahlt markieren
          </DropdownMenuItem>
        )}
        {rechnung.status === 'offen' && (
          <DropdownMenuItem onClick={() => onStatusChange(rechnung.id, 'mahnung')}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Mahnung setzen
          </DropdownMenuItem>
        )}
        {rechnung.status !== 'storniert' && (
          <DropdownMenuItem
            onClick={() => onStatusChange(rechnung.id, 'storniert')}
            className="text-destructive"
          >
            <XCircle className="mr-2 h-4 w-4" />
            Stornieren
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Mobile: Karten */}
      <div className="md:hidden space-y-3">
        {rechnungen.length === 0 ? (
          <div className="rounded-md border p-6 text-center text-muted-foreground">
            Keine Rechnungen gefunden
          </div>
        ) : (
          rechnungen.map((rechnung) => (
            <div
              key={rechnung.id}
              role="button"
              onClick={() => onViewDetails(rechnung)}
              className="rounded-lg border bg-card p-4 shadow-sm active:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold">{rechnung.rechnungsnummer}</div>
                  <div className="text-xs text-muted-foreground">{rechnung.bestellnummer}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <RechnungStatusBadge status={rechnung.status} />
                  {renderActions(rechnung)}
                </div>
              </div>
              <div className="mt-2 text-sm">
                {rechnung.kunde_firma && <div className="font-medium">{rechnung.kunde_firma}</div>}
                <div className={rechnung.kunde_firma ? "text-muted-foreground" : "font-medium"}>
                  {rechnung.kunde_name}
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between gap-2 text-sm">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Datum</span>
                  <span>{format(new Date(rechnung.rechnungsdatum), "dd.MM.yyyy", { locale: de })}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Fällig</span>
                  <span className={isOverdue(rechnung) ? 'text-destructive font-medium' : ''}>
                    {rechnung.faelligkeitsdatum
                      ? format(new Date(rechnung.faelligkeitsdatum), "dd.MM.yyyy", { locale: de })
                      : "-"}
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs text-muted-foreground">Brutto</span>
                  <span className="font-semibold">{formatPreis(rechnung.bruttobetrag)}</span>
                </div>
              </div>
              {((rechnung.mahnung_anzahl ?? 0) > 0 || isOverdue(rechnung)) && (
                <div className="mt-2 flex gap-2">
                  {isOverdue(rechnung) && (
                    <Badge variant="destructive" className="text-xs">Überfällig</Badge>
                  )}
                  {(rechnung.mahnung_anzahl ?? 0) > 0 && (
                    <Badge variant="outline" className="text-amber-600 border-amber-300 text-xs">
                      {rechnung.mahnung_anzahl} Mahnung(en)
                    </Badge>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Desktop: Tabelle */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rechnungsnr.</TableHead>
              <TableHead>Bestellung</TableHead>
              <TableHead>Kunde</TableHead>
              <TableHead>Datum</TableHead>
              <TableHead>Fällig</TableHead>
              <TableHead className="text-right">Brutto</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Mahnungen</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rechnungen.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                  Keine Rechnungen gefunden
                </TableCell>
              </TableRow>
            ) : (
              rechnungen.map((rechnung) => (
                <TableRow
                  key={rechnung.id}
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewDetails(rechnung)}
                >
                  <TableCell className="font-medium">{rechnung.rechnungsnummer}</TableCell>
                  <TableCell>{rechnung.bestellnummer}</TableCell>
                  <TableCell>
                    <div>
                      {rechnung.kunde_firma && (
                        <div className="font-medium">{rechnung.kunde_firma}</div>
                      )}
                      <div className={rechnung.kunde_firma ? "text-sm text-muted-foreground" : ""}>
                        {rechnung.kunde_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {format(new Date(rechnung.rechnungsdatum), "dd.MM.yyyy", { locale: de })}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={isOverdue(rechnung) ? 'text-destructive font-medium' : ''}>
                        {rechnung.faelligkeitsdatum
                          ? format(new Date(rechnung.faelligkeitsdatum), "dd.MM.yyyy", { locale: de })
                          : "-"}
                      </span>
                      {isOverdue(rechnung) && (
                        <Badge variant="destructive" className="text-xs">
                          Überfällig
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPreis(rechnung.bruttobetrag)}
                  </TableCell>
                  <TableCell>
                    <RechnungStatusBadge status={rechnung.status} />
                  </TableCell>
                  <TableCell className="text-center">
                    {(rechnung.mahnung_anzahl ?? 0) > 0 ? (
                      <Badge variant="outline" className="text-amber-600 border-amber-300">
                        {rechnung.mahnung_anzahl}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {renderActions(rechnung)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
