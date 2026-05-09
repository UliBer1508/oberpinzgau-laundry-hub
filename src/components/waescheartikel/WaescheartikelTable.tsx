import { useState } from "react";
import { MoreHorizontal, Pencil, Power, ArrowUpDown, Image as ImageIcon } from "lucide-react";
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

function getColorClass(farbe: string | null): string {
  if (!farbe) return "bg-gray-300";
  return colorMap[farbe] || "bg-gray-300";
}

export function WaescheartikelTable({
  artikel,
  onEdit,
  onToggleAktiv,
}: WaescheartikelTableProps) {
  const [sortField, setSortField] = useState<SortField>("artikelnummer");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedArtikel = [...artikel].sort((a, b) => {
    let aValue: string | boolean | number = "";
    let bValue: string | boolean | number = "";

    switch (sortField) {
      case "artikelnummer":
        aValue = a.artikelnummer || "";
        bValue = b.artikelnummer || "";
        break;
      case "name":
        aValue = a.name || "";
        bValue = b.name || "";
        break;
      case "groesse":
        aValue = a.groesse || "";
        bValue = b.groesse || "";
        break;
      case "kategorie":
        aValue = a.kategorie || "";
        bValue = b.kategorie || "";
        break;
      case "farbe":
        aValue = a.farbe || "";
        bValue = b.farbe || "";
        break;
      case "preis":
        aValue = a.preis ?? -1;
        bValue = b.preis ?? -1;
        break;
      case "aktiv":
        aValue = a.aktiv ?? false;
        bValue = b.aktiv ?? false;
        break;
    }

    if (typeof aValue === "boolean" && typeof bValue === "boolean") {
      return sortDirection === "asc"
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    const comparison = String(aValue).localeCompare(String(bValue), "de");
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const SortButton = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 data-[state=open]:bg-accent"
      onClick={() => handleSort(field)}
    >
      {children}
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  );

  const renderActions = (artikel: Waescheartikel) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Aktionen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onEdit(artikel)}>
          <Pencil className="mr-2 h-4 w-4" />
          Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleAktiv(artikel.id, !artikel.aktiv)}>
          <Power className="mr-2 h-4 w-4" />
          {artikel.aktiv ? "Deaktivieren" : "Aktivieren"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {sortedArtikel.length === 0 ? (
          <div className="rounded-md border p-6 text-center text-muted-foreground">Keine Wäscheartikel gefunden.</div>
        ) : (
          sortedArtikel.map((artikel) => (
            <div
              key={artikel.id}
              role="button"
              onClick={() => onEdit(artikel)}
              className="rounded-lg border bg-card p-3 shadow-sm active:bg-muted/50 transition-colors flex gap-3"
            >
              {artikel.bild_url ? (
                <img src={artikel.bild_url} alt={artikel.name} className="w-14 h-14 object-cover rounded border shrink-0" />
              ) : (
                <div className="w-14 h-14 bg-muted rounded border flex items-center justify-center shrink-0">
                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{artikel.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{artikel.artikelnummer}</div>
                  </div>
                  {renderActions(artikel)}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
                  {artikel.kategorie && <Badge variant="secondary" className="text-xs">{artikel.kategorie}</Badge>}
                  {artikel.farbe && (
                    <span className="inline-flex items-center gap-1 rounded border px-1.5 py-0.5">
                      <span className={`h-3 w-3 rounded-full ${getColorClass(artikel.farbe)}`} />
                      {artikel.farbe}
                    </span>
                  )}
                  {artikel.groesse && <span className="text-muted-foreground">{artikel.groesse}</span>}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  <Badge variant={artikel.aktiv ? "default" : "secondary"} className="text-xs">
                    {artikel.aktiv ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <span className="font-mono text-sm">
                    {artikel.preis != null ? `${artikel.preis.toFixed(2).replace('.', ',')} €` : "-"}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[60px]">Bild</TableHead>
              <TableHead className="w-[100px]"><SortButton field="artikelnummer">Art.-Nr.</SortButton></TableHead>
              <TableHead><SortButton field="name">Name</SortButton></TableHead>
              <TableHead><SortButton field="groesse">Größe</SortButton></TableHead>
              <TableHead>Bezeichnung</TableHead>
              <TableHead><SortButton field="kategorie">Kategorie</SortButton></TableHead>
              <TableHead><SortButton field="farbe">Farbe</SortButton></TableHead>
              <TableHead className="text-right"><SortButton field="preis">Preis</SortButton></TableHead>
              <TableHead><SortButton field="aktiv">Status</SortButton></TableHead>
              <TableHead className="w-[70px]">Aktionen</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedArtikel.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="h-24 text-center">Keine Wäscheartikel gefunden.</TableCell>
              </TableRow>
            ) : (
              sortedArtikel.map((artikel) => (
                <TableRow key={artikel.id}>
                  <TableCell>
                    {artikel.bild_url ? (
                      <img src={artikel.bild_url} alt={artikel.name} className="w-12 h-12 object-cover rounded border" />
                    ) : (
                      <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm">{artikel.artikelnummer}</TableCell>
                  <TableCell className="font-medium">{artikel.name}</TableCell>
                  <TableCell className="text-muted-foreground">{artikel.groesse || "-"}</TableCell>
                  <TableCell className="text-muted-foreground">{artikel.bezeichnung || "-"}</TableCell>
                  <TableCell>
                    {artikel.kategorie ? <Badge variant="secondary">{artikel.kategorie}</Badge> : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    {artikel.farbe ? (
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 rounded-full ${getColorClass(artikel.farbe)}`} />
                        <span>{artikel.farbe}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {artikel.preis != null ? `${artikel.preis.toFixed(2).replace('.', ',')} €` : <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={artikel.aktiv ? "default" : "secondary"}>
                      {artikel.aktiv ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderActions(artikel)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

