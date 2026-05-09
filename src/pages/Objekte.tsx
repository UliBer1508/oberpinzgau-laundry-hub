import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { ObjekteStats } from "@/components/objekte/ObjekteStats";
import { ObjekteFilter } from "@/components/objekte/ObjekteFilter";
import { ObjekteTable } from "@/components/objekte/ObjekteTable";
import { ObjektFormDialog } from "@/components/objekte/ObjektFormDialog";
import { toast } from "@/hooks/use-toast";
import {
  useObjekte,
  useKundenForSelect,
  useCreateObjekt,
  useUpdateObjekt,
  useToggleObjektAktiv,
  type Objekt,
} from "@/hooks/useObjekte";

const Objekte = () => {
  const [searchParams] = useSearchParams();
  const kundeIdFromUrl = searchParams.get("kunde");

  const [searchTerm, setSearchTerm] = useState("");
  const [typFilter, setTypFilter] = useState("alle");
  const [kundeFilter, setKundeFilter] = useState(kundeIdFromUrl || "alle");
  const [nurAktive, setNurAktive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedObjekt, setSelectedObjekt] = useState<Objekt | null>(null);

  // URL-Parameter für Kundenfilter übernehmen
  useEffect(() => {
    if (kundeIdFromUrl) {
      setKundeFilter(kundeIdFromUrl);
    }
  }, [kundeIdFromUrl]);

  // Daten aus Supabase laden
  const { data: objekte = [], isLoading, error } = useObjekte();
  const { data: kunden = [] } = useKundenForSelect();
  const createObjekt = useCreateObjekt();
  const updateObjekt = useUpdateObjekt();
  const toggleAktiv = useToggleObjektAktiv();

  // Stats berechnen
  const stats = useMemo(() => {
    return {
      total: objekte.length,
      aktiv: objekte.filter((o) => o.aktiv).length,
      hotels: objekte.filter((o) => o.typ === "hotel" || o.typ === "apartmenthaus").length,
      ferienwohnungen: objekte.filter((o) => o.typ === "ferienhaus" || o.typ === "ferienwohnung").length,
    };
  }, [objekte]);

  // Gefilterte Objekte
  const filteredObjekte = useMemo(() => {
    return objekte.filter((objekt) => {
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        objekt.name.toLowerCase().includes(searchLower) ||
        objekt.objektnummer.toLowerCase().includes(searchLower) ||
        objekt.kundeName.toLowerCase().includes(searchLower);

      const matchesTyp = typFilter === "alle" || objekt.typ === typFilter;
      const matchesKunde = kundeFilter === "alle" || objekt.kunde_id === kundeFilter;
      const matchesAktiv = !nurAktive || objekt.aktiv;

      return matchesSearch && matchesTyp && matchesKunde && matchesAktiv;
    });
  }, [objekte, searchTerm, typFilter, kundeFilter, nurAktive]);

  const handleNewObjekt = () => {
    setSelectedObjekt(null);
    setDialogOpen(true);
  };

  const handleEditObjekt = (objekt: Objekt) => {
    setSelectedObjekt(objekt);
    setDialogOpen(true);
  };

  const handleManageSets = (objekt: Objekt) => {
    toast({
      title: "Wäschesets verwalten",
      description: `Wäschesets für ${objekt.name} werden geladen...`,
    });
  };

  const handleToggleAktiv = (objekt: Objekt) => {
    toggleAktiv.mutate(
      { id: objekt.id, aktiv: !objekt.aktiv },
      {
        onSuccess: () => {
          toast({
            title: objekt.aktiv ? "Objekt deaktiviert" : "Objekt aktiviert",
            description: `${objekt.name} wurde ${objekt.aktiv ? "deaktiviert" : "aktiviert"}.`,
          });
        },
        onError: (error) => {
          toast({
            title: "Fehler",
            description: "Aktion konnte nicht ausgeführt werden.",
            variant: "destructive",
          });
          console.error(error);
        },
      }
    );
  };

  const handleSaveObjekt = (data: any) => {
    if (selectedObjekt) {
      updateObjekt.mutate(
        { id: selectedObjekt.id, ...data },
        {
          onSuccess: () => {
            toast({
              title: "Objekt aktualisiert",
              description: `${data.name} wurde erfolgreich aktualisiert.`,
            });
            setDialogOpen(false);
          },
          onError: (error) => {
            toast({
              title: "Fehler",
              description: "Objekt konnte nicht aktualisiert werden.",
              variant: "destructive",
            });
            console.error(error);
          },
        }
      );
    } else {
      createObjekt.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Objekt angelegt",
            description: `${data.name} wurde erfolgreich angelegt.`,
          });
          setDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Fehler",
            description: "Objekt konnte nicht angelegt werden.",
            variant: "destructive",
          });
          console.error(error);
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
              <p className="text-destructive mb-2">Fehler beim Laden der Objekte</p>
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
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-sidebar-foreground">Objekte</h1>
                <p className="text-sm text-sidebar-foreground/80">
                  Verwalten Sie Hotels, Ferienwohnungen und andere Objekte
                </p>
              </div>
            </div>
            <Button onClick={handleNewObjekt} disabled={createObjekt.isPending}>
              {createObjekt.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Neues Objekt
            </Button>
          </header>

          {/* Content */}
          <div className="p-4 md:p-6 space-y-6">
            {/* Stats */}
            <ObjekteStats {...stats} />

            {/* Tabelle mit Filter */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Objektliste</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <ObjekteFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  typFilter={typFilter}
                  onTypChange={setTypFilter}
                  kundeFilter={kundeFilter}
                  onKundeChange={setKundeFilter}
                  nurAktive={nurAktive}
                  onNurAktiveChange={setNurAktive}
                  kunden={kunden}
                />
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                  <>
                    <ObjekteTable
                      objekte={filteredObjekte}
                      onEdit={handleEditObjekt}
                      onManageSets={handleManageSets}
                      onToggleAktiv={handleToggleAktiv}
                    />
                    <div className="text-sm text-muted-foreground">
                      {filteredObjekte.length} von {objekte.length} Objekte angezeigt
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      {/* Dialog */}
      <ObjektFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        objekt={selectedObjekt}
        onSave={handleSaveObjekt}
        isSaving={createObjekt.isPending || updateObjekt.isPending}
        kunden={kunden}
      />
    </SidebarProvider>
  );
};

export default Objekte;
