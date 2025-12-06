import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useGeneratePersonalnummer } from "@/hooks/useWaeschekraefte";
import type { Waeschekraft } from "@/hooks/useWaeschekraefte";

const MITARBEITER_TYP_OPTIONS = [
  { value: "waeschekraft", label: "Wäschekraft" },
  { value: "fahrer", label: "Fahrer" },
  { value: "beides", label: "Beides" },
] as const;

const formSchema = z.object({
  personalnummer: z.string().min(1, "Personalnummer ist erforderlich"),
  name: z.string().min(1, "Name ist erforderlich"),
  typ: z.enum(["waeschekraft", "fahrer", "beides"]),
  strasse: z.string().optional(),
  plz: z.string().optional(),
  ort: z.string().optional(),
  telefon: z.string().optional(),
  email: z.string().email("Ungültige E-Mail-Adresse").optional().or(z.literal("")),
  notizen: z.string().optional(),
  aktiv: z.boolean(),
  portalzugang: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface WaeschekraftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Waeschekraft | null;
  onSubmit: (data: FormValues) => void;
}

export function WaeschekraftFormDialog({
  open,
  onOpenChange,
  worker,
  onSubmit,
}: WaeschekraftFormDialogProps) {
  const { data: nextPersonalnummer } = useGeneratePersonalnummer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      personalnummer: "",
      name: "",
      typ: "waeschekraft",
      strasse: "",
      plz: "",
      ort: "",
      telefon: "",
      email: "",
      notizen: "",
      aktiv: true,
      portalzugang: false,
    },
  });

  useEffect(() => {
    if (worker) {
      form.reset({
        personalnummer: worker.personalnummer,
        name: worker.name,
        typ: (worker.typ as "waeschekraft" | "fahrer" | "beides") || "waeschekraft",
        strasse: worker.strasse || "",
        plz: worker.plz || "",
        ort: worker.ort || "",
        telefon: worker.telefon || "",
        email: worker.email || "",
        notizen: worker.notizen || "",
        aktiv: worker.aktiv ?? true,
        portalzugang: worker.portalzugang ?? false,
      });
    } else {
      form.reset({
        personalnummer: nextPersonalnummer || "",
        name: "",
        typ: "waeschekraft",
        strasse: "",
        plz: "",
        ort: "",
        telefon: "",
        email: "",
        notizen: "",
        aktiv: true,
        portalzugang: false,
      });
    }
  }, [worker, nextPersonalnummer, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {worker ? "Personal bearbeiten" : "Neues Personal"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="personalnummer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Personalnummer</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={!!worker} className={worker ? "bg-muted" : ""} />
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
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Vor- und Nachname" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="typ"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Typ</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Typ wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MITARBEITER_TYP_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
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
              name="strasse"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Straße & Hausnummer</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Musterstraße 1" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="plz"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PLZ</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="12345" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ort"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ort</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Musterstadt" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
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

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-Mail</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="mail@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notizen"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notizen</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} placeholder="Optionale Notizen..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center gap-6 pt-2">
              <FormField
                control={form.control}
                name="aktiv"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Aktiv</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portalzugang"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal">Portalzugang</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit">
                {worker ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
