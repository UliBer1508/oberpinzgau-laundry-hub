# API & Integrations-Dokumentation

## Wäscheportal Oberpinzgau - Zugriffsdokumentation

Diese Dokumentation beschreibt alle Möglichkeiten, programmgesteuert auf das Wäscheportal zuzugreifen.

---

## 1. Direkte Supabase-Verbindung (Empfohlen für eigene Programme)

### Verbindungsdaten

| Parameter | Wert |
|-----------|------|
| **Supabase URL** | `https://pkpnowevagxmhyqlawng.supabase.co` |
| **Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY` |

### Client-Initialisierung

#### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pkpnowevagxmhyqlawng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY'
);
```

#### Python
```python
from supabase import create_client

supabase = create_client(
    "https://pkpnowevagxmhyqlawng.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY"
)
```

#### C# / .NET
```csharp
using Supabase;

var options = new SupabaseOptions
{
    AutoRefreshToken = true,
    PersistSession = true
};

var client = new Supabase.Client(
    "https://pkpnowevagxmhyqlawng.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY",
    options
);
await client.InitializeAsync();
```

---

## 2. Datenbanktabellen

### Stammdaten

| Tabelle | Beschreibung |
|---------|-------------|
| `kunden` | Kundenstammdaten (Firma, Kontakt, Bestellmodus) |
| `objekte` | Objekte/Unterkünfte der Kunden (Hotels, Ferienwohnungen, etc.) |
| `waescheartikel` | Wäscheartikel-Katalog mit Preisen |
| `waeschesets` | Wäschesets (Artikelzusammenstellungen pro Objekt) |
| `waescheset_artikel` | Artikel innerhalb eines Sets |
| `waeschekraefte` | Personal (Wäschekräfte, Fahrer) |

### Bestellungen

| Tabelle | Beschreibung |
|---------|-------------|
| `waeschebestellungen` | Bestellungen mit Buchungsdaten |
| `bestellpositionen` | Bestellte Artikel pro Bestellung |
| `bestellung_history` | Statusverlauf und Änderungsprotokoll |

### Logistik

| Tabelle | Beschreibung |
|---------|-------------|
| `liefertouren` | Geplante Liefertouren |
| `liefertour_stopps` | Einzelne Stopps einer Tour |
| `routenvorlagen` | Vorlagen für wiederkehrende Routen |
| `routenvorlage_kunden` | Kunden in Routenvorlagen |

### Rechnungen

| Tabelle | Beschreibung |
|---------|-------------|
| `rechnungen` | Rechnungsköpfe |
| `rechnungspositionen` | Rechnungspositionen |
| `rechnungseinstellungen` | Globale Rechnungseinstellungen |

---

## 3. Wichtige Tabellenstrukturen

### kunden
```sql
id              UUID PRIMARY KEY
kundennummer    TEXT NOT NULL (z.B. "K470214")
name            TEXT NOT NULL
firma           TEXT
email           TEXT
telefon         TEXT
strasse         TEXT
plz             TEXT
ort             TEXT
bestellmodus    ENUM ('mit_buchung', 'nur_sets')
bestellart      ENUM ('lieferung', 'abholung', 'beides')
aktiv           BOOLEAN DEFAULT true
```

### objekte
```sql
id              UUID PRIMARY KEY
objektnummer    TEXT NOT NULL (z.B. "O415239")
name            TEXT NOT NULL
kunde_id        UUID REFERENCES kunden(id)
typ             ENUM ('hotel', 'apartmenthaus', 'ferienhaus', 'ferienwohnung')
strasse         TEXT
plz             TEXT
ort             TEXT
ansprechpartner TEXT
telefon         TEXT
aktiv           BOOLEAN DEFAULT true
```

### waescheartikel
```sql
id              UUID PRIMARY KEY
artikelnummer   TEXT NOT NULL (z.B. "WA001")
name            TEXT NOT NULL
bezeichnung     TEXT
kategorie       TEXT ('Bettwäsche', 'Handtücher', 'Wellness', 'Badartikel', 'Küchenartikel')
groesse         TEXT
farbe           TEXT
preis           DECIMAL(10,2)
bild_url        TEXT
aktiv           BOOLEAN DEFAULT true
```

