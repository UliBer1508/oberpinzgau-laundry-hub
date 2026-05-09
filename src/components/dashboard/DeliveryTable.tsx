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
import { MoreHorizontal, MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Delivery {
  id: string;
  customer: string;
  object: string;
  address: string;
  time: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  worker: string;
  items: number;
}

const mockDeliveries: Delivery[] = [
  {
    id: "L-001",
    customer: "Hotel Bergblick",
    object: "Hauptgebäude",
    address: "Bergstraße 15, Mittersill",
    time: "08:30",
    status: "completed",
    worker: "Maria Huber",
    items: 45,
  },
  {
    id: "L-002",
    customer: "Pension Alpenrose",
    object: "Gästehaus A",
    address: "Alpenweg 8, Bramberg",
    time: "09:15",
    status: "in_progress",
    worker: "Thomas Gruber",
    items: 28,
  },
  {
    id: "L-003",
    customer: "Ferienwohnungen Sonnblick",
    object: "Wohnung 3",
    address: "Sonnblickstraße 22, Hollersbach",
    time: "10:00",
    status: "pending",
    worker: "Maria Huber",
    items: 12,
  },
  {
    id: "L-004",
    customer: "Appartements Glockner",
    object: "Suite Deluxe",
    address: "Glocknerweg 5, Uttendorf",
    time: "11:30",
    status: "pending",
    worker: "Anna Maier",
    items: 18,
  },
  {
    id: "L-005",
    customer: "Gasthof Pinzgauer Hof",
    object: "Restaurant",
    address: "Hauptplatz 1, Mittersill",
    time: "14:00",
    status: "pending",
    worker: "Thomas Gruber",
    items: 65,
  },
];

const statusConfig = {
  pending: {
    label: "Ausstehend",
    className: "bg-warning/10 text-warning border-warning/20 hover:bg-warning/20",
  },
  in_progress: {
    label: "In Bearbeitung",
    className: "bg-info/10 text-info border-info/20 hover:bg-info/20",
  },
  completed: {
    label: "Abgeschlossen",
    className: "bg-success/10 text-success border-success/20 hover:bg-success/20",
  },
  cancelled: {
    label: "Storniert",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
};

export function DeliveryTable() {
  return (
    <>
      {/* Mobile */}
      <div className="md:hidden space-y-3">
        {mockDeliveries.map((delivery) => (
          <div
            key={delivery.id}
            role="button"
            className="rounded-lg border bg-card p-4 shadow-sm active:bg-muted/50 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-mono text-xs text-muted-foreground">{delivery.id}</div>
                <div className="font-semibold truncate">{delivery.customer}</div>
                <div className="text-sm text-muted-foreground truncate">{delivery.object}</div>
              </div>
              <Badge variant="outline" className={cn("font-medium text-xs shrink-0", statusConfig[delivery.status].className)}>
                {statusConfig[delivery.status].label}
              </Badge>
            </div>
            <div className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span>{delivery.address}</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{delivery.time}</span>
              </div>
              <span className="text-muted-foreground truncate">{delivery.worker}</span>
              <span className="rounded-md bg-muted px-2 py-1 text-xs font-medium">{delivery.items}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop */}
      <div className="hidden md:block rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-20 font-semibold">ID</TableHead>
              <TableHead className="font-semibold">Kunde / Objekt</TableHead>
              <TableHead className="font-semibold">Adresse</TableHead>
              <TableHead className="w-24 font-semibold">Zeit</TableHead>
              <TableHead className="w-32 font-semibold">Status</TableHead>
              <TableHead className="font-semibold">Wäschekraft</TableHead>
              <TableHead className="w-20 text-right font-semibold">Artikel</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockDeliveries.map((delivery) => (
              <TableRow key={delivery.id} className="group">
                <TableCell className="font-mono text-sm font-medium text-muted-foreground">
                  {delivery.id}
                </TableCell>
                <TableCell>
                  <div className="space-y-0.5">
                    <p className="font-medium text-foreground">{delivery.customer}</p>
                    <p className="text-sm text-muted-foreground">{delivery.object}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{delivery.address}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{delivery.time}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn("font-medium", statusConfig[delivery.status].className)}>
                    {statusConfig[delivery.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">{delivery.worker}</TableCell>
                <TableCell className="text-right">
                  <span className="rounded-md bg-muted px-2 py-1 text-sm font-medium">{delivery.items}</span>
                </TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}

