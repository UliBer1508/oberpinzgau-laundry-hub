import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Package, Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useWaescheartikelForSelect, type Berechnungsart } from "@/hooks/useWaeschesets";
import {
  useVorlageArtikel,
  useAddVorlageArtikel,
  useRemoveVorlageArtikel,
  useUpdateVorlageArtikel,
  type VorlageSet,
} from "@/hooks/useVorlagenSets";

const schema = z.object({
  name: z.string().min(1, "Name erforderlich").max(120),
  kategorie: z.string().optional(),
  beschreibung: z.string().optional(),
  bild_url: z.string().optional(),
  aktiv: z.boolean(),
});

type Values = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  vorlage: VorlageSet | null;
  onSubmit: (v: Values) => Promise<void>;
  isLoading: boolean;
}

const KATEGORIEN = ["Apartment", "Chalet", "Hotelzimmer", "Wellness", "Sonstige"];

export function VorlageFormDialog({ open, onOpenChange, vorlage, onSubmit, isLoading }: Props) {
  const { toast } = useToast();
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", kategorie: "", beschreibung: "", bild_url: "", aktiv: true },
  });

  const [artikelId, setArtikelId] = useState("");
  const [menge, setMenge] = useState(1);
  const [berechnungsart, setBerechnungsart] = useState<Berechnungsart>("pro_buchung");

  const { data: alleArtikel = [] } = useWaescheartikelForSelect();
  const { data: positionen = [] } = useVorlageArtikel(vorlage?.id ?? null);
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
      setArtikelId("");
      setMenge(1);
      setBerechnungsart("pro_buchung");
    }
  }, [open, vorlage, form]);

  const verfuegbar = useMemo(() => {
    const used = new Set(positionen.map((p) => p.artikel_id));
    return alleArtikel.filter((a) => !used.has(a.id));
  }, [alleArtikel, positionen]);

  const handleAdd = async () => {
    if (!vorlage || !artikelId) return;
    try {
      await addMut.mutateAsync({ vorlage_id: vorlage.id, artikel_id: artikelId, menge, berechnungsart });
      setArtikelId("");
      setMenge(1);
      setBerechnungsart("pro_buchung");
    } catch {
      toast({ title: "Fehler beim Hinzufügen", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            {vorlage ? "Vorlagen-Set bearbeiten" : "Neues Vorlagen-Set"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl><Input placeholder="z. B. Standard-Apartment" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="kategorie" render={({ field }) => (
                <FormItem>
                  <FormLabel>Kategorie</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl><SelectTrigger><SelectValue placeholder="– keine –" /></SelectTrigger></FormControl>
                    <SelectContent>
                      {KATEGORIEN.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="beschreibung" render={({ field }) => (
              <FormItem>
                <FormLabel>Beschreibung</FormLabel>
                <FormControl><Textarea rows={2} {...field} /></FormControl>
              </FormItem>
            )} />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="bild_url" render={({ field }) => (
                <FormItem>
                  <FormLabel>Bild-URL (optional)</FormLabel>
                  <FormControl><Input placeholder="https://…" {...field} /></FormControl>
                </FormItem>
              )} />
              <FormField control={form.control} name="aktiv" render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-3 h-[66px]">
                  <FormLabel className="cursor-pointer">Aktiv</FormLabel>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
              <Button type="submit" disabled={isLoading}>{vorlage ? "Speichern" : "Erstellen"}</Button>
            </DialogFooter>
          </form>
        </Form>

        {vorlage && (
          <>
            <Separator className="my-4" />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium">Artikel im Vorlagen-Set</h3>
                <Badge variant="secondary" className="ml-auto">{positionen.length}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-[1fr_100px_160px_auto] gap-2">
                <Select value={artikelId} onValueChange={setArtikelId}>
                  <SelectTrigger><SelectValue placeholder="Artikel wählen…" /></SelectTrigger>
                  <SelectContent>
                    {verfuegbar.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.artikelnummer} – {a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input type="number" min={1} value={menge} onChange={(e) => setMenge(Math.max(1, Number(e.target.value) || 1))} />
                <Select value={berechnungsart} onValueChange={(v) => setBerechnungsart(v as Berechnungsart)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pro_buchung">pro Buchung</SelectItem>
                    <SelectItem value="pro_gast">pro Gast</SelectItem>
                  </SelectContent>
                </Select>
                <Button type="button" onClick={handleAdd} disabled={!artikelId}>
                  <Plus className="h-4 w-4 mr-1" /> Hinzufügen
                </Button>
              </div>

              {positionen.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                  Noch keine Artikel.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Artikel</TableHead>
                      <TableHead className="w-24">Menge</TableHead>
                      <TableHead className="w-40">Berechnung</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positionen.map((p) => (
                      <TableRow key={p.id}>
                        <TableCell>
                          <div className="font-medium">{p.artikelName}</div>
                          <div className="text-xs text-muted-foreground">{p.artikelNummer}</div>
                        </TableCell>
                        <TableCell>
                          <Input type="number" min={1} value={p.menge} onChange={(e) => updateMut.mutate({ id: p.id, vorlage_id: vorlage.id, menge: Math.max(1, Number(e.target.value) || 1) })} />
                        </TableCell>
                        <TableCell>
                          <Select value={p.berechnungsart} onValueChange={(v) => updateMut.mutate({ id: p.id, vorlage_id: vorlage.id, berechnungsart: v as Berechnungsart })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pro_buchung">pro Buchung</SelectItem>
                              <SelectItem value="pro_gast">pro Gast</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button type="button" size="icon" variant="ghost" onClick={() => removeMut.mutate({ id: p.id, vorlage_id: vorlage.id })}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}

        {!vorlage && (
          <p className="text-xs text-muted-foreground">Artikel können nach dem Anlegen der Vorlage hinzugefügt werden.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
