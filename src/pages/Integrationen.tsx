import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Copy, Download, Eye, EyeOff, Check, Plug, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const ENDPOINT_URL = `${SUPABASE_URL}/functions/v1/external-order-import`;

const PAYLOAD_EXAMPLE = `{
  "kundennummer": "K470214",
  "objektnummer": "OBJ-001",
  "gastname": "Familie Mustermann",
  "check_in": "2026-05-10",
  "check_out": "2026-05-15",
  "anzahl_personen": 4,
  "lieferdatum": "2026-05-09",
  "abholdatum": "2026-05-16",
  "lieferzeit": "08:00 - 12:00",
  "abholzeit": "10:00 - 14:00",
  "notizen": "Bitte vor 10:00 anliefern",
  "prioritaet": 0,
  "positionen": [
    { "artikelnummer": "WA001", "menge": 6 },
    { "artikelnummer": "WA002", "menge": 6 },
    { "artikelnummer": "WA003", "menge": 6, "notizen": "weiß" }
  ]
}`;

const fields: Array<{
  name: string;
  type: string;
  required: boolean;
  desc: string;
}> = [
  { name: "kundennummer", type: "string", required: true, desc: "Kundennummer aus der Kundenverwaltung (z.B. K470214)" },
  { name: "objektnummer", type: "string", required: false, desc: "Objektnummer, falls Bestellung an einem konkreten Objekt erfolgt" },
  { name: "gastname", type: "string", required: false, desc: "Name des Gastes/Buchung" },
  { name: "check_in", type: "date (YYYY-MM-DD)", required: false, desc: "Anreisedatum des Gastes" },
  { name: "check_out", type: "date (YYYY-MM-DD)", required: false, desc: "Abreisedatum des Gastes" },
  { name: "anzahl_personen", type: "integer", required: false, desc: "Anzahl Gäste (Standard 1)" },
  { name: "lieferdatum", type: "date (YYYY-MM-DD)", required: false, desc: "Wunsch-Lieferdatum (Standard: check_in - 1 Tag)" },
  { name: "abholdatum", type: "date (YYYY-MM-DD)", required: false, desc: "Wunsch-Abholdatum" },
  { name: "lieferzeit", type: "string", required: false, desc: "Freier Text, z.B. '08:00 - 12:00'" },
  { name: "abholzeit", type: "string", required: false, desc: "Freier Text" },
  { name: "notizen", type: "string", required: false, desc: "Bemerkungen zur Bestellung" },
  { name: "prioritaet", type: "integer", required: false, desc: "0 = normal, höhere Werte = wichtiger" },
  { name: "positionen", type: "array", required: true, desc: "Liste der Positionen, mind. 1 Eintrag" },
  { name: "positionen[].artikelnummer", type: "string", required: true, desc: "Artikelnummer aus den Wäscheartikeln (z.B. WA001)" },
  { name: "positionen[].menge", type: "integer", required: true, desc: "Stückzahl" },
  { name: "positionen[].notizen", type: "string", required: false, desc: "Notiz zur Position" },
];

