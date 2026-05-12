import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Package, Plus, Minus, Trash2, User, Calendar, Check, Upload, X, Image as ImageIcon, Search } from "lucide-react";
import { useUploadArtikelBild } from "@/hooks/useWaescheartikel";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useWaescheartikelForSelect, type Berechnungsart } from "@/hooks/useWaeschesets";
import {
  useVorlageArtikel,
  useAddVorlageArtikel,
  useRemoveVorlageArtikel,
  useUpdateVorlageArtikel,
  type VorlageSet,
} from "@/hooks/useVorlagenSets";

const FARB_STYLES: Record<string, string> = {
  "Weiß": "bg-white border border-gray-300",
  "Weiß gestreift": "bg-white border border-gray-300",
  "Grau": "bg-gray-400",
  "Grau gestreift": "bg-gray-400",
  "Braun": "bg-amber-800",
  "Bunt": "bg-gradient-to-r from-pink-400 via-yellow-400 to-blue-400",
};

const KATEGORIEN = ["Apartment", "Chalet", "Hotelzimmer", "Wellness", "Sonstige"];
const KATEGORIEN_ARTIKEL = ["Bettwäsche", "Handtücher", "Wellness", "Badartikel", "Küchenartikel"];

const schema = z.object({
  name: z.string().min(1, "Name erforderlich").max(120),
  kategorie: z.string().optional(),
  beschreibung: z.string().optional(),
  bild_url: z.string().optional(),
  aktiv: z.boolean(),
});

type Values = z.infer<typeof schema>;

export interface PendingVorlageArtikel {
  id: string;
  artikel_id: string;
  artikelNummer: string;
  artikelName: string;
  kategorie: string | null;
  farbe: string | null;
  bild_url: string | null;
  preis: number | null;
  menge: number;
  berechnungsart: Berechnungsart;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vorlage: VorlageSet | null;
  onSubmit: (v: Values, pendingArtikel?: PendingVorlageArtikel[]) => Promise<void>;
  isLoading: boolean;
}

