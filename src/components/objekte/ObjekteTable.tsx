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
import { MoreHorizontal, Pencil, Layers, Power, PowerOff, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Objekt } from "@/hooks/useObjekte";

interface ObjekteTableProps {
  objekte: Objekt[];
  onEdit: (objekt: Objekt) => void;
  onManageSets: (objekt: Objekt) => void;
  onToggleAktiv: (objekt: Objekt) => void;
}

const typLabels: Record<string, string> = {
  hotel: "Hotel",
  apartmenthaus: "Apartmenthaus",
  ferienhaus: "Ferienhaus",
  ferienwohnung: "Ferienwohnung",
};

const typVariants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  hotel: "default",
  apartmenthaus: "secondary",
  ferienhaus: "outline",
  ferienwohnung: "outline",
};

export function ObjekteTable({ objekte, onEdit, onManageSets, onToggleAktiv }: ObjekteTableProps) {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Obj-Nr.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead className="hidden md:table-cell">Typ</TableHead>
            <TableHead className="hidden sm:table-cell">Ort</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {objekte.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                Keine Objekte gefunden.
              </TableCell>
            </TableRow>
          ) : (
            objekte.map((objekt) => (
              <TableRow key={objekt.id} className="group">
                <TableCell className="font-mono text-sm">{objekt.objektnummer}</TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{objekt.name}</span>
                    {objekt.ansprechpartner && (
                      <span className="text-sm text-muted-foreground">
                        {objekt.ansprechpartner}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => navigate(`/kunden?search=${objekt.kundeName}`)}
                    className="text-left hover:underline"
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{objekt.kundeName}</span>
                      {objekt.kundeFirma && (
                        <span className="text-sm text-muted-foreground">
                          {objekt.kundeFirma}
                        </span>
                      )}
                    </div>
                  </button>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Badge variant={typVariants[objekt.typ]}>
                    {typLabels[objekt.typ] || objekt.typ}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  {objekt.ort ? `${objekt.plz} ${objekt.ort}` : "-"}
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant={objekt.aktiv ? "default" : "secondary"}>
                    {objekt.aktiv ? "Aktiv" : "Inaktiv"}
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
                      <DropdownMenuItem onClick={() => onEdit(objekt)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onManageSets(objekt)}>
                        <Layers className="mr-2 h-4 w-4" />
                        Wäschesets verwalten
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onToggleAktiv(objekt)}>
                        {objekt.aktiv ? (
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
