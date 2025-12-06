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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Kunde } from "./KundenTable";

const kundeFormSchema = z.object({
  kundennummer: z.string().min(1, "Kundennummer ist erforderlich"),
  name: z.string().min(1, "Name ist erforderlich"),
  firma: z.string().optional(),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  email: z.string().email("Ungültige E-Mail").optional().or(z.literal("")),
  telefon: z.string().optional(),
  bestellart: z.enum(["lieferung", "abholung", "beides"]).optional(),
  anlieferadresse: z.string().optional(),
  notizen: z.string().optional(),
  aktiv: z.boolean(),
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
        anlieferadresse: "",
        notizen: "",
        aktiv: kunde.aktiv,
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
        anlieferadresse: "",
        notizen: "",
        aktiv: true,
      });
    }
  }, [kunde, form]);

  const handleSubmit = (data: KundeFormValues) => {
    onSave(data);
    onOpenChange(false);
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
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      <Input {...field} placeholder="Musterfirma GmbH" />
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
                      <Input {...field} placeholder="Musterstraße 123" />
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
                        <Input {...field} placeholder="5020" />
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
                        <Input {...field} placeholder="Salzburg" />
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
                      <Input {...field} type="email" placeholder="info@beispiel.at" />
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
                      <Input {...field} placeholder="+43 123 456789" />
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
                      checked={field.value}
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
