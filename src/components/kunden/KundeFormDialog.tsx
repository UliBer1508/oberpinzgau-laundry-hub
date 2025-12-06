import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { Kunde } from "@/hooks/useKunden";

const kundeFormSchema = z.object({
  kundennummer: z.string().min(1, "Kundennummer ist erforderlich"),
  name: z.string().min(1, "Name ist erforderlich"),
  firma: z.string().optional().nullable(),
  strasse: z.string().optional().nullable(),
  plz: z.string().optional().nullable(),
  ort: z.string().optional().nullable(),
  email: z.string().email("Ungültige E-Mail").optional().nullable().or(z.literal("")),
  telefon: z.string().optional().nullable(),
  bestellart: z.enum(["lieferung", "abholung", "beides"]).optional().nullable(),
  bestellmodus: z.enum(["mit_buchung", "nur_sets"]),
  anlieferadresse: z.string().optional().nullable(),
  notizen: z.string().optional().nullable(),
  aktiv: z.boolean().optional().nullable(),
});

type KundeFormValues = z.infer<typeof kundeFormSchema>;

interface KundeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kunde: Kunde | null;
  onSave: (data: KundeFormValues) => void;
}

export function KundeFormDialog({ open, onOpenChange, kunde, onSave }: KundeFormDialogProps) {
  const isEditing = !!kunde;

  const form = useForm<KundeFormValues>({
    resolver: zodResolver(kundeFormSchema),
    defaultValues: {
      kundennummer: "",
      name: "",
      firma: "",
      strasse: "",
      plz: "",
      ort: "",
      email: "",
      telefon: "",
      bestellart: "beides",
      bestellmodus: "mit_buchung",
      anlieferadresse: "",
      notizen: "",
      aktiv: true,
    },
  });

  useEffect(() => {
    if (kunde) {
      form.reset({
        kundennummer: kunde.kundennummer,
        name: kunde.name,
        firma: kunde.firma || "",
        strasse: kunde.strasse || "",
        plz: kunde.plz || "",
        ort: kunde.ort || "",
        email: kunde.email || "",
        telefon: kunde.telefon || "",
        bestellart: kunde.bestellart || "beides",
        bestellmodus: kunde.bestellmodus || "mit_buchung",
        anlieferadresse: kunde.anlieferadresse || "",
        notizen: kunde.notizen || "",
        aktiv: kunde.aktiv ?? true,
      });
    } else {
      form.reset({
        kundennummer: `K${Date.now().toString().slice(-6)}`,
        name: "",
        firma: "",
        strasse: "",
        plz: "",
        ort: "",
        email: "",
        telefon: "",
        bestellart: "beides",
        bestellmodus: "mit_buchung",
        anlieferadresse: "",
        notizen: "",
        aktiv: true,
      });
    }
  }, [kunde, form, open]);

  const handleSubmit = (data: KundeFormValues) => {
    // Clean up empty strings to null for optional fields
    const cleanedData = {
      ...data,
      firma: data.firma || null,
      strasse: data.strasse || null,
      plz: data.plz || null,
      ort: data.ort || null,
      email: data.email || null,
      telefon: data.telefon || null,
      anlieferadresse: data.anlieferadresse || null,
      notizen: data.notizen || null,
    };
    onSave(cleanedData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Kunde bearbeiten" : "Neuen Kunden anlegen"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Bearbeiten Sie die Kundendaten und speichern Sie die Änderungen."
              : "Füllen Sie die Felder aus, um einen neuen Kunden anzulegen."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Grunddaten */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="kundennummer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kundennummer</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isEditing} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bestellart"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bestellart</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || "beides"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Bestellart wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="lieferung">Lieferung</SelectItem>
                        <SelectItem value="abholung">Abholung</SelectItem>
                        <SelectItem value="beides">Beides</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Bestellmodus */}
            <FormField
              control={form.control}
              name="bestellmodus"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Bestellmodus *</FormLabel>
                  <FormDescription>
                    Bestimmt, welches Bestellformular der Kunde im Portal sieht
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="space-y-3"
                    >
                      <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="mit_buchung" id="mit_buchung" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="mit_buchung" className="font-medium cursor-pointer">
                            Mit Buchungsdaten
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Kunde gibt Check-in, Check-out und Gästeanzahl an. Die Wäschemenge wird automatisch berechnet.
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 rounded-lg border p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                        <RadioGroupItem value="nur_sets" id="nur_sets" className="mt-1" />
                        <div className="space-y-1">
                          <Label htmlFor="nur_sets" className="font-medium cursor-pointer">
                            Nur Wäscheset-Anzahl
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            Kunde bestellt direkt eine Anzahl von Wäschesets ohne Buchungsinformationen.
                          </p>
                        </div>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Max Mustermann" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="firma"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Firma</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Musterfirma GmbH" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Adresse */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-muted-foreground">Adresse</h4>
              <FormField
                control={form.control}
                name="strasse"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Straße</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Musterstraße 123" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid gap-4 sm:grid-cols-3">
                <FormField
                  control={form.control}
                  name="plz"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>PLZ</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="5020" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="ort"
                  render={({ field }) => (
                    <FormItem className="sm:col-span-2">
                      <FormLabel>Ort</FormLabel>
                      <FormControl>
                        <Input {...field} value={field.value || ""} placeholder="Salzburg" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Kontakt */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} type="email" placeholder="info@beispiel.at" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefon</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="+43 123 456789" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Anlieferadresse */}
            <FormField
              control={form.control}
              name="anlieferadresse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abweichende Anlieferadresse</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Falls abweichend von der Hauptadresse..."
                      rows={2}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notizen */}
            <FormField
              control={form.control}
              name="notizen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value || ""}
                      placeholder="Interne Bemerkungen zum Kunden..."
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Aktiv Toggle */}
            <FormField
              control={form.control}
              name="aktiv"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Kunde aktiv</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Deaktivierte Kunden erscheinen nicht in der Standardansicht
                    </p>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value ?? true}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit">
                {isEditing ? "Speichern" : "Anlegen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
