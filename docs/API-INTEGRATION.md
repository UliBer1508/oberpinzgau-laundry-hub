# API & Integrations-Dokumentation

**Wäscheportal Oberpinzgau** – Integration für Hausverwaltungs-Software

Diese Dokumentation beschreibt die offizielle Partner-Schnittstelle, über die eine Hausverwaltungs-Software Wäschebestellungen anlegen, deren Bearbeitungsstatus abfragen und Rechnungen importieren kann.

> **Empfehlung:** Verwende ausschließlich die hier beschriebenen REST-Endpoints. Direkter DB-Zugriff ist nicht mehr vorgesehen und wird nicht supportet.

---

## Übersicht der Endpoints

| Methode | Endpoint | Zweck |
|---|---|---|
| `POST` | `/functions/v1/external-order-import` | Bestellung anlegen |
| `GET`  | `/functions/v1/external-order-status` | Status & Positionen einer Bestellung abrufen |
| `GET`  | `/functions/v1/external-invoices` | Rechnungen mit Positionen abrufen |

**Basis-URL:** `https://pkpnowevagxmhyqlawng.supabase.co`

---

## Authentifizierung

Alle Partner-Endpoints verwenden denselben HTTP-Header:

```
Authorization: Bearer <PARTNER_TOKEN>
Content-Type: application/json
```

- Den Token erhältst du direkt vom Wäscheportal-Betreiber.
- Der Token ist **pro Hausverwaltung + Kundennummer** ausgestellt. Du siehst ausschließlich Daten zu deiner eigenen Kundennummer (Tenant-Isolation auf Server-Ebene).
- Der Token wird im Backend nur als SHA-256-Hash gespeichert und ist jederzeit ohne Code-Deploy rotierbar.
- Soft-Rate-Limit: **60 Requests/Minute pro Token**, sonst `429 Too Many Requests`.

Fehlt der Header oder ist der Token unbekannt/inaktiv → `401 Unauthorized`.

---

## 1. Bestellung anlegen

```
POST https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-import
```

### Request-Body

```json
{
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
}
```

### Felder

| Feld | Typ | Pflicht | Beschreibung |
|---|---|---|---|
| `kundennummer` | string | ✅ | Kundennummer aus dem Portal (z. B. `K470214`) |
| `objektnummer` | string | – | Objekt, falls bestellung an einem konkreten Objekt erfolgt |
| `gastname` | string | – | Name der Buchung |
| `check_in` | date `YYYY-MM-DD` | – | Anreise |
| `check_out` | date `YYYY-MM-DD` | – | Abreise |
| `anzahl_personen` | int | – | default 1 |
| `lieferdatum` | date | – | default: `check_in - 1` |
| `abholdatum` | date | – | Wunsch-Abholdatum |
| `lieferzeit` / `abholzeit` | string | – | freier Text, z. B. `08:00 - 12:00` |
| `notizen` | string | – | Bemerkungen zur Bestellung |
| `prioritaet` | int | – | `0` = normal, höher = wichtiger |
| `positionen[]` | array | ✅ | mind. 1 Eintrag |
| `positionen[].artikelnummer` | string | ✅ | z. B. `WA001` |
| `positionen[].menge` | int | ✅ | Stückzahl |
| `positionen[].notizen` | string | – | Notiz pro Position |

### Responses

`201 Created`
```json
{ "success": true, "bestellnummer": "B0042", "id": "uuid", "positionen_count": 3 }
```

`400` Validation · `401` Token ungültig · `404` Kunde / Artikel / Objekt nicht gefunden.

### cURL

```bash
curl -X POST 'https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-import' \
  -H 'Authorization: Bearer <PARTNER_TOKEN>' \
  -H 'Content-Type: application/json' \
  -d '{ "kundennummer":"K470214","positionen":[{"artikelnummer":"WA001","menge":6}] }'
```

---

## 2. Bestellstatus abfragen

```
GET https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-status
```

Liefert Status, Buchungsdaten, Positionen und kalkulierten Gesamtpreis einer übermittelten Bestellung.

### Query-Parameter (mind. einer Pflicht)

| Parameter | Typ | Beschreibung |
|---|---|---|
| `bestellnummer` | string | Einzelabfrage, z. B. `B0042` |
| `bestellnummern` | string | CSV, Batch-Abfrage, max. 100 Einträge |

### Status-Werte

`neu` → `in_bearbeitung` → `ausgeliefert` → `abgeholt` → `abgeschlossen` (oder `storniert`)

### Response 200 – Einzelabfrage

```json
{
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
}
```

### Response 200 – Batch

```json
{ "orders": [ /* nur gefundene Bestellungen, in beliebiger Reihenfolge */ ] }
```

