import { useEffect, useMemo } from "react";
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
import { Lock } from "lucide-react";
import type { Waescheset, WaeschesetInsert } from "@/hooks/useWaeschesets";
import { useKundenForWaeschesets, useObjekteByKunde } from "@/hooks/useWaeschesets";

const formSchema = z.object({
  kunde_id: z.string().min(1, "Bitte wählen Sie einen Kunden"),
  objekt_id: z.string().min(1, "Bitte wählen Sie ein Objekt"),
  beschreibung: z.string().optional(),
  aktiv: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

interface WaeschesetFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  set: Waescheset | null;
  objekte: { id: string; name: string; objektnummer: string }[];
  onSubmit: (data: WaeschesetInsert) => void;
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

  const selectedKundeId = form.watch("kunde_id");
  const selectedObjektId = form.watch("objekt_id");

  // Fetch Kunden and Objekte
  const { data: kunden = [] } = useKundenForWaeschesets();
  const { data: kundeObjekte = [] } = useObjekteByKunde(selectedKundeId || null);

  // Get selected kunde and objekt names for auto-generated name
  const selectedKunde = useMemo(() => 
    kunden.find(k => k.id === selectedKundeId),
    [kunden, selectedKundeId]
  );
  
  const selectedObjekt = useMemo(() => 
    kundeObjekte.find(o => o.id === selectedObjektId),
    [kundeObjekte, selectedObjektId]
  );

  // Auto-generated name
  const autoName = useMemo(() => {
    if (!selectedKunde || !selectedObjekt) return "";
    const kundeName = selectedKunde.firma || selectedKunde.name;
    return `${kundeName} - ${selectedObjekt.name}`;
  }, [selectedKunde, selectedObjekt]);

  // Reset objekt when kunde changes
  useEffect(() => {
    if (selectedKundeId && !set) {
      form.setValue("objekt_id", "");
    }
  }, [selectedKundeId, form, set]);

  useEffect(() => {
    if (open) {
      if (set) {
        // Editing existing set - find kunde from set data
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
      }
    }
  }, [open, set, form]);

  const handleSubmit = (values: FormValues) => {
    const data: WaeschesetInsert = {
      objekt_id: values.objekt_id,
      name: autoName,
      beschreibung: values.beschreibung || null,
      aktiv: values.aktiv,
    };
    onSubmit(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {set ? "Wäscheset bearbeiten" : "Neues Wäscheset erstellen"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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

            <FormField
              control={form.control}
              name="beschreibung"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Beschreibung</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Beschreibung des Sets..."
                      rows={3}
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
                {isLoading ? "Speichern..." : "Speichern"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
