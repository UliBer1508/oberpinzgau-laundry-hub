import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Waescheset, WaeschesetInsert, Berechnungsart } from "@/hooks/useWaeschesets";
import { 
  useKundenForWaeschesets, 
  useObjekteByKunde, 
  useWaescheartikelForSelect,
  useWaeschesetArtikel,
  useExistingWaeschesetNames,
} from "@/hooks/useWaeschesets";

const formSchema = z.object({
  kunde_id: z.string().min(1, "Bitte wählen Sie einen Kunden"),
  objekt_id: z.string().min(1, "Bitte wählen Sie ein Objekt"),
  beschreibung: z.string().optional(),
  aktiv: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

// Temporary article type for the form
export type TempArtikel = {
  artikel_id: string;
  artikelName: string;
  artikelNummer: string;
  menge: number;
  berechnungsart: Berechnungsart;
};

interface WaeschesetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: Waescheset | null;
  objekte: { id: string; name: string; objektnummer: string }[];
  onSubmit: (data: WaeschesetInsert, artikel: TempArtikel[]) => void;
  isLoading: boolean;
}

export function WaeschesetFormDialog({
  open,
  onOpenChange,
  set,
  onSubmit,
  isLoading,
}: WaeschesetFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kunde_id: "",
      objekt_id: "",
      beschreibung: "",
      aktiv: true,
    },
  });

  // Temporary articles state for new sets
  const [tempArtikel, setTempArtikel] = useState<TempArtikel[]>([]);
  
  // New article form state
  const [newArtikelId, setNewArtikelId] = useState("");
  const [newMenge, setNewMenge] = useState(1);
  const [newBerechnungsart, setNewBerechnungsart] = useState<Berechnungsart>("pro_buchung");

  const selectedKundeId = form.watch("kunde_id");
  const selectedObjektId = form.watch("objekt_id");

  // Fetch data
  const { data: kunden = [] } = useKundenForWaeschesets();
  const { data: kundeObjekte = [] } = useObjekteByKunde(selectedKundeId || null);
  const { data: alleArtikel = [] } = useWaescheartikelForSelect();
  const { data: existingArtikel = [] } = useWaeschesetArtikel(set?.id || null);
  const { data: existingNames = [] } = useExistingWaeschesetNames(selectedObjektId || null);

  // Get selected kunde and objekt names for auto-generated name
  const selectedKunde = useMemo(() => 
    kunden.find(k => k.id === selectedKundeId),
    [kunden, selectedKundeId]
  );
  
  const selectedObjekt = useMemo(() => 
    kundeObjekte.find(o => o.id === selectedObjektId),
    [kundeObjekte, selectedObjektId]
  );

  // Auto-generated name with automatic numbering for multiple sets
  const autoName = useMemo(() => {
    if (!selectedKunde || !selectedObjekt) return "";
    const kundeName = selectedKunde.firma || selectedKunde.name;
    const baseName = `${kundeName} - ${selectedObjekt.name}`;
    
    // If editing an existing set for the same object, keep the original name
    if (set?.objekt_id === selectedObjektId) {
      return set.name;
    }
    
    // Check if baseName already exists
    if (!existingNames.includes(baseName)) {
      return baseName;
    }
    
    // Find next available number: "Kunde - Objekt 2", "Kunde - Objekt 3", etc.
    let counter = 2;
    while (existingNames.includes(`${baseName} ${counter}`)) {
      counter++;
    }
    return `${baseName} ${counter}`;
  }, [selectedKunde, selectedObjekt, existingNames, set, selectedObjektId]);

  // Filter out already added articles
  const availableArtikel = useMemo(() => {
    const addedIds = new Set(tempArtikel.map(a => a.artikel_id));
    return alleArtikel.filter(a => !addedIds.has(a.id));
  }, [alleArtikel, tempArtikel]);

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
        // Editing existing set
        form.reset({
          kunde_id: set.kundeId || "",
          objekt_id: set.objekt_id,
          beschreibung: set.beschreibung || "",
          aktiv: set.aktiv ?? true,
        });
        // Load existing articles into temp state
        setTempArtikel(existingArtikel.map(a => ({
          artikel_id: a.artikel_id,
          artikelName: a.artikelName,
          artikelNummer: a.artikelNummer,
          menge: a.menge,
          berechnungsart: a.berechnungsart,
        })));
      } else {
        form.reset({
          kunde_id: "",
          objekt_id: "",
          beschreibung: "",
          aktiv: true,
        });
        setTempArtikel([]);
      }
      // Reset new article form
      setNewArtikelId("");
      setNewMenge(1);
      setNewBerechnungsart("pro_buchung");
    }
  }, [open, set, form, existingArtikel]);

  // Add article to temp list
  const handleAddArtikel = () => {
    if (!newArtikelId) return;
    
    const artikel = alleArtikel.find(a => a.id === newArtikelId);
    if (!artikel) return;

    setTempArtikel(prev => [...prev, {
      artikel_id: artikel.id,
      artikelName: artikel.name,
      artikelNummer: artikel.artikelnummer,
      menge: newMenge,
      berechnungsart: newBerechnungsart,
    }]);

    // Reset form
    setNewArtikelId("");
    setNewMenge(1);
    setNewBerechnungsart("pro_buchung");
  };

  // Remove article from temp list
  const handleRemoveArtikel = (artikelId: string) => {
    setTempArtikel(prev => prev.filter(a => a.artikel_id !== artikelId));
  };

  // Update article quantity
  const handleUpdateMenge = (artikelId: string, menge: number) => {
    setTempArtikel(prev => prev.map(a => 
      a.artikel_id === artikelId ? { ...a, menge } : a
    ));
  };

  // Update article berechnungsart
  const handleUpdateBerechnungsart = (artikelId: string, berechnungsart: Berechnungsart) => {
    setTempArtikel(prev => prev.map(a => 
      a.artikel_id === artikelId ? { ...a, berechnungsart } : a
    ));
  };

  const handleSubmit = (values: FormValues) => {
    const data: WaeschesetInsert = {
      objekt_id: values.objekt_id,
      name: autoName,
      beschreibung: values.beschreibung || null,
      aktiv: values.aktiv,
    };
    onSubmit(data, tempArtikel);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {set ? "Wäscheset bearbeiten" : "Neues Wäscheset erstellen"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Kunde Select - direkter Ansatz ohne FormField */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Kunde *
              </label>
              <Select
                value={selectedKundeId}
                onValueChange={(value) => form.setValue("kunde_id", value)}
                disabled={!!set}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {kunden.map((kunde) => (
                    <SelectItem key={kunde.id} value={kunde.id}>
                      {kunde.firma || kunde.name} ({kunde.kundennummer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.kunde_id && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.kunde_id.message}
                </p>
              )}
            </div>

            {/* Objekt Select - direkter Ansatz ohne FormField */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Objekt *
              </label>
              <Select
                value={selectedObjektId}
                onValueChange={(value) => form.setValue("objekt_id", value)}
                disabled={!!set || !selectedKundeId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={
                    !selectedKundeId 
                      ? "Bitte zuerst Kunde wählen" 
                      : kundeObjekte.length === 0 
                        ? "Keine Objekte vorhanden" 
                        : "Objekt auswählen"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {kundeObjekte.map((objekt) => (
                    <SelectItem key={objekt.id} value={objekt.id}>
                      {objekt.name} ({objekt.objektnummer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.objekt_id && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.objekt_id.message}
                </p>
              )}
            </div>

            {/* Auto-generated name (read-only) */}
            <div className="space-y-2">
              <FormLabel className="flex items-center gap-2">
                Name (automatisch generiert)
                <Lock className="h-3 w-3 text-muted-foreground" />
              </FormLabel>
              <div className="flex items-center rounded-md border bg-muted/50 px-3 py-2 text-sm">
                {autoName || (
                  <span className="text-muted-foreground">
                    Wird automatisch erstellt...
                  </span>
                )}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Articles Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <FormLabel className="text-base font-semibold">Artikel im Set</FormLabel>
                <Badge variant="secondary">{tempArtikel.length} Artikel</Badge>
              </div>

              {/* Article List */}
              {tempArtikel.length > 0 && (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Art.-Nr.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead className="w-[80px]">Menge</TableHead>
                        <TableHead>Berechnung</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {tempArtikel.map((artikel) => (
                        <TableRow key={artikel.artikel_id}>
                          <TableCell className="font-mono text-xs">
                            {artikel.artikelNummer}
                          </TableCell>
                          <TableCell>{artikel.artikelName}</TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              value={artikel.menge}
                              onChange={(e) => handleUpdateMenge(artikel.artikel_id, parseInt(e.target.value) || 1)}
                              className="h-8 w-16"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={artikel.berechnungsart}
                              onValueChange={(value: Berechnungsart) => 
                                handleUpdateBerechnungsart(artikel.artikel_id, value)
                              }
                            >
                              <SelectTrigger className="h-8 w-[130px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pro_buchung">Pro Buchung</SelectItem>
                                <SelectItem value="pro_gast">Pro Gast</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleRemoveArtikel(artikel.artikel_id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {tempArtikel.length === 0 && (
                <div className="rounded-md border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Noch keine Artikel hinzugefügt
                </div>
              )}

              {/* Add Article Form */}
              <div className="flex flex-wrap items-end gap-2 rounded-md border bg-muted/30 p-3">
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-muted-foreground">Artikel</label>
                  <Select
                    value={newArtikelId}
                    onValueChange={setNewArtikelId}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Artikel wählen..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableArtikel.map((artikel) => (
                        <SelectItem key={artikel.id} value={artikel.id}>
                          {artikel.artikelnummer} - {artikel.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-[70px]">
                  <label className="text-xs text-muted-foreground">Menge</label>
                  <Input
                    type="number"
                    min={1}
                    value={newMenge}
                    onChange={(e) => setNewMenge(parseInt(e.target.value) || 1)}
                    className="h-9"
                  />
                </div>
                <div className="w-[140px]">
                  <label className="text-xs text-muted-foreground">Berechnung</label>
                  <Select
                    value={newBerechnungsart}
                    onValueChange={(value: Berechnungsart) => setNewBerechnungsart(value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pro_buchung">Pro Buchung</SelectItem>
                      <SelectItem value="pro_gast">Pro Gast</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-9"
                  onClick={handleAddArtikel}
                  disabled={!newArtikelId}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Hinzufügen
                </Button>
              </div>
            </div>

            <Separator className="my-4" />

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

            <FormField
              control={form.control}
              name="aktiv"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3">
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
                {isLoading ? "Speichern..." : set ? "Speichern" : "Wäscheset erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