export function VorlageFormDialog({ open, onOpenChange, vorlage, onSubmit, isLoading }: Props) {
  const { toast } = useToast();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", kategorie: "", beschreibung: "", bild_url: "", aktiv: true },
  });

  const [pendingArtikel, setPendingArtikel] = useState<PendingVorlageArtikel[]>([]);
  const [artikelSuche, setArtikelSuche] = useState("");
  const [artikelKategorieFilter, setArtikelKategorieFilter] = useState<string>("alle");
  const [rowMengen, setRowMengen] = useState<Record<string, number>>({});
  const [rowBerechnung, setRowBerechnung] = useState<Record<string, Berechnungsart>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingBild, setIsUploadingBild] = useState(false);
  const uploadBildMut = useUploadArtikelBild();

  const handleBildSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast({ title: "Ungültiges Format", description: "Nur JPG, PNG oder WEBP.", variant: "destructive" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Datei zu groß", description: "Maximale Dateigröße ist 5MB.", variant: "destructive" });
      return;
    }
    setIsUploadingBild(true);
    try {
      const url = await uploadBildMut.mutateAsync(file);
      form.setValue("bild_url", url, { shouldDirty: true });
    } catch (err) {
      toast({ title: "Upload fehlgeschlagen", description: "Bild konnte nicht hochgeladen werden.", variant: "destructive" });
    } finally {
      setIsUploadingBild(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { data: alleArtikel = [] } = useWaescheartikelForSelect();
  const { data: existingArtikel = [] } = useVorlageArtikel(vorlage?.id ?? null);
  const addMut = useAddVorlageArtikel();
  const removeMut = useRemoveVorlageArtikel();
  const updateMut = useUpdateVorlageArtikel();

  useEffect(() => {
    if (open) {
      form.reset(
        vorlage
          ? {
              name: vorlage.name,
              kategorie: vorlage.kategorie ?? "",
              beschreibung: vorlage.beschreibung ?? "",
              bild_url: vorlage.bild_url ?? "",
              aktiv: vorlage.aktiv,
            }
          : { name: "", kategorie: "", beschreibung: "", bild_url: "", aktiv: true },
      );
      setPendingArtikel([]);
      setArtikelSuche("");
      setArtikelKategorieFilter("alle");
      setRowMengen({});
      setRowBerechnung({});
    }
  }, [open, vorlage, form]);

  const usedArtikelIds = useMemo(() => {
    const ids = vorlage
      ? existingArtikel.map((a) => a.artikel_id)
      : pendingArtikel.map((a) => a.artikel_id);
    return new Set(ids);
  }, [vorlage, existingArtikel, pendingArtikel]);

  const gefilterteArtikel = useMemo(() => {
    const q = artikelSuche.trim().toLowerCase();
    return alleArtikel.filter((a) => {
      if (artikelKategorieFilter !== "alle" && a.kategorie !== artikelKategorieFilter) return false;
      if (!q) return true;
      return (
        a.artikelnummer.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        (a.bezeichnung ?? "").toLowerCase().includes(q)
      );
    });
  }, [alleArtikel, artikelSuche, artikelKategorieFilter]);

  const handleAddArtikelById = async (artikelId: string) => {
    const artikel = alleArtikel.find((a) => a.id === artikelId);
    if (!artikel) return;
    const menge = rowMengen[artikelId] ?? 1;
    const berechnungsart = rowBerechnung[artikelId] ?? "pro_buchung";

    if (vorlage) {
      try {
        await addMut.mutateAsync({
          vorlage_id: vorlage.id,
          artikel_id: artikelId,
          menge,
          berechnungsart,
        });
        toast({ title: "Artikel hinzugefügt" });
      } catch {
        toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
        return;
      }
    } else {
      setPendingArtikel((prev) => [
        ...prev,
        {
          id: `temp-${Date.now()}-${artikelId}`,
          artikel_id: artikelId,
          artikelNummer: artikel.artikelnummer,
          artikelName: artikel.name,
          kategorie: artikel.kategorie,
          farbe: artikel.farbe,
          bild_url: artikel.bild_url,
          preis: artikel.preis ?? null,
          menge,
          berechnungsart,
        },
      ]);
    }
    setRowMengen((p) => ({ ...p, [artikelId]: 1 }));
    setRowBerechnung((p) => ({ ...p, [artikelId]: "pro_buchung" }));
  };

  const handleRemoveArtikel = async (id: string, tempId?: string) => {
    if (vorlage) {
      try {
        await removeMut.mutateAsync({ id, vorlage_id: vorlage.id });
      } catch {
        toast({ title: "Fehler beim Entfernen", variant: "destructive" });
      }
    } else {
      setPendingArtikel((prev) => prev.filter((a) => a.id !== tempId));
    }
  };

  const handleUpdateMenge = async (id: string, tempId: string, newMenge: number) => {
    if (newMenge < 1) return;
    if (vorlage) {
      try {
        await updateMut.mutateAsync({ id, vorlage_id: vorlage.id, menge: newMenge });
      } catch {
        toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
      }
    } else {
      setPendingArtikel((prev) => prev.map((a) => (a.id === tempId ? { ...a, menge: newMenge } : a)));
    }
  };

  const handleToggleBerechnungsart = async (id: string, tempId: string, current: Berechnungsart) => {
    const next: Berechnungsart = current === "pro_buchung" ? "pro_gast" : "pro_buchung";
    if (vorlage) {
      try {
        await updateMut.mutateAsync({ id, vorlage_id: vorlage.id, berechnungsart: next });
      } catch {
        toast({ title: "Fehler beim Aktualisieren", variant: "destructive" });
      }
    } else {
      setPendingArtikel((prev) => prev.map((a) => (a.id === tempId ? { ...a, berechnungsart: next } : a)));
    }
  };

  const getFarbStyle = (farbe: string | null) => {
    if (!farbe) return "bg-gray-200";
    return FARB_STYLES[farbe] || "bg-gray-200";
  };

  const handleFormSubmit = async (values: Values) => {
    await onSubmit(values, vorlage ? undefined : pendingArtikel);
  };

  const displayArtikel = vorlage
    ? existingArtikel.map((a) => ({
        id: a.id,
        tempId: a.id,
        artikel_id: a.artikel_id,
        artikelNummer: a.artikelNummer,
        artikelName: a.artikelName,
        kategorie: a.kategorie,
        farbe: a.farbe,
        bild_url: a.bild_url,
        preis: a.preis,
        menge: a.menge,
        berechnungsart: a.berechnungsart,
      }))
    : pendingArtikel.map((a) => ({
        id: a.id,
        tempId: a.id,
        artikel_id: a.artikel_id,
        artikelNummer: a.artikelNummer,
        artikelName: a.artikelName,
        kategorie: a.kategorie,
        farbe: a.farbe,
        bild_url: a.bild_url,
        preis: a.preis,
        menge: a.menge,
        berechnungsart: a.berechnungsart,
      }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {vorlage ? "Wäscheset bearbeiten" : "Neues Wäscheset erstellen"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="z. B. Standard-Apartment" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="kategorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="– keine –" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KATEGORIEN.map((k) => (
                          <SelectItem key={k} value={k}>
                            {k}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="bild_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bild (optional)</FormLabel>
                    <div className="flex items-center gap-3">
                      {field.value ? (
                        <div className="relative">
                          <img src={field.value} alt="Vorschau" className="w-16 h-16 object-cover rounded-md border" />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-5 w-5"
                            onClick={() => form.setValue("bild_url", "", { shouldDirty: true })}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <div
                          className="w-16 h-16 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <ImageIcon className="h-6 w-6" />
                        </div>
                      )}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="hidden"
                        onChange={handleBildSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingBild}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {isUploadingBild ? "Lädt…" : field.value ? "Ändern" : "Hochladen"}
                      </Button>
                    </div>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="aktiv"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-3 h-[66px]">
                    <FormLabel className="cursor-pointer">Aktiv</FormLabel>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
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
                    <Textarea placeholder="Beschreibung des Sets..." rows={2} {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Separator />

            {/* Articles section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Artikel im Set</h3>
                <Badge variant="secondary" className="ml-auto">
                  {displayArtikel.length} Artikel
                </Badge>
              </div>

              {displayArtikel.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
                  <Package className="h-8 w-8 text-muted-foreground/50" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Noch keine Artikel. Fügen Sie unten Artikel hinzu.
                  </p>
                </div>
              ) : (
                <div className="rounded-lg border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Art.-Nr.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Kategorie</TableHead>
                        <TableHead>Farbe</TableHead>
                        <TableHead className="text-right">Preis</TableHead>
                        <TableHead className="text-center">Menge</TableHead>
                        <TableHead className="text-right">Summe</TableHead>
                        <TableHead className="text-center">Berechnung</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {displayArtikel.map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-mono text-sm">{a.artikelNummer}</TableCell>
                          <TableCell className="font-medium">{a.artikelName}</TableCell>
                          <TableCell>
                            {a.kategorie ? <Badge variant="outline">{a.kategorie}</Badge> : "-"}
                          </TableCell>
                          <TableCell>
                            {a.farbe ? (
                              <div className="flex items-center gap-2">
                                <span className={`h-4 w-4 rounded-full ${getFarbStyle(a.farbe)}`} />
                                <span className="text-sm">{a.farbe}</span>
                              </div>
                            ) : (
                              "-"
                            )}
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {a.preis != null ? (
                              `${a.preis.toFixed(2).replace(".", ",")} €`
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateMenge(a.id, a.tempId, a.menge - 1)}
                                disabled={a.menge <= 1}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <Input
                                type="number"
                                min={1}
                                value={a.menge}
                                onChange={(e) =>
                                  handleUpdateMenge(a.id, a.tempId, parseInt(e.target.value) || 1)
                                }
                                className="h-7 w-14 text-center"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleUpdateMenge(a.id, a.tempId, a.menge + 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-mono font-medium">
                            {a.preis != null ? (
                              `${(a.menge * a.preis).toFixed(2).replace(".", ",")} €`
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-center">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    type="button"
                                    variant={a.berechnungsart === "pro_gast" ? "default" : "outline"}
                                    size="sm"
                                    className="gap-1.5"
                                    onClick={() =>
                                      handleToggleBerechnungsart(a.id, a.tempId, a.berechnungsart)
                                    }
                                  >
                                    {a.berechnungsart === "pro_gast" ? (
                                      <>
                                        <User className="h-3.5 w-3.5" />
                                        <span>Pro Gast</span>
                                      </>
                                    ) : (
                                      <>
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>Pro Buchung</span>
                                      </>
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>
                                    {a.berechnungsart === "pro_gast"
                                      ? "Menge wird mit Gästeanzahl multipliziert"
                                      : "Menge gilt für die gesamte Buchung"}
                                  </p>
                                  <p className="text-xs text-muted-foreground">Klicken zum Wechseln</p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
                              onClick={() => handleRemoveArtikel(a.id, a.tempId)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {displayArtikel.some((a) => a.preis != null) && (
                        <TableRow className="bg-muted/50 font-medium">
                          <TableCell colSpan={6} className="text-right">
                            Gesamtpreis:
                          </TableCell>
                          <TableCell className="text-right font-mono text-base">
                            {displayArtikel
                              .reduce((sum, a) => sum + (a.preis != null ? a.menge * a.preis : 0), 0)
                              .toFixed(2)
                              .replace(".", ",")}{" "}
                            €
                          </TableCell>
                          <TableCell colSpan={2}></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Article picker */}
              <div className="rounded-lg border bg-muted/30 p-3 space-y-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <h4 className="text-sm font-medium">Artikel auswählen</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Artikel suchen…"
                      value={artikelSuche}
                      onChange={(e) => setArtikelSuche(e.target.value)}
                      className="pl-8 bg-background"
                    />
                  </div>
                  <Select value={artikelKategorieFilter} onValueChange={setArtikelKategorieFilter}>
                    <SelectTrigger className="w-[200px] bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alle">Alle Kategorien</SelectItem>
                      {KATEGORIEN_ARTIKEL.map((k) => (
                        <SelectItem key={k} value={k}>
                          {k}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border bg-background max-h-[360px] overflow-y-auto divide-y">
                  {gefilterteArtikel.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">
                      Keine Artikel gefunden.
                    </div>
                  ) : (
                    gefilterteArtikel.map((a) => {
                      const isUsed = usedArtikelIds.has(a.id);
                      const rowMenge = rowMengen[a.id] ?? 1;
                      const rowBerech = rowBerechnung[a.id] ?? "pro_buchung";
                      return (
                        <div
                          key={a.id}
                          className={cn(
                            "flex items-center gap-3 p-2.5",
                            isUsed && "opacity-50 bg-muted/30",
                          )}
                        >
                          {a.bild_url ? (
                            <img
                              src={a.bild_url}
                              alt={a.name}
                              loading="lazy"
                              className="h-10 w-10 rounded object-cover border shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded border bg-muted flex items-center justify-center shrink-0">
                              <Package className="h-4 w-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-xs">{a.artikelnummer}</span>
                              <span className="font-medium text-sm truncate">{a.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-xs text-muted-foreground">
                              {a.kategorie && <Badge variant="outline" className="text-[10px] py-0">{a.kategorie}</Badge>}
                              {a.farbe && (
                                <span className="flex items-center gap-1">
                                  <span className={`h-3 w-3 rounded-full ${getFarbStyle(a.farbe)}`} />
                                  {a.farbe}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                setRowMengen((p) => ({ ...p, [a.id]: Math.max(1, rowMenge - 1) }))
                              }
                              disabled={isUsed || rowMenge <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              min={1}
                              value={rowMenge}
                              onChange={(e) =>
                                setRowMengen((p) => ({
                                  ...p,
                                  [a.id]: Math.max(1, parseInt(e.target.value) || 1),
                                }))
                              }
                              disabled={isUsed}
                              className="h-7 w-12 text-center px-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() =>
                                setRowMengen((p) => ({ ...p, [a.id]: rowMenge + 1 }))
                              }
                              disabled={isUsed}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <div className="inline-flex rounded-md border bg-background p-0.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setRowBerechnung((p) => ({ ...p, [a.id]: "pro_buchung" }))}
                              disabled={isUsed}
                              className={cn(
                                "flex items-center gap-1 px-2 h-6 rounded text-xs font-medium transition-colors",
                                rowBerech === "pro_buchung"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                                isUsed && "cursor-not-allowed opacity-60",
                              )}
                            >
                              <Calendar className="h-3 w-3" />
                              Pro Buchung
                            </button>
                            <button
                              type="button"
                              onClick={() => setRowBerechnung((p) => ({ ...p, [a.id]: "pro_gast" }))}
                              disabled={isUsed}
                              className={cn(
                                "flex items-center gap-1 px-2 h-6 rounded text-xs font-medium transition-colors",
                                rowBerech === "pro_gast"
                                  ? "bg-primary text-primary-foreground"
                                  : "text-muted-foreground hover:text-foreground",
                                isUsed && "cursor-not-allowed opacity-60",
                              )}
                            >
                              <User className="h-3 w-3" />
                              Pro Gast
                            </button>
                          </div>

                          {isUsed ? (
                            <div className="h-8 w-8 flex items-center justify-center text-emerald-600 shrink-0">
                              <Check className="h-4 w-4" />
                            </div>
                          ) : (
                            <Button
                              type="button"
                              size="icon"
                              className="h-8 w-8 shrink-0"
                              onClick={() => handleAddArtikelById(a.id)}
                              disabled={addMut.isPending}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {vorlage ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
