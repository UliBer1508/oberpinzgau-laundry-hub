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
  const renderActions = (kunde: Kunde, mobile = false) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => e.stopPropagation()}
          className={mobile ? "" : "opacity-0 group-hover:opacity-100 transition-opacity"}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Aktionen</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
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
            <><PowerOff className="mr-2 h-4 w-4" />Deaktivieren</>
          ) : (
            <><Power className="mr-2 h-4 w-4" />Aktivieren</>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {kunden.length === 0 ? (
          <div className="rounded-md border p-6 text-center text-muted-foreground">Keine Kunden gefunden.</div>
        ) : (
          kunden.map((kunde) => (
            <div
              key={kunde.id}
              role="button"
              onClick={() => onEdit(kunde)}
              className="rounded-lg border bg-card p-4 shadow-sm active:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-semibold truncate">{kunde.name}</div>
                  {kunde.firma && <div className="text-sm text-muted-foreground truncate">{kunde.firma}</div>}
                  <div className="font-mono text-xs text-muted-foreground mt-0.5">{kunde.kundennummer}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Badge variant={kunde.aktiv ? "default" : "secondary"}>
                    {kunde.aktiv ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  {renderActions(kunde, true)}
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between gap-2 text-sm">
                <span className="text-muted-foreground truncate">
                  {kunde.ort ? `${kunde.plz ?? ""} ${kunde.ort}` : "-"}
                </span>
                <div className="flex items-center gap-2 shrink-0">
                  {kunde.bestellart && (
                    <Badge variant={bestellartVariants[kunde.bestellart]} className="text-xs">
                      {bestellartLabels[kunde.bestellart]}
                    </Badge>
                  )}
                  <Badge variant="secondary" className="font-mono text-xs">
                    {kunde.objekteCount} Obj.
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
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
                    <Badge variant="secondary" className="font-mono">{kunde.objekteCount}</Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={kunde.aktiv ? "default" : "secondary"}>
                      {kunde.aktiv ? "Aktiv" : "Inaktiv"}
                    </Badge>
                  </TableCell>
                  <TableCell>{renderActions(kunde)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

