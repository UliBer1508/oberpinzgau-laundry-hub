import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { BackButton } from "@/components/layout/BackButton";
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
const STATUS_URL = `${SUPABASE_URL}/functions/v1/external-order-status`;
const INVOICES_URL = `${SUPABASE_URL}/functions/v1/external-invoices`;

const STATUS_RESPONSE_EXAMPLE = `{
  "bestellnummer": "B0042",
  "status": "in_bearbeitung",
  "kunde_kundennummer": "K470214",
  "objekt_objektnummer": "OBJ-001",
  "gastname": "Familie Mustermann",
  "check_in": "2026-05-10",
  "check_out": "2026-05-15",
  "anzahl_personen": 4,
  "lieferdatum": "2026-05-09",
  "abholdatum": "2026-05-16",
  "erstellt_am": "2026-05-09T12:34:56Z",
  "aktualisiert_am": "2026-05-10T08:15:00Z",
  "gesamt_preis": 461.00,
  "waehrung": "EUR",
  "positionen": [
    { "artikelnummer": "WA001", "name": "Bettwäsche", "menge": 4, "einzelpreis": 30.00, "summe": 120.00 }
  ]
}`;

const INVOICES_RESPONSE_EXAMPLE = `{
  "rechnungen": [
    {
      "id": "uuid",
      "rechnungsnummer": "R-2026-0042",
      "rechnungsdatum": "2026-04-30",
      "faelligkeitsdatum": "2026-05-30",
      "bezahlt_am": null,
      "status": "offen",
      "nettobetrag": 1200.00,
      "mwst_betrag": 240.00,
      "bruttobetrag": 1440.00,
      "waehrung": "EUR",
      "kunde_kundennummer": "K470214",
      "kunde_name": "Steinbock Chalets",
      "pdf_url": null,
      "positionen": [
        { "bezeichnung": "Bettwäsche", "menge": 12, "einzelpreis": 30.00, "summe": 360.00, "bestellnummer": "B0042" }
      ]
    }
  ],
  "count": 1
}`;

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
            <BackButton />
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

            {/* Bestellstatus abfragen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plug className="h-5 w-5" />
                  Bestellstatus abfragen
                </CardTitle>
                <CardDescription>
                  Status &amp; Positionen einer übermittelten Bestellung abrufen.
                  Auth via Bearer-Token aus <code>partner_api_keys</code> – Mandantentrennung
                  pro Kundennummer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Badge variant="secondary" className="self-start">GET</Badge>
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                    {STATUS_URL}?bestellnummer=B0042
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copy(STATUS_URL, "URL")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-medium">Query-Parameter (mind. einer)</p>
                  <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                    <li><code>bestellnummer</code> – Einzelabfrage, z.B. <code>B0042</code></li>
                    <li><code>bestellnummern</code> – CSV-Liste, max. 100 Einträge (Batch)</li>
                  </ul>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-medium">Status-Werte</p>
                  <p className="text-xs text-muted-foreground">
                    <code>neu</code>, <code>in_bearbeitung</code>, <code>ausgeliefert</code>,
                    <code> abgeholt</code>, <code>abgeschlossen</code>, <code>storniert</code>
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Beispiel-Response (Einzelabfrage)</p>
                    <Button size="sm" variant="outline"
                      onClick={() => copy(STATUS_RESPONSE_EXAMPLE, "Response")}>
                      <Copy className="h-4 w-4 mr-1" /> Kopieren
                    </Button>
                  </div>
                  <pre className="bg-muted text-xs rounded p-3 overflow-x-auto">
                    <code>{STATUS_RESPONSE_EXAMPLE}</code>
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    Batch: <code>{`{ "orders": [ ... ] }`}</code> – nur gefundene Bestellungen.
                  </p>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-medium">Fehler</p>
                  <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                    <li><code>400</code> – kein Query-Parameter angegeben</li>
                    <li><code>401</code> – Token fehlt/ungültig</li>
                    <li><code>404</code> – nur bei Einzelabfrage, Bestellung nicht gefunden</li>
                    <li><code>429</code> – Rate-Limit (60 req/min/Token)</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Rechnungen abrufen */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Rechnungen abrufen
                </CardTitle>
                <CardDescription>
                  Rechnungen samt Positionen für die im Token hinterlegte Kundennummer.
                  Tenant-Isolation: niemals quer.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Badge variant="secondary" className="self-start">GET</Badge>
                  <code className="flex-1 text-xs bg-muted px-3 py-2 rounded break-all">
                    {INVOICES_URL}?since=2026-01-01&amp;status=offen&amp;limit=100
                  </code>
                  <Button size="sm" variant="outline" onClick={() => copy(INVOICES_URL, "URL")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>

                <div className="text-sm space-y-1">
                  <p className="font-medium">Query-Parameter (alle optional)</p>
                  <ul className="list-disc list-inside text-muted-foreground text-xs space-y-0.5">
                    <li><code>kundennummer</code> – wenn gesetzt, muss sie der Token-Kundennummer entsprechen (sonst 403)</li>
                    <li><code>since</code> – ISO-Datum, filtert <code>rechnungsdatum &gt;= since</code></li>
                    <li><code>status</code> – z. B. <code>offen</code>, <code>bezahlt</code>, <code>storniert</code></li>
                    <li><code>limit</code> – default 100, max 500</li>
                  </ul>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Beispiel-Response</p>
                    <Button size="sm" variant="outline"
                      onClick={() => copy(INVOICES_RESPONSE_EXAMPLE, "Response")}>
                      <Copy className="h-4 w-4 mr-1" /> Kopieren
                    </Button>
                  </div>
                  <pre className="bg-muted text-xs rounded p-3 overflow-x-auto">
                    <code>{INVOICES_RESPONSE_EXAMPLE}</code>
                  </pre>
                  <p className="text-xs text-muted-foreground mt-1">
                    Leere Liste statt 404, wenn keine Rechnungen vorhanden.
                    <code>pdf_url</code> kommt in einer Folge-Iteration (signierte URL).
                  </p>
                </div>
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
