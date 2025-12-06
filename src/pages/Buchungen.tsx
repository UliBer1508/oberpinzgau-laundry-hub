import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { BuchungenStats } from "@/components/buchungen/BuchungenStats";
import { BuchungenFilter } from "@/components/buchungen/BuchungenFilter";
import { BuchungenTable } from "@/components/buchungen/BuchungenTable";
import { BuchungFormDialog } from "@/components/buchungen/BuchungFormDialog";
import {
  useBuchungen,
  useCreateBuchung,
  useUpdateBuchung,
  useDeleteBuchung,
} from "@/hooks/useBuchungen";
import type { Buchung } from "@/hooks/useBuchungen";

export default function Buchungen() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBuchung, setSelectedBuchung] = useState<Buchung | null>(null);

  const { data: buchungen = [], isLoading } = useBuchungen();
  const createBuchung = useCreateBuchung();
  const updateBuchung = useUpdateBuchung();
  const deleteBuchung = useDeleteBuchung();

  const filteredBuchungen = useMemo(() => {
    return buchungen.filter((buchung) => {
      const matchesSearch =
        searchTerm === "" ||
        buchung.buchungsnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buchung.gastname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buchung.objektName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        buchung.kundeName?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || buchung.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [buchungen, searchTerm, statusFilter]);

  const handleEdit = (buchung: Buchung) => {
    setSelectedBuchung(buchung);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteBuchung.mutate(id);
  };

  const handleFormSubmit = (data: {
    buchungsnummer: string;
    objekt_id: string;
    gastname?: string;
    anzahl_personen: number;
    check_in: Date;
    check_out: Date;
    notizen?: string;
  }) => {
    const payload = {
      buchungsnummer: data.buchungsnummer,
      objekt_id: data.objekt_id,
      gastname: data.gastname || null,
      anzahl_personen: data.anzahl_personen,
      check_in: data.check_in.toISOString().split("T")[0],
      check_out: data.check_out.toISOString().split("T")[0],
      notizen: data.notizen || null,
    };

    if (selectedBuchung) {
      updateBuchung.mutate({ id: selectedBuchung.id, ...payload });
    } else {
      createBuchung.mutate(payload);
    }
  };

  const handleNewBuchung = () => {
    setSelectedBuchung(null);
    setIsFormOpen(true);
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="-ml-2" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Buchungen</h1>
                <p className="text-sm text-muted-foreground">
                  Check-in/Check-out Tracking und Gästedaten
                </p>
              </div>
            </div>
            <Button onClick={handleNewBuchung}>
              <Plus className="mr-2 h-4 w-4" />
              Neue Buchung
            </Button>
          </header>

          <div className="space-y-6 p-6">
            <BuchungenStats buchungen={buchungen} />

            <BuchungenFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
            />

            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Laden...</div>
            ) : (
              <BuchungenTable
                buchungen={filteredBuchungen}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>
      </div>

      <BuchungFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        buchung={selectedBuchung}
        onSubmit={handleFormSubmit}
      />
    </SidebarProvider>
  );
}
