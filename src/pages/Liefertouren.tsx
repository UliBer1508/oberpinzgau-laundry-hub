import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LiefertourenStats } from "@/components/liefertouren/LiefertourenStats";
import { LiefertourenFilter } from "@/components/liefertouren/LiefertourenFilter";
import { LiefertourenTable } from "@/components/liefertouren/LiefertourenTable";
import { LiefertourFormDialog } from "@/components/liefertouren/LiefertourFormDialog";
import { LiefertourStoppsDialog } from "@/components/liefertouren/LiefertourStoppsDialog";
import { RoutenvorlagenTab } from "@/components/routenvorlagen/RoutenvorlagenTab";
import {
  useLiefertouren,
  useCreateLiefertour,
  useUpdateLiefertour,
  useUpdateLiefertourStatus,
} from "@/hooks/useLiefertouren";
import type { Liefertour } from "@/hooks/useLiefertouren";

export default function Liefertouren() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [waeschekraftFilter, setWaeschekraftFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isStoppsOpen, setIsStoppsOpen] = useState(false);
  const [selectedTour, setSelectedTour] = useState<Liefertour | null>(null);

  const { data: touren = [], isLoading } = useLiefertouren();
  const createTour = useCreateLiefertour();
  const updateTour = useUpdateLiefertour();
  const updateStatus = useUpdateLiefertourStatus();

  const filteredTouren = useMemo(() => {
    return touren.filter((tour) => {
      const matchesSearch =
        searchTerm === "" ||
        tour.tournummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tour.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || tour.status === statusFilter;

      const matchesWaeschekraft =
        waeschekraftFilter === "all" || tour.waeschekraft_id === waeschekraftFilter;

      return matchesSearch && matchesStatus && matchesWaeschekraft;
    });
  }, [touren, searchTerm, statusFilter, waeschekraftFilter]);

  const handleEdit = (tour: Liefertour) => {
    setSelectedTour(tour);
    setIsFormOpen(true);
  };

  const handleManageStopps = (tour: Liefertour) => {
    setSelectedTour(tour);
    setIsStoppsOpen(true);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateStatus.mutate({ id, status });
  };

  const handleFormSubmit = (data: {
    tournummer: string;
    name: string;
    datum: Date;
    waeschekraft_id?: string;
    status: string;
    notizen?: string;
  }) => {
    const payload = {
      tournummer: data.tournummer,
      name: data.name,
      datum: data.datum.toISOString().split("T")[0],
      waeschekraft_id: data.waeschekraft_id || null,
      status: data.status,
      notizen: data.notizen || null,
    };

    if (selectedTour) {
      updateTour.mutate({ id: selectedTour.id, ...payload });
    } else {
      createTour.mutate(payload);
    }
  };

  const handleNewTour = () => {
    setSelectedTour(null);
    setIsFormOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">Liefertouren</h1>
                <p className="text-sm text-muted-foreground">
                  Tourenplanung und Stopp-Verwaltung
                </p>
              </div>
            </div>
            <Button onClick={handleNewTour}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Tour
            </Button>
          </header>

          <div className="p-6">
            <Tabs defaultValue="touren" className="space-y-6">
              <TabsList>
                <TabsTrigger value="touren">Touren</TabsTrigger>
                <TabsTrigger value="vorlagen">Routenvorlagen</TabsTrigger>
              </TabsList>

              <TabsContent value="touren" className="space-y-6">
                <LiefertourenStats touren={touren} />

                <LiefertourenFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  statusFilter={statusFilter}
                  onStatusChange={setStatusFilter}
                  waeschekraftFilter={waeschekraftFilter}
                  onWaeschekraftChange={setWaeschekraftFilter}
                />

                {isLoading ? (
                  <div className="py-8 text-center text-muted-foreground">Laden...</div>
                ) : (
                  <LiefertourenTable
                    touren={filteredTouren}
                    onEdit={handleEdit}
                    onManageStopps={handleManageStopps}
                    onUpdateStatus={handleUpdateStatus}
                  />
                )}
              </TabsContent>

              <TabsContent value="vorlagen">
                <RoutenvorlagenTab />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>

      <LiefertourFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        tour={selectedTour}
        onSubmit={handleFormSubmit}
      />

      <LiefertourStoppsDialog
        open={isStoppsOpen}
        onOpenChange={setIsStoppsOpen}
        tour={selectedTour}
      />
    </SidebarProvider>
  );
}
