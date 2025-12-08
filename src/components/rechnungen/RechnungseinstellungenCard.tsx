import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Pencil } from "lucide-react";
import { formatPreis } from "@/lib/formatPreis";
import { Rechnungseinstellungen } from "@/hooks/useRechnungseinstellungen";
import { Skeleton } from "@/components/ui/skeleton";

interface RechnungseinstellungenCardProps {
  einstellungen: Rechnungseinstellungen | null | undefined;
  isLoading: boolean;
  onEdit: () => void;
}

export function RechnungseinstellungenCard({
  einstellungen,
  isLoading,
  onEdit,
}: RechnungseinstellungenCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Rechnungseinstellungen
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-8">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Rechnungseinstellungen
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Bearbeiten
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-8">
          <div>
            <p className="text-sm text-muted-foreground">MwSt-Satz</p>
            <p className="text-lg font-semibold">
              {einstellungen?.mwst_satz ?? 20}%
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Bearbeitungsgebühr</p>
            <p className="text-lg font-semibold">
              {formatPreis(einstellungen?.bearbeitungsgebuehr ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Zahlungsfrist</p>
            <p className="text-lg font-semibold">
              {einstellungen?.zahlungsfrist_tage ?? 14} Tage
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Mahnfrist</p>
            <p className="text-lg font-semibold">
              {einstellungen?.mahnung_nach_tagen ?? 7} Tage nach Fälligkeit
            </p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Diese Werte werden für alle neuen Rechnungen automatisch verwendet.
        </p>
      </CardContent>
    </Card>
  );
}
