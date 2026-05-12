import { MoreVertical, Pencil, Power, Package, Tag, Trash2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { VorlageSet } from "@/hooks/useVorlagenSets";
import { formatPreis } from "@/lib/formatPreis";

interface VorlagenSetsGridProps {
  sets: VorlageSet[];
  onEdit: (set: VorlageSet) => void;
  onToggleAktiv: (set: VorlageSet) => void;
  onDelete: (id: string) => void;
}

export function VorlagenSetsGrid({ sets, onEdit, onToggleAktiv, onDelete }: VorlagenSetsGridProps) {
  if (sets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-card p-12 text-center">
        <Layers className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Keine Vorlagen gefunden</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Erstellen Sie eine neue Vorlage oder passen Sie die Filter an.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {sets.map((set) => (
        <div
          key={set.id}
          role="button"
          tabIndex={0}
          onClick={() => onEdit(set)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onEdit(set);
            }
          }}
          className={cn(
            "group relative rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all",
            "hover:shadow-md hover:border-primary/30 cursor-pointer",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            !set.aktiv && "opacity-60",
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-semibold truncate">{set.name}</h3>
              {set.kategorie && (
                <div className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground truncate">
                  <Tag className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{set.kategorie}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge variant={set.aktiv ? "default" : "secondary"} className="text-xs">
                {set.aktiv ? "Aktiv" : "Inaktiv"}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onEdit(set)}>
                    <Pencil className="mr-2 h-4 w-4" />Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onToggleAktiv(set)}>
                    <Power className="mr-2 h-4 w-4" />
                    {set.aktiv ? "Deaktivieren" : "Aktivieren"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(set.id)}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />Löschen
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {set.beschreibung && (
            <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{set.beschreibung}</p>
          )}

          <div className="mt-3 border-t pt-3 flex flex-wrap items-center gap-2 text-sm">
            <Badge variant="secondary" className="gap-1">
              <Package className="h-3 w-3" />
              {set.artikelCount} Artikel
            </Badge>
            {set.gesamtpreis !== null && (
              <span className="ml-auto font-mono font-medium">{formatPreis(set.gesamtpreis)}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
