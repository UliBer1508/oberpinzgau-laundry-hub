import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useWaeschekraefteForSelect } from "@/hooks/useBestellungen";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ArbeitsauftragErstellenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type OffeneBestellung = {
  id: string;
  bestellnummer: string;
  lieferdatum: string | null;
  kunde: { name: string } | null;
};

export function ArbeitsauftragErstellenDialog({
  open,
  onOpenChange,
}: ArbeitsauftragErstellenDialogProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [bestellungId, setBestellungId] = useState<string>("");
  const [waeschekraftId, setWaeschekraftId] = useState<string>("");
  const [prioritaet, setPrioritaet] = useState<string>("0");
  const [deadline, setDeadline] = useState<Date | undefined>(undefined);

  const { data: bestellungen = [], isLoading: loadingBestellungen } = useQuery({
    queryKey: ["offene-bestellungen-fuer-arbeitsauftrag"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("waeschebestellungen")
        .select("id, bestellnummer, lieferdatum, kunde:kunden(name)")
        .eq("status", "neu")
        .is("waeschekraft_id", null)
        .order("lieferdatum", { ascending: true, nullsFirst: false });
      if (error) throw error;
      return (data || []) as unknown as OffeneBestellung[];
    },
    enabled: open,
  });

  const { data: waeschekraefte = [] } = useWaeschekraefteForSelect();

  const reset = () => {
    setBestellungId("");
    setWaeschekraftId("");
    setPrioritaet("0");
    setDeadline(undefined);
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (!bestellungId || !waeschekraftId) {
        throw new Error("Bestellung und Wäschekraft auswählen");
      }
      const update = {
        waeschekraft_id: waeschekraftId,
        status: "in_bearbeitung" as const,
        prioritaet: parseInt(prioritaet, 10) || 0,
        ...(deadline ? { bearbeitung_deadline: deadline.toISOString() } : {}),
      };

      const { error } = await supabase
        .from("waeschebestellungen")
        .update(update)
        .eq("id", bestellungId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Arbeitsauftrag erstellt");
      queryClient.invalidateQueries({ queryKey: ["bestellungen"] });
      queryClient.invalidateQueries({ queryKey: ["management-bestellungen"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      queryClient.invalidateQueries({ queryKey: ["offene-bestellungen-fuer-arbeitsauftrag"] });
      reset();
      onOpenChange(false);
      navigate("/bestellungen/management");
    },
    onError: (err: Error) => {
      toast.error(err.message || "Fehler beim Erstellen");
    },
  });

  const selectedBestellung = useMemo(
    () => bestellungen.find((b) => b.id === bestellungId),
    [bestellungen, bestellungId],
  );

  const canSubmit = !!bestellungId && !!waeschekraftId && !mutation.isPending;
  const noOffeneBestellungen = !loadingBestellungen && bestellungen.length === 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Arbeitsauftrag erstellen</DialogTitle>
          <DialogDescription>
            Bestellung auswählen und einer Wäschekraft zuweisen.
          </DialogDescription>
        </DialogHeader>

        {noOffeneBestellungen ? (
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">
              Keine offenen Bestellungen ohne Zuweisung vorhanden.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                navigate("/bestellungen?neu=1");
              }}
            >
              Neue Bestellung erstellen
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Bestellung *</Label>
              <Select value={bestellungId} onValueChange={setBestellungId} disabled={loadingBestellungen}>
                <SelectTrigger>
                  <SelectValue placeholder={loadingBestellungen ? "Lade…" : "Bestellung wählen"} />
                </SelectTrigger>
                <SelectContent>
                  {bestellungen.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.bestellnummer} · {b.kunde?.name ?? "—"}
                      {b.lieferdatum ? ` · ${format(new Date(b.lieferdatum), "dd.MM.yyyy", { locale: de })}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Wäschekraft *</Label>
              <Select value={waeschekraftId} onValueChange={setWaeschekraftId}>
                <SelectTrigger>
                  <SelectValue placeholder="Wäschekraft wählen" />
                </SelectTrigger>
                <SelectContent>
                  {waeschekraefte.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priorität</Label>
              <Select value={prioritaet} onValueChange={setPrioritaet}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">⚪ Normal</SelectItem>
                  <SelectItem value="1">🟡 Hoch</SelectItem>
                  <SelectItem value="2">🔴 Dringend</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Bearbeitung bis (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !deadline && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {deadline ? format(deadline, "dd.MM.yyyy", { locale: de }) : "Kein Datum"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={deadline} onSelect={setDeadline} locale={de} />
                </PopoverContent>
              </Popover>
              {deadline && (
                <Button variant="ghost" size="sm" onClick={() => setDeadline(undefined)}>
                  Datum entfernen
                </Button>
              )}
            </div>

            {selectedBestellung?.lieferdatum && (
              <p className="text-xs text-muted-foreground">
                Lieferdatum dieser Bestellung:{" "}
                {format(new Date(selectedBestellung.lieferdatum), "EEEE, dd.MM.yyyy", { locale: de })}
              </p>
            )}
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          {!noOffeneBestellungen && (
            <Button onClick={() => mutation.mutate()} disabled={!canSubmit}>
              {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Arbeitsauftrag erstellen
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
