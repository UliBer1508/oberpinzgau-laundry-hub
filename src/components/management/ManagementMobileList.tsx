import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  AlertCircle,
  Building2,
  Calendar,
  Clock,
  Euro,
  Eye,
  MoreVertical,
  Package,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatPreis } from "@/lib/formatPreis";
import { type ManagementBestellung } from "@/hooks/useManagementBestellungen";

const statusLabel: Record<string, string> = {
  neu: "Neu",
  in_bearbeitung: "In Bearbeitung",
  ausgeliefert: "Ausgeliefert",
  abgeholt: "Abgeholt",
  abgeschlossen: "Abgeschlossen",
  storniert: "Storniert",
};

const statusBadgeClass: Record<string, string> = {
  neu: "bg-blue-100 text-blue-700 hover:bg-blue-100",
  in_bearbeitung: "bg-amber-100 text-amber-700 hover:bg-amber-100",
  ausgeliefert: "bg-purple-100 text-purple-700 hover:bg-purple-100",
  abgeholt: "bg-cyan-100 text-cyan-700 hover:bg-cyan-100",
  abgeschlossen: "bg-green-100 text-green-700 hover:bg-green-100",
  storniert: "bg-red-100 text-red-700 hover:bg-red-100",
};

interface Props {
  bestellungen: ManagementBestellung[];
  onViewDetails?: (id: string) => void;
}

export function ManagementMobileList({ bestellungen, onViewDetails }: Props) {
  if (bestellungen.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <Package className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">
          Keine Bestellungen für die ausgewählten Filter
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {bestellungen.map((b) => {
        const prio = (b.prioritaet ?? 0) > 0;
        const gastname = (b as any).gastname as string | undefined;
        const gesamtpreis = (b as any).gesamtpreis as number | null | undefined;

        return (
          <div
            key={b.id}
            role="button"
            tabIndex={0}
            onClick={() => onViewDetails?.(b.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onViewDetails?.(b.id);
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
                  {b.bestellnummer}
                </span>
                <Badge
                  className={cn("whitespace-nowrap", statusBadgeClass[b.status])}
                  variant="secondary"
                >
                  {statusLabel[b.status] ?? b.status}
                </Badge>
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
                    <DropdownMenuItem onClick={() => onViewDetails?.(b.id)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Details ansehen
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Kunde + Objekt */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="font-semibold text-foreground">{b.kundeName}</span>
              {b.objektName && (
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {b.objektName}
                </span>
              )}
              {gastname && (
                <span className="text-xs text-muted-foreground">· Gast: {gastname}</span>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {b.lieferdatum ? (
                  <span>{format(new Date(b.lieferdatum), "dd.MM.yy", { locale: de })}</span>
                ) : (
                  <span>Kein Datum</span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Package className="h-4 w-4" />
                <span>{b.positionen.length} Pos.</span>
              </div>

              {b.waeschekraftName && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{b.waeschekraftName}</span>
                </div>
              )}

              {b.bearbeitung_deadline && (
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>
                    {format(new Date(b.bearbeitung_deadline), "dd.MM. HH:mm", { locale: de })}
                  </span>
                </div>
              )}

              {gesamtpreis != null && (
                <div className="flex items-center gap-1.5 font-semibold text-foreground ml-auto">
                  <Euro className="h-4 w-4 text-muted-foreground" />
                  <span>{formatPreis(gesamtpreis)}</span>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