### waeschebestellungen
```sql
id                  UUID PRIMARY KEY
bestellnummer       TEXT NOT NULL (z.B. "B2024-0001")
kunde_id            UUID REFERENCES kunden(id) NOT NULL
objekt_id           UUID REFERENCES objekte(id)
status              ENUM ('neu', 'in_bearbeitung', 'ausgeliefert', 'abgeholt', 'abgeschlossen', 'storniert')
gastname            TEXT
check_in            DATE
check_out           DATE
anzahl_personen     INTEGER DEFAULT 1
lieferdatum         DATE
lieferzeit          TEXT
abholdatum          DATE
abholzeit           TEXT
waeschekraft_id     UUID REFERENCES waeschekraefte(id)
prioritaet          INTEGER DEFAULT 0
bearbeitung_deadline TIMESTAMP WITH TIME ZONE
notizen             TEXT
created_at          TIMESTAMP WITH TIME ZONE
updated_at          TIMESTAMP WITH TIME ZONE
```

### bestellpositionen
```sql
id              UUID PRIMARY KEY
bestellung_id   UUID REFERENCES waeschebestellungen(id) NOT NULL
artikel_id      UUID REFERENCES waescheartikel(id) NOT NULL
menge           INTEGER DEFAULT 1
notizen         TEXT
```

### bestellung_history
```sql
id              UUID PRIMARY KEY
bestellung_id   UUID REFERENCES waeschebestellungen(id) NOT NULL
status          TEXT NOT NULL
bearbeiter_name TEXT
notiz           TEXT
zeitpunkt       TIMESTAMP WITH TIME ZONE DEFAULT now()
```

---

## 4. Bestellung erstellen (Direktzugriff)

### Workflow
1. Bestellung in `waeschebestellungen` erstellen
2. Positionen in `bestellpositionen` hinzufügen
3. History-Eintrag in `bestellung_history` erstellen

### JavaScript/TypeScript Beispiel

```typescript
async function createOrder(orderData: {
  kunde_id: string;
  objekt_id?: string;
  gastname?: string;
  check_in?: string;
  check_out?: string;
  anzahl_personen?: number;
  lieferdatum?: string;
  positionen: Array<{ artikel_id: string; menge: number; notizen?: string }>;
}) {
  // 1. Nächste Bestellnummer generieren
  const { data: lastOrder } = await supabase
    .from('waeschebestellungen')
    .select('bestellnummer')
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  const year = new Date().getFullYear();
  let nextNumber = 1;
  if (lastOrder?.bestellnummer) {
    const match = lastOrder.bestellnummer.match(/B(\d{4})-(\d+)/);
    if (match && parseInt(match[1]) === year) {
      nextNumber = parseInt(match[2]) + 1;
    }
  }
  const bestellnummer = `B${year}-${String(nextNumber).padStart(4, '0')}`;

  // 2. Bestellung erstellen
  const { data: bestellung, error: bestellungError } = await supabase
    .from('waeschebestellungen')
    .insert({
      bestellnummer,
      kunde_id: orderData.kunde_id,
      objekt_id: orderData.objekt_id,
      gastname: orderData.gastname,
      check_in: orderData.check_in,
      check_out: orderData.check_out,
      anzahl_personen: orderData.anzahl_personen || 1,
      lieferdatum: orderData.lieferdatum,
      status: 'neu'
    })
    .select()
    .single();

  if (bestellungError) throw bestellungError;

  // 3. Positionen hinzufügen
  const positionen = orderData.positionen.map(pos => ({
    bestellung_id: bestellung.id,
    artikel_id: pos.artikel_id,
    menge: pos.menge,
    notizen: pos.notizen
  }));

  const { error: positionenError } = await supabase
    .from('bestellpositionen')
    .insert(positionen);

  if (positionenError) throw positionenError;

  // 4. History-Eintrag erstellen
  await supabase
    .from('bestellung_history')
    .insert({
      bestellung_id: bestellung.id,
      status: 'neu',
      bearbeiter_name: 'Externes System',
      notiz: 'Bestellung erstellt via Direktzugriff'
    });

  return bestellung;
}
```

