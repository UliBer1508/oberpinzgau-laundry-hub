import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Eye,
  CheckCircle,
  AlertTriangle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  Euro,
} from "lucide-react";
import { Rechnung, RechnungStatus } from "@/hooks/useRechnungen";
import { RechnungStatusBadge } from "./RechnungStatusBadge";
import { formatPreis } from "@/lib/formatPreis";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { cn } from "@/lib/utils";

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

  if (rechnungen.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <FileText className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Keine Rechnungen gefunden.</p>
      </div>
    );
  }

  const isOverdue = (rechnung: Rechnung) =>
    rechnung.status === "offen" &&
    rechnung.faelligkeitsdatum &&
    new Date(rechnung.faelligkeitsdatum) < new Date();

  return (
    <div className="grid gap-3">
      {rechnungen.map((rechnung) => {
        const overdue = isOverdue(rechnung);
        const mahnungen = rechnung.mahnung_anzahl ?? 0;

        return (
          <div
            key={rechnung.id}
            role="button"
            tabIndex={0}
            onClick={() => onViewDetails(rechnung)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewDetails(rechnung);
              }
            }}
            className={cn(
              "group relative rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all",
              "hover:shadow-md hover:border-primary/30 cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {rechnung.rechnungsnummer}
                </span>
                <RechnungStatusBadge status={rechnung.status} />
                {overdue && (
                  <Badge variant="destructive" className="text-xs">
                    Überfällig
                  </Badge>
                )}
                {mahnungen > 0 && (
                  <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                    {mahnungen} Mahnung{mahnungen > 1 ? "en" : ""}
                  </Badge>
                )}
              </div>

              <div onClick={(e) => e.stopPropagation()} className="shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onViewDetails(rechnung)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Details anzeigen
                    </DropdownMenuItem>
                    {rechnung.status !== "bezahlt" && (
                      <DropdownMenuItem onClick={() => onStatusChange(rechnung.id, "bezahlt")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Als bezahlt markieren
                      </DropdownMenuItem>
                    )}
                    {rechnung.status === "offen" && (
                      <DropdownMenuItem onClick={() => onStatusChange(rechnung.id, "mahnung")}>
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Mahnung setzen
                      </DropdownMenuItem>
                    )}
                    {rechnung.status !== "storniert" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange(rechnung.id, "storniert")}
                        className="text-destructive focus:text-destructive"
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Stornieren
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Kunde */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              {rechnung.kunde_firma && (
                <span className="font-semibold text-foreground">{rechnung.kunde_firma}</span>
              )}
              <span
                className={
                  rechnung.kunde_firma
                    ? "text-muted-foreground"
                    : "font-semibold text-foreground"
                }
              >
                {rechnung.kunde_name}
              </span>
              {rechnung.bestellnummer && (
                <span className="text-xs text-muted-foreground">
                  · Bestellung {rechnung.bestellnummer}
                </span>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>
                  {format(new Date(rechnung.rechnungsdatum), "dd.MM.yyyy", { locale: de })}
                </span>
              </div>

              <div
                className={cn(
                  "flex items-center gap-1.5",
                  overdue ? "text-destructive font-medium" : "text-muted-foreground"
                )}
              >
                <Clock className="h-4 w-4" />
                <span>
                  {rechnung.faelligkeitsdatum
                    ? format(new Date(rechnung.faelligkeitsdatum), "dd.MM.yyyy", { locale: de })
                    : "—"}
                </span>
              </div>

              <div className="flex items-center gap-1.5 font-semibold text-foreground ml-auto">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span>{formatPreis(rechnung.bruttobetrag)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
