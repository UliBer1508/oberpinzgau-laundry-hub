import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, Minus, Trash2, Package, User, Calendar, Lock, ChevronsUpDown, Check, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { formatPreis } from "@/lib/formatPreis";
import { useToast } from "@/hooks/use-toast";
import type { Waescheset, WaeschesetInsert, Berechnungsart } from "@/hooks/useWaeschesets";
import {
  useKundenForWaeschesets,
  useObjekteByKunde,
  useWaeschesetArtikel,
  useWaescheartikelForSelect,
  useWaeschesetsByObjekt,
  useAddArtikelToSet,
  useRemoveArtikelFromSet,
  useUpdateArtikelMenge,
  useUpdateArtikelBerechnungsart,
} from "@/hooks/useWaeschesets";

const FARB_STYLES: Record<string, string> = {
  "Weiß": "bg-white border border-gray-300",
  "Beige": "bg-amber-100",
  "Grau": "bg-gray-400",
  "Blau": "bg-blue-500",
  "Grün": "bg-green-500",
  "Anthrazit": "bg-gray-700",
};

const formSchema = z.object({
  kunde_id: z.string().min(1, "Bitte wählen Sie einen Kunden"),
  objekt_id: z.string().min(1, "Bitte wählen Sie ein Objekt"),
  beschreibung: z.string().optional(),
  aktiv: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface PendingArtikel {
  id: string; // temp id for UI
  artikel_id: string;
  artikelNummer: string;
  artikelName: string;
  kategorie: string | null;
  farbe: string | null;
  bild_url: string | null;
  bezeichnung: string | null;
  preis: number | null;
  groesse: string | null;
  menge: number;
  berechnungsart: Berechnungsart;
}

interface WaeschesetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: Waescheset | null;
  objekte: { id: string; name: string; objektnummer: string }[];
  onSubmit: (data: WaeschesetInsert, pendingArtikel?: PendingArtikel[]) => Promise<void>;
  isLoading: boolean;
}

export function WaeschesetFormDialog({
  open,
  onOpenChange,
  set,
  onSubmit,
  isLoading,
}: WaeschesetFormDialogProps) {
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kunde_id: "",
      objekt_id: "",
      beschreibung: "",
      aktiv: true,
    },
  });

  // Local state for pending articles (new set only)
  const [pendingArtikel, setPendingArtikel] = useState<PendingArtikel[]>([]);
  const [selectedArtikel, setSelectedArtikel] = useState<string>("");
  const [menge, setMenge] = useState<number>(1);
  const [berechnungsart, setBerechnungsart] = useState<Berechnungsart>("pro_buchung");
  const [artikelPopoverOpen, setArtikelPopoverOpen] = useState(false);

  const selectedKundeId = form.watch("kunde_id");
  const selectedObjektId = form.watch("objekt_id");

  // Fetch data
  const { data: kunden = [] } = useKundenForWaeschesets();
  const { data: kundeObjekte = [] } = useObjekteByKunde(selectedKundeId || null);
  const { data: alleArtikel = [] } = useWaescheartikelForSelect();
  const { data: existingArtikel = [] } = useWaeschesetArtikel(set?.id ?? null);
  const { data: existingSetsForObjekt = [] } = useWaeschesetsByObjekt(selectedObjektId || null);

  // Mutations for existing sets
  const addArtikelMutation = useAddArtikelToSet();
  const removeArtikelMutation = useRemoveArtikelFromSet();
  const updateMengeMutation = useUpdateArtikelMenge();
  const updateBerechnungsartMutation = useUpdateArtikelBerechnungsart();

  // Get selected kunde and objekt names
  const selectedKunde = useMemo(() => 
    kunden.find(k => k.id === selectedKundeId),
    [kunden, selectedKundeId]
  );
  
  const selectedObjekt = useMemo(() => 
    kundeObjekte.find(o => o.id === selectedObjektId),
    [kundeObjekte, selectedObjektId]
  );

  // Auto-generated name with numbering for multiple sets
  const autoName = useMemo(() => {
    if (!selectedKunde || !selectedObjekt) return "";
    const kundeName = selectedKunde.firma || selectedKunde.name;
    const baseName = `${kundeName} - ${selectedObjekt.name}`;
    
    // Count existing sets (exclude current set if editing)
    const otherSets = set 
      ? existingSetsForObjekt.filter(s => s.id !== set.id)
      : existingSetsForObjekt;
    
    const count = otherSets.length + 1;
    
    if (count <= 1) return baseName;
    return `${baseName} ${count}`;
  }, [selectedKunde, selectedObjekt, existingSetsForObjekt, set]);

  // Available articles (filter out already added)
  const verfuegbareArtikel = useMemo(() => {
    const usedIds = set 
      ? existingArtikel.map(a => a.artikel_id)
      : pendingArtikel.map(a => a.artikel_id);
    return alleArtikel.filter(a => !usedIds.includes(a.id));
  }, [alleArtikel, set, existingArtikel, pendingArtikel]);

  // Selected artikel details for display
  const selectedArtikelDetails = useMemo(() => 
    alleArtikel.find(a => a.id === selectedArtikel),
    [alleArtikel, selectedArtikel]
  );

  // Reset objekt when kunde changes
  useEffect(() => {
    if (selectedKundeId && !set) {
      form.setValue("objekt_id", "");
    }
  }, [selectedKundeId, form, set]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (open) {
      if (set) {
        form.reset({
          kunde_id: set.kundeId || "",
          objekt_id: set.objekt_id,
          beschreibung: set.beschreibung || "",
          aktiv: set.aktiv ?? true,
        });
      } else {
        form.reset({
          kunde_id: "",
          objekt_id: "",
          beschreibung: "",
          aktiv: true,
        });
        setPendingArtikel([]);
      }
      setSelectedArtikel("");
      setMenge(1);
      setBerechnungsart("pro_buchung");
      setArtikelPopoverOpen(false);
    }
  }, [open, set, form]);

  // Handle adding article
  const handleAddArtikel = async () => {
    if (!selectedArtikel) return;

    const artikel = alleArtikel.find(a => a.id === selectedArtikel);
    if (!artikel) return;

    if (set) {
      // Existing set - add to database
      try {
        await addArtikelMutation.mutateAsync({
          set_id: set.id,
          artikel_id: selectedArtikel,
          menge,
          berechnungsart,
        });
        toast({ title: "Artikel hinzugefügt" });
      } catch {
        toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        return;
      }
    } else {
      // New set - add to pending list
      const newArtikel: PendingArtikel = {
        id: `temp-${Date.now()}`,
        artikel_id: selectedArtikel,
        artikelNummer: artikel.artikelnummer,
        artikelName: artikel.name,
        kategorie: artikel.kategorie,
        farbe: artikel.farbe,
        bild_url: artikel.bild_url,
        bezeichnung: artikel.bezeichnung,
        preis: artikel.preis ?? null,
        groesse: artikel.groesse ?? null,
        menge,
        berechnungsart,
      };
      setPendingArtikel(prev => [...prev, newArtikel]);
    }

    setSelectedArtikel("");
    setMenge(1);
    setBerechnungsart("pro_buchung");
  };

  // Handle removing article
  const handleRemoveArtikel = async (artikelId: string, tempId?: string) => {
    if (set) {
      try {
        await removeArtikelMutation.mutateAsync({ id: artikelId, set_id: set.id });
        toast({ title: "Artikel entfernt" });
      } catch {
        toast({ title: "Fehler beim Entfernen", variant: "destructive" });
      }
    } else {
      setPendingArtikel(prev => prev.filter(a => a.id !== tempId));
    }
  };

  // Handle menge update
  const handleUpdateMenge = async (artikelId: string, tempId: string, newMenge: number) => {
    if (newMenge < 1) return;

    if (set) {
      try {
        await updateMengeMutation.mutateAsync({ id: artikelId, menge: newMenge, set_id: set.id });
      } catch {
        toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
      }
    } else {
      setPendingArtikel(prev => prev.map(a => 
        a.id === tempId ? { ...a, menge: newMenge } : a
      ));
    }
  };

  // Handle berechnungsart toggle
  const handleToggleBerechnungsart = async (artikelId: string, tempId: string, current: Berechnungsart) => {
    const newBerechnungsart: Berechnungsart = current === "pro_buchung" ? "pro_gast" : "pro_buchung";

    if (set) {
      try {
        await updateBerechnungsartMutation.mutateAsync({
          id: artikelId,
          berechnungsart: newBerechnungsart,
          set_id: set.id,
        });
      } catch {
        toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
      }
    } else {
      setPendingArtikel(prev => prev.map(a => 
        a.id === tempId ? { ...a, berechnungsart: newBerechnungsart } : a
      ));
    }
  };

  const getFarbStyle = (farbe: string | null) => {
    if (!farbe) return "bg-gray-200";
    return FARB_STYLES[farbe] || "bg-gray-200";
  };

  const handleSubmit = async (values: FormValues) => {
    const data: WaeschesetInsert = {
      objekt_id: values.objekt_id,
      name: autoName,
      beschreibung: values.beschreibung || null,
      aktiv: values.aktiv,
    };
    await onSubmit(data, set ? undefined : pendingArtikel);
  };

  // Determine which articles to display
  const displayArtikel = set ? existingArtikel : pendingArtikel;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {set ? "Kunden-Wäscheset bearbeiten" : "Neues Kunden-Wäscheset erstellen"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Kunde & Objekt Selection */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="kunde_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kunde *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!set}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kunde auswählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kunden.map((kunde) => (
                          <SelectItem key={kunde.id} value={kunde.id}>
                            {kunde.firma || kunde.name} ({kunde.kundennummer})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="objekt_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objekt *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!set || !selectedKundeId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={
                            !selectedKundeId 
                              ? "Bitte zuerst Kunde wählen" 
                              : kundeObjekte.length === 0 
                                ? "Keine Objekte vorhanden" 
                                : "Objekt auswählen"
                          } />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {kundeObjekte.map((objekt) => (
                          <SelectItem key={objekt.id} value={objekt.id}>
                            {objekt.name} ({objekt.objektnummer})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto-generated name & description */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormLabel className="flex items-center gap-2">
                  Name (automatisch)
                  <Lock className="h-3 w-3 text-muted-foreground" />
                </FormLabel>
                <div className="flex items-center rounded-md border bg-muted/50 px-3 py-2 text-sm h-10">
                  {autoName || (
                    <span className="text-muted-foreground">
                      Wird automatisch erstellt...
                    </span>
                  )}
                </div>
              </div>

              <FormField
                control={form.control}
                name="aktiv"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 h-[66px]">
                    <FormLabel className="cursor-pointer">Aktiv</FormLabel>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="beschreibung"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibung des Sets..."
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            {/* Articles Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Artikel im Set</h3>
                <Badge variant="secondary" className="ml-auto">
                  {displayArtikel.length} Artikel
                </Badge>
              </div>

              {/* Article list */}
              {displayArtikel.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Noch keine Artikel. Fügen Sie unten Artikel hinzu.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border max-h-[250px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Bild</TableHead>
                        <TableHead className="w-[100px]">Art.-Nr.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="hidden lg:table-cell w-[100px]">Größe</TableHead>
                        <TableHead className="hidden sm:table-cell">Kategorie</TableHead>
                        <TableHead className="hidden md:table-cell">Farbe</TableHead>
                        <TableHead className="text-center w-[130px]">Menge</TableHead>
                        <TableHead className="text-right w-[90px]">E-Preis</TableHead>
                        <TableHead className="text-right w-[90px]">Summe</TableHead>
                        <TableHead className="text-center w-[140px]">Berechnung</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayArtikel.map((artikel) => {
                        const isExisting = set !== null;
                        const artikelId = isExisting ? (artikel as any).id : "";
                        const tempId = !isExisting ? (artikel as PendingArtikel).id : "";
                        const artikelNummer = isExisting ? (artikel as any).artikelNummer : (artikel as PendingArtikel).artikelNummer;
                        const artikelName = isExisting ? (artikel as any).artikelName : (artikel as PendingArtikel).artikelName;
                        const kategorie = isExisting ? (artikel as any).kategorie : (artikel as PendingArtikel).kategorie;
                        const farbe = isExisting ? (artikel as any).farbe : (artikel as PendingArtikel).farbe;
                        const bildUrl = isExisting ? (artikel as any).bild_url : (artikel as PendingArtikel).bild_url;
                        const groesse = isExisting ? (artikel as any).groesse : (artikel as PendingArtikel).groesse;
                        const artikelMenge = isExisting ? (artikel as any).menge : (artikel as PendingArtikel).menge;
                        const artikelPreis = isExisting ? (artikel as any).preis : (artikel as PendingArtikel).preis;
                        const artikelBerechnungsart = isExisting ? (artikel as any).berechnungsart : (artikel as PendingArtikel).berechnungsart;
                        const artikelSumme = artikelPreis !== null ? artikelMenge * artikelPreis : null;

                        return (
                          <TableRow key={isExisting ? artikelId : tempId}>
                            <TableCell>
                              {bildUrl ? (
                                <img 
                                  src={bildUrl} 
                                  alt={artikelName}
                                  className="h-10 w-10 rounded object-cover"
                                />
                              ) : (
                                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted">
                                  <ImageIcon className="h-5 w-5 text-muted-foreground" />
                                </div>
                              )}
                            </TableCell>
                            <TableCell className="font-mono text-xs">
                              {artikelNummer}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {artikelName}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell text-xs text-muted-foreground">
                              {groesse || "-"}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">
                              {kategorie ? (
                                <Badge variant="outline" className="text-xs">{kategorie}</Badge>
                              ) : "-"}
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {farbe ? (
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-3 w-3 rounded-full ${getFarbStyle(farbe)}`} />
                                  <span className="text-xs">{farbe}</span>
                                </div>
                              ) : "-"}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleUpdateMenge(artikelId, tempId, artikelMenge - 1)}
                                  disabled={artikelMenge <= 1}
                                >
                                  <Minus className="h-3 w-3" />
                                </Button>
                                <Input
                                  type="number"
                                  min={1}
                                  value={artikelMenge}
                                  onChange={(e) => handleUpdateMenge(artikelId, tempId, parseInt(e.target.value) || 1)}
                                  className="h-6 w-12 text-center text-xs"
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleUpdateMenge(artikelId, tempId, artikelMenge + 1)}
                                >
                                  <Plus className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-xs text-muted-foreground">
                              {formatPreis(artikelPreis)}
                            </TableCell>
                            <TableCell className="text-right text-xs font-medium">
                              {formatPreis(artikelSumme)}
                            </TableCell>
                            <TableCell className="text-center">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      type="button"
                                      variant={artikelBerechnungsart === "pro_gast" ? "default" : "outline"}
                                      size="sm"
                                      className="gap-1 h-7 text-xs"
                                      onClick={() => handleToggleBerechnungsart(artikelId, tempId, artikelBerechnungsart)}
                                    >
                                      {artikelBerechnungsart === "pro_gast" ? (
                                        <>
                                          <User className="h-3 w-3" />
                                          <span className="hidden sm:inline">Pro Gast</span>
                                        </>
                                      ) : (
                                        <>
                                          <Calendar className="h-3 w-3" />
                                          <span className="hidden sm:inline">Pro Buchung</span>
                                        </>
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>
                                      {artikelBerechnungsart === "pro_gast"
                                        ? "Menge × Gästeanzahl"
                                        : "Feste Menge pro Buchung"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            </TableCell>
                            <TableCell>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:bg-destructive/10"
                                onClick={() => handleRemoveArtikel(artikelId, tempId)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                    <TableFooter>
                      <TableRow>
                        <TableCell colSpan={8} className="text-right font-medium">
                          Gesamtpreis:
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatPreis(
                            displayArtikel.reduce((sum, artikel) => {
                              const isExisting = set !== null;
                              const artikelPreis = isExisting ? (artikel as any).preis : (artikel as PendingArtikel).preis;
                              const artikelMenge = isExisting ? (artikel as any).menge : (artikel as PendingArtikel).menge;
                              if (artikelPreis !== null) {
                                return sum + artikelMenge * artikelPreis;
                              }
                              return sum;
                            }, 0) || null
                          )}
                        </TableCell>
                        <TableCell colSpan={2}></TableCell>
                      </TableRow>
                    </TableFooter>
                  </Table>
                </div>
              )}

              {/* Add article section */}
              <div className="rounded-lg border bg-muted/50 p-3">
                <div className="flex flex-wrap items-end gap-2">
                  <div className="flex-1 min-w-[250px]">
                    <Label className="text-xs text-muted-foreground mb-1 block">Artikel</Label>
                    <Popover open={artikelPopoverOpen} onOpenChange={setArtikelPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={artikelPopoverOpen}
                          className="w-full justify-between bg-background h-auto min-h-9 py-1.5"
                        >
                          {selectedArtikelDetails ? (
                            <div className="flex items-center gap-2 overflow-hidden">
                              {selectedArtikelDetails.bild_url ? (
                                <img 
                                  src={selectedArtikelDetails.bild_url} 
                                  alt={selectedArtikelDetails.name}
                                  className="h-7 w-7 rounded object-cover flex-shrink-0"
                                />
                              ) : (
                                <div className="flex h-7 w-7 items-center justify-center rounded bg-muted flex-shrink-0">
                                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                              <div className="flex flex-col items-start overflow-hidden">
                                <span className="truncate text-sm font-medium">
                                  {selectedArtikelDetails.artikelnummer} - {selectedArtikelDetails.name}
                                </span>
                                {selectedArtikelDetails.bezeichnung && (
                                  <span className="truncate text-xs text-muted-foreground">
                                    {selectedArtikelDetails.bezeichnung}
                                  </span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">Artikel auswählen...</span>
                          )}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[400px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Artikel suchen..." />
                          <CommandList className="max-h-[300px]">
                            <CommandEmpty>Keine Artikel gefunden.</CommandEmpty>
                            <CommandGroup>
                              {verfuegbareArtikel.map((artikel) => (
                                <CommandItem
                                  key={artikel.id}
                                  value={`${artikel.artikelnummer} ${artikel.name} ${artikel.kategorie || ''} ${artikel.farbe || ''}`}
                                  onSelect={() => {
                                    setSelectedArtikel(artikel.id);
                                    setArtikelPopoverOpen(false);
                                  }}
                                  className="flex items-start gap-3 p-2"
                                >
                                  {artikel.bild_url ? (
                                    <img 
                                      src={artikel.bild_url} 
                                      alt={artikel.name}
                                      className="h-12 w-12 rounded object-cover flex-shrink-0"
                                    />
                                  ) : (
                                    <div className="flex h-12 w-12 items-center justify-center rounded bg-muted flex-shrink-0">
                                      <ImageIcon className="h-6 w-6 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="flex flex-col flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-mono text-xs text-muted-foreground">
                                        {artikel.artikelnummer}
                                      </span>
                                      {artikel.kategorie && (
                                        <Badge variant="secondary" className="text-xs px-1.5 py-0">
                                          {artikel.kategorie}
                                        </Badge>
                                      )}
                                    </div>
                                    <span className="font-medium truncate">
                                      {artikel.name}
                                    </span>
                                    {artikel.bezeichnung && (
                                      <span className="text-xs text-muted-foreground truncate">
                                        {artikel.bezeichnung}
                                      </span>
                                    )}
                                    {artikel.farbe && (
                                      <div className="flex items-center gap-1 mt-0.5">
                                        <span className={`h-2.5 w-2.5 rounded-full ${getFarbStyle(artikel.farbe)}`} />
                                        <span className="text-xs text-muted-foreground">{artikel.farbe}</span>
                                      </div>
                                    )}
                                  </div>
                                  <Check
                                    className={cn(
                                      "h-4 w-4 shrink-0",
                                      selectedArtikel === artikel.id ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="w-16">
                    <Label className="text-xs text-muted-foreground mb-1 block">Menge</Label>
                    <Input
                      type="number"
                      min={1}
                      value={menge}
                      onChange={(e) => setMenge(parseInt(e.target.value) || 1)}
                      className="bg-background h-9"
                    />
                  </div>

                  <RadioGroup
                    value={berechnungsart}
                    onValueChange={(value) => setBerechnungsart(value as Berechnungsart)}
                    className="flex items-center gap-3 rounded-md border bg-background px-2 py-1.5 h-9"
                  >
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="pro_buchung" id="add_pro_buchung" className="h-3.5 w-3.5" />
                      <Label htmlFor="add_pro_buchung" className="flex items-center gap-1 cursor-pointer text-xs">
                        <Calendar className="h-3 w-3" />
                        Buchung
                      </Label>
                    </div>
                    <div className="flex items-center gap-1">
                      <RadioGroupItem value="pro_gast" id="add_pro_gast" className="h-3.5 w-3.5" />
                      <Label htmlFor="add_pro_gast" className="flex items-center gap-1 cursor-pointer text-xs">
                        <User className="h-3 w-3" />
                        Gast
                      </Label>
                    </div>
                  </RadioGroup>

                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddArtikel}
                    disabled={!selectedArtikel || addArtikelMutation.isPending}
                    className="h-9"
                  >
                    <Plus className="mr-1 h-3.5 w-3.5" />
                    Hinzufügen
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !autoName}
              >
                {isLoading ? "Speichern..." : "Speichern"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
