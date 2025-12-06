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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Building2, Power, PowerOff } from "lucide-react";
import type { Kunde } from "@/hooks/useKunden";

interface KundenTableProps {
  kunden: Kunde[];
  onEdit: (kunde: Kunde) => void;
  onShowObjekte: (kunde: Kunde) => void;
  onToggleAktiv: (kunde: Kunde) => void;
}

const bestellartLabels: Record<string, string> = {
  lieferung: "Lieferung",
  abholung: "Abholung",
  beides: "Beides",
};

const bestellartVariants: Record<string, "default" | "secondary" | "outline"> = {
  lieferung: "default",
  abholung: "secondary",
  beides: "outline",
};

export function KundenTable({ kunden, onEdit, onShowObjekte, onToggleAktiv }: KundenTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">Kd-Nr.</TableHead>
            <TableHead>Name / Firma</TableHead>
            <TableHead className="hidden md:table-cell">Ort</TableHead>
            <TableHead className="hidden sm:table-cell">Bestellart</TableHead>
            <TableHead className="text-center">Objekte</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {kunden.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Keine Kunden gefunden.
              </TableCell>
            </TableRow>
          ) : (
            kunden.map((kunde) => (
              <TableRow key={kunde.id} className="group">
                <TableCell className="font-mono text-sm">{kunde.kundennummer}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{kunde.name}</span>
                    {kunde.firma && (
                      <span className="text-sm text-muted-foreground">{kunde.firma}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {kunde.ort ? `${kunde.plz} ${kunde.ort}` : "-"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {kunde.bestellart ? (
                    <Badge variant={bestellartVariants[kunde.bestellart]}>
                      {bestellartLabels[kunde.bestellart]}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="secondary" className="font-mono">
                    {kunde.objekteCount}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={kunde.aktiv ? "default" : "secondary"}>
                    {kunde.aktiv ? "Aktiv" : "Inaktiv"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Aktionen</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(kunde)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onShowObjekte(kunde)}>
                        <Building2 className="mr-2 h-4 w-4" />
                        Objekte anzeigen
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleAktiv(kunde)}>
                        {kunde.aktiv ? (
                          <>
                            <PowerOff className="mr-2 h-4 w-4" />
                            Deaktivieren
                          </>
                        ) : (
                          <>
                            <Power className="mr-2 h-4 w-4" />
                            Aktivieren
                          </>
                        )}
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
