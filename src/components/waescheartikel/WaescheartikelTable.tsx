import { useState } from "react";
import { MoreHorizontal, Pencil, Power, ArrowUpDown } from "lucide-react";
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

type SortField = "artikelnummer" | "name" | "kategorie" | "farbe" | "aktiv";
type SortDirection = "asc" | "desc";

const colorMap: Record<string, string> = {
  "Weiß": "bg-white border border-border",
  "Beige": "bg-amber-100",
  "Grau": "bg-gray-400",
  "Blau": "bg-blue-500",
  "Grün": "bg-green-500",
  "Anthrazit": "bg-gray-700",
  "Rot": "bg-red-500",
  "Gelb": "bg-yellow-400",
  "Rosa": "bg-pink-300",
  "Braun": "bg-amber-700",
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
    let aValue: string | boolean = "";
    let bValue: string | boolean = "";

    switch (sortField) {
      case "artikelnummer":
        aValue = a.artikelnummer || "";
        bValue = b.artikelnummer || "";
        break;
      case "name":
        aValue = a.name || "";
        bValue = b.name || "";
        break;
      case "kategorie":
        aValue = a.kategorie || "";
        bValue = b.kategorie || "";
        break;
      case "farbe":
        aValue = a.farbe || "";
        bValue = b.farbe || "";
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">
              <SortButton field="artikelnummer">Art.-Nr.</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="name">Name</SortButton>
            </TableHead>
            <TableHead>Bezeichnung</TableHead>
            <TableHead>
              <SortButton field="kategorie">Kategorie</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="farbe">Farbe</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="aktiv">Status</SortButton>
            </TableHead>
            <TableHead className="w-[70px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedArtikel.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Keine Wäscheartikel gefunden.
              </TableCell>
            </TableRow>
          ) : (
            sortedArtikel.map((artikel) => (
              <TableRow key={artikel.id}>
                <TableCell className="font-mono text-sm">
                  {artikel.artikelnummer}
                </TableCell>
                <TableCell className="font-medium">{artikel.name}</TableCell>
                <TableCell className="text-muted-foreground">
                  {artikel.bezeichnung || "-"}
                </TableCell>
                <TableCell>
                  {artikel.kategorie ? (
                    <Badge variant="secondary">{artikel.kategorie}</Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {artikel.farbe ? (
                    <div className="flex items-center gap-2">
                      <span
                        className={`h-4 w-4 rounded-full ${getColorClass(artikel.farbe)}`}
                      />
                      <span>{artikel.farbe}</span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={artikel.aktiv ? "default" : "secondary"}>
                    {artikel.aktiv ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Aktionen</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(artikel)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onToggleAktiv(artikel.id, !artikel.aktiv)}
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {artikel.aktiv ? "Deaktivieren" : "Aktivieren"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
