import { useState, useMemo } from "react";
import { Plus, Layers } from "lucide-react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BackButton } from "@/components/layout/BackButton";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  useWaeschesets,
  useCreateWaescheset,
  useUpdateWaescheset,
  useToggleWaeschesetAktiv,
  useKundenForWaeschesets,
  useAddArtikelToSet,
  type Waescheset,
  type WaeschesetInsert,
  type Berechnungsart,
} from "@/hooks/useWaeschesets";
import { WaeschesetsStats } from "@/components/waeschesets/WaeschesetsStats";
import { WaeschesetsFilter } from "@/components/waeschesets/WaeschesetsFilter";
import { WaeschesetsTable } from "@/components/waeschesets/WaeschesetsTable";
import { WaeschesetFormDialog } from "@/components/waeschesets/WaeschesetFormDialog";
import { VorlageUebernehmenDialog } from "@/components/vorlagen/VorlageUebernehmenDialog";
import { ArrowDownToLine } from "lucide-react";

interface PendingArtikel {
  id: string;
  artikel_id: string;
  artikelNummer: string;
  artikelName: string;
  kategorie: string | null;
  farbe: string | null;
  menge: number;
  berechnungsart: Berechnungsart;
}

export default function Waeschesets() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKunde, setSelectedKunde] = useState("all");
  const [showOnlyAktiv, setShowOnlyAktiv] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedSet, setSelectedSet] = useState<Waescheset | null>(null);
  const [vorlageDialogOpen, setVorlageDialogOpen] = useState(false);

  const { data: sets = [], isLoading, error } = useWaeschesets();
  const { data: kunden = [] } = useKundenForWaeschesets();
  const createSet = useCreateWaescheset();
  const updateSet = useUpdateWaescheset();
  const toggleAktiv = useToggleWaeschesetAktiv();
  const addArtikel = useAddArtikelToSet();

  // Filter sets
  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      const matchesSearch =
        searchTerm === "" ||
        set.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.beschreibung?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.objektName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        set.kundeName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesKunde =
        selectedKunde === "all" || set.kundeId === selectedKunde;

      const matchesAktiv = !showOnlyAktiv || set.aktiv;

      return matchesSearch && matchesKunde && matchesAktiv;
    });
  }, [sets, searchTerm, selectedKunde, showOnlyAktiv]);

  // Calculate statistics
  const stats = useMemo(() => {
    const uniqueObjekte = new Set(sets.map((s) => s.objekt_id));
    const totalArtikel = sets.reduce((sum, s) => sum + s.artikelCount, 0);

    return {
      total: sets.length,
      aktiv: sets.filter((s) => s.aktiv).length,
      objekteMitSets: uniqueObjekte.size,
      artikelZugeordnet: totalArtikel,
    };
  }, [sets]);

  const handleAddSet = () => {
    setSelectedSet(null);
    setFormDialogOpen(true);
  };

  const handleEditSet = (set: Waescheset) => {
    setSelectedSet(set);
    setFormDialogOpen(true);
  };

  // Opens the form dialog in edit mode for managing articles
  const handleManageArtikel = (set: Waescheset) => {
    setSelectedSet(set);
    setFormDialogOpen(true);
  };

  const handleToggleAktiv = async (set: Waescheset) => {
    try {
      await toggleAktiv.mutateAsync({ id: set.id, aktiv: !set.aktiv });
      toast({
        title: set.aktiv ? "Set deaktiviert" : "Set aktiviert",
      });
    } catch {
      toast({
        title: "Fehler beim Ändern des Status",
        variant: "destructive",
      });
    }
  };

  const handleSaveSet = async (data: WaeschesetInsert, pendingArtikel?: PendingArtikel[]) => {
    try {
      if (selectedSet) {
        await updateSet.mutateAsync({ id: selectedSet.id, ...data });
        toast({ title: "Kunden-Wäscheset aktualisiert" });
      } else {
        // Create new set
        const newSet = await createSet.mutateAsync(data);
        
        // Add pending articles to the new set
        if (pendingArtikel && pendingArtikel.length > 0) {
          for (const artikel of pendingArtikel) {
            await addArtikel.mutateAsync({
              set_id: newSet.id,
              artikel_id: artikel.artikel_id,
              menge: artikel.menge,
              berechnungsart: artikel.berechnungsart,
            });
          }
        }
        toast({ title: "Kunden-Wäscheset erstellt" });
      }
      setFormDialogOpen(false);
    } catch {
      toast({
        title: "Fehler beim Speichern",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <main className="flex-1 p-4 md:p-6 overflow-x-hidden min-w-0">
            <div className="text-center text-destructive">
              Fehler beim Laden der Daten
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
          <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:hidden">
            <SidebarTrigger className="h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <BackButton />
            <h1 className="text-base font-semibold">Kunden-Wäschesets</h1>
          </header>
          <div className="container py-4 md:py-6">
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Kunden-Wäschesets</h1>
                  <p className="text-sm text-muted-foreground">
                    Verwalten Sie Kunden-Wäschesets für Ihre Objekte
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => setVorlageDialogOpen(true)}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  Vorlage übernehmen
                </Button>
                <Button onClick={handleAddSet}>
                  <Plus className="mr-2 h-4 w-4" />
                  Neues Set
                </Button>
              </div>
            </div>

            {/* Stats */}
            <div className="mb-6">
              <WaeschesetsStats {...stats} />
            </div>

            {/* Filter */}
            <div className="mb-6">
              <WaeschesetsFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedKunde={selectedKunde}
                onKundeChange={setSelectedKunde}
                kunden={kunden.map(k => ({ 
                  id: k.id, 
                  name: k.firma || k.name 
                }))}
                showOnlyAktiv={showOnlyAktiv}
                onShowOnlyAktivChange={setShowOnlyAktiv}
              />
            </div>

            {/* Table */}
            {isLoading ? (
              <div className="py-12 text-center text-muted-foreground">
                Lade Kunden-Wäschesets...
              </div>
            ) : (
              <WaeschesetsTable
                sets={filteredSets}
                onEdit={handleEditSet}
                onToggleAktiv={handleToggleAktiv}
                onManageArtikel={handleManageArtikel}
              />
            )}

            {/* Combined Form Dialog with Articles */}
            <WaeschesetFormDialog
              open={formDialogOpen}
              onOpenChange={setFormDialogOpen}
              set={selectedSet}
              objekte={[]}
              onSubmit={handleSaveSet}
              isLoading={createSet.isPending || updateSet.isPending}
            />

            <VorlageUebernehmenDialog
              open={vorlageDialogOpen}
              onOpenChange={setVorlageDialogOpen}
            />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
