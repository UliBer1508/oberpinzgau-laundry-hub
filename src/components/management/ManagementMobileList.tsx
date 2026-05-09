import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  neu: "bg-blue-100 text-blue-700",
  in_bearbeitung: "bg-amber-100 text-amber-700",
  ausgeliefert: "bg-purple-100 text-purple-700",
  abgeholt: "bg-cyan-100 text-cyan-700",
  abgeschlossen: "bg-green-100 text-green-700",
  storniert: "bg-red-100 text-red-700",
};

const statusBgClass: Record<string, string> = {
  neu: "bg-blue-50",
  in_bearbeitung: "bg-amber-50",
  ausgeliefert: "bg-purple-50",
  abgeholt: "bg-cyan-50",
  abgeschlossen: "bg-green-50",
  storniert: "bg-red-50",
};

const prioIcon = (p: number) => (p === 2 ? "🔴" : p === 1 ? "🟡" : "⚪");

interface Props {
  bestellungen: ManagementBestellung[];
  onViewDetails?: (id: string) => void;
}

export function ManagementMobileList({ bestellungen, onViewDetails }: Props) {
  if (bestellungen.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground">
        Keine Bestellungen für die ausgewählten Filter
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {bestellungen.map((b) => (
        <li
          key={b.id}
          className={cn(
            "rounded-lg border p-3 active:scale-[0.99] transition-transform cursor-pointer",
            statusBgClass[b.status] ?? "bg-card"
          )}
          onClick={() => onViewDetails?.(b.id)}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-base shrink-0" aria-hidden>
                {prioIcon(b.prioritaet ?? 0)}
              </span>
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted-foreground truncate">
                  {b.bestellnummer}
                </div>
                <div className="font-semibold text-sm truncate">{b.kundeName}</div>
                {b.objektName && (
                  <div className="text-xs text-muted-foreground truncate">
                    {b.objektName}
                  </div>
                )}
              </div>
            </div>
            <Badge
              className={cn("shrink-0 whitespace-nowrap", statusBadgeClass[b.status])}
              variant="secondary"
            >
              {statusLabel[b.status] ?? b.status}
            </Badge>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
            <div>
              <div className="text-muted-foreground">Lieferung</div>
              <div className="font-medium">
                {b.lieferdatum
                  ? format(new Date(b.lieferdatum), "dd.MM.yyyy", { locale: de })
                  : "—"}
              </div>
            </div>
            <div>
              <div className="text-muted-foreground">Abholung</div>
              <div className="font-medium">
                {b.abholdatum
                  ? format(new Date(b.abholdatum), "dd.MM.yyyy", { locale: de })
                  : "—"}
              </div>
            </div>
            {b.bearbeitung_deadline && (
              <div className="col-span-2">
                <div className="text-muted-foreground">Deadline</div>
                <div className="font-medium">
                  {format(new Date(b.bearbeitung_deadline), "dd.MM. HH:mm", { locale: de })}
                </div>
              </div>
            )}
            {b.waeschekraftName && (
              <div className="col-span-2">
                <div className="text-muted-foreground">Wäschekraft</div>
                <div className="font-medium truncate">{b.waeschekraftName}</div>
              </div>
            )}
          </div>

          <div className="mt-2 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              className="h-8 gap-1 text-xs"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(b.id);
              }}
            >
              <Eye className="h-3.5 w-3.5" />
              Details
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
