## Plan: Teuni-Vorlagen-Sets + API für Wäscheartikel & Vorlagen-Sets

### Konzept

Zwei klar getrennte Ebenen:
- **Kunden-Sets** (bestehend, `waeschesets`) – objektgebunden, vom Kunden für seine Häuser definiert.
- **Teuni-Vorlagen-Sets** (neu) – zentral von Teuni gepflegte Standard-Sets, **objekt-unabhängig**, abrufbar per API und im Portal als „Vorlage übernehmen" nutzbar.

### 1. Datenbank (neu)

**`waescheset_vorlagen`**
- `id`, `name`, `beschreibung`, `kategorie` (z. B. „Apartment", „Chalet", „Wellness"), `aktiv`, `bild_url` (optional), `created_at`, `updated_at`.

**`waescheset_vorlage_artikel`**
- `id`, `vorlage_id` → `waescheset_vorlagen`, `artikel_id` → `waescheartikel`, `menge`, `berechnungsart` (`pro_buchung` / `pro_gast`).

RLS aus (Dev-State konsistent), `updated_at`-Trigger.

### 2. Verwaltung im Portal

**Neue Seite `/vorlagen-sets`** (Sidebar-Eintrag „Vorlagen-Sets", Admin-Bereich):
- Liste aller Teuni-Vorlagen mit Name, Kategorie, Anzahl Artikel, Aktiv-Toggle.
- Anlegen/Bearbeiten-Dialog wie bestehender Set-Dialog (Artikel-Auswahl, Menge, Berechnungsart) – **ohne Objekt-Auswahl**.
- Aktivierungs-Schalter und Löschen.

**Auf `/waeschesets`** zusätzlicher Button **„Vorlage übernehmen"**:
- Öffnet Dialog mit Liste aller aktiven Teuni-Vorlagen.
- Kunde wählt Vorlage + Zielobjekt → System legt eine Kopie als normales `waeschesets`-Set für dieses Objekt an (Artikel-Positionen werden mitkopiert, danach unabhängig editierbar).

### 3. Neue Edge Functions

**`external-articles`** (GET)
- Auth: `Authorization: Bearer EXTERNAL_API_KEY` (gleiches Schema wie bestehende Endpoints).
- Optional `?aktiv=true` (Default), `?kategorie=...`, `?search=...`.
- Liefert: `artikelnummer`, `name`, `bezeichnung`, `kategorie`, `farbe`, `groesse`, `preis`, `bild_url`, `aktiv`.

**`external-vorlagen-sets`** (GET)
- Gleiche Auth.
- Optional `?aktiv=true`, `?kategorie=...`.
- Liefert pro Vorlage: `id`, `name`, `beschreibung`, `kategorie`, `bild_url`, `positionen[]` mit `artikelnummer`, `name`, `menge`, `berechnungsart`.
- Antwortformat eignet sich direkt zum Anlegen/Übernehmen in der Hausverwaltung des Partners.

Beide Endpoints: CORS, klare 401/400/500-Antworten, Logging in `partner_api_log`-Stil (über bestehende Konvention).

### 4. Integrationen-Seite

In `src/pages/Integrationen.tsx` zwei zusätzliche Endpoint-Karten + Doku-Snippets (cURL + JSON-Beispielantwort) für:
- `GET /functions/v1/external-articles`
- `GET /functions/v1/external-vorlagen-sets`

### Was bleibt unverändert

- Bestehende Endpoints (`external-order-import`, `external-order-status`, `external-invoices`).
- Kunden-Set-Workflow (`waeschesets` an Objekt gebunden).
- Bestellfluss & Berechnungslogik.

### Offene Annahmen

- Vorlagen-Sets sind **nur lesbar** über die API (keine Erstellung durch Partner).
- Sidebar-Eintrag „Vorlagen-Sets" landet im Admin-Bereich (analog Wäscheartikel/Wäschesets).
- Beim „Vorlage übernehmen" wird eine **Kopie** angelegt – Änderungen am Original wirken sich nicht rückwirkend aus.
