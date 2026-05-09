import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Eye,
  User,
  Calendar,
  Euro,
  Package,
  AlertCircle,
  Building2,
} from "lucide-react";
import { BestellungStatusBadge } from "./BestellungStatusBadge";
import type { Bestellung, BestellungStatus } from "@/hooks/useBestellungen";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatPreis } from "@/lib/formatPreis";
import { cn } from "@/lib/utils";

interface BestellungenTableProps {
  bestellungen: Bestellung[];
  onEdit: (bestellung: Bestellung) => void;
  onManagePositionen: (bestellung: Bestellung) => void;
  onStatusChange: (id: string, status: BestellungStatus) => void;
  onDelete: (bestellung: Bestellung) => void;
  onViewDetails: (bestellung: Bestellung) => void;
}

function getRechnungsstatus(bestellung: Bestellung) {
  const rechnung = (bestellung as any).rechnung;
  if (!rechnung) {
    return { label: "Keine Rechnung", className: "text-muted-foreground border-border" };
  }
  switch (rechnung.status) {
    case "bezahlt":
      return { label: "Bezahlt", className: "bg-success/10 text-success border-success/20" };
    case "offen":
      return { label: "Ausstehend", className: "bg-warning/10 text-warning border-warning/20" };
    case "mahnung":
      return { label: "Mahnung", className: "bg-destructive/10 text-destructive border-destructive/20" };
    case "storniert":
      return { label: "Storniert", className: "text-muted-foreground border-border" };
    default:
      return { label: "-", className: "text-muted-foreground border-border" };
  }
}

export function BestellungenTable({
  bestellungen,
  onEdit,
  onDelete,
  onViewDetails,
}: BestellungenTableProps) {
  if (bestellungen.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Keine Bestellungen gefunden.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {bestellungen.map((bestellung) => {
        const rechnung = getRechnungsstatus(bestellung);
        const prio = bestellung.prioritaet && bestellung.prioritaet > 0;
        const gastname = (bestellung as any).gastname as string | undefined;

        return (
          <div
            key={bestellung.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(bestellung)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEdit(bestellung);
              }
            }}
            className={cn(
              "group relative rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all",
              "hover:shadow-md hover:border-primary/30 cursor-pointer",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            )}
          >
            {/* Header: Bestellnr + Badges + Actions */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <span className="font-mono text-sm font-semibold text-foreground">
                  {bestellung.bestellnummer}
                </span>
                <BestellungStatusBadge status={bestellung.status as BestellungStatus} />
                {prio && (
                  <Badge variant="destructive" className="text-xs gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Priorität
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
                  <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem onClick={() => onEdit(bestellung)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onViewDetails(bestellung)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Details ansehen
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onDelete(bestellung)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Löschen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Kunde + Objekt */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-foreground">{bestellung.kundeName}</span>
              {bestellung.objektName && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {bestellung.objektName}
                </span>
              )}
              {gastname && (
                <span className="text-xs text-muted-foreground">· Gast: {gastname}</span>
              )}
            </div>

            {/* Footer: Lieferdatum, Wäschekraft, Betrag, Zahlung */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {bestellung.lieferdatum ? (
                  <span>
                    {format(new Date(bestellung.lieferdatum), "dd.MM.yy", { locale: de })}
                    {bestellung.lieferzeit && (
                      <span className="ml-1 text-xs">{bestellung.lieferzeit}</span>
                    )}
                  </span>
                ) : (
                  <span>Kein Datum</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{bestellung.positionenCount} Pos.</span>
              </div>

              {bestellung.waeschekraftName && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{bestellung.waeschekraftName}</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <Euro className="h-4 w-4 text-muted-foreground" />
                <span>{formatPreis(bestellung.gesamtpreis)}</span>
              </div>

              <Badge variant="outline" className={cn("ml-auto text-xs", rechnung.className)}>
                {rechnung.label}
              </Badge>
            </div>
          </div>
        );
      })}
    </div>
  );
}
