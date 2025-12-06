import { format, differenceInDays } from "date-fns";
import { de } from "date-fns/locale";
import { MoreHorizontal, Edit, Trash2, Users, Building2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { BuchungStatusBadge } from "./BuchungStatusBadge";
import type { Buchung } from "@/hooks/useBuchungen";

interface BuchungenTableProps {
  buchungen: Buchung[];
  onEdit: (buchung: Buchung) => void;
  onDelete: (id: string) => void;
}

export function BuchungenTable({
  buchungen,
  onEdit,
  onDelete,
}: BuchungenTableProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  const calculateNights = (checkIn: string, checkOut: string) => {
    return differenceInDays(new Date(checkOut), new Date(checkIn));
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">Buchungs-Nr.</TableHead>
            <TableHead>Gast</TableHead>
            <TableHead>Objekt</TableHead>
            <TableHead>Check-in</TableHead>
            <TableHead>Check-out</TableHead>
            <TableHead className="text-center">Nächte</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {buchungen.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                Keine Buchungen gefunden
              </TableCell>
            </TableRow>
          ) : (
            buchungen.map((buchung) => (
              <TableRow key={buchung.id}>
                <TableCell className="font-mono font-medium">{buchung.buchungsnummer}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{buchung.gastname || "—"}</div>
                      {buchung.anzahl_personen && (
                        <div className="text-sm text-muted-foreground">
                          {buchung.anzahl_personen} {buchung.anzahl_personen === 1 ? "Person" : "Personen"}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <div className="font-medium">{buchung.objektName || "—"}</div>
                      {buchung.kundeName && (
                        <div className="text-sm text-muted-foreground">{buchung.kundeName}</div>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell>{formatDate(buchung.check_in)}</TableCell>
                <TableCell>{formatDate(buchung.check_out)}</TableCell>
                <TableCell className="text-center">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-sm font-medium">
                    {calculateNights(buchung.check_in, buchung.check_out)}
                  </span>
                </TableCell>
                <TableCell>
                  <BuchungStatusBadge status={buchung.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onEdit(buchung)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Bearbeiten
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <DropdownMenuItem
                            onSelect={(e) => e.preventDefault()}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Löschen
                          </DropdownMenuItem>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Buchung löschen?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Möchten Sie die Buchung "{buchung.buchungsnummer}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(buchung.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Löschen
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
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
