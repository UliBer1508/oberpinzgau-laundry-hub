import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { WaeschekraefteStats } from "@/components/waeschekraefte/WaeschekraefteStats";
import { WaeschekraefteFilter } from "@/components/waeschekraefte/WaeschekraefteFilter";
import { WaeschekraefteTable } from "@/components/waeschekraefte/WaeschekraefteTable";
import { WaeschekraftFormDialog } from "@/components/waeschekraefte/WaeschekraftFormDialog";
import {
  useWaeschekraefteList,
  useCreateWaeschekraft,
  useUpdateWaeschekraft,
  useToggleWaeschekraftAktiv,
  useTogglePortalzugang,
  useDeleteWaeschekraft,
} from "@/hooks/useWaeschekraefte";
import type { Waeschekraft } from "@/hooks/useWaeschekraefte";

export default function Waeschekraefte() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [portalFilter, setPortalFilter] = useState("all");
  const [typFilter, setTypFilter] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Waeschekraft | null>(null);

  const { data: waeschekraefte = [], isLoading } = useWaeschekraefteList();
  const createWorker = useCreateWaeschekraft();
  const updateWorker = useUpdateWaeschekraft();
  const toggleAktiv = useToggleWaeschekraftAktiv();
  const togglePortal = useTogglePortalzugang();
  const deleteWorker = useDeleteWaeschekraft();

  const filteredWaeschekraefte = useMemo(() => {
    return waeschekraefte.filter((worker) => {
      const matchesSearch =
        searchTerm === "" ||
        worker.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.personalnummer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        worker.email?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "aktiv" && worker.aktiv) ||
        (statusFilter === "inaktiv" && !worker.aktiv);

      const matchesPortal =
        portalFilter === "all" ||
        (portalFilter === "mit" && worker.portalzugang) ||
        (portalFilter === "ohne" && !worker.portalzugang);

      const matchesTyp =
        typFilter === "all" || worker.typ === typFilter;

      return matchesSearch && matchesStatus && matchesPortal && matchesTyp;
    });
  }, [waeschekraefte, searchTerm, statusFilter, portalFilter, typFilter]);

  const handleEdit = (worker: Waeschekraft) => {
    setSelectedWorker(worker);
    setIsFormOpen(true);
  };

  const handleToggleAktiv = (id: string, aktiv: boolean) => {
    toggleAktiv.mutate({ id, aktiv });
  };

  const handleTogglePortal = (id: string, portalzugang: boolean) => {
    togglePortal.mutate({ id, portalzugang });
  };

  const handleDelete = (id: string) => {
    deleteWorker.mutate(id);
  };

  const handleFormSubmit = (data: {
    personalnummer: string;
    name: string;
    typ: "waeschekraft" | "fahrer" | "beides";
    strasse?: string;
    plz?: string;
    ort?: string;
    telefon?: string;
    email?: string;
    notizen?: string;
    aktiv: boolean;
    portalzugang: boolean;
  }) => {
    const payload = {
      personalnummer: data.personalnummer,
      name: data.name,
      typ: data.typ,
      strasse: data.strasse || null,
      plz: data.plz || null,
      ort: data.ort || null,
      telefon: data.telefon || null,
      email: data.email || null,
      notizen: data.notizen || null,
      aktiv: data.aktiv,
      portalzugang: data.portalzugang,
    };

    if (selectedWorker) {
      updateWorker.mutate({ id: selectedWorker.id, ...payload });
    } else {
      createWorker.mutate(payload);
    }
  };

  const handleNewWorker = () => {
    setSelectedWorker(null);
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
                <h1 className="text-xl font-semibold text-foreground">Personal</h1>
                <p className="text-sm text-muted-foreground">
                  Wäschekräfte und Fahrer verwalten
                </p>
              </div>
            </div>
            <Button onClick={handleNewWorker}>
              <Plus className="mr-2 h-4 w-4" />
              Neues Personal
            </Button>
          </header>

          <div className="space-y-6 p-6">
            <WaeschekraefteStats waeschekraefte={waeschekraefte} />

            <WaeschekraefteFilter
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              portalFilter={portalFilter}
              onPortalChange={setPortalFilter}
              typFilter={typFilter}
              onTypChange={setTypFilter}
            />

            {isLoading ? (
              <div className="py-8 text-center text-muted-foreground">Laden...</div>
            ) : (
              <WaeschekraefteTable
                waeschekraefte={filteredWaeschekraefte}
                onEdit={handleEdit}
                onToggleAktiv={handleToggleAktiv}
                onTogglePortal={handleTogglePortal}
                onDelete={handleDelete}
              />
            )}
          </div>
        </main>
      </div>

      <WaeschekraftFormDialog
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        worker={selectedWorker}
        onSubmit={handleFormSubmit}
      />
    </SidebarProvider>
  );
}
