import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import type { Objekt } from "@/hooks/useObjekte";

interface ObjektFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  objekt: Objekt | null;
  onSave: (data: any) => void;
  isSaving?: boolean;
  kunden: Array<{ id: string; name: string; firma: string | null; kundennummer: string }>;
}

const objektTypen = [
  { value: "hotel", label: "Hotel" },
  { value: "apartmenthaus", label: "Apartmenthaus" },
  { value: "ferienhaus", label: "Ferienhaus" },
  { value: "ferienwohnung", label: "Ferienwohnung" },
];

export function ObjektFormDialog({
  open,
  onOpenChange,
  objekt,
  onSave,
  isSaving,
  kunden,
}: ObjektFormDialogProps) {
  const { register, handleSubmit, reset, setValue, watch } = useForm({
    defaultValues: {
      objektnummer: "",
      kunde_id: "",
      name: "",
      typ: "ferienwohnung" as "hotel" | "apartmenthaus" | "ferienhaus" | "ferienwohnung",
      strasse: "",
      plz: "",
      ort: "",
      ansprechpartner: "",
      telefon: "",
      notizen: "",
      aktiv: true,
    },
  });

  const selectedTyp = watch("typ");
  const selectedKundeId = watch("kunde_id");

  useEffect(() => {
    if (objekt) {
      reset({
        objektnummer: objekt.objektnummer,
        kunde_id: objekt.kunde_id,
        name: objekt.name,
        typ: objekt.typ,
        strasse: objekt.strasse || "",
        plz: objekt.plz || "",
        ort: objekt.ort || "",
        ansprechpartner: objekt.ansprechpartner || "",
        telefon: objekt.telefon || "",
        notizen: objekt.notizen || "",
        aktiv: objekt.aktiv ?? true,
      });
    } else {
      const newObjektnummer = `O${Date.now().toString().slice(-6)}`;
      reset({
        objektnummer: newObjektnummer,
        kunde_id: "",
        name: "",
        typ: "ferienwohnung",
        strasse: "",
        plz: "",
        ort: "",
        ansprechpartner: "",
        telefon: "",
        notizen: "",
        aktiv: true,
      });
    }
  }, [objekt, reset]);

  const onSubmit = (data: any) => {
    onSave(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {objekt ? "Objekt bearbeiten" : "Neues Objekt anlegen"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="objektnummer">Objektnummer</Label>
              <Input
                id="objektnummer"
                {...register("objektnummer", { required: true })}
                placeholder="O001"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="kunde_id">Kunde *</Label>
              <Select
                value={selectedKundeId}
                onValueChange={(value) => setValue("kunde_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kunde auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {kunden.map((kunde) => (
                    <SelectItem key={kunde.id} value={kunde.id}>
                      {kunde.name}
                      {kunde.firma && ` (${kunde.firma})`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Objektname *</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="z.B. Haus Bergblick"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="typ">Objekttyp *</Label>
              <Select
                value={selectedTyp}
                onValueChange={(value) => setValue("typ", value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Typ auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {objektTypen.map((typ) => (
                    <SelectItem key={typ.value} value={typ.value}>
                      {typ.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-muted-foreground">Adresse</h4>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="strasse">Straße</Label>
                <Input
                  id="strasse"
                  {...register("strasse")}
                  placeholder="Musterstraße 1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="plz">PLZ</Label>
                <Input id="plz" {...register("plz")} placeholder="5020" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="ort">Ort</Label>
                <Input id="ort" {...register("ort")} placeholder="Salzburg" />
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="ansprechpartner">Ansprechpartner</Label>
              <Input
                id="ansprechpartner"
                {...register("ansprechpartner")}
                placeholder="Max Mustermann"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefon">Telefon</Label>
              <Input
                id="telefon"
                {...register("telefon")}
                placeholder="+43 123 456789"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              {...register("notizen")}
              placeholder="Weitere Informationen zum Objekt..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="aktiv"
              checked={watch("aktiv")}
              onCheckedChange={(checked) => setValue("aktiv", checked)}
            />
            <Label htmlFor="aktiv">Objekt ist aktiv</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSaving || !selectedKundeId}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {objekt ? "Speichern" : "Anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
