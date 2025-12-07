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
import { Pencil, Trash2, User } from "lucide-react";
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
  onViewDetails: (bestellung: Bestellung) => void;
}

function getRechnungsstatusBadge(bestellung: Bestellung) {
  const rechnung = (bestellung as any).rechnung;
  if (!rechnung) {
    return <Badge variant="outline" className="text-muted-foreground">Keine Rechnung</Badge>;
  }
  
  switch (rechnung.status) {
    case "bezahlt":
      return <Badge className="bg-success/10 text-success border-success/20">Bezahlt</Badge>;
    case "offen":
      return <Badge className="bg-warning/10 text-warning border-warning/20">Ausstehend</Badge>;
    case "mahnung":
      return <Badge className="bg-destructive/10 text-destructive border-destructive/20">Mahnung</Badge>;
    case "storniert":
      return <Badge variant="outline" className="text-muted-foreground">Storniert</Badge>;
    default:
      return <Badge variant="outline" className="text-muted-foreground">-</Badge>;
  }
}

export function BestellungenTable({
  bestellungen,
  onEdit,
  onDelete,
  onViewDetails,
}: BestellungenTableProps) {
  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/30">
            <TableHead className="font-semibold">Bestellnr.</TableHead>
            <TableHead className="font-semibold">Kunde</TableHead>
            <TableHead className="font-semibold">Objekt</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            <TableHead className="font-semibold">Lieferdatum</TableHead>
            <TableHead className="font-semibold">Zahlung</TableHead>
            <TableHead className="font-semibold text-right">Betrag</TableHead>
            <TableHead className="font-semibold">Wäschekraft</TableHead>
            <TableHead className="font-semibold">Buchung</TableHead>
            <TableHead className="font-semibold text-center">Aktionen</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bestellungen.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-24 text-center text-muted-foreground">
                Keine Bestellungen gefunden.
              </TableCell>
            </TableRow>
          ) : (
            bestellungen.map((bestellung) => {
              const hasBookingData = (bestellung as any).gastname || (bestellung as any).check_in || (bestellung as any).check_out;
              
              return (
                <TableRow 
                  key={bestellung.id} 
                  className="cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => onViewDetails(bestellung)}
                >
                  <TableCell className="font-medium">
                    {bestellung.bestellnummer}
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{bestellung.kundeName}</span>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {bestellung.objektName || "-"}
                  </TableCell>
                  <TableCell>
                    <BestellungStatusBadge status={bestellung.status as BestellungStatus} />
                  </TableCell>
                  <TableCell>
                    {bestellung.lieferdatum ? (
                      <div className="text-sm">
                        {format(new Date(bestellung.lieferdatum), "dd.MM.yy", { locale: de })}
                        {bestellung.lieferzeit && (
                          <div className="text-xs text-muted-foreground">{bestellung.lieferzeit}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getRechnungsstatusBadge(bestellung)}
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatPreis(bestellung.gesamtpreis)}
                  </TableCell>
                  <TableCell>
                    {bestellung.waeschekraftName ? (
                      <Badge variant="secondary" className="gap-1">
                        <User className="h-3 w-3" />
                        {bestellung.waeschekraftName}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {hasBookingData ? (
                      <div className="text-sm space-y-0.5">
                        {(bestellung as any).gastname && (
                          <div className="font-medium">{(bestellung as any).gastname}</div>
                        )}
                        {((bestellung as any).check_in || (bestellung as any).check_out) && (
                          <div className="text-xs text-muted-foreground">
                            {(bestellung as any).check_in && format(new Date((bestellung as any).check_in), "dd.MM", { locale: de })}
                            {(bestellung as any).check_in && (bestellung as any).check_out && " - "}
                            {(bestellung as any).check_out && format(new Date((bestellung as any).check_out), "dd.MM", { locale: de })}
                          </div>
                        )}
                        {(bestellung as any).anzahl_personen && (bestellung as any).anzahl_personen > 1 && (
                          <div className="text-xs text-muted-foreground">{(bestellung as any).anzahl_personen} Gäste</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(bestellung)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => onDelete(bestellung)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
