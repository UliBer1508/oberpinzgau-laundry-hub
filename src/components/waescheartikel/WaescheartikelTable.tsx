import { useState } from "react";
import { MoreVertical, Pencil, Power, Image as ImageIcon, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Waescheartikel } from "@/hooks/useWaescheartikel";

interface WaescheartikelTableProps {
  artikel: Waescheartikel[];
  onEdit: (artikel: Waescheartikel) => void;
  onToggleAktiv: (id: string, aktiv: boolean) => void;
}

type SortField = "artikelnummer" | "name" | "groesse" | "kategorie" | "farbe" | "preis" | "aktiv";
type SortDirection = "asc" | "desc";

const colorMap: Record<string, string> = {
  "Weiß": "bg-white border border-border",
  "Weiß gestreift": "bg-gradient-to-r from-white via-gray-200 to-white border border-border",
  "Grau": "bg-gray-400",
  "Grau gestreift": "bg-gradient-to-r from-gray-400 via-gray-300 to-gray-400",
  "Braun": "bg-amber-700",
  "Bunt": "bg-gradient-to-r from-red-400 via-yellow-400 to-blue-400",
};

const SORT_LABEL: Record<SortField, string> = {
  artikelnummer: "Artikelnummer",
  name: "Name",
  groesse: "Größe",
  kategorie: "Kategorie",
  farbe: "Farbe",
  preis: "Preis",
  aktiv: "Status",
};

function getColorClass(farbe: string | null): string {
  if (!farbe) return "bg-gray-300";
  return colorMap[farbe] || "bg-gray-300";
}

export function WaescheartikelTable({ artikel, onEdit, onToggleAktiv }: WaescheartikelTableProps) {
  const [sortField, setSortField] = useState<SortField>("artikelnummer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const sortedArtikel = [...artikel].sort((a, b) => {
    let aValue: string | boolean | number = "";
    let bValue: string | boolean | number = "";
    switch (sortField) {
      case "artikelnummer": aValue = a.artikelnummer || ""; bValue = b.artikelnummer || ""; break;
      case "name": aValue = a.name || ""; bValue = b.name || ""; break;
      case "groesse": aValue = a.groesse || ""; bValue = b.groesse || ""; break;
      case "kategorie": aValue = a.kategorie || ""; bValue = b.kategorie || ""; break;
      case "farbe": aValue = a.farbe || ""; bValue = b.farbe || ""; break;
      case "preis": aValue = a.preis ?? -1; bValue = b.preis ?? -1; break;
      case "aktiv": aValue = a.aktiv ?? false; bValue = b.aktiv ?? false; break;
    }
    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortDirection === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue);
    }
    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }
    const c = String(aValue).localeCompare(String(bValue), "de");
    return sortDirection === "asc" ? c : -c;
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Sortieren nach:</span>
        <Select value={sortField} onValueChange={(v) => setSortField(v as SortField)}>
          <SelectTrigger className="h-8 w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(SORT_LABEL) as SortField[]).map((f) => (
              <SelectItem key={f} value={f}>{SORT_LABEL[f]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          onClick={() => setSortDirection((d) => (d === "asc" ? "desc" : "asc"))}
        >
          <ArrowUpDown className="h-3.5 w-3.5" />
          {sortDirection === "asc" ? "Aufsteigend" : "Absteigend"}
        </Button>
      </div>

      {sortedArtikel.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
          Keine Wäscheartikel gefunden.
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sortedArtikel.map((a) => (
            <div
              key={a.id}
              role="button"
              tabIndex={0}
              onClick={() => onEdit(a)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onEdit(a);
                }
              }}
              className={cn(
                "group relative rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all",
                "hover:shadow-md hover:border-primary/30 cursor-pointer",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                !a.aktiv && "opacity-60",
              )}
            >
              <div className="flex items-start gap-3">
                {a.bild_url ? (
                  <img src={a.bild_url} alt={a.name} className="w-14 h-14 object-cover rounded border shrink-0" />
                ) : (
                  <div className="w-14 h-14 bg-muted rounded border flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold">{a.artikelnummer}</span>
                        <Badge variant={a.aktiv ? "default" : "secondary"} className="text-xs">
                          {a.aktiv ? "Aktiv" : "Inaktiv"}
                        </Badge>
                      </div>
                      <h3 className="mt-1 text-base font-semibold truncate">{a.name}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 -mr-1 -mt-1" onClick={(e) => e.stopPropagation()}>
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenuItem onClick={() => onEdit(a)}>
                          <Pencil className="mr-2 h-4 w-4" />Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggleAktiv(a.id, !a.aktiv)}>
                          <Power className="mr-2 h-4 w-4" />{a.aktiv ? "Deaktivieren" : "Aktivieren"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-xs">
                {a.kategorie && <Badge variant="secondary" className="text-xs">{a.kategorie}</Badge>}
                {a.farbe && (
                  <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5">
                    <span className={cn("h-3 w-3 rounded-full", getColorClass(a.farbe))} />
                    {a.farbe}
                  </span>
                )}
                {a.groesse && <span className="text-muted-foreground">{a.groesse}</span>}
                {a.bezeichnung && <span className="text-muted-foreground truncate max-w-[10rem]">· {a.bezeichnung}</span>}
              </div>

              <div className="mt-3 border-t pt-3 flex items-center justify-end">
                <span className="font-mono text-sm font-medium">
                  {a.preis != null ? `${a.preis.toFixed(2).replace(".", ",")} €` : "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
