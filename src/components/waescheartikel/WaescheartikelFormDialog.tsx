import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Upload, X, Image as ImageIcon } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import type { Waescheartikel, WaescheartikelInsert } from "@/hooks/useWaescheartikel";
import { useUploadArtikelBild, useDeleteArtikelBild } from "@/hooks/useWaescheartikel";

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
  "Weiß gestreift",
  "Grau",
  "Grau gestreift",
  "Braun",
  "Bunt",
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
  onSubmit: (data: WaescheartikelInsert & { bild_url?: string | null }) => void;
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
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const uploadMutation = useUploadArtikelBild();
  const deleteMutation = useDeleteArtikelBild();

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
        setImagePreview(artikel.bild_url || null);
        setImageFile(null);
      } else {
        form.reset({
          artikelnummer: nextArtikelnummer,
          name: "",
          bezeichnung: "",
          kategorie: "",
          farbe: "",
          aktiv: true,
        });
        setImagePreview(null);
        setImageFile(null);
      }
    }
  }, [open, artikel, nextArtikelnummer, form]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Ungültiges Format",
        description: "Bitte nur JPG, PNG oder WEBP Dateien hochladen.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Datei zu groß",
        description: "Maximale Dateigröße ist 5MB.",
        variant: "destructive",
      });
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setIsUploading(true);
    try {
      let bild_url: string | null = artikel?.bild_url || null;

      // If there's a new file to upload
      if (imageFile) {
        // Delete old image if exists
        if (artikel?.bild_url) {
          try {
            await deleteMutation.mutateAsync(artikel.bild_url);
          } catch (e) {
            console.warn("Could not delete old image:", e);
          }
        }
        // Upload new image
        bild_url = await uploadMutation.mutateAsync(imageFile);
      } 
      // If image was removed (preview is null but artikel had an image)
      else if (!imagePreview && artikel?.bild_url) {
        try {
          await deleteMutation.mutateAsync(artikel.bild_url);
        } catch (e) {
          console.warn("Could not delete old image:", e);
        }
        bild_url = null;
      }

      onSubmit({
        artikelnummer: values.artikelnummer,
        name: values.name,
        bezeichnung: values.bezeichnung || null,
        kategorie: values.kategorie || null,
        farbe: values.farbe || null,
        aktiv: values.aktiv,
        bild_url,
      });
    } catch (error) {
      toast({
        title: "Fehler beim Hochladen",
        description: "Das Bild konnte nicht hochgeladen werden.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Wäscheartikel bearbeiten" : "Neuer Wäscheartikel"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Image Upload Section */}
            <div className="space-y-2">
              <FormLabel>Artikelbild</FormLabel>
              <div className="flex flex-col items-center gap-3">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Vorschau"
                      className="w-32 h-32 object-cover rounded-lg border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6"
                      onClick={handleRemoveImage}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div
                    className="w-32 h-32 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-muted-foreground cursor-pointer hover:border-primary hover:text-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="h-8 w-8 mb-1" />
                    <span className="text-xs">Kein Bild</span>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  {imagePreview ? "Bild ändern" : "Bild hochladen"}
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG oder WEBP (max. 5MB)
                </p>
              </div>
            </div>

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
              <Button type="submit" disabled={isLoading || isUploading}>
                {isLoading || isUploading ? "Speichern..." : isEditing ? "Speichern" : "Erstellen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
