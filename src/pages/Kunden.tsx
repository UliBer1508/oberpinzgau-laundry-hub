import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { KundenStats } from "@/components/kunden/KundenStats";
import { KundenFilter } from "@/components/kunden/KundenFilter";
import { KundenTable, type Kunde } from "@/components/kunden/KundenTable";
import { KundeFormDialog } from "@/components/kunden/KundeFormDialog";
import { toast } from "@/hooks/use-toast";

// Dummy-Daten für die Design-Vorschau
const dummyKunden: Kunde[] = [
  {
    id: "1",
    kundennummer: "K001",
    name: "Maria Huber",
    firma: "Alpenhotel Huber",
    strasse: "Bergstraße 12",
    plz: "5741",
    ort: "Neukirchen am Großvenediger",
    email: "info@alpenhotel-huber.at",
    telefon: "+43 6565 1234",
    bestellart: "beides",
    aktiv: true,
    objekteCount: 3,
  },
  {
    id: "2",
    kundennummer: "K002",
    name: "Thomas Gruber",
    firma: "Pension Edelweiß",
    strasse: "Hauptplatz 5",
    plz: "5730",
    ort: "Mittersill",
    email: "pension@edelweiss.at",
    telefon: "+43 6562 5678",
    bestellart: "lieferung",
    aktiv: true,
    objekteCount: 1,
  },
  {
    id: "3",
    kundennummer: "K003",
    name: "Anna Berger",
    firma: null,
    strasse: "Dorfweg 8",
    plz: "5742",
    ort: "Wald im Pinzgau",
    email: "anna.berger@gmail.com",
    telefon: "+43 664 9876543",
    bestellart: "abholung",
    aktiv: true,
    objekteCount: 2,
  },
  {
    id: "4",
    kundennummer: "K004",
    name: "Franz Maier",
    firma: "Hotel Sonnblick",
    strasse: "Sonnenweg 1",
    plz: "5743",
    ort: "Krimml",
    email: "rezeption@hotel-sonnblick.at",
    telefon: "+43 6564 2222",
    bestellart: "beides",
    aktiv: false,
    objekteCount: 4,
  },
  {
    id: "5",
    kundennummer: "K005",
    name: "Elisabeth Moser",
    firma: "Ferienwohnungen Pinzgau",
    strasse: "Almweg 22",
    plz: "5741",
    ort: "Neukirchen am Großvenediger",
    email: "info@fewo-pinzgau.at",
    telefon: "+43 6565 3333",
    bestellart: "lieferung",
    aktiv: true,
    objekteCount: 6,
  },
  {
    id: "6",
    kundennummer: "K006",
    name: "Karl Wimmer",
    firma: "Aparthotel Tauernblick",
    strasse: "Tauernstraße 45",
    plz: "5730",
    ort: "Mittersill",
    email: "office@tauernblick.at",
    telefon: "+43 6562 4444",
    bestellart: "beides",
    aktiv: true,
    objekteCount: 8,
  },
];

const Kunden = () => {
  const [kunden, setKunden] = useState<Kunde[]>(dummyKunden);
  const [searchTerm, setSearchTerm] = useState("");
  const [bestellartFilter, setBestellartFilter] = useState("alle");
  const [nurAktive, setNurAktive] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedKunde, setSelectedKunde] = useState<Kunde | null>(null);

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
      // Suchfilter
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        kunde.name.toLowerCase().includes(searchLower) ||
        kunde.kundennummer.toLowerCase().includes(searchLower) ||
        kunde.firma?.toLowerCase().includes(searchLower);

      // Bestellart-Filter
      const matchesBestellart =
        bestellartFilter === "alle" || kunde.bestellart === bestellartFilter;

      // Aktiv-Filter
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
    toast({
      title: "Objekte anzeigen",
      description: `Objektliste für ${kunde.name} wird geladen...`,
    });
  };

  const handleToggleAktiv = (kunde: Kunde) => {
    setKunden((prev) =>
      prev.map((k) =>
        k.id === kunde.id ? { ...k, aktiv: !k.aktiv } : k
      )
    );
    toast({
      title: kunde.aktiv ? "Kunde deaktiviert" : "Kunde aktiviert",
      description: `${kunde.name} wurde ${kunde.aktiv ? "deaktiviert" : "aktiviert"}.`,
    });
  };

  const handleSaveKunde = (data: any) => {
    if (selectedKunde) {
      // Bearbeiten
      setKunden((prev) =>
        prev.map((k) =>
          k.id === selectedKunde.id
            ? { ...k, ...data, objekteCount: k.objekteCount }
            : k
        )
      );
      toast({
        title: "Kunde aktualisiert",
        description: `${data.name} wurde erfolgreich aktualisiert.`,
      });
    } else {
      // Neu anlegen
      const newKunde: Kunde = {
        id: Date.now().toString(),
        ...data,
        objekteCount: 0,
      };
      setKunden((prev) => [newKunde, ...prev]);
      toast({
        title: "Kunde angelegt",
        description: `${data.name} wurde erfolgreich angelegt.`,
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="lg:hidden" />
              <div>
                <h1 className="text-xl font-semibold text-foreground">Kunden</h1>
                <p className="text-sm text-muted-foreground">
                  Verwalten Sie Ihre Kunden und deren Objekte
                </p>
              </div>
            </div>
            <Button onClick={handleNewKunde}>
              <Plus className="mr-2 h-4 w-4" />
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
                <KundenTable
                  kunden={filteredKunden}
                  onEdit={handleEditKunde}
                  onShowObjekte={handleShowObjekte}
                  onToggleAktiv={handleToggleAktiv}
                />
                <div className="text-sm text-muted-foreground">
                  {filteredKunden.length} von {kunden.length} Kunden angezeigt
                </div>
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
