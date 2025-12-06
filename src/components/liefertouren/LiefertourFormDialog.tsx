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
import { useFahrer, useGenerateTournummer } from "@/hooks/useLiefertouren";
import type { Liefertour } from "@/hooks/useLiefertouren";

const formSchema = z.object({
  tournummer: z.string().min(1, "Tournummer ist erforderlich"),
  name: z.string().min(1, "Name ist erforderlich"),
  datum: z.date({ required_error: "Datum ist erforderlich" }),
  waeschekraft_id: z.string().optional(),
  status: z.string(),
  notizen: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface LiefertourFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Liefertour | null;
  onSubmit: (data: FormValues) => void;
}

export function LiefertourFormDialog({
  open,
  onOpenChange,
  tour,
  onSubmit,
}: LiefertourFormDialogProps) {
  const { data: fahrer = [] } = useFahrer();
  const { data: nextTournummer } = useGenerateTournummer();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tournummer: "",
      name: "",
      datum: new Date(),
      waeschekraft_id: "",
      status: "geplant",
      notizen: "",
    },
  });

  useEffect(() => {
    if (tour) {
      form.reset({
        tournummer: tour.tournummer,
        name: tour.name,
        datum: new Date(tour.datum),
        waeschekraft_id: tour.waeschekraft_id || "",
        status: tour.status || "geplant",
        notizen: tour.notizen || "",
      });
    } else {
      form.reset({
        tournummer: nextTournummer || "",
        name: "",
        datum: new Date(),
        waeschekraft_id: "",
        status: "geplant",
        notizen: "",
      });
    }
  }, [tour, nextTournummer, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {tour ? "Liefertour bearbeiten" : "Neue Liefertour"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="tournummer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tournummer</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly={!!tour} className={tour ? "bg-muted" : ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="datum"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Datum</FormLabel>
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="z.B. Montag Stadtmitte" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="waeschekraft_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fahrer</FormLabel>
                    <Select 
                      value={field.value || "none"} 
                      onValueChange={(val) => field.onChange(val === "none" ? "" : val)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Fahrer wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Keine Zuweisung</SelectItem>
                        {fahrer.map((f) => (
                          <SelectItem key={f.id} value={f.id}>
                            {f.name}
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
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="geplant">Geplant</SelectItem>
                        <SelectItem value="aktiv">Aktiv</SelectItem>
                        <SelectItem value="abgeschlossen">Abgeschlossen</SelectItem>
                      </SelectContent>
                    </Select>
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
                    <Textarea {...field} rows={3} placeholder="Optionale Notizen zur Tour..." />
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
                {tour ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
