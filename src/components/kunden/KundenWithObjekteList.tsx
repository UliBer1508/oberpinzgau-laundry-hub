import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2,
  Plus,
  MoreHorizontal,
  Pencil,
  Power,
  PowerOff,
  MapPin,
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Kunde } from "@/hooks/useKunden";
import { useObjekte, type Objekt } from "@/hooks/useObjekte";

const bestellartLabels: Record<string, string> = {
  lieferung: "Lieferung",
  abholung: "Abholung",
  beides: "Beides",
};

const objektTypLabels: Record<string, string> = {
  hotel: "Hotel",
  apartmenthaus: "Apartmenthaus",
  ferienhaus: "Ferienhaus",
  ferienwohnung: "Ferienwohnung",
};

interface KundenWithObjekteListProps {
  kunden: Kunde[];
  onEditKunde: (kunde: Kunde) => void;
  onToggleKundeAktiv: (kunde: Kunde) => void;
  onAddObjekt: (kunde: Kunde) => void;
  onEditObjekt: (objekt: Objekt) => void;
  onToggleObjektAktiv: (objekt: Objekt) => void;
  searchTerm?: string;
}

export function KundenWithObjekteList({
  kunden,
  onEditKunde,
  onToggleKundeAktiv,
  onAddObjekt,
  onEditObjekt,
  onToggleObjektAktiv,
  searchTerm = "",
}: KundenWithObjekteListProps) {
  const { data: objekte = [], isLoading: objekteLoading } = useObjekte();
  const [openItems, setOpenItems] = useState<string[]>([]);

  const objekteByKunde = objekte.reduce<Record<string, Objekt[]>>((acc, o) => {
    if (!acc[o.kunde_id]) acc[o.kunde_id] = [];
    acc[o.kunde_id].push(o);
    return acc;
  }, {});

  if (kunden.length === 0) {
    return (
      <div className="py-12 text-center text-sm text-muted-foreground">
        Keine Kunden gefunden.
      </div>
    );
  }

  return (
    <Accordion
      type="multiple"
      value={openItems}
      onValueChange={setOpenItems}
      className="space-y-2"
    >
      {kunden.map((kunde) => {
        const kundeObjekte = objekteByKunde[kunde.id] || [];
        return (
          <AccordionItem
            key={kunde.id}
            value={kunde.id}
            className="border rounded-lg bg-card overflow-hidden"
          >
            <div className="flex items-center gap-2 pr-2">
              <AccordionTrigger className="flex-1 px-3 sm:px-4 py-3 hover:no-underline hover:bg-muted/50 [&[data-state=open]]:bg-muted/30">
                <div className="flex flex-1 items-center gap-3 min-w-0 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs text-muted-foreground">
                        {kunde.kundennummer}
                      </span>
                      <span className="font-medium truncate">{kunde.name}</span>
                      {kunde.firma && (
                        <span className="text-sm text-muted-foreground truncate">
                          · {kunde.firma}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground flex-wrap">
                      {kunde.ort && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {kunde.plz} {kunde.ort}
                        </span>
                      )}
                      {kunde.bestellart && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          {bestellartLabels[kunde.bestellart]}
                        </Badge>
                      )}
                      <Badge
                        variant="secondary"
                        className="text-[10px] py-0 h-4 font-mono"
                      >
                        {kundeObjekte.length} Objekt
                        {kundeObjekte.length === 1 ? "" : "e"}
                      </Badge>
                      {!kunde.aktiv && (
                        <Badge variant="outline" className="text-[10px] py-0 h-4">
                          Inaktiv
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onEditKunde(kunde)}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Bearbeiten
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onAddObjekt(kunde)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Neues Objekt
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => onToggleKundeAktiv(kunde)}>
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
            </div>

            <AccordionContent className="px-3 sm:px-4 pb-4 pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Objekte ({kundeObjekte.length})
                </h4>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onAddObjekt(kunde)}
                >
                  <Plus className="mr-1.5 h-3.5 w-3.5" />
                  Neues Objekt
                </Button>
              </div>
              {objekteLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : kundeObjekte.length === 0 ? (
                <div className="rounded-md border border-dashed py-6 text-center text-sm text-muted-foreground">
                  Noch keine Objekte für diesen Kunden.
                </div>
              ) : (
                <ul className="space-y-2">
                  {kundeObjekte.map((objekt) => (
                    <li
                      key={objekt.id}
                      className={cn(
                        "flex items-center gap-3 rounded-md border bg-background p-2.5",
                        !objekt.aktiv && "opacity-60"
                      )}
                    >
                      <div className="h-12 w-12 shrink-0 rounded-md bg-muted overflow-hidden flex items-center justify-center">
                        {objekt.bild_url ? (
                          <img
                            src={objekt.bild_url}
                            alt={objekt.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium truncate">
                            {objekt.name}
                          </span>
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {objekt.objektnummer}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap mt-0.5">
                          <Badge
                            variant="outline"
                            className="text-[10px] py-0 h-4"
                          >
                            {objektTypLabels[objekt.typ] || objekt.typ}
                          </Badge>
                          {objekt.ort && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {objekt.plz} {objekt.ort}
                            </span>
                          )}
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onEditObjekt(objekt)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Bearbeiten
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onToggleObjektAktiv(objekt)}
                          >
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
                    </li>
                  ))}
                </ul>
              )}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
