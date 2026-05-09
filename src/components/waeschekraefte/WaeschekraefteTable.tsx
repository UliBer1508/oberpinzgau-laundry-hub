import { MoreHorizontal, Edit, Power, Key, Trash2, Phone, Mail, MapPin } from "lucide-react";
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
import { cn } from "@/lib/utils";
import type { Waeschekraft } from "@/hooks/useWaeschekraefte";

interface WaeschekraefteTableProps {
  waeschekraefte: Waeschekraft[];
  onEdit: (worker: Waeschekraft) => void;
  onToggleAktiv: (id: string, aktiv: boolean) => void;
  onTogglePortal: (id: string, portalzugang: boolean) => void;
  onDelete: (id: string) => void;
}

export function WaeschekraefteTable({
  waeschekraefte,
  onEdit,
  onToggleAktiv,
  onTogglePortal,
  onDelete,
}: WaeschekraefteTableProps) {
  const renderActions = (worker: Waeschekraft) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onEdit(worker)}>
          <Edit className="mr-2 h-4 w-4" />Bearbeiten
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onToggleAktiv(worker.id, !worker.aktiv)}>
          <Power className="mr-2 h-4 w-4" />
          {worker.aktiv ? "Deaktivieren" : "Aktivieren"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTogglePortal(worker.id, !worker.portalzugang)}>
          <Key className="mr-2 h-4 w-4" />
          {worker.portalzugang ? "Portal deaktivieren" : "Portal aktivieren"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              onSelect={(e) => e.preventDefault()}
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />Löschen
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Personal löschen?</AlertDialogTitle>
              <AlertDialogDescription>
                Möchten Sie "{worker.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(worker.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  const getTypInfo = (worker: Waeschekraft) => {
    const label = worker.typ === "fahrer" ? "Fahrer" : worker.typ === "beides" ? "Beides" : "Wäschekraft";
    const color = worker.typ === "fahrer"
      ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      : worker.typ === "beides"
      ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    return { label, color };
  };

  return (
    <>
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {waeschekraefte.length === 0 ? (
          <div className="rounded-md border p-6 text-center text-muted-foreground">Kein Personal gefunden</div>
        ) : (
          waeschekraefte.map((worker) => {
            const { label, color } = getTypInfo(worker);
            return (
              <div
                key={worker.id}
                role="button"
                onClick={() => onEdit(worker)}
                className={cn(
                  "rounded-lg border bg-card p-4 shadow-sm active:bg-muted/50 transition-colors",
                  !worker.aktiv && "opacity-60"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{worker.name}</div>
                    <div className="font-mono text-xs text-muted-foreground">{worker.personalnummer}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge variant="outline" className={cn("font-medium text-xs", color)}>{label}</Badge>
                    {renderActions(worker)}
                  </div>
                </div>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {worker.telefon && (
                    <div className="flex items-center gap-1"><Phone className="h-3 w-3" />{worker.telefon}</div>
                  )}
                  {worker.email && (
                    <div className="flex items-center gap-1"><Mail className="h-3 w-3" />{worker.email}</div>
                  )}
                  {(worker.strasse || worker.ort) && (
                    <div className="flex items-start gap-1">
                      <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                      <span>{[worker.strasse, `${worker.plz || ""} ${worker.ort || ""}`.trim()].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Badge variant="outline" className={cn("text-xs", worker.aktiv
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400")}>
                    {worker.aktiv ? "Aktiv" : "Inaktiv"}
                  </Badge>
                  <Badge variant="outline" className={cn("text-xs", worker.portalzugang
                    ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400")}>
                    Portal: {worker.portalzugang ? "An" : "Aus"}
                  </Badge>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[100px]">Personal-Nr.</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Typ</TableHead>
              <TableHead>Kontakt</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Portalzugang</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waeschekraefte.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  Kein Personal gefunden
                </TableCell>
              </TableRow>
            ) : (
              waeschekraefte.map((worker) => {
                const { label, color } = getTypInfo(worker);
                return (
                  <TableRow key={worker.id} className={cn(!worker.aktiv && "opacity-60")}>
                    <TableCell className="font-mono font-medium">{worker.personalnummer}</TableCell>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium", color)}>{label}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {worker.telefon && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Phone className="h-3 w-3" />{worker.telefon}
                          </div>
                        )}
                        {worker.email && (
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />{worker.email}
                          </div>
                        )}
                        {!worker.telefon && !worker.email && "—"}
                      </div>
                    </TableCell>
                    <TableCell>
                      {worker.strasse || worker.plz || worker.ort ? (
                        <div className="flex items-start gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>
                            {[worker.strasse, `${worker.plz || ""} ${worker.ort || ""}`.trim()]
                              .filter(Boolean).join(", ")}
                          </span>
                        </div>
                      ) : ("—")}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium",
                        worker.aktiv
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400")}>
                        {worker.aktiv ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={cn("font-medium",
                        worker.portalzugang
                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400")}>
                        {worker.portalzugang ? "Aktiv" : "Inaktiv"}
                      </Badge>
                    </TableCell>
                    <TableCell>{renderActions(worker)}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

