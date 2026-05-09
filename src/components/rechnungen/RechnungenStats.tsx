import { Card, CardContent } from "@/components/ui/card";
import { FileText, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { formatPreis } from "@/lib/formatPreis";

interface RechnungenStatsProps {
  stats: {
    gesamt: number;
    offen: number;
    bezahlt: number;
    mahnung: number;
    offeneSumme: number;
    bezahlteSumme: number;
  };
}

export function RechnungenStats({ stats }: RechnungenStatsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Gesamt</p>
              <p className="text-2xl font-bold">{stats.gesamt}</p>
            </div>
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Offen</p>
              <p className="text-2xl font-bold">{stats.offen}</p>
              <p className="text-xs text-muted-foreground">{formatPreis(stats.offeneSumme)}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Bezahlt</p>
              <p className="text-2xl font-bold">{stats.bezahlt}</p>
              <p className="text-xs text-muted-foreground">{formatPreis(stats.bezahlteSumme)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Mahnungen</p>
              <p className="text-2xl font-bold">{stats.mahnung}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
