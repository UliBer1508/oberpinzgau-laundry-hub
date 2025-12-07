import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Package, ArrowRight, XCircle, Trash2, User, CalendarDays } from "lucide-react";
import { BestellungStatusBadge } from "./BestellungStatusBadge";
import type { Bestellung, BestellungStatus } from "@/hooks/useBestellungen";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { formatPreis } from "@/lib/formatPreis";

interface BestellungenTableProps {
  bestellungen: Bestellung[];
  onEdit: (bestellung: Bestellung) => void;
  onManagePositionen: (bestellung: Bestellung) => void;
  onStatusChange: (id: string, status: BestellungStatus) => void;
  onDelete: (bestellung: Bestellung) => void;
}

const NEXT_STATUS: Partial<Record<BestellungStatus, { status: BestellungStatus; label: string }>> = {
  neu: { status: "in_bearbeitung", label: "In Bearbeitung setzen" },
  in_bearbeitung: { status: "ausgeliefert", label: "Als ausgeliefert markieren" },
  ausgeliefert: { status: "abgeholt", label: "Als abgeholt markieren" },
  abgeholt: { status: "abgeschlossen", label: "Abschließen" },
};

export function BestellungenTable({
  bestellungen,
  onEdit,
  onManagePositionen,
  onStatusChange,
  onDelete,
}: BestellungenTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Bestellnummer</TableHead>
            <TableHead>Kunde</TableHead>
            <TableHead>Objekt</TableHead>
            <TableHead>Gast / Buchung</TableHead>
            <TableHead>Lieferdatum</TableHead>
            <TableHead>Abholdatum</TableHead>
            <TableHead>Wäschekraft</TableHead>
            <TableHead>Positionen</TableHead>
            <TableHead className="text-right">Preis</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bestellungen.length === 0 ? (
            <TableRow>
              <TableCell colSpan={11} className="h-24 text-center text-muted-foreground">
                Keine Bestellungen gefunden.
              </TableCell>
            </TableRow>
          ) : (
            bestellungen.map((bestellung) => (
              <TableRow key={bestellung.id}>
                <TableCell className="font-medium">{bestellung.bestellnummer}</TableCell>
                <TableCell>{bestellung.kundeName}</TableCell>
                <TableCell>{bestellung.objektName || "-"}</TableCell>
                <TableCell>
                  {(bestellung as any).gastname || (bestellung as any).check_in ? (
                    <div className="space-y-0.5">
                      {(bestellung as any).gastname && (
                        <div className="font-medium text-sm">{(bestellung as any).gastname}</div>
                      )}
                      {(bestellung as any).check_in && (bestellung as any).check_out && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CalendarDays className="h-3 w-3" />
                          {format(new Date((bestellung as any).check_in), "dd.MM.", { locale: de })}
                          {" - "}
                          {format(new Date((bestellung as any).check_out), "dd.MM.yy", { locale: de })}
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {bestellung.lieferdatum
                    ? format(new Date(bestellung.lieferdatum), "dd.MM.yyyy", { locale: de })
                    : "-"}
                </TableCell>
                <TableCell>
                  {bestellung.abholdatum
                    ? format(new Date(bestellung.abholdatum), "dd.MM.yyyy", { locale: de })
                    : "-"}
                </TableCell>
                <TableCell>
                  {bestellung.waeschekraftName ? (
                    <span className="inline-flex items-center gap-1.5 text-sm">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      {bestellung.waeschekraftName}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{bestellung.positionenCount}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatPreis(bestellung.gesamtpreis)}
                </TableCell>
                <TableCell>
                  <BestellungStatusBadge status={bestellung.status as BestellungStatus} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onManagePositionen(bestellung)}>
                        <Package className="mr-2 h-4 w-4" />
                        Positionen verwalten
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onEdit(bestellung)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      {NEXT_STATUS[bestellung.status as BestellungStatus] && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              onStatusChange(
                                bestellung.id,
                                NEXT_STATUS[bestellung.status as BestellungStatus]!.status
                              )
                            }
                          >
                            <ArrowRight className="mr-2 h-4 w-4" />
                            {NEXT_STATUS[bestellung.status as BestellungStatus]!.label}
                          </DropdownMenuItem>
                        </>
                      )}
                      {bestellung.status !== "storniert" && bestellung.status !== "abgeschlossen" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onStatusChange(bestellung.id, "storniert")}
                            className="text-destructive"
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Stornieren
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(bestellung)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Löschen
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
