import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
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
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Waescheartikel, WaescheartikelInsert } from "@/hooks/useWaescheartikel";

const KATEGORIEN = [
  "Bettwäsche",
  "Handtücher",
  "Bademäntel",
  "Tischdecken",
  "Bezüge",
  "Sonstiges",
];

const FARBEN = [
  "Weiß",
  "Beige",
  "Grau",
  "Blau",
  "Grün",
  "Anthrazit",
  "Rot",
  "Gelb",
  "Rosa",
  "Braun",
];

const formSchema = z.object({
  artikelnummer: z.string().min(1, "Artikelnummer ist erforderlich"),
  name: z.string().min(1, "Name ist erforderlich"),
  bezeichnung: z.string().optional(),
  kategorie: z.string().optional(),
  farbe: z.string().optional(),
  aktiv: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface WaescheartikelFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  artikel: Waescheartikel | null;
  nextArtikelnummer: string;
  onSubmit: (data: WaescheartikelInsert) => void;
  isLoading: boolean;
}

export function WaescheartikelFormDialog({
  open,
  onOpenChange,
  artikel,
  nextArtikelnummer,
  onSubmit,
  isLoading,
}: WaescheartikelFormDialogProps) {
  const isEditing = !!artikel;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      artikelnummer: "",
      name: "",
      bezeichnung: "",
      kategorie: "",
      farbe: "",
      aktiv: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (artikel) {
        form.reset({
          artikelnummer: artikel.artikelnummer,
          name: artikel.name,
          bezeichnung: artikel.bezeichnung || "",
          kategorie: artikel.kategorie || "",
          farbe: artikel.farbe || "",
          aktiv: artikel.aktiv ?? true,
        });
      } else {
        form.reset({
          artikelnummer: nextArtikelnummer,
          name: "",
          bezeichnung: "",
          kategorie: "",
          farbe: "",
          aktiv: true,
        });
      }
    }
  }, [open, artikel, nextArtikelnummer, form]);

  const handleSubmit = (values: FormValues) => {
    onSubmit({
      artikelnummer: values.artikelnummer,
      name: values.name,
      bezeichnung: values.bezeichnung || null,
      kategorie: values.kategorie || null,
      farbe: values.farbe || null,
      aktiv: values.aktiv,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Wäscheartikel bearbeiten" : "Neuer Wäscheartikel"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="artikelnummer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Artikelnummer</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      disabled={isEditing}
                      className="font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="z.B. Betttuch 180x200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bezeichnung"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bezeichnung</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Zusätzliche Beschreibung" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="kategorie"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {KATEGORIEN.map((kategorie) => (
                          <SelectItem key={kategorie} value={kategorie}>
                            {kategorie}
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
                name="farbe"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farbe</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Wählen..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FARBEN.map((farbe) => (
                          <SelectItem key={farbe} value={farbe}>
                            {farbe}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="aktiv"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <FormLabel className="text-base">Aktiv</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Artikel für Bestellungen verfügbar
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

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Abbrechen
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Speichern..." : isEditing ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