### Python Beispiel

```python
from datetime import datetime

async def create_order(order_data):
    # 1. Nächste Bestellnummer generieren
    result = supabase.table('waeschebestellungen') \
        .select('bestellnummer') \
        .order('created_at', desc=True) \
        .limit(1) \
        .execute()
    
    year = datetime.now().year
    next_number = 1
    if result.data:
        import re
        match = re.match(r'B(\d{4})-(\d+)', result.data[0]['bestellnummer'])
        if match and int(match.group(1)) == year:
            next_number = int(match.group(2)) + 1
    
    bestellnummer = f"B{year}-{next_number:04d}"
    
    # 2. Bestellung erstellen
    bestellung = supabase.table('waeschebestellungen').insert({
        'bestellnummer': bestellnummer,
        'kunde_id': order_data['kunde_id'],
        'objekt_id': order_data.get('objekt_id'),
        'gastname': order_data.get('gastname'),
        'check_in': order_data.get('check_in'),
        'check_out': order_data.get('check_out'),
        'anzahl_personen': order_data.get('anzahl_personen', 1),
        'lieferdatum': order_data.get('lieferdatum'),
        'status': 'neu'
    }).execute()
    
    bestellung_id = bestellung.data[0]['id']
    
    # 3. Positionen hinzufügen
    positionen = [{
        'bestellung_id': bestellung_id,
        'artikel_id': pos['artikel_id'],
        'menge': pos['menge'],
        'notizen': pos.get('notizen')
    } for pos in order_data['positionen']]
    
    supabase.table('bestellpositionen').insert(positionen).execute()
    
    # 4. History-Eintrag
    supabase.table('bestellung_history').insert({
        'bestellung_id': bestellung_id,
        'status': 'neu',
        'bearbeiter_name': 'Externes System',
        'notiz': 'Bestellung erstellt via Direktzugriff'
    }).execute()
    
    return bestellung.data[0]
```

---

## 5. Stammdaten abfragen

### Aktive Kunden abrufen
```typescript
const { data: kunden } = await supabase
  .from('kunden')
  .select('id, kundennummer, name, firma, bestellmodus')
  .eq('aktiv', true)
  .order('name');
```

### Objekte eines Kunden
```typescript
const { data: objekte } = await supabase
  .from('objekte')
  .select('id, objektnummer, name, typ')
  .eq('kunde_id', kundeId)
  .eq('aktiv', true);
```

### Wäscheartikel-Katalog
```typescript
const { data: artikel } = await supabase
  .from('waescheartikel')
  .select('id, artikelnummer, name, bezeichnung, kategorie, groesse, farbe, preis')
  .eq('aktiv', true)
  .order('artikelnummer');
```

### Wäscheset mit Artikeln
```typescript
const { data: sets } = await supabase
  .from('waeschesets')
  .select(`
    id, name, beschreibung,
    waescheset_artikel (
      menge,
      berechnungsart,
      waescheartikel (id, artikelnummer, name, preis)
    )
  `)
  .eq('objekt_id', objektId)
  .eq('aktiv', true);
```

---

## 6. External API (für Drittanbieter)

Für externe Programme, die keinen direkten Datenbankzugriff haben sollen, steht eine REST API zur Verfügung.

### Endpoint

| Parameter | Wert |
|-----------|------|
| **URL** | `https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-import` |
| **Methode** | `POST` |
| **Content-Type** | `application/json` |

### Authentifizierung

```
Authorization: Bearer DEIN_EXTERNAL_API_KEY
```

Der API-Key wird als Supabase Secret `EXTERNAL_API_KEY` konfiguriert.

### Request-Body

```json
{
  "kundennummer": "K470214",
  "objektnummer": "O415239",
  "gastname": "Max Mustermann",
  "check_in": "2024-07-15",
  "check_out": "2024-07-22",
  "anzahl_personen": 4,
  "lieferdatum": "2024-07-14",
  "abholdatum": "2024-07-22",
  "notizen": "Bitte am Nachmittag liefern",
  "positionen": [
    {
      "artikelnummer": "WA001",
      "menge": 2,
      "notizen": "Für Doppelbett"
    },
    {
      "artikelnummer": "WA005",
      "menge": 8
    }
  ]
}
```

