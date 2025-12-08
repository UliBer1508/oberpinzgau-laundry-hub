import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import type { Routenvorlage } from "@/hooks/useRoutenvorlagen";

const formSchema = z.object({
  name: z.string().min(1, "Name ist erforderlich"),
  beschreibung: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface RoutenvorlageFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vorlage: Routenvorlage | null;
  onSubmit: (data: FormValues) => void;
}

export function RoutenvorlageFormDialog({
  open,
  onOpenChange,
  vorlage,
  onSubmit,
}: RoutenvorlageFormDialogProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      beschreibung: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (vorlage) {
        form.reset({
          name: vorlage.name,
          beschreibung: vorlage.beschreibung || "",
        });
      } else {
        form.reset({
          name: "",
          beschreibung: "",
        });
      }
    }
  }, [open, vorlage, form]);

  const handleSubmit = (data: FormValues) => {
    onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {vorlage ? "Routenvorlage bearbeiten" : "Neue Routenvorlage"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Pinzgau West" {...field} />
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
                  <FormLabel>Beschreibung (optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="z.B. Route von Mittersill über Bramberg nach Krimml"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
              <Button type="submit">
                {vorlage ? "Speichern" : "Erstellen"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
