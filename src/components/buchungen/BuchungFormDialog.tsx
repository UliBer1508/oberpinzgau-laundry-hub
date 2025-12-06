import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { useObjekteForBuchung, useGenerateBuchungsnummer } from "@/hooks/useBuchungen";
import type { Buchung } from "@/hooks/useBuchungen";

const formSchema = z.object({
  buchungsnummer: z.string().min(1, "Buchungsnummer ist erforderlich"),
  objekt_id: z.string().min(1, "Objekt ist erforderlich"),
  gastname: z.string().optional(),
  anzahl_personen: z.number().min(1, "Mindestens 1 Person"),
  check_in: z.date({ required_error: "Check-in Datum ist erforderlich" }),
  check_out: z.date({ required_error: "Check-out Datum ist erforderlich" }),
  notizen: z.string().optional(),
}).refine((data) => data.check_out > data.check_in, {
  message: "Check-out muss nach Check-in sein",
  path: ["check_out"],
});

type FormValues = z.infer<typeof formSchema>;

interface BuchungFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buchung: Buchung | null;
  onSubmit: (data: FormValues) => void;
}

export function BuchungFormDialog({
  open,
  onOpenChange,
  buchung,
  onSubmit,
}: BuchungFormDialogProps) {
  const { data: objekte = [] } = useObjekteForBuchung();
  const { data: nextBuchungsnummer } = useGenerateBuchungsnummer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      buchungsnummer: "",
      objekt_id: "",
      gastname: "",
      anzahl_personen: 1,
      check_in: new Date(),
      check_out: new Date(Date.now() + 86400000), // +1 day
      notizen: "",
    },
  });

  useEffect(() => {
    if (buchung) {
      form.reset({
        buchungsnummer: buchung.buchungsnummer,
        objekt_id: buchung.objekt_id,
        gastname: buchung.gastname || "",
        anzahl_personen: buchung.anzahl_personen || 1,
        check_in: new Date(buchung.check_in),
        check_out: new Date(buchung.check_out),
        notizen: buchung.notizen || "",
      });
    } else {
      form.reset({
        buchungsnummer: nextBuchungsnummer || "",
        objekt_id: "",
        gastname: "",
        anzahl_personen: 1,
        check_in: new Date(),
        check_out: new Date(Date.now() + 86400000),
        notizen: "",
      });
    }
  }, [buchung, nextBuchungsnummer, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {buchung ? "Buchung bearbeiten" : "Neue Buchung"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="buchungsnummer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buchungsnummer</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={!!buchung} className={buchung ? "bg-muted" : ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="anzahl_personen"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Anzahl Personen</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="objekt_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Objekt</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Objekt wählen" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {objekte.map((obj) => (
                        <SelectItem key={obj.id} value={obj.id}>
                          {obj.name} ({obj.kundeName})
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
              name="gastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gastname</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Name des Gastes" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="check_in"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-in</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd.MM.yyyy") : "Datum wählen"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="check_out"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Check-out</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "dd.MM.yyyy") : "Datum wählen"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
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
                    <Textarea {...field} rows={3} placeholder="Optionale Notizen zur Buchung..." />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Abbrechen
              </Button>
              <Button type="submit">
                {buchung ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
