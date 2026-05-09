import { useState, useMemo } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Loader2 } from "lucide-react";
import { KundenStats } from "@/components/kunden/KundenStats";
import { KundenFilter } from "@/components/kunden/KundenFilter";
import { KundenTable } from "@/components/kunden/KundenTable";
import { KundeFormDialog } from "@/components/kunden/KundeFormDialog";
import { toast } from "@/hooks/use-toast";
import {
  useKunden,
  useCreateKunde,
  useUpdateKunde,
  useToggleKundeAktiv,
  type Kunde,
} from "@/hooks/useKunden";

const Kunden = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [bestellartFilter, setBestellartFilter] = useState("alle");
  const [nurAktive, setNurAktive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKunde, setSelectedKunde] = useState<Kunde | null>(null);

  // Daten aus Supabase laden
  const { data: kunden = [], isLoading, error } = useKunden();
  const createKunde = useCreateKunde();
  const updateKunde = useUpdateKunde();
  const toggleAktiv = useToggleKundeAktiv();

  // Stats berechnen
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

  // Gefilterte Kunden
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
    setDialogOpen(true);
  };

  const handleEditKunde = (kunde: Kunde) => {
    setSelectedKunde(kunde);
    setDialogOpen(true);
  };

  const handleShowObjekte = (kunde: Kunde) => {
    window.location.href = `/objekte?kunde=${kunde.id}`;
  };

  const handleToggleAktiv = (kunde: Kunde) => {
    toggleAktiv.mutate(
      { id: kunde.id, aktiv: !kunde.aktiv },
      {
        onSuccess: () => {
          toast({
            title: kunde.aktiv ? "Kunde deaktiviert" : "Kunde aktiviert",
            description: `${kunde.name} wurde ${kunde.aktiv ? "deaktiviert" : "aktiviert"}.`,
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

  const handleSaveKunde = (data: any) => {
    if (selectedKunde) {
      updateKunde.mutate(
        { id: selectedKunde.id, ...data },
        {
          onSuccess: () => {
            toast({
              title: "Kunde aktualisiert",
              description: `${data.name} wurde erfolgreich aktualisiert.`,
            });
            setDialogOpen(false);
          },
          onError: (error) => {
            toast({
              title: "Fehler",
              description: "Kunde konnte nicht aktualisiert werden.",
              variant: "destructive",
            });
            console.error(error);
          },
        }
      );
    } else {
      createKunde.mutate(data, {
        onSuccess: () => {
          toast({
            title: "Kunde angelegt",
            description: `${data.name} wurde erfolgreich angelegt.`,
          });
          setDialogOpen(false);
        },
        onError: (error) => {
          toast({
            title: "Fehler",
            description: "Kunde konnte nicht angelegt werden.",
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
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-6">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-sidebar-foreground">Kunden</h1>
                <p className="text-sm text-sidebar-foreground/80">
                  Verwalten Sie Ihre Kunden und deren Objekte
                </p>
              </div>
            </div>
            <Button onClick={handleNewKunde} disabled={createKunde.isPending}>
              {createKunde.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Neuer Kunde
            </Button>
          </header>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Stats */}
            <KundenStats {...stats} />

            {/* Tabelle mit Filter */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Kundenliste</CardTitle>
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
                    <KundenTable
                      kunden={filteredKunden}
                      onEdit={handleEditKunde}
                      onShowObjekte={handleShowObjekte}
                      onToggleAktiv={handleToggleAktiv}
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

      {/* Dialog */}
      <KundeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        kunde={selectedKunde}
        onSave={handleSaveKunde}
      />
    </SidebarProvider>
  );
};

export default Kunden;
