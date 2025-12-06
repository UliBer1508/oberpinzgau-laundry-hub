import { format } from "date-fns";
import { de } from "date-fns/locale";
import { MoreHorizontal, Edit, MapPin, Play, CheckCircle, RotateCcw } from "lucide-react";
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
import { Progress } from "@/components/ui/progress";
import { LiefertourStatusBadge } from "./LiefertourStatusBadge";
import type { Liefertour } from "@/hooks/useLiefertouren";

interface LiefertourenTableProps {
  touren: Liefertour[];
  onEdit: (tour: Liefertour) => void;
  onManageStopps: (tour: Liefertour) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

const NEXT_STATUS: Record<string, string> = {
  geplant: "aktiv",
  aktiv: "abgeschlossen",
};

export function LiefertourenTable({
  touren,
  onEdit,
  onManageStopps,
  onUpdateStatus,
}: LiefertourenTableProps) {
  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), "dd.MM.yyyy", { locale: de });
  };

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[100px]">Tour-Nr.</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Datum</TableHead>
            <TableHead>Wäschekraft</TableHead>
            <TableHead className="w-[180px]">Stopps</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {touren.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                Keine Liefertouren gefunden
              </TableCell>
            </TableRow>
          ) : (
            touren.map((tour) => {
              const progress = tour.stoppCount > 0 ? (tour.erledigtCount / tour.stoppCount) * 100 : 0;

              return (
                <TableRow key={tour.id}>
                  <TableCell className="font-mono font-medium">{tour.tournummer}</TableCell>
                  <TableCell className="font-medium">{tour.name}</TableCell>
                  <TableCell>{formatDate(tour.datum)}</TableCell>
                  <TableCell>{tour.waeschekraftName || "—"}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={progress} className="h-2 flex-1" />
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {tour.erledigtCount}/{tour.stoppCount}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <LiefertourStatusBadge status={tour.status} />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={() => onManageStopps(tour)}>
                          <MapPin className="mr-2 h-4 w-4" />
                          Stopps verwalten
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onEdit(tour)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Bearbeiten
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {tour.status === "geplant" && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(tour.id, "aktiv")}>
                            <Play className="mr-2 h-4 w-4" />
                            Tour starten
                          </DropdownMenuItem>
                        )}
                        {tour.status === "aktiv" && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(tour.id, "abgeschlossen")}>
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Tour abschließen
                          </DropdownMenuItem>
                        )}
                        {tour.status === "abgeschlossen" && (
                          <DropdownMenuItem onClick={() => onUpdateStatus(tour.id, "geplant")}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Zurücksetzen
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
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
