import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { useToast } from "@/hooks/use-toast";
import {
  useRechnungseinstellungen,
  useUpdateRechnungseinstellungen,
} from "@/hooks/useRechnungseinstellungen";
import { RechnungseinstellungenCard } from "@/components/rechnungen/RechnungseinstellungenCard";
import { RechnungseinstellungenDialog } from "@/components/rechnungen/RechnungseinstellungenDialog";

export default function Rechnungseinstellungen() {
  const { toast } = useToast();
  const { data: einstellungen, isLoading } = useRechnungseinstellungen();
  const updateEinstellungen = useUpdateRechnungseinstellungen();
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleSave = (data: {
    mwst_satz: number;
    bearbeitungsgebuehr: number;
    firma_name: string | null;
    firma_bezeichnung: string | null;
    firma_strasse: string | null;
    firma_plz: string | null;
    firma_ort: string | null;
    firma_telefon: string | null;
    firma_email: string | null;
    zahlungsfrist_tage: number;
    mahnung_betreff: string | null;
    mahnung_text: string | null;
  }) => {
    if (!einstellungen?.id) return;
    updateEinstellungen.mutate(
      { id: einstellungen.id, ...data },
      {
        onSuccess: () => {
          toast({
            title: "Einstellungen gespeichert",
            description: "Die Rechnungseinstellungen wurden aktualisiert.",
          });
          setDialogOpen(false);
        },
        onError: () => {
          toast({
            title: "Fehler",
            description: "Einstellungen konnten nicht gespeichert werden.",
            variant: "destructive",
          });
        },
      }
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div>
              <h1 className="text-xl font-semibold text-sidebar-foreground">Rechnungseinstellungen</h1>
              <p className="text-sm text-sidebar-foreground/80">Standardwerte für neue Rechnungen</p>
            </div>
            <div />
          </header>

          <div className="p-4 md:p-6 space-y-6">
            <RechnungseinstellungenCard
              einstellungen={einstellungen}
              isLoading={isLoading}
              onEdit={() => setDialogOpen(true)}
            />
          </div>
        </main>
      </div>

      <RechnungseinstellungenDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        einstellungen={einstellungen ?? null}
        onSave={handleSave}
        isPending={updateEinstellungen.isPending}
      />
    </SidebarProvider>
  );
}