Nicht gefundene Bestellnummern werden im Batch-Modus **stillschweigend ausgelassen** – kein Fehlerobjekt pro fehlender Nummer.

### Fehler

| Code | Bedeutung |
|---|---|
| `400` | Weder `bestellnummer` noch `bestellnummern` angegeben |
| `401` | Token fehlt/ungültig |
| `404` | nur bei Einzelabfrage, Bestellung nicht gefunden oder gehört nicht zur Token-Kundennummer |
| `429` | Rate-Limit überschritten |

### Empfohlenes Polling

- **Aktive Bestellungen** (`status` ∈ `neu, in_bearbeitung, ausgeliefert`): alle 10–15 Min.
- **Erledigte Bestellungen**: kein Polling mehr nötig.

### cURL

```bash
# Einzeln
curl -H 'Authorization: Bearer <PARTNER_TOKEN>' \
  'https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-status?bestellnummer=B0042'

# Batch
curl -H 'Authorization: Bearer <PARTNER_TOKEN>' \
  'https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-status?bestellnummern=B0042,B0043,B0044'
```

---

## 3. Rechnungen abrufen

```
GET https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-invoices
```

Liefert Rechnungen samt Positionen für die Token-Kundennummer.

### Query-Parameter (alle optional)

| Parameter | Typ | Default | Beschreibung |
|---|---|---|---|
| `kundennummer` | string | aus Token | wenn gesetzt, **muss** sie der Token-Kundennummer entsprechen, sonst `403` |
| `since` | date `YYYY-MM-DD` | – | nur Rechnungen mit `rechnungsdatum >= since` |
| `status` | string | – | z. B. `offen`, `bezahlt`, `storniert` |
| `limit` | int | 100 | max 500 |

### Response 200

```json
{
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
        {
          "bezeichnung": "Bettwäsche",
          "menge": 12,
          "einzelpreis": 30.00,
          "summe": 360.00,
          "bestellnummer": "B0042"
        }
      ]
    }
  ],
  "count": 1
}
```

- **Sortierung**: nach `rechnungsdatum` absteigend.
- **Leere Liste statt 404**, wenn keine Rechnungen vorhanden.
- `pdf_url` ist aktuell immer `null`. Eine signierte, zeitlich limitierte PDF-URL (1 h gültig) wird in einer Folge-Iteration nachgeliefert.
- `positionen[].bestellnummer` verknüpft die Rechnungsposition mit der ursprünglichen Bestellung.

### Fehler

| Code | Bedeutung |
|---|---|
| `401` | Token fehlt/ungültig |
| `403` | `kundennummer`-Parameter weicht von Token-Kundennummer ab |
| `429` | Rate-Limit überschritten |

### cURL

```bash
curl -H 'Authorization: Bearer <PARTNER_TOKEN>' \
  'https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-invoices?since=2026-01-01&status=offen&limit=100'
```

---

## Empfohlener Integrations-Flow

```
Hausverwaltung                Wäscheportal
     │                              │
     │ POST external-order-import   │
     ├─────────────────────────────▶│  201  { bestellnummer: "B0042" }
     │◀─────────────────────────────┤
     │                              │
     │  ⏱  Polling alle 10 Min      │
     │ GET  external-order-status   │
     ├─────────────────────────────▶│
     │◀─────────────────────────────┤  status: "ausgeliefert"
     │                              │
     │  ⏱  Täglicher Sync           │
     │ GET  external-invoices       │
     ├─────────────────────────────▶│
     │◀─────────────────────────────┤  rechnungen[]
     │                              │
     ▼                              ▼
   In Buchhaltung übernehmen
```

---

## Bekannte Stamm­daten-Konventionen

- **Kundennummer-Format**: `K` + Ziffern (z. B. `K470214`).
- **Objektnummer-Format**: frei (z. B. `OBJ-001`).
- **Artikelnummer-Format**: `WA` + Ziffern (z. B. `WA001`).
- **Bestellnummer-Format**: `B` + 4–13 Ziffern (z. B. `B0042`, `B1778343093471`).
- **Rechnungsnummer-Format**: `R-YYYY-NNNN` (z. B. `R-2026-0042`).
- **Währung**: EUR, **MwSt-Satz**: 20 % (Österreich).

---

## Support

- Token-Anlage / -Rotation: per Mail an den Portal-Betreiber inkl. Kundennummer.
- Test-Aufrufe vor Go-Live empfohlen (z. B. mit einer Test-Bestellnummer).
- Bei Fehlern bitte `request_id` aus den Server-Logs nennen (wird intern pro Aufruf vergeben).
