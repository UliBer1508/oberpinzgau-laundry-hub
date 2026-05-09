import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { KundenStats } from "@/components/kunden/KundenStats";
import { KundenFilter } from "@/components/kunden/KundenFilter";
import { KundenWithObjekteList } from "@/components/kunden/KundenWithObjekteList";
import { KundeFormDialog } from "@/components/kunden/KundeFormDialog";
import { ObjektFormDialog } from "@/components/objekte/ObjektFormDialog";
import { toast } from "@/hooks/use-toast";
import {
  useKunden,
  useCreateKunde,
  useUpdateKunde,
  useToggleKundeAktiv,
  type Kunde,
} from "@/hooks/useKunden";
import {
  useKundenForSelect,
  useCreateObjekt,
  useUpdateObjekt,
  useToggleObjektAktiv,
  type Objekt,
} from "@/hooks/useObjekte";

const Kunden = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bestellartFilter, setBestellartFilter] = useState("alle");
  const [nurAktive, setNurAktive] = useState(true);

  const [kundeDialogOpen, setKundeDialogOpen] = useState(false);
  const [selectedKunde, setSelectedKunde] = useState<Kunde | null>(null);

  const [objektDialogOpen, setObjektDialogOpen] = useState(false);
  const [selectedObjekt, setSelectedObjekt] = useState<Objekt | null>(null);
  const [lockedKundeId, setLockedKundeId] = useState<string | null>(null);

  const { data: kunden = [], isLoading, error } = useKunden();
  const { data: kundenSelect = [] } = useKundenForSelect();
  const createKunde = useCreateKunde();
  const updateKunde = useUpdateKunde();
  const toggleKundeAktiv = useToggleKundeAktiv();
  const createObjekt = useCreateObjekt();
  const updateObjekt = useUpdateObjekt();
  const toggleObjektAktiv = useToggleObjektAktiv();

  const stats = useMemo(() => {
    return {
      total: kunden.length,
      aktiv: kunden.filter((k) => k.aktiv).length,
      hotels: kunden.filter((k) => k.firma?.toLowerCase().includes("hotel")).length,
      apartments: kunden.filter(
        (k) =>
          k.firma?.toLowerCase().includes("ferienwohnung") ||
          k.firma?.toLowerCase().includes("apartment")
      ).length,
    };
  }, [kunden]);

  const filteredKunden = useMemo(() => {
    return kunden.filter((kunde) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        kunde.name.toLowerCase().includes(searchLower) ||
        kunde.kundennummer.toLowerCase().includes(searchLower) ||
        kunde.firma?.toLowerCase().includes(searchLower);

      const matchesBestellart =
        bestellartFilter === "alle" || kunde.bestellart === bestellartFilter;

      const matchesAktiv = !nurAktive || kunde.aktiv;

      return matchesSearch && matchesBestellart && matchesAktiv;
    });
  }, [kunden, searchTerm, bestellartFilter, nurAktive]);

  const handleNewKunde = () => {
    setSelectedKunde(null);
    setKundeDialogOpen(true);
  };

  const handleEditKunde = (kunde: Kunde) => {
    setSelectedKunde(kunde);
    setKundeDialogOpen(true);
  };

  const handleToggleKundeAktiv = (kunde: Kunde) => {
    toggleKundeAktiv.mutate(
      { id: kunde.id, aktiv: !kunde.aktiv },
      {
        onSuccess: () => {
          toast({
            title: kunde.aktiv ? "Kunde deaktiviert" : "Kunde aktiviert",
            description: `${kunde.name} wurde ${kunde.aktiv ? "deaktiviert" : "aktiviert"}.`,
          });
        },
        onError: (err) => {
          toast({ title: "Fehler", description: "Aktion fehlgeschlagen.", variant: "destructive" });
          console.error(err);
        },
      }
    );
  };

  const handleAddObjekt = (kunde: Kunde) => {
    setSelectedObjekt(null);
    setLockedKundeId(kunde.id);
    setObjektDialogOpen(true);
  };

  const handleEditObjekt = (objekt: Objekt) => {
    setSelectedObjekt(objekt);
    setLockedKundeId(objekt.kunde_id);
    setObjektDialogOpen(true);
  };

  const handleToggleObjektAktiv = (objekt: Objekt) => {
    toggleObjektAktiv.mutate(
      { id: objekt.id, aktiv: !objekt.aktiv },
      {
        onSuccess: () => {
          toast({
            title: objekt.aktiv ? "Objekt deaktiviert" : "Objekt aktiviert",
            description: `${objekt.name} wurde ${objekt.aktiv ? "deaktiviert" : "aktiviert"}.`,
          });
        },
        onError: (err) => {
          toast({ title: "Fehler", description: "Aktion fehlgeschlagen.", variant: "destructive" });
          console.error(err);
        },
      }
    );
  };

  const handleSaveKunde = (data: any) => {
    if (selectedKunde) {
      updateKunde.mutate(
        { id: selectedKunde.id, ...data },
        {
          onSuccess: () => {
            toast({ title: "Kunde aktualisiert", description: `${data.name} wurde gespeichert.` });
            setKundeDialogOpen(false);
          },
          onError: (err) => {
            toast({ title: "Fehler", description: "Speichern fehlgeschlagen.", variant: "destructive" });
            console.error(err);
          },
        }
      );
    } else {
      createKunde.mutate(data, {
        onSuccess: () => {
          toast({ title: "Kunde angelegt", description: `${data.name} wurde angelegt.` });
          setKundeDialogOpen(false);
        },
        onError: (err) => {
          toast({ title: "Fehler", description: "Anlegen fehlgeschlagen.", variant: "destructive" });
          console.error(err);
        },
      });
    }
  };

  const handleSaveObjekt = (data: any) => {
    if (selectedObjekt) {
      updateObjekt.mutate(
        { id: selectedObjekt.id, ...data },
        {
          onSuccess: () => {
            toast({ title: "Objekt aktualisiert", description: `${data.name} wurde gespeichert.` });
            setObjektDialogOpen(false);
          },
          onError: (err) => {
            toast({ title: "Fehler", description: "Speichern fehlgeschlagen.", variant: "destructive" });
            console.error(err);
          },
        }
      );
    } else {
      createObjekt.mutate(data, {
        onSuccess: () => {
          toast({ title: "Objekt angelegt", description: `${data.name} wurde angelegt.` });
          setObjektDialogOpen(false);
        },
        onError: (err) => {
          toast({ title: "Fehler", description: "Anlegen fehlgeschlagen.", variant: "destructive" });
          console.error(err);
        },
      });
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-destructive mb-2">Fehler beim Laden der Kunden</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex items-center gap-4 min-w-0">
              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-sidebar-foreground truncate">Kunden &amp; Objekte</h1>
                <p className="text-sm text-sidebar-foreground/80 truncate">
                  Kunden mit ihren Objekten verwalten
                </p>
              </div>
            </div>
            <Button onClick={handleNewKunde} disabled={createKunde.isPending} size="sm">
              {createKunde.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Neuer Kunde
            </Button>
          </header>

          <div className="p-4 md:p-6 space-y-6">
            <KundenStats {...stats} />

            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Kunden</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <KundenFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  bestellartFilter={bestellartFilter}
                  onBestellartChange={setBestellartFilter}
                  nurAktive={nurAktive}
                  onNurAktiveChange={setNurAktive}
                />
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <KundenWithObjekteList
                      kunden={filteredKunden}
                      onEditKunde={handleEditKunde}
                      onToggleKundeAktiv={handleToggleKundeAktiv}
                      onAddObjekt={handleAddObjekt}
                      onEditObjekt={handleEditObjekt}
                      onToggleObjektAktiv={handleToggleObjektAktiv}
                      searchTerm={searchTerm}
                    />
                    <div className="text-sm text-muted-foreground">
                      {filteredKunden.length} von {kunden.length} Kunden angezeigt
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <KundeFormDialog
        open={kundeDialogOpen}
        onOpenChange={setKundeDialogOpen}
        kunde={selectedKunde}
        onSave={handleSaveKunde}
      />

      <ObjektFormDialog
        open={objektDialogOpen}
        onOpenChange={setObjektDialogOpen}
        objekt={selectedObjekt}
        onSave={handleSaveObjekt}
        isSaving={createObjekt.isPending || updateObjekt.isPending}
        kunden={kundenSelect}
        lockedKundeId={lockedKundeId}
      />
    </SidebarProvider>
  );
};

export default Kunden;
