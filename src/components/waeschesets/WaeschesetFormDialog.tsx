import { useEffect } from "react";
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
import type { Waescheset, WaeschesetInsert } from "@/hooks/useWaeschesets";

const formSchema = z.object({
  objekt_id: z.string().min(1, "Bitte wählen Sie ein Objekt"),
  name: z.string().min(1, "Name ist erforderlich"),
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
  objekte,
  onSubmit,
  isLoading,
}: WaeschesetFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      objekt_id: "",
      name: "",
      beschreibung: "",
      aktiv: true,
    },
  });

  useEffect(() => {
    if (open) {
      if (set) {
        form.reset({
          objekt_id: set.objekt_id,
          name: set.name,
          beschreibung: set.beschreibung || "",
          aktiv: set.aktiv ?? true,
        });
      } else {
        form.reset({
          objekt_id: "",
          name: "",
          beschreibung: "",
          aktiv: true,
        });
      }
    }
  }, [open, set, form]);

  const handleSubmit = (values: FormValues) => {
    const data: WaeschesetInsert = {
      objekt_id: values.objekt_id,
      name: values.name,
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
              name="objekt_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objekt *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={!!set}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Objekt auswählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {objekte.map((objekt) => (
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

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Standard-Set" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Speichern..." : "Speichern"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
