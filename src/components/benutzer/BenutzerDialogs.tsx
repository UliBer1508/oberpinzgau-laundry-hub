import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ALL_ROLES, ROLE_LABEL, type AppRole, useCreateBenutzer } from "@/hooks/useBenutzer";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormValues = {
  email: string;
  password: string;
  name: string;
  role: AppRole;
};

export function BenutzerCreateDialog({ open, onOpenChange }: Props) {
  const create = useCreateBenutzer();
  const { register, handleSubmit, reset, setValue, watch, formState } =
    useForm<FormValues>({
      defaultValues: { email: "", password: "", name: "", role: "kunde" },
    });
  const role = watch("role");

  const onSubmit = (values: FormValues) => {
    create.mutate(values, {
      onSuccess: () => {
        toast.success("Benutzer angelegt");
        reset();
        onOpenChange(false);
      },
      onError: (e: Error) => toast.error(e.message),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Neuer Benutzer</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" {...register("name", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" {...register("email", { required: true })} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              minLength={6}
              {...register("password", { required: true, minLength: 6 })}
            />
          </div>
          <div className="space-y-2">
            <Label>Rolle</Label>
            <Select value={role} onValueChange={(v) => setValue("role", v as AppRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {ROLE_LABEL[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Abbrechen
            </Button>
            <Button type="submit" disabled={create.isPending}>
              {create.isPending ? "Anlegen..." : "Anlegen"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface EditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  benutzer: { id: string; name: string; telefon: string | null } | null;
  onSave: (input: { id: string; name: string; telefon: string | null }) => void;
  isPending: boolean;
}

export function BenutzerEditDialog({ open, onOpenChange, benutzer, onSave, isPending }: EditProps) {
  const [name, setName] = useState("");
  const [telefon, setTelefon] = useState("");

  // Sync when opened
  useState(() => {
    if (benutzer) {
      setName(benutzer.name);
      setTelefon(benutzer.telefon ?? "");
    }
  });

  // reset on open change
  if (open && benutzer && name === "" && telefon === "" && benutzer.name) {
    setName(benutzer.name);
    setTelefon(benutzer.telefon ?? "");
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) {
          setName("");
          setTelefon("");
        }
        onOpenChange(o);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Benutzer bearbeiten</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Telefon</Label>
            <Input value={telefon} onChange={(e) => setTelefon(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button
            disabled={isPending || !benutzer}
            onClick={() =>
              benutzer &&
              onSave({ id: benutzer.id, name: name.trim(), telefon: telefon.trim() || null })
            }
          >
            Speichern
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
