import { MoreHorizontal, Pencil, Power, Package } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Waescheset } from "@/hooks/useWaeschesets";

interface WaeschesetsTableProps {
  sets: Waescheset[];
  onEdit: (set: Waescheset) => void;
  onToggleAktiv: (set: Waescheset) => void;
  onManageArtikel: (set: Waescheset) => void;
}

export function WaeschesetsTable({
  sets,
  onEdit,
  onToggleAktiv,
  onManageArtikel,
}: WaeschesetsTableProps) {
  if (sets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed bg-card p-12 text-center">
        <Package className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">Keine Wäschesets gefunden</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Erstellen Sie ein neues Wäscheset oder passen Sie die Filter an.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Objekt</TableHead>
            <TableHead>Beschreibung</TableHead>
            <TableHead className="text-center">Artikel</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px]">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sets.map((set) => (
            <TableRow key={set.id}>
              <TableCell className="font-medium">{set.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{set.objektName}</Badge>
              </TableCell>
              <TableCell className="max-w-[200px] truncate text-muted-foreground">
                {set.beschreibung || "-"}
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="secondary">{set.artikelCount}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant={set.aktiv ? "default" : "secondary"}>
                  {set.aktiv ? "Aktiv" : "Inaktiv"}
                </Badge>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onManageArtikel(set)}>
                      <Package className="mr-2 h-4 w-4" />
                      Artikel verwalten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(set)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Bearbeiten
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onToggleAktiv(set)}>
                      <Power className="mr-2 h-4 w-4" />
                      {set.aktiv ? "Deaktivieren" : "Aktivieren"}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
