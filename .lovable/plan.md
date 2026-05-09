# API-Integrationsanleitung in der App bereitstellen

Eine neue Seite **„API & Integrationen"** in der Verwaltung, die die bestehende Schnittstelle zur Hausverwaltung dokumentiert und als Download bereitstellt.

## Was entsteht

### Neue Seite `/integrationen`
Sichtbar im Sidebar-Bereich „Verwaltung" (Resource: `rechnungen` o. ä. Admin-Schutz), enthält:

1. **Übersichtskarte** – kurze Erklärung, was die Schnittstelle macht (Hausverwaltung → Wäschebestellung automatisch anlegen).

2. **Endpoint-Karte**
   - URL `POST {SUPABASE_URL}/functions/v1/external-order-import`
   - Copy-Button für die URL
   - Hinweis auf Header `Authorization: Bearer <EXTERNAL_API_KEY>`
   - Button „API-Key anzeigen/kopieren" (lädt den Key über eine neue, geschützte Edge Function `get-external-api-key` – nur für Admins)

3. **Payload-Beispiel** (JSON, mit Copy-Button)
   - Pflichtfelder hervorgehoben
   - Beispiel mit Buchungsdaten + Positionen

4. **Felder-Tabelle**
   - Feldname, Typ, Pflicht/Optional, Beschreibung
   - Stammdaten-Hinweise (Kundennummer aus `/kunden`, Artikelnummern aus `/waescheartikel`)

5. **cURL-Beispiel** mit Copy-Button.

6. **Antworten** (Erfolg + häufige Fehler 400/401)

7. **Download-Buttons**
   - „Vollständige Doku herunterladen (Markdown)" → liefert `docs/API-INTEGRATION.md`
   - „Direkter DB-Zugriff Doku" → liefert `docs/DIRECT-ACCESS.md`
   Dateien werden nach `public/docs/` kopiert, damit sie im Browser direkt downloadbar sind.

## Technische Details

- **Route**: `/integrationen` in `App.tsx`, gekapselt in `RequireAccess resource="benutzer"` (Admin-only).
- **Sidebar**: neuer Eintrag in `managementNavItems` mit `Plug`/`Webhook`-Icon.
- **Edge Function** `get-external-api-key`: liest `Deno.env.get("EXTERNAL_API_KEY")`, prüft per Service-Role + JWT, ob aufrufender User Admin-Rolle hat, gibt Key zurück. Standardmäßig maskiert in der UI, „Anzeigen"-Toggle.
- **Download**: Markdown-Dateien aus `docs/` werden nach `public/docs/` kopiert; Buttons verwenden `<a download href="/docs/API-INTEGRATION.md">`.
- **Komponenten**: `IntegrationenPage.tsx`, `EndpointCard.tsx`, `PayloadExample.tsx`, `FieldsTable.tsx` (alle in `src/pages/` bzw. `src/components/integrationen/`).
- **UI**: shadcn `Card`, `Tabs` (Übersicht / Payload / Beispiele / Download), `Button` mit Lucide-Icon `Copy`, `Download`, `Eye`. Toast bei Copy-Aktion.
- **Mobile-optimiert** (Karten statt Tabellen, scrollfreie Code-Blöcke mit `overflow-x-auto` nur innerhalb der Code-Box).

## Nicht enthalten

- Kein neues Feature in der Schnittstelle selbst (bleibt unverändert).
- Keine Änderung am `external-order-import`-Endpunkt.
- Keine Änderung an Auth/RLS.