### Pflichtfelder

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `kundennummer` | string | Kundennummer (z.B. "K470214") |
| `positionen` | array | Min. 1 Position erforderlich |
| `positionen[].artikelnummer` | string | Artikelnummer (z.B. "WA001") |
| `positionen[].menge` | number | Menge (min. 1) |

### Optionale Felder

| Feld | Typ | Beschreibung |
|------|-----|-------------|
| `objektnummer` | string | Objektnummer |
| `gastname` | string | Name des Gastes |
| `check_in` | string | Check-in Datum (YYYY-MM-DD) |
| `check_out` | string | Check-out Datum (YYYY-MM-DD) |
| `anzahl_personen` | number | Anzahl Personen (Default: 1) |
| `lieferdatum` | string | Lieferdatum (YYYY-MM-DD) |
| `abholdatum` | string | Abholdatum (YYYY-MM-DD) |
| `notizen` | string | Zusätzliche Notizen |

### Response (Erfolg - HTTP 201)

```json
{
  "success": true,
  "bestellung": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "bestellnummer": "B2024-0042",
    "status": "neu",
    "created_at": "2024-07-10T14:30:00Z"
  },
  "message": "Bestellung B2024-0042 erfolgreich erstellt"
}
```

### cURL Beispiel

```bash
curl -X POST \
  'https://pkpnowevagxmhyqlawng.supabase.co/functions/v1/external-order-import' \
  -H 'Authorization: Bearer DEIN_API_KEY' \
  -H 'Content-Type: application/json' \
  -d '{
    "kundennummer": "K470214",
    "objektnummer": "O415239",
    "gastname": "Max Mustermann",
    "check_in": "2024-07-15",
    "check_out": "2024-07-22",
    "anzahl_personen": 4,
    "lieferdatum": "2024-07-14",
    "positionen": [
      {"artikelnummer": "WA001", "menge": 2},
      {"artikelnummer": "WA005", "menge": 8}
    ]
  }'
```

---

## 7. Sicherheitshinweise

### Aktueller Status (Entwicklung)

⚠️ **Row Level Security (RLS) ist derzeit DEAKTIVIERT**

- Der Anon Key hat vollen Lese-/Schreibzugriff auf alle Tabellen
- Dies ist nur für die Entwicklungsphase gedacht

### Vor Produktivbetrieb

Vor dem Go-Live müssen folgende Maßnahmen umgesetzt werden:

1. **RLS aktivieren** auf allen Tabellen
2. **Policies definieren** für Benutzerrollen (Admin, Wäschekraft, Kunde)
3. **Service Role Key** nur serverseitig verwenden
4. **API-Keys** regelmäßig rotieren
5. **HTTPS** für alle Verbindungen erzwingen

---

## 8. Enums und Standardwerte

### bestellung_status
- `neu` - Neue Bestellung
- `in_bearbeitung` - In Bearbeitung
- `ausgeliefert` - Ausgeliefert
- `abgeholt` - Abgeholt
- `abgeschlossen` - Abgeschlossen
- `storniert` - Storniert

### objekt_typ
- `hotel`
- `apartmenthaus`
- `ferienhaus`
- `ferienwohnung`

### bestellmodus
- `mit_buchung` - Mit Buchungsdaten (Gast, Check-in/out)
- `nur_sets` - Nur Wäschesets ohne Buchungsdaten

### bestellart
- `lieferung` - Nur Lieferung
- `abholung` - Nur Abholung
- `beides` - Lieferung und Abholung

### berechnungsart (für Wäscheset-Artikel)
- `pro_buchung` - Menge gilt pro Buchung
- `pro_gast` - Menge wird mit Gästezahl multipliziert

### mitarbeiter_typ
- `waeschekraft` - Nur Wäschebearbeitung
- `fahrer` - Nur Lieferung
- `beides` - Beide Rollen

---

*Dokumentation erstellt: Dezember 2024*
*Version: 1.0*
