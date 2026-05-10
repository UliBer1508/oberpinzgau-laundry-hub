import { MoreVertical, Edit, Power, Key, Trash2, Phone, Mail, MapPin, UserCircle2 } from "lucide-react";
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
  if (waeschekraefte.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-card p-10 text-center text-muted-foreground">
        Kein Personal gefunden
      </div>
    );
  }

  const getTypInfo = (worker: Waeschekraft) => {
    const label = worker.typ === "fahrer" ? "Fahrer" : worker.typ === "beides" ? "Beides" : "Wäschekraft";
    const color =
      worker.typ === "fahrer"
        ? "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
        : worker.typ === "beides"
        ? "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400"
        : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    return { label, color };
  };

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {waeschekraefte.map((worker) => {
        const { label, color } = getTypInfo(worker);
        const adresse = [worker.strasse, `${worker.plz || ""} ${worker.ort || ""}`.trim()].filter(Boolean).join(", ");
        return (
          <div
            key={worker.id}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(worker)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onEdit(worker);
              }
            }}
            className={cn(
              "group relative rounded-xl border bg-card p-4 sm:p-5 shadow-sm transition-all",
              "hover:shadow-md hover:border-primary/30 cursor-pointer",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              !worker.aktiv && "opacity-60",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-semibold">{worker.personalnummer}</span>
                <Badge variant="outline" className={cn("text-xs font-medium", color)}>{label}</Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    worker.aktiv
                      ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
                  )}
                >
                  {worker.aktiv ? "Aktiv" : "Inaktiv"}
                </Badge>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mr-1 -mt-1"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onEdit(worker)}>
                    <Edit className="mr-2 h-4 w-4" />Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onToggleAktiv(worker.id, !worker.aktiv)}>
                    <Power className="mr-2 h-4 w-4" />{worker.aktiv ? "Deaktivieren" : "Aktivieren"}
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
                    <AlertDialogContent onClick={(e) => e.stopPropagation()}>
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
            </div>

            <div className="mt-2 flex items-center gap-2">
              <UserCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
              <h3 className="text-base font-semibold truncate">{worker.name}</h3>
            </div>

            <div className="mt-3 border-t pt-3 grid gap-1.5 text-sm text-muted-foreground">
              {worker.telefon && (
                <div className="flex items-center gap-2"><Phone className="h-3.5 w-3.5" />{worker.telefon}</div>
              )}
              {worker.email && (
                <div className="flex items-center gap-2 truncate"><Mail className="h-3.5 w-3.5" /><span className="truncate">{worker.email}</span></div>
              )}
              {adresse && (
                <div className="flex items-start gap-2"><MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0" /><span className="truncate">{adresse}</span></div>
              )}
              <div className="flex items-center gap-2 pt-1">
                <Key className="h-3.5 w-3.5" />
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    worker.portalzugang
                      ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
                  )}
                >
                  Portal: {worker.portalzugang ? "An" : "Aus"}
                </Badge>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
