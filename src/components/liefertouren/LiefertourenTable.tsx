import { format } from "date-fns";
import { de } from "date-fns/locale";
import {
  MoreVertical,
  Edit,
  MapPin,
  Play,
  CheckCircle,
  RotateCcw,
  Calendar,
  User,
  Truck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { LiefertourStatusBadge } from "./LiefertourStatusBadge";
import { cn } from "@/lib/utils";
import type { Liefertour } from "@/hooks/useLiefertouren";

interface LiefertourenTableProps {
  touren: Liefertour[];
  onEdit: (tour: Liefertour) => void;
  onManageStopps: (tour: Liefertour) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

export function LiefertourenTable({
  touren,
  onEdit,
  onManageStopps,
  onUpdateStatus,
}: LiefertourenTableProps) {
  if (touren.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <Truck className="mx-auto h-10 w-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Keine Liefertouren gefunden.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {touren.map((tour) => {
        const progress = tour.stoppCount > 0 ? (tour.erledigtCount / tour.stoppCount) * 100 : 0;

        return (
          <div
            key={tour.id}
            role="button"
            tabIndex={0}
            onClick={() => onManageStopps(tour)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onManageStopps(tour);
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
                  {tour.tournummer}
                </span>
                <LiefertourStatusBadge status={tour.status} />
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
                    <DropdownMenuItem onClick={() => onManageStopps(tour)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Stopps verwalten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(tour)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {tour.status === "geplant" && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(tour.id, "aktiv")}>
                        <Play className="mr-2 h-4 w-4" />
                        Tour starten
                      </DropdownMenuItem>
                    )}
                    {tour.status === "aktiv" && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(tour.id, "abgeschlossen")}>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Tour abschließen
                      </DropdownMenuItem>
                    )}
                    {tour.status === "abgeschlossen" && (
                      <DropdownMenuItem onClick={() => onUpdateStatus(tour.id, "geplant")}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Zurücksetzen
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Name */}
            <div className="mt-3 text-sm">
              <span className="font-semibold text-foreground">{tour.name}</span>
            </div>

            {/* Footer */}
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(tour.datum), "dd.MM.yyyy", { locale: de })}</span>
              </div>

              <div className="flex items-center gap-1.5 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{tour.waeschekraftName || "—"}</span>
              </div>

              <div className="flex items-center gap-2 ml-auto min-w-[140px]">
                <Progress value={progress} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {tour.erledigtCount}/{tour.stoppCount}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