export default function Integrationen() {
  const { toast } = useToast();
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);
  const [loadingKey, setLoadingKey] = useState(false);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Kopiert", description: `${label} in Zwischenablage kopiert.` });
  };

  const loadApiKey = async () => {
    setLoadingKey(true);
    try {
      const { data, error } = await supabase.functions.invoke("get-external-api-key");
      if (error) throw error;
      if (!data?.configured) {
        toast({
          title: "Kein API-Key konfiguriert",
          description: "EXTERNAL_API_KEY ist nicht gesetzt.",
          variant: "destructive",
        });
        return;
      }
      setApiKey(data.apiKey);
      setShowKey(true);
    } catch (e: any) {
      toast({
        title: "Fehler",
        description: e?.message ?? "API-Key konnte nicht geladen werden.",
        variant: "destructive",
      });
    } finally {
      setLoadingKey(false);
    }
  };

  const curlExample = `curl -X POST '${ENDPOINT_URL}' \\
  -H 'Authorization: Bearer ${apiKey ?? "<EXTERNAL_API_KEY>"}' \\
  -H 'Content-Type: application/json' \\
  -d '${PAYLOAD_EXAMPLE.replace(/\n\s*/g, " ")}'`;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 overflow-x-hidden min-w-0">
          <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-sidebar-border bg-sidebar text-sidebar-foreground px-4 md:px-6">
            <SidebarTrigger className="hidden h-9 w-9 rounded-lg hover:bg-sidebar-accent shrink-0" />
            <div>
              <h1 className="text-xl font-semibold">API & Integrationen</h1>
              <p className="text-sm text-sidebar-foreground/80">
                Schnittstelle zur Hausverwaltung
              </p>
            </div>
            <div />
          </header>

          <div className="p-4 md:p-6 space-y-6 max-w-5xl">
            {/* Übersicht */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Wäschebestellungen automatisch übernehmen
                </CardTitle>
                <CardDescription>
                  Über diese REST-Schnittstelle kann deine Hausverwaltungs-Software
                  Wäschebestellungen direkt anlegen. Stammdaten (Kunden, Objekte,
                  Artikel) werden über ihre Nummern verknüpft.
                </CardDescription>
              </CardHeader>
            </Card>

            {/* Endpoint */}
            <Card>
              <CardHeader>
                <CardTitle>Endpoint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    HTTP-Methode & URL
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Badge variant="secondary" className="self-start">POST</Badge>
                    <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                      {ENDPOINT_URL}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copy(ENDPOINT_URL, "URL")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Authentifizierungs-Header
                  </p>
                  <code className="block text-xs bg-muted px-3 py-2 rounded break-all">
                    Authorization: Bearer{" "}
                    {showKey && apiKey ? apiKey : "<EXTERNAL_API_KEY>"}
                  </code>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {!apiKey ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={loadApiKey}
                        disabled={loadingKey}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        {loadingKey ? "Lädt…" : "API-Key anzeigen"}
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setShowKey(!showKey)}
                        >
                          {showKey ? (
                            <><EyeOff className="h-4 w-4 mr-1" /> Verbergen</>
                          ) : (
                            <><Eye className="h-4 w-4 mr-1" /> Anzeigen</>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copy(apiKey, "API-Key")}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Key kopieren
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs: Payload / Felder / cURL / Antworten */}
            <Card>
              <CardContent className="pt-6">
                <Tabs defaultValue="payload">
                  <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-1 h-auto">
                    <TabsTrigger value="payload">Payload</TabsTrigger>
                    <TabsTrigger value="fields">Felder</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="responses">Antworten</TabsTrigger>
                  </TabsList>

                  <TabsContent value="payload" className="space-y-2">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copy(PAYLOAD_EXAMPLE, "Payload-Beispiel")}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Kopieren
                      </Button>
                    </div>
                    <pre className="bg-muted text-xs rounded p-3 overflow-x-auto">
                      <code>{PAYLOAD_EXAMPLE}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="fields" className="space-y-2">
                    {fields.map((f) => (
                      <div
                        key={f.name}
                        className="rounded-md border bg-card p-3 text-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
                            {f.name}
                          </code>
                          <span className="text-xs text-muted-foreground">
                            {f.type}
                          </span>
                          {f.required ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Pflicht
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-[10px]">
                              Optional
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">{f.desc}</p>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="curl" className="space-y-2">
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copy(curlExample, "cURL-Befehl")}
                      >
                        <Copy className="h-4 w-4 mr-1" /> Kopieren
                      </Button>
                    </div>
                    <pre className="bg-muted text-xs rounded p-3 overflow-x-auto">
                      <code>{curlExample}</code>
                    </pre>
                  </TabsContent>

                  <TabsContent value="responses" className="space-y-3 text-sm">
                    <div className="rounded-md border p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Check className="h-4 w-4 text-green-600" />
                        <span className="font-medium">200 OK – Bestellung angelegt</span>
                      </div>
                      <pre className="bg-muted text-xs rounded p-2 overflow-x-auto">
{`{
  "success": true,
  "bestellnummer": "B0042",
  "bestellung_id": "uuid"
}`}
                      </pre>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="font-medium mb-1">401 Unauthorized</p>
                      <p className="text-muted-foreground text-xs">
                        API-Key fehlt oder ist falsch.
                      </p>
                    </div>
                    <div className="rounded-md border p-3">
                      <p className="font-medium mb-1">400 Validation Error</p>
                      <p className="text-muted-foreground text-xs">
                        Pflichtfelder fehlen oder Kunden-/Artikelnummer existiert nicht.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Downloads */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Vollständige Dokumentation
                </CardTitle>
                <CardDescription>
                  Detaillierte Markdown-Dokumente zum Weitergeben an deine
                  IT/Hausverwaltung.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col sm:flex-row gap-2">
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href="/docs/API-INTEGRATION.md" download>
                    <Download className="h-4 w-4 mr-2" />
                    API-Integration (Markdown)
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full sm:w-auto">
                  <a href="/docs/DIRECT-ACCESS.md" download>
                    <Download className="h-4 w-4 mr-2" />
                    Direkter DB-Zugriff (Markdown)
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
