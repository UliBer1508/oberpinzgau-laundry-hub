# Wäscheportal Oberpinzgau - Direktzugriff Dokumentation

Diese Dokumentation beschreibt den vollständigen Direktzugriff auf die Supabase-Datenbank für externe Systeme und Integrationen.

---

## Inhaltsverzeichnis

1. [Verbindung & Initialisierung](#1-verbindung--initialisierung)
2. [Stammdaten: Kunden](#2-stammdaten-kunden)
3. [Stammdaten: Objekte](#3-stammdaten-objekte)
4. [Stammdaten: Wäscheartikel](#4-stammdaten-wäscheartikel)
5. [Wäschesets](#5-wäschesets)
6. [Bestellungen](#6-bestellungen)
7. [Bestellpositionen](#7-bestellpositionen)
8. [Bestellhistorie](#8-bestellhistorie)
9. [Liefertouren](#9-liefertouren)
10. [Wäschekräfte / Personal](#10-wäschekräfte--personal)
11. [Rechnungen](#11-rechnungen)
12. [Realtime-Subscriptions](#12-realtime-subscriptions)
13. [Fehlerbehandlung](#13-fehlerbehandlung)
14. [Best Practices](#14-best-practices)

---

## 1. Verbindung & Initialisierung

### Verbindungsdaten

```
SUPABASE_URL: https://pkpnowevagxmhyqlawng.supabase.co
SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrcG5vd2V2YWd4bWh5cWxhd25nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMzE5OTUsImV4cCI6MjA4MDYwNzk5NX0.yHgZOQg24yzUGTNaQnOOJK4QwWEeSfr7MgQUpq88UTY
```

### JavaScript/TypeScript

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://pkpnowevagxmhyqlawng.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';

const supabase = createClient(supabaseUrl, supabaseKey);

// Verbindungstest
async function testConnection() {
  const { data, error } = await supabase
    .from('kunden')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Verbindungsfehler:', error.message);
    return false;
  }
  console.log('Verbindung erfolgreich!');
  return true;
}
```

### Python

```python
from supabase import create_client, Client

url = "https://pkpnowevagxmhyqlawng.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

supabase: Client = create_client(url, key)

# Verbindungstest
def test_connection():
    try:
        response = supabase.table("kunden").select("id").limit(1).execute()
        print("Verbindung erfolgreich!")
        return True
    except Exception as e:
        print(f"Verbindungsfehler: {e}")
        return False
```

### C#

```csharp
using Supabase;
using Supabase.Gotrue;

var url = "https://pkpnowevagxmhyqlawng.supabase.co";
var key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

var options = new SupabaseOptions
{
    AutoRefreshToken = true,
    AutoConnectRealtime = true
};

var supabase = new Supabase.Client(url, key, options);
await supabase.InitializeAsync();

// Verbindungstest
var response = await supabase.From<Kunde>().Get();
Console.WriteLine($"Verbindung erfolgreich! {response.Models.Count} Kunden gefunden.");
```

---

## 2. Stammdaten: Kunden

### Tabellenstruktur: `kunden`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| kundennummer | text | Nein | Eindeutige Kundennummer (z.B. "K001") |
| name | text | Nein | Kundenname |
| firma | text | Ja | Firmenname |
| strasse | text | Ja | Straße und Hausnummer |
| plz | text | Ja | Postleitzahl |
| ort | text | Ja | Stadt/Ort |
| telefon | text | Ja | Telefonnummer |
| email | text | Ja | E-Mail-Adresse |
| bestellmodus | enum | Nein | 'mit_buchung' oder 'nur_sets' |
| bestellart | enum | Ja | 'lieferung', 'abholung' oder 'beides' |
| anlieferadresse | text | Ja | Abweichende Lieferadresse |
| notizen | text | Ja | Interne Notizen |
| aktiv | boolean | Ja | Status (Standard: true) |
| created_at | timestamp | Nein | Erstellungszeitpunkt |
| updated_at | timestamp | Nein | Letztes Update |

### 2.1 Alle Kunden abrufen

**JavaScript/TypeScript:**
```typescript
// Alle aktiven Kunden
const { data: kunden, error } = await supabase
  .from('kunden')
  .select('*')
  .eq('aktiv', true)
  .order('name', { ascending: true });

// Mit Paginierung (10 pro Seite, Seite 1)
const { data, error, count } = await supabase
  .from('kunden')
  .select('*', { count: 'exact' })
  .range(0, 9)  // Erste 10 Einträge
  .order('created_at', { ascending: false });
```

**Python:**
```python
# Alle aktiven Kunden
response = supabase.table("kunden") \
    .select("*") \
    .eq("aktiv", True) \
    .order("name") \
    .execute()

kunden = response.data

# Mit Paginierung
response = supabase.table("kunden") \
    .select("*", count="exact") \
    .range(0, 9) \
    .execute()

total_count = response.count
```

**C#:**
```csharp
// Model-Klasse
public class Kunde
{
    public Guid Id { get; set; }
    public string Kundennummer { get; set; }
    public string Name { get; set; }
    public string? Firma { get; set; }
    public string? Strasse { get; set; }
    public string? Plz { get; set; }
    public string? Ort { get; set; }
    public string? Telefon { get; set; }
    public string? Email { get; set; }
    public string Bestellmodus { get; set; }
    public string? Bestellart { get; set; }
    public bool Aktiv { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

// Abfrage
var response = await supabase.From<Kunde>()
    .Filter("aktiv", Postgrest.Constants.Operator.Equals, true)
    .Order("name", Postgrest.Constants.Ordering.Ascending)
    .Get();

var kunden = response.Models;
```

### 2.2 Einzelnen Kunden abrufen

**JavaScript/TypeScript:**
```typescript
// Per ID
const { data: kunde, error } = await supabase
  .from('kunden')
  .select('*')
  .eq('id', 'uuid-hier')
  .single();

// Per Kundennummer
const { data: kunde, error } = await supabase
  .from('kunden')
  .select('*')
  .eq('kundennummer', 'K001')
  .single();
```

**Python:**
```python
# Per ID
response = supabase.table("kunden") \
    .select("*") \
    .eq("id", "uuid-hier") \
    .single() \
    .execute()

kunde = response.data

# Per Kundennummer
response = supabase.table("kunden") \
    .select("*") \
    .eq("kundennummer", "K001") \
    .single() \
    .execute()
```

### 2.3 Kunde mit Objekten (JOIN)

**JavaScript/TypeScript:**
```typescript
// Kunde mit allen zugehörigen Objekten
const { data: kunde, error } = await supabase
  .from('kunden')
  .select(`
    *,
    objekte (
      id,
      name,
      objektnummer,
      typ,
      strasse,
      plz,
      ort,
      aktiv
    )
  `)
  .eq('id', 'uuid-hier')
  .single();

// Zugriff auf Objekte:
// kunde.objekte[0].name
```

**Python:**
```python
response = supabase.table("kunden") \
    .select("*, objekte(id, name, objektnummer, typ, aktiv)") \
    .eq("id", "uuid-hier") \
    .single() \
    .execute()

kunde = response.data
objekte = kunde.get("objekte", [])
```

### 2.4 Kunden suchen und filtern

**JavaScript/TypeScript:**
```typescript
// Textsuche in Name oder Firma
const { data, error } = await supabase
  .from('kunden')
  .select('*')
  .or('name.ilike.%suchbegriff%,firma.ilike.%suchbegriff%');

// Kombinierte Filter
const { data, error } = await supabase
  .from('kunden')
  .select('*')
  .eq('aktiv', true)
  .eq('bestellmodus', 'mit_buchung')
  .ilike('ort', '%Salzburg%');

// Kunden ohne Objekte
const { data: alleKunden } = await supabase
  .from('kunden')
  .select('id');

const { data: kundenMitObjekten } = await supabase
  .from('objekte')
  .select('kunde_id');

const kundenIdsOhneObjekte = alleKunden
  .filter(k => !kundenMitObjekten.some(o => o.kunde_id === k.id));
```

**Python:**
```python
# Textsuche
response = supabase.table("kunden") \
    .select("*") \
    .or_("name.ilike.%suchbegriff%,firma.ilike.%suchbegriff%") \
    .execute()

# Nach Ort filtern
response = supabase.table("kunden") \
    .select("*") \
    .eq("aktiv", True) \
    .ilike("ort", "%Salzburg%") \
    .execute()
```

### 2.5 Neuen Kunden erstellen

**JavaScript/TypeScript:**
```typescript
const neuerKunde = {
  kundennummer: 'K042',
  name: 'Max Mustermann',
  firma: 'Hotel Alpenblick',
  strasse: 'Bergstraße 15',
  plz: '5730',
  ort: 'Mittersill',
  telefon: '+43 6562 12345',
  email: 'info@hotel-alpenblick.at',
  bestellmodus: 'mit_buchung',
  bestellart: 'beides',
  notizen: 'Premium-Kunde',
  aktiv: true
};

const { data, error } = await supabase
  .from('kunden')
  .insert(neuerKunde)
  .select()
  .single();

if (error) {
  console.error('Fehler beim Erstellen:', error.message);
} else {
  console.log('Kunde erstellt mit ID:', data.id);
}
```

**Python:**
```python
neuer_kunde = {
    "kundennummer": "K042",
    "name": "Max Mustermann",
    "firma": "Hotel Alpenblick",
    "strasse": "Bergstraße 15",
    "plz": "5730",
    "ort": "Mittersill",
    "telefon": "+43 6562 12345",
    "email": "info@hotel-alpenblick.at",
    "bestellmodus": "mit_buchung",
    "bestellart": "beides",
    "aktiv": True
}

response = supabase.table("kunden").insert(neuer_kunde).execute()
kunde_id = response.data[0]["id"]
print(f"Kunde erstellt mit ID: {kunde_id}")
```

**C#:**
```csharp
var neuerKunde = new Kunde
{
    Kundennummer = "K042",
    Name = "Max Mustermann",
    Firma = "Hotel Alpenblick",
    Strasse = "Bergstraße 15",
    Plz = "5730",
    Ort = "Mittersill",
    Email = "info@hotel-alpenblick.at",
    Bestellmodus = "mit_buchung",
    Aktiv = true
};

var response = await supabase.From<Kunde>().Insert(neuerKunde);
var erstellterKunde = response.Models.First();
```

### 2.6 Kunden aktualisieren

**JavaScript/TypeScript:**
```typescript
const updates = {
  telefon: '+43 6562 99999',
  email: 'neu@hotel-alpenblick.at',
  notizen: 'Aktualisierte Kontaktdaten'
};

const { data, error } = await supabase
  .from('kunden')
  .update(updates)
  .eq('id', 'uuid-hier')
  .select()
  .single();
```

**Python:**
```python
updates = {
    "telefon": "+43 6562 99999",
    "email": "neu@hotel-alpenblick.at"
}

response = supabase.table("kunden") \
    .update(updates) \
    .eq("id", "uuid-hier") \
    .execute()
```

### 2.7 Kunden deaktivieren

```typescript
// Soft-Delete (empfohlen)
const { error } = await supabase
  .from('kunden')
  .update({ aktiv: false })
  .eq('id', 'uuid-hier');

// ACHTUNG: Hard-Delete löscht auch alle verknüpften Objekte!
// Nur verwenden wenn wirklich nötig
const { error } = await supabase
  .from('kunden')
  .delete()
  .eq('id', 'uuid-hier');
```

### 2.8 Nächste Kundennummer generieren

**JavaScript/TypeScript:**
```typescript
async function generateNextKundennummer(): Promise<string> {
  const { data, error } = await supabase
    .from('kunden')
    .select('kundennummer')
    .order('kundennummer', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return 'K001';
  }

  const lastNumber = data[0].kundennummer;
  const numberPart = parseInt(lastNumber.replace('K', ''), 10);
  const nextNumber = numberPart + 1;
  
  return `K${nextNumber.toString().padStart(3, '0')}`;
}

// Verwendung
const nextKundennummer = await generateNextKundennummer();
// Ergebnis: "K043" (wenn letzte "K042" war)
```

---

## 3. Stammdaten: Objekte

### Tabellenstruktur: `objekte`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| kunde_id | uuid | Nein | Fremdschlüssel zu kunden |
| objektnummer | text | Nein | Eindeutige Objektnummer (z.B. "O001") |
| name | text | Nein | Objektname |
| typ | enum | Nein | 'hotel', 'apartmenthaus', 'ferienhaus', 'ferienwohnung' |
| strasse | text | Ja | Straße |
| plz | text | Ja | PLZ |
| ort | text | Ja | Ort |
| ansprechpartner | text | Ja | Kontaktperson |
| telefon | text | Ja | Telefon |
| notizen | text | Ja | Interne Notizen |
| aktiv | boolean | Ja | Status |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Objekttypen (Enum)

```typescript
type ObjektTyp = 'hotel' | 'apartmenthaus' | 'ferienhaus' | 'ferienwohnung';
```

### 3.1 Objekte eines Kunden abrufen

**JavaScript/TypeScript:**
```typescript
const { data: objekte, error } = await supabase
  .from('objekte')
  .select('*')
  .eq('kunde_id', 'kunde-uuid')
  .eq('aktiv', true)
  .order('name');
```

**Python:**
```python
response = supabase.table("objekte") \
    .select("*") \
    .eq("kunde_id", "kunde-uuid") \
    .eq("aktiv", True) \
    .order("name") \
    .execute()

objekte = response.data
```

### 3.2 Objekt mit Kundendaten

**JavaScript/TypeScript:**
```typescript
const { data: objekt, error } = await supabase
  .from('objekte')
  .select(`
    *,
    kunden (
      id,
      name,
      firma,
      kundennummer
    )
  `)
  .eq('id', 'objekt-uuid')
  .single();

// Zugriff:
// objekt.kunden.name
// objekt.kunden.firma
```

### 3.3 Alle Objekte mit Kundeninfo

```typescript
const { data: objekte, error } = await supabase
  .from('objekte')
  .select(`
    id,
    name,
    objektnummer,
    typ,
    ort,
    aktiv,
    kunden!inner (
      id,
      name,
      firma,
      kundennummer
    )
  `)
  .eq('aktiv', true)
  .order('name');

// Ergebnis-Struktur:
// [
//   {
//     id: "...",
//     name: "Ferienhaus Nordsee",
//     objektnummer: "O001",
//     typ: "ferienhaus",
//     kunden: {
//       id: "...",
//       name: "Müller",
//       firma: "Müller GmbH"
//     }
//   }
// ]
```

### 3.4 Objekt erstellen

**JavaScript/TypeScript:**
```typescript
const neuesObjekt = {
  kunde_id: 'kunde-uuid',
  objektnummer: 'O015',
  name: 'Bergchalet Sonnblick',
  typ: 'ferienhaus',
  strasse: 'Almweg 5',
  plz: '5741',
  ort: 'Neukirchen',
  ansprechpartner: 'Frau Huber',
  telefon: '+43 664 1234567',
  aktiv: true
};

const { data, error } = await supabase
  .from('objekte')
  .insert(neuesObjekt)
  .select()
  .single();
```

### 3.5 Nächste Objektnummer generieren

```typescript
async function generateNextObjektnummer(): Promise<string> {
  const { data } = await supabase
    .from('objekte')
    .select('objektnummer')
    .order('objektnummer', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return 'O001';
  }

  const lastNumber = data[0].objektnummer;
  const numberPart = parseInt(lastNumber.replace('O', ''), 10);
  
  return `O${(numberPart + 1).toString().padStart(3, '0')}`;
}
```

---

## 4. Stammdaten: Wäscheartikel

### Tabellenstruktur: `waescheartikel`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| artikelnummer | text | Nein | Eindeutige Artikelnummer (z.B. "WA001") |
| name | text | Nein | Artikelname |
| bezeichnung | text | Ja | Ausführliche Bezeichnung |
| kategorie | text | Ja | Kategorie (siehe unten) |
| groesse | text | Ja | Größe (z.B. "180x200 cm") |
| farbe | text | Ja | Farbe (siehe unten) |
| preis | decimal | Ja | Preis in Euro |
| bild_url | text | Ja | URL zum Artikelbild |
| aktiv | boolean | Ja | Status |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Kategorien (erlaubte Werte)

```typescript
type ArtikelKategorie = 
  | 'Bettwäsche'      // Bettbezüge, Laken, Kopfkissen
  | 'Handtücher'      // Hand-, Dusch-, Badetücher
  | 'Wellness'        // Bademäntel, Saunatücher
  | 'Badartikel'      // Badematten, Duschvorleger
  | 'Küchenartikel';  // Geschirrtücher, Schürzen
```

### Farben (erlaubte Werte)

```typescript
type ArtikelFarbe = 
  | 'Weiß'
  | 'Weiß gestreift'
  | 'Grau'
  | 'Grau gestreift'
  | 'Braun'
  | 'Bunt';
```

### 4.1 Alle Artikel abrufen

**JavaScript/TypeScript:**
```typescript
const { data: artikel, error } = await supabase
  .from('waescheartikel')
  .select('*')
  .eq('aktiv', true)
  .order('kategorie')
  .order('name');
```

### 4.2 Artikel nach Kategorie

```typescript
const { data: bettwaesche, error } = await supabase
  .from('waescheartikel')
  .select('*')
  .eq('kategorie', 'Bettwäsche')
  .eq('aktiv', true)
  .order('name');
```

### 4.3 Artikel mit Preisen

```typescript
// Nur Artikel mit Preis
const { data, error } = await supabase
  .from('waescheartikel')
  .select('id, artikelnummer, name, kategorie, groesse, farbe, preis')
  .eq('aktiv', true)
  .not('preis', 'is', null)
  .order('preis', { ascending: true });
```

### 4.4 Artikel suchen

```typescript
const suchbegriff = 'Handtuch';

const { data, error } = await supabase
  .from('waescheartikel')
  .select('*')
  .eq('aktiv', true)
  .or(`name.ilike.%${suchbegriff}%,bezeichnung.ilike.%${suchbegriff}%`);
```

### 4.5 Artikel erstellen

```typescript
const neuerArtikel = {
  artikelnummer: 'WA025',
  name: 'Duschtuch Premium',
  bezeichnung: 'Flauschiges Duschtuch aus ägyptischer Baumwolle',
  kategorie: 'Handtücher',
  groesse: '70x140 cm',
  farbe: 'Weiß',
  preis: 3.50,
  aktiv: true
};

const { data, error } = await supabase
  .from('waescheartikel')
  .insert(neuerArtikel)
  .select()
  .single();
```

### 4.6 Nächste Artikelnummer

```typescript
async function generateNextArtikelnummer(): Promise<string> {
  const { data } = await supabase
    .from('waescheartikel')
    .select('artikelnummer')
    .like('artikelnummer', 'WA%')
    .order('artikelnummer', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return 'WA001';
  }

  const lastNumber = data[0].artikelnummer;
  const numberPart = parseInt(lastNumber.replace('WA', ''), 10);
  
  return `WA${(numberPart + 1).toString().padStart(3, '0')}`;
}
```

---

## 5. Wäschesets

### Tabellenstruktur: `waeschesets`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| objekt_id | uuid | Nein | Fremdschlüssel zu objekte |
| name | text | Nein | Set-Name |
| beschreibung | text | Ja | Beschreibung |
| aktiv | boolean | Ja | Status |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Tabellenstruktur: `waescheset_artikel`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| set_id | uuid | Nein | Fremdschlüssel zu waeschesets |
| artikel_id | uuid | Nein | Fremdschlüssel zu waescheartikel |
| menge | integer | Nein | Anzahl (Standard: 1) |
| berechnungsart | enum | Nein | 'pro_buchung' oder 'pro_gast' |

### Berechnungsarten

```typescript
type Berechnungsart = 
  | 'pro_buchung'  // Menge gilt für die gesamte Buchung
  | 'pro_gast';    // Menge wird mit Gästezahl multipliziert
```

### 5.1 Sets eines Objekts abrufen

**JavaScript/TypeScript:**
```typescript
const { data: sets, error } = await supabase
  .from('waeschesets')
  .select(`
    id,
    name,
    beschreibung,
    aktiv,
    objekte (
      id,
      name,
      kunden (
        id,
        name,
        firma
      )
    )
  `)
  .eq('objekt_id', 'objekt-uuid')
  .eq('aktiv', true);
```

### 5.2 Set mit allen Artikeln

```typescript
const { data: set, error } = await supabase
  .from('waeschesets')
  .select(`
    id,
    name,
    beschreibung,
    waescheset_artikel (
      id,
      menge,
      berechnungsart,
      waescheartikel (
        id,
        artikelnummer,
        name,
        kategorie,
        groesse,
        farbe,
        preis
      )
    )
  `)
  .eq('id', 'set-uuid')
  .single();

// Set-Artikel durchgehen:
set.waescheset_artikel.forEach(sa => {
  console.log(`${sa.menge}x ${sa.waescheartikel.name} (${sa.berechnungsart})`);
});
```

### 5.3 Mengen für Bestellung berechnen

```typescript
interface BestellPosition {
  artikel_id: string;
  artikelname: string;
  menge: number;
}

async function calculateOrderItems(
  setId: string, 
  anzahlGaeste: number
): Promise<BestellPosition[]> {
  
  const { data: setArtikel } = await supabase
    .from('waescheset_artikel')
    .select(`
      menge,
      berechnungsart,
      waescheartikel (
        id,
        name
      )
    `)
    .eq('set_id', setId);

  return setArtikel.map(sa => {
    const berechneterMenge = sa.berechnungsart === 'pro_gast'
      ? sa.menge * anzahlGaeste
      : sa.menge;

    return {
      artikel_id: sa.waescheartikel.id,
      artikelname: sa.waescheartikel.name,
      menge: berechneterMenge
    };
  });
}

// Beispiel: Set für 4 Gäste
const positionen = await calculateOrderItems('set-uuid', 4);
// Artikel mit berechnungsart='pro_gast' und menge=2 → ergibt menge=8
```

### 5.4 Set-Gesamtpreis berechnen

```typescript
async function calculateSetPrice(
  setId: string, 
  anzahlGaeste: number = 1
): Promise<number> {
  
  const { data: setArtikel } = await supabase
    .from('waescheset_artikel')
    .select(`
      menge,
      berechnungsart,
      waescheartikel (
        preis
      )
    `)
    .eq('set_id', setId);

  let gesamtpreis = 0;

  setArtikel.forEach(sa => {
    if (sa.waescheartikel.preis) {
      const menge = sa.berechnungsart === 'pro_gast'
        ? sa.menge * anzahlGaeste
        : sa.menge;
      
      gesamtpreis += menge * sa.waescheartikel.preis;
    }
  });

  return gesamtpreis;
}
```

### 5.5 Set erstellen

```typescript
// 1. Set erstellen
const { data: neuesSet, error: setError } = await supabase
  .from('waeschesets')
  .insert({
    objekt_id: 'objekt-uuid',
    name: 'Müller GmbH - Ferienhaus Nordsee',
    beschreibung: 'Standard-Set für 4 Personen',
    aktiv: true
  })
  .select()
  .single();

// 2. Artikel zum Set hinzufügen
const artikelZuordnungen = [
  { set_id: neuesSet.id, artikel_id: 'artikel-1-uuid', menge: 4, berechnungsart: 'pro_buchung' },
  { set_id: neuesSet.id, artikel_id: 'artikel-2-uuid', menge: 2, berechnungsart: 'pro_gast' },
  { set_id: neuesSet.id, artikel_id: 'artikel-3-uuid', menge: 1, berechnungsart: 'pro_buchung' }
];

const { error: artikelError } = await supabase
  .from('waescheset_artikel')
  .insert(artikelZuordnungen);
```

---

## 6. Bestellungen

### Tabellenstruktur: `waeschebestellungen`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| bestellnummer | text | Nein | Eindeutige Bestellnummer (z.B. "B2024-0001") |
| kunde_id | uuid | Nein | Fremdschlüssel zu kunden |
| objekt_id | uuid | Ja | Fremdschlüssel zu objekte |
| status | enum | Ja | Bestellstatus (Standard: 'neu') |
| gastname | text | Ja | Name des Gastes |
| check_in | date | Ja | Check-in Datum |
| check_out | date | Ja | Check-out Datum |
| anzahl_personen | integer | Ja | Anzahl Gäste (Standard: 1) |
| lieferdatum | date | Ja | Geplantes Lieferdatum |
| lieferzeit | text | Ja | Geplante Lieferzeit |
| abholdatum | date | Ja | Geplantes Abholdatum |
| abholzeit | text | Ja | Geplante Abholzeit |
| waeschekraft_id | uuid | Ja | Zugewiesene Wäschekraft |
| prioritaet | integer | Ja | Priorität (Standard: 0) |
| reihenfolge | integer | Ja | Sortierreihenfolge |
| bearbeitung_deadline | timestamp | Ja | Deadline für Bearbeitung |
| bearbeitung_notizen | text | Ja | Interne Bearbeitungsnotizen |
| notizen | text | Ja | Allgemeine Notizen |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Bestellstatus (Enum)

```typescript
type BestellungStatus = 
  | 'neu'             // Neue Bestellung, noch nicht begonnen
  | 'in_bearbeitung'  // Wäsche wird vorbereitet
  | 'ausgeliefert'    // Wäsche wurde geliefert (löst Rechnung aus!)
  | 'abgeholt'        // Wäsche wurde abgeholt
  | 'abgeschlossen'   // Bestellung vollständig abgeschlossen
  | 'storniert';      // Bestellung wurde storniert
```

### 6.1 Bestellungen abrufen

**JavaScript/TypeScript:**
```typescript
// Alle offenen Bestellungen
const { data: bestellungen, error } = await supabase
  .from('waeschebestellungen')
  .select(`
    *,
    kunden (
      id, name, firma, kundennummer
    ),
    objekte (
      id, name, objektnummer
    ),
    waeschekraefte (
      id, name, personalnummer
    )
  `)
  .in('status', ['neu', 'in_bearbeitung'])
  .order('lieferdatum', { ascending: true });
```

### 6.2 Bestellung mit Positionen

```typescript
const { data: bestellung, error } = await supabase
  .from('waeschebestellungen')
  .select(`
    *,
    kunden (id, name, firma),
    objekte (id, name),
    bestellpositionen (
      id,
      menge,
      notizen,
      waescheartikel (
        id,
        artikelnummer,
        name,
        kategorie,
        preis
      )
    )
  `)
  .eq('id', 'bestellung-uuid')
  .single();

// Gesamtpreis berechnen:
let gesamtpreis = 0;
bestellung.bestellpositionen.forEach(pos => {
  if (pos.waescheartikel.preis) {
    gesamtpreis += pos.menge * pos.waescheartikel.preis;
  }
});
```

### 6.3 Bestellungen filtern

```typescript
// Nach Status
const { data } = await supabase
  .from('waeschebestellungen')
  .select('*')
  .eq('status', 'neu');

// Nach Datum
const { data } = await supabase
  .from('waeschebestellungen')
  .select('*')
  .gte('lieferdatum', '2024-01-01')
  .lte('lieferdatum', '2024-01-31');

// Heute zu liefern
const heute = new Date().toISOString().split('T')[0];
const { data } = await supabase
  .from('waeschebestellungen')
  .select('*')
  .eq('lieferdatum', heute)
  .neq('status', 'storniert');

// Nach Kunde
const { data } = await supabase
  .from('waeschebestellungen')
  .select('*')
  .eq('kunde_id', 'kunde-uuid');

// Überfällige Bestellungen
const { data } = await supabase
  .from('waeschebestellungen')
  .select('*')
  .lt('bearbeitung_deadline', new Date().toISOString())
  .in('status', ['neu', 'in_bearbeitung']);
```

### 6.4 Neue Bestellung erstellen (komplett)

**JavaScript/TypeScript:**
```typescript
interface NeueBestellung {
  kunde_id: string;
  objekt_id?: string;
  gastname?: string;
  check_in?: string;
  check_out?: string;
  anzahl_personen?: number;
  lieferdatum?: string;
  notizen?: string;
  positionen: {
    artikel_id: string;
    menge: number;
    notizen?: string;
  }[];
}

async function createOrder(data: NeueBestellung): Promise<{ 
  bestellung: any; 
  error: any 
}> {
  // 1. Bestellnummer generieren
  const bestellnummer = await generateNextBestellnummer();
  
  // 2. Lieferdatum berechnen (1 Tag vor Check-in)
  let lieferdatum = data.lieferdatum;
  if (!lieferdatum && data.check_in) {
    const checkIn = new Date(data.check_in);
    checkIn.setDate(checkIn.getDate() - 1);
    lieferdatum = checkIn.toISOString().split('T')[0];
  }

  // 3. Bestellung erstellen
  const { data: bestellung, error: bestellError } = await supabase
    .from('waeschebestellungen')
    .insert({
      bestellnummer,
      kunde_id: data.kunde_id,
      objekt_id: data.objekt_id,
      gastname: data.gastname,
      check_in: data.check_in,
      check_out: data.check_out,
      anzahl_personen: data.anzahl_personen || 1,
      lieferdatum,
      notizen: data.notizen,
      status: 'neu'
    })
    .select()
    .single();

  if (bestellError) {
    return { bestellung: null, error: bestellError };
  }

  // 4. Positionen hinzufügen
  const positionen = data.positionen.map(pos => ({
    bestellung_id: bestellung.id,
    artikel_id: pos.artikel_id,
    menge: pos.menge,
    notizen: pos.notizen
  }));

  const { error: posError } = await supabase
    .from('bestellpositionen')
    .insert(positionen);

  if (posError) {
    // Bestellung rückgängig machen bei Fehler
    await supabase.from('waeschebestellungen').delete().eq('id', bestellung.id);
    return { bestellung: null, error: posError };
  }

  // 5. History-Eintrag erstellen
  await supabase.from('bestellung_history').insert({
    bestellung_id: bestellung.id,
    status: 'neu',
    bearbeiter_name: 'System',
    notiz: 'Bestellung erstellt'
  });

  return { bestellung, error: null };
}

// Beispielaufruf:
const result = await createOrder({
  kunde_id: 'kunde-uuid',
  objekt_id: 'objekt-uuid',
  gastname: 'Familie Schmidt',
  check_in: '2024-07-15',
  check_out: '2024-07-22',
  anzahl_personen: 4,
  notizen: 'Allergiker - keine Daunenkissen',
  positionen: [
    { artikel_id: 'artikel-1', menge: 4 },
    { artikel_id: 'artikel-2', menge: 8 },
    { artikel_id: 'artikel-3', menge: 2 }
  ]
});
```

**Python:**
```python
from datetime import datetime, timedelta

def create_order(data):
    # 1. Bestellnummer generieren
    response = supabase.table("waeschebestellungen") \
        .select("bestellnummer") \
        .order("bestellnummer", desc=True) \
        .limit(1) \
        .execute()
    
    if response.data:
        last = response.data[0]["bestellnummer"]
        year = datetime.now().year
        num = int(last.split("-")[1]) + 1
        bestellnummer = f"B{year}-{num:04d}"
    else:
        bestellnummer = f"B{datetime.now().year}-0001"
    
    # 2. Lieferdatum berechnen
    lieferdatum = data.get("lieferdatum")
    if not lieferdatum and data.get("check_in"):
        check_in = datetime.strptime(data["check_in"], "%Y-%m-%d")
        lieferdatum = (check_in - timedelta(days=1)).strftime("%Y-%m-%d")
    
    # 3. Bestellung erstellen
    bestellung_data = {
        "bestellnummer": bestellnummer,
        "kunde_id": data["kunde_id"],
        "objekt_id": data.get("objekt_id"),
        "gastname": data.get("gastname"),
        "check_in": data.get("check_in"),
        "check_out": data.get("check_out"),
        "anzahl_personen": data.get("anzahl_personen", 1),
        "lieferdatum": lieferdatum,
        "notizen": data.get("notizen"),
        "status": "neu"
    }
    
    response = supabase.table("waeschebestellungen") \
        .insert(bestellung_data) \
        .execute()
    
    bestellung_id = response.data[0]["id"]
    
    # 4. Positionen hinzufügen
    positionen = [
        {
            "bestellung_id": bestellung_id,
            "artikel_id": pos["artikel_id"],
            "menge": pos["menge"],
            "notizen": pos.get("notizen")
        }
        for pos in data["positionen"]
    ]
    
    supabase.table("bestellpositionen").insert(positionen).execute()
    
    # 5. History-Eintrag
    supabase.table("bestellung_history").insert({
        "bestellung_id": bestellung_id,
        "status": "neu",
        "bearbeiter_name": "System",
        "notiz": "Bestellung erstellt"
    }).execute()
    
    return bestellung_id

# Aufruf
bestellung_id = create_order({
    "kunde_id": "kunde-uuid",
    "objekt_id": "objekt-uuid",
    "gastname": "Familie Schmidt",
    "check_in": "2024-07-15",
    "check_out": "2024-07-22",
    "anzahl_personen": 4,
    "positionen": [
        {"artikel_id": "artikel-1", "menge": 4},
        {"artikel_id": "artikel-2", "menge": 8}
    ]
})
```

### 6.5 Bestellung aus Wäscheset erstellen

```typescript
async function createOrderFromSet(
  kundeId: string,
  objektId: string,
  setId: string,
  gastname: string,
  checkIn: string,
  checkOut: string,
  anzahlGaeste: number
): Promise<{ bestellung: any; error: any }> {
  
  // 1. Set-Artikel laden
  const { data: setArtikel } = await supabase
    .from('waescheset_artikel')
    .select('artikel_id, menge, berechnungsart')
    .eq('set_id', setId);

  // 2. Positionen mit berechneten Mengen erstellen
  const positionen = setArtikel.map(sa => ({
    artikel_id: sa.artikel_id,
    menge: sa.berechnungsart === 'pro_gast' 
      ? sa.menge * anzahlGaeste 
      : sa.menge
  }));

  // 3. Bestellung erstellen
  return createOrder({
    kunde_id: kundeId,
    objekt_id: objektId,
    gastname,
    check_in: checkIn,
    check_out: checkOut,
    anzahl_personen: anzahlGaeste,
    positionen
  });
}
```

### 6.6 Bestellstatus ändern

**JavaScript/TypeScript:**
```typescript
async function updateOrderStatus(
  bestellungId: string,
  neuerStatus: string,
  bearbeiterName: string,
  notiz?: string
): Promise<boolean> {
  
  // 1. Status aktualisieren
  const { error: updateError } = await supabase
    .from('waeschebestellungen')
    .update({ status: neuerStatus })
    .eq('id', bestellungId);

  if (updateError) {
    console.error('Fehler beim Status-Update:', updateError);
    return false;
  }

  // 2. History-Eintrag erstellen
  await supabase.from('bestellung_history').insert({
    bestellung_id: bestellungId,
    status: neuerStatus,
    bearbeiter_name: bearbeiterName,
    notiz: notiz || `Status geändert zu: ${neuerStatus}`
  });

  // 3. Bei "ausgeliefert" wird automatisch Rechnung erstellt (via Edge Function)
  if (neuerStatus === 'ausgeliefert') {
    // Die Rechnung wird serverseitig automatisch erstellt
    console.log('Rechnung wird automatisch erstellt...');
  }

  return true;
}

// Beispiel:
await updateOrderStatus(
  'bestellung-uuid',
  'in_bearbeitung',
  'Maria Huber',
  'Wäsche wird vorbereitet'
);
```

### 6.7 Bestellung aktualisieren

```typescript
// Lieferdatum ändern
const { error } = await supabase
  .from('waeschebestellungen')
  .update({ 
    lieferdatum: '2024-07-16',
    lieferzeit: '10:00'
  })
  .eq('id', 'bestellung-uuid');

// Wäschekraft zuweisen
const { error } = await supabase
  .from('waeschebestellungen')
  .update({ waeschekraft_id: 'waeschekraft-uuid' })
  .eq('id', 'bestellung-uuid');

// Priorität ändern
const { error } = await supabase
  .from('waeschebestellungen')
  .update({ prioritaet: 2 })  // Höhere Zahl = höhere Priorität
  .eq('id', 'bestellung-uuid');
```

### 6.8 Bestellung stornieren

```typescript
async function cancelOrder(
  bestellungId: string, 
  bearbeiterName: string, 
  grund: string
): Promise<boolean> {
  
  const { error } = await supabase
    .from('waeschebestellungen')
    .update({ status: 'storniert' })
    .eq('id', bestellungId);

  if (error) return false;

  await supabase.from('bestellung_history').insert({
    bestellung_id: bestellungId,
    status: 'storniert',
    bearbeiter_name: bearbeiterName,
    notiz: `Storniert: ${grund}`
  });

  return true;
}
```

### 6.9 Bestellnummer generieren

```typescript
async function generateNextBestellnummer(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `B${currentYear}-`;

  const { data } = await supabase
    .from('waeschebestellungen')
    .select('bestellnummer')
    .like('bestellnummer', `${prefix}%`)
    .order('bestellnummer', { ascending: false })
    .limit(1);

  if (!data || data.length === 0) {
    return `${prefix}0001`;
  }

  const lastNumber = data[0].bestellnummer;
  const numberPart = parseInt(lastNumber.split('-')[1], 10);
  
  return `${prefix}${(numberPart + 1).toString().padStart(4, '0')}`;
}
```

---

## 7. Bestellpositionen

### Tabellenstruktur: `bestellpositionen`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| bestellung_id | uuid | Nein | Fremdschlüssel zu waeschebestellungen |
| artikel_id | uuid | Nein | Fremdschlüssel zu waescheartikel |
| menge | integer | Nein | Anzahl (Standard: 1) |
| notizen | text | Ja | Positions-spezifische Notizen |

### 7.1 Positionen einer Bestellung

```typescript
const { data: positionen, error } = await supabase
  .from('bestellpositionen')
  .select(`
    id,
    menge,
    notizen,
    waescheartikel (
      id,
      artikelnummer,
      name,
      kategorie,
      groesse,
      farbe,
      preis
    )
  `)
  .eq('bestellung_id', 'bestellung-uuid');

// Gesamtanzahl Artikel
const gesamtAnzahl = positionen.reduce((sum, pos) => sum + pos.menge, 0);

// Gesamtpreis
const gesamtPreis = positionen.reduce((sum, pos) => {
  return sum + (pos.menge * (pos.waescheartikel.preis || 0));
}, 0);
```

### 7.2 Position hinzufügen

```typescript
const { error } = await supabase
  .from('bestellpositionen')
  .insert({
    bestellung_id: 'bestellung-uuid',
    artikel_id: 'artikel-uuid',
    menge: 3,
    notizen: 'Extra weich gewaschen'
  });
```

### 7.3 Position aktualisieren

```typescript
const { error } = await supabase
  .from('bestellpositionen')
  .update({ menge: 5 })
  .eq('id', 'position-uuid');
```

### 7.4 Position löschen

```typescript
const { error } = await supabase
  .from('bestellpositionen')
  .delete()
  .eq('id', 'position-uuid');
```

---

## 8. Bestellhistorie

### Tabellenstruktur: `bestellung_history`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| bestellung_id | uuid | Nein | Fremdschlüssel zu waeschebestellungen |
| status | text | Nein | Status zum Zeitpunkt |
| bearbeiter_name | text | Ja | Name des Bearbeiters |
| zeitpunkt | timestamp | Nein | Zeitpunkt der Änderung |
| notiz | text | Ja | Optionale Notiz |

### 8.1 Historie einer Bestellung

```typescript
const { data: historie, error } = await supabase
  .from('bestellung_history')
  .select('*')
  .eq('bestellung_id', 'bestellung-uuid')
  .order('zeitpunkt', { ascending: false });

// Beispiel-Ausgabe:
// [
//   { status: 'ausgeliefert', bearbeiter_name: 'Hans', zeitpunkt: '2024-07-15 14:30' },
//   { status: 'in_bearbeitung', bearbeiter_name: 'Maria', zeitpunkt: '2024-07-14 09:00' },
//   { status: 'neu', bearbeiter_name: 'System', zeitpunkt: '2024-07-13 16:45' }
// ]
```

### 8.2 History-Eintrag erstellen

```typescript
const { error } = await supabase
  .from('bestellung_history')
  .insert({
    bestellung_id: 'bestellung-uuid',
    status: 'in_bearbeitung',
    bearbeiter_name: 'Maria Huber',
    notiz: 'Wäsche in Maschine 3'
  });
```

### 8.3 Letzter Status einer Bestellung

```typescript
const { data: letzterEintrag, error } = await supabase
  .from('bestellung_history')
  .select('*')
  .eq('bestellung_id', 'bestellung-uuid')
  .order('zeitpunkt', { ascending: false })
  .limit(1)
  .single();
```

---

## 9. Liefertouren

### Tabellenstruktur: `liefertouren`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| tournummer | text | Nein | Eindeutige Tournummer |
| name | text | Nein | Tour-Name |
| datum | date | Nein | Tour-Datum |
| status | text | Ja | 'geplant', 'unterwegs', 'abgeschlossen' |
| waeschekraft_id | uuid | Ja | Zugewiesener Fahrer |
| notizen | text | Ja | Notizen |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Tabellenstruktur: `liefertour_stopps`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| tour_id | uuid | Nein | Fremdschlüssel zu liefertouren |
| bestellung_id | uuid | Nein | Fremdschlüssel zu waeschebestellungen |
| reihenfolge | integer | Nein | Position in der Route |
| erledigt | boolean | Ja | Stopp abgeschlossen? |
| ankunftszeit | timestamp | Ja | Tatsächliche Ankunft |
| notizen | text | Ja | Stopp-Notizen |

### 9.1 Touren eines Tages

```typescript
const { data: touren, error } = await supabase
  .from('liefertouren')
  .select(`
    *,
    waeschekraefte (
      id,
      name,
      personalnummer
    )
  `)
  .eq('datum', '2024-07-15')
  .order('name');
```

### 9.2 Tour mit allen Stopps

```typescript
const { data: tour, error } = await supabase
  .from('liefertouren')
  .select(`
    *,
    waeschekraefte (id, name),
    liefertour_stopps (
      id,
      reihenfolge,
      erledigt,
      ankunftszeit,
      notizen,
      waeschebestellungen (
        id,
        bestellnummer,
        gastname,
        kunden (id, name, firma),
        objekte (id, name, strasse, plz, ort)
      )
    )
  `)
  .eq('id', 'tour-uuid')
  .single();

// Stopps sind in tour.liefertour_stopps
// Sortiert nach reihenfolge
```

### 9.3 Tour erstellen

```typescript
async function createDeliveryTour(
  name: string,
  datum: string,
  fahrerId: string,
  bestellungIds: string[]
): Promise<{ tour: any; error: any }> {
  
  // 1. Tournummer generieren
  const tournummer = await generateNextTournummer();

  // 2. Tour erstellen
  const { data: tour, error: tourError } = await supabase
    .from('liefertouren')
    .insert({
      tournummer,
      name,
      datum,
      waeschekraft_id: fahrerId,
      status: 'geplant'
    })
    .select()
    .single();

  if (tourError) return { tour: null, error: tourError };

  // 3. Stopps erstellen
  const stopps = bestellungIds.map((bestellungId, index) => ({
    tour_id: tour.id,
    bestellung_id: bestellungId,
    reihenfolge: index + 1,
    erledigt: false
  }));

  const { error: stoppsError } = await supabase
    .from('liefertour_stopps')
    .insert(stopps);

  if (stoppsError) {
    await supabase.from('liefertouren').delete().eq('id', tour.id);
    return { tour: null, error: stoppsError };
  }

  return { tour, error: null };
}
```

### 9.4 Stopp als erledigt markieren

```typescript
const { error } = await supabase
  .from('liefertour_stopps')
  .update({
    erledigt: true,
    ankunftszeit: new Date().toISOString()
  })
  .eq('id', 'stopp-uuid');
```

### 9.5 Tour-Status aktualisieren

```typescript
const { error } = await supabase
  .from('liefertouren')
  .update({ status: 'unterwegs' })
  .eq('id', 'tour-uuid');
```

---

## 10. Wäschekräfte / Personal

### Tabellenstruktur: `waeschekraefte`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| personalnummer | text | Nein | Eindeutige Personalnummer |
| name | text | Nein | Name |
| typ | enum | Nein | 'waeschekraft', 'fahrer', 'beides' |
| email | text | Ja | E-Mail |
| telefon | text | Ja | Telefon |
| strasse | text | Ja | Straße |
| plz | text | Ja | PLZ |
| ort | text | Ja | Ort |
| portalzugang | boolean | Ja | Hat Portal-Zugang? |
| user_id | uuid | Ja | Verknüpfter Auth-User |
| notizen | text | Ja | Notizen |
| aktiv | boolean | Ja | Status |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Mitarbeitertypen

```typescript
type MitarbeiterTyp = 
  | 'waeschekraft'  // Nur Wäschebearbeitung
  | 'fahrer'        // Nur Lieferung/Abholung
  | 'beides';       // Beides
```

### 10.1 Alle aktiven Mitarbeiter

```typescript
const { data: mitarbeiter, error } = await supabase
  .from('waeschekraefte')
  .select('*')
  .eq('aktiv', true)
  .order('name');
```

### 10.2 Nur Fahrer (für Liefertouren)

```typescript
const { data: fahrer, error } = await supabase
  .from('waeschekraefte')
  .select('*')
  .in('typ', ['fahrer', 'beides'])
  .eq('aktiv', true)
  .order('name');
```

### 10.3 Mitarbeiter erstellen

```typescript
const { data, error } = await supabase
  .from('waeschekraefte')
  .insert({
    personalnummer: 'P005',
    name: 'Hans Müller',
    typ: 'beides',
    email: 'hans@example.at',
    telefon: '+43 664 9876543',
    aktiv: true,
    portalzugang: false
  })
  .select()
  .single();
```

---

## 11. Rechnungen

### Tabellenstruktur: `rechnungen`

| Spalte | Typ | Nullable | Beschreibung |
|--------|-----|----------|--------------|
| id | uuid | Nein | Primärschlüssel |
| rechnungsnummer | text | Nein | Eindeutig (z.B. "R2024-0001") |
| bestellung_id | uuid | Nein | Fremdschlüssel |
| kunde_id | uuid | Nein | Fremdschlüssel |
| rechnungsdatum | date | Nein | Rechnungsdatum |
| faelligkeitsdatum | date | Ja | Fälligkeitsdatum |
| nettobetrag | decimal | Nein | Nettobetrag |
| mwst_satz | decimal | Nein | MwSt-Satz (Standard: 20) |
| mwst_betrag | decimal | Nein | MwSt-Betrag |
| bearbeitungsgebuehr | decimal | Nein | Bearbeitungsgebühr |
| bruttobetrag | decimal | Nein | Bruttobetrag inkl. Gebühr |
| status | text | Nein | 'offen', 'bezahlt', 'storniert', 'mahnung' |
| bezahlt_am | date | Ja | Zahlungsdatum |
| mahnung_anzahl | integer | Ja | Anzahl gesendeter Mahnungen |
| mahnung_gesendet_am | timestamp | Ja | Letzte Mahnung |
| kunde_* | diverse | Ja | Snapshot der Kundendaten |
| notizen | text | Ja | Notizen |
| created_at | timestamp | Nein | Erstellt am |
| updated_at | timestamp | Nein | Aktualisiert am |

### Rechnungsstatus

```typescript
type RechnungStatus = 
  | 'offen'       // Noch nicht bezahlt
  | 'bezahlt'     // Bezahlt
  | 'storniert'   // Storniert
  | 'mahnung';    // Mahnung gesendet
```

### 11.1 Rechnungen abrufen

```typescript
// Alle offenen Rechnungen
const { data: rechnungen, error } = await supabase
  .from('rechnungen')
  .select('*')
  .eq('status', 'offen')
  .order('faelligkeitsdatum', { ascending: true });

// Mit Bestelldaten
const { data } = await supabase
  .from('rechnungen')
  .select(`
    *,
    waeschebestellungen (
      bestellnummer,
      gastname,
      check_in,
      check_out
    )
  `)
  .order('rechnungsdatum', { ascending: false });
```

### 11.2 Rechnungspositionen

```typescript
const { data: positionen, error } = await supabase
  .from('rechnungspositionen')
  .select('*')
  .eq('rechnung_id', 'rechnung-uuid')
  .order('artikelnummer');

// Struktur:
// [
//   {
//     artikelnummer: "WA001",
//     bezeichnung: "Duschtuch Premium",
//     menge: 8,
//     einzelpreis: 3.50,
//     gesamtpreis: 28.00
//   }
// ]
```

### 11.3 Rechnung als bezahlt markieren

```typescript
const { error } = await supabase
  .from('rechnungen')
  .update({
    status: 'bezahlt',
    bezahlt_am: new Date().toISOString().split('T')[0]
  })
  .eq('id', 'rechnung-uuid');
```

### 11.4 Überfällige Rechnungen

```typescript
const heute = new Date().toISOString().split('T')[0];

const { data: ueberfaellig, error } = await supabase
  .from('rechnungen')
  .select('*')
  .eq('status', 'offen')
  .lt('faelligkeitsdatum', heute);
```

**Hinweis:** Rechnungen werden automatisch erstellt, wenn eine Bestellung den Status "ausgeliefert" erreicht. Die Erstellung erfolgt serverseitig über eine Edge Function.

---

## 12. Realtime-Subscriptions

Supabase ermöglicht Echtzeit-Updates über WebSocket-Verbindungen.

### 12.1 Neue Bestellungen live empfangen

```typescript
const channel = supabase
  .channel('neue-bestellungen')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'waeschebestellungen'
    },
    (payload) => {
      console.log('Neue Bestellung:', payload.new);
      // UI aktualisieren, Benachrichtigung anzeigen, etc.
    }
  )
  .subscribe();

// Subscription beenden
// supabase.removeChannel(channel);
```

### 12.2 Status-Änderungen überwachen

```typescript
const channel = supabase
  .channel('status-aenderungen')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'waeschebestellungen',
      filter: 'status=neq.storniert'
    },
    (payload) => {
      const altStatus = payload.old.status;
      const neuStatus = payload.new.status;
      console.log(`Bestellung ${payload.new.bestellnummer}: ${altStatus} → ${neuStatus}`);
    }
  )
  .subscribe();
```

### 12.3 Mehrere Tabellen überwachen

```typescript
const channel = supabase
  .channel('dashboard-updates')
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'waeschebestellungen' },
    (payload) => console.log('Bestellung geändert:', payload)
  )
  .on(
    'postgres_changes',
    { event: '*', schema: 'public', table: 'liefertouren' },
    (payload) => console.log('Tour geändert:', payload)
  )
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'rechnungen' },
    (payload) => console.log('Neue Rechnung:', payload)
  )
  .subscribe();
```

### 12.4 Python Realtime

```python
def handle_new_order(payload):
    print(f"Neue Bestellung: {payload}")

# Realtime erfordert async in Python
import asyncio

async def subscribe_to_orders():
    channel = supabase.channel("bestellungen")
    channel.on_postgres_changes(
        event="INSERT",
        schema="public",
        table="waeschebestellungen",
        callback=handle_new_order
    )
    await channel.subscribe()
```

---

## 13. Fehlerbehandlung

### 13.1 Allgemeine Fehlerstruktur

```typescript
interface SupabaseError {
  message: string;    // Fehlerbeschreibung
  details: string;    // Technische Details
  hint: string;       // Lösungshinweis
  code: string;       // Fehlercode
}
```

### 13.2 Häufige Fehler

| Code | Bedeutung | Lösung |
|------|-----------|--------|
| `23505` | Unique constraint violation | Kundennummer/Bestellnummer bereits vergeben |
| `23503` | Foreign key violation | Referenzierter Datensatz existiert nicht |
| `23502` | Not null violation | Pflichtfeld fehlt |
| `42P01` | Tabelle existiert nicht | Tabellenname prüfen |
| `PGRST116` | Kein Ergebnis bei .single() | .maybeSingle() verwenden |

### 13.3 Fehlerbehandlung Beispiel

```typescript
async function safeInsert(data: any): Promise<{ data: any; error: string | null }> {
  try {
    const { data: result, error } = await supabase
      .from('kunden')
      .insert(data)
      .select()
      .single();

    if (error) {
      // Spezifische Fehler behandeln
      if (error.code === '23505') {
        return { data: null, error: 'Kundennummer bereits vergeben' };
      }
      if (error.code === '23502') {
        return { data: null, error: 'Pflichtfeld fehlt: ' + error.details };
      }
      return { data: null, error: error.message };
    }

    return { data: result, error: null };
  } catch (e) {
    return { data: null, error: 'Netzwerkfehler: ' + e.message };
  }
}
```

### 13.4 Python Fehlerbehandlung

```python
from postgrest.exceptions import APIError

def safe_insert(data):
    try:
        response = supabase.table("kunden").insert(data).execute()
        return {"data": response.data[0], "error": None}
    except APIError as e:
        if "23505" in str(e):
            return {"data": None, "error": "Kundennummer bereits vergeben"}
        return {"data": None, "error": str(e)}
    except Exception as e:
        return {"data": None, "error": f"Unbekannter Fehler: {e}"}
```

---

## 14. Best Practices

### 14.1 Transaktionen (mehrere Operationen)

Supabase unterstützt keine echten Transaktionen über die API. Verwenden Sie stattdessen:

```typescript
async function createOrderWithRollback(orderData: any) {
  let bestellungId: string | null = null;

  try {
    // 1. Bestellung erstellen
    const { data: bestellung, error: bestellError } = await supabase
      .from('waeschebestellungen')
      .insert(orderData.bestellung)
      .select()
      .single();

    if (bestellError) throw bestellError;
    bestellungId = bestellung.id;

    // 2. Positionen erstellen
    const positionen = orderData.positionen.map(p => ({
      ...p,
      bestellung_id: bestellungId
    }));

    const { error: posError } = await supabase
      .from('bestellpositionen')
      .insert(positionen);

    if (posError) throw posError;

    // 3. History erstellen
    const { error: histError } = await supabase
      .from('bestellung_history')
      .insert({
        bestellung_id: bestellungId,
        status: 'neu',
        bearbeiter_name: 'System'
      });

    if (histError) throw histError;

    return { success: true, bestellungId };

  } catch (error) {
    // Rollback: Bestellung löschen (kaskadiert Positionen)
    if (bestellungId) {
      await supabase
        .from('waeschebestellungen')
        .delete()
        .eq('id', bestellungId);
    }
    return { success: false, error };
  }
}
```

### 14.2 Batch-Operationen

```typescript
// Mehrere Datensätze auf einmal einfügen
const kunden = [
  { kundennummer: 'K100', name: 'Kunde 1', bestellmodus: 'mit_buchung' },
  { kundennummer: 'K101', name: 'Kunde 2', bestellmodus: 'nur_sets' },
  { kundennummer: 'K102', name: 'Kunde 3', bestellmodus: 'mit_buchung' }
];

const { data, error } = await supabase
  .from('kunden')
  .insert(kunden)
  .select();

// Mehrere Datensätze aktualisieren
const { error } = await supabase
  .from('waeschebestellungen')
  .update({ status: 'storniert' })
  .in('id', ['uuid-1', 'uuid-2', 'uuid-3']);
```

### 14.3 Paginierung für große Datenmengen

```typescript
async function fetchAllOrders(pageSize = 100): Promise<any[]> {
  let allOrders: any[] = [];
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error } = await supabase
      .from('waeschebestellungen')
      .select('*')
      .range(from, to)
      .order('created_at', { ascending: false });

    if (error) throw error;

    allOrders = [...allOrders, ...data];
    hasMore = data.length === pageSize;
    page++;
  }

  return allOrders;
}
```

### 14.4 Caching-Strategien

```typescript
// Einfacher In-Memory-Cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

async function getCachedKunden(): Promise<any[]> {
  const cacheKey = 'kunden_aktiv';
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  const { data, error } = await supabase
    .from('kunden')
    .select('*')
    .eq('aktiv', true);

  if (!error && data) {
    cache.set(cacheKey, { data, timestamp: Date.now() });
  }

  return data || [];
}

// Cache invalidieren bei Änderungen
function invalidateKundenCache() {
  cache.delete('kunden_aktiv');
}
```

### 14.5 Rate Limiting beachten

```typescript
// Verzögerung zwischen Anfragen
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function bulkUpdate(items: any[]) {
  for (const item of items) {
    await supabase
      .from('waescheartikel')
      .update({ preis: item.neuerPreis })
      .eq('id', item.id);
    
    await delay(100); // 100ms Pause zwischen Updates
  }
}
```

### 14.6 Verbindungsstatus prüfen

```typescript
async function checkConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kunden')
      .select('id')
      .limit(1);
    
    return !error;
  } catch {
    return false;
  }
}

// Vor wichtigen Operationen prüfen
async function performCriticalOperation() {
  if (!await checkConnection()) {
    throw new Error('Keine Verbindung zur Datenbank');
  }
  
  // Operation durchführen...
}
```

---

## Anhang: Vollständiges Beispiel

### Komplette Bestellungsintegration

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://pkpnowevagxmhyqlawng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
);

// Vollständige Bestellungsanlage mit Set
async function createCompleteOrder(params: {
  kundeId: string;
  objektId: string;
  setId: string;
  gastname: string;
  checkIn: string;
  checkOut: string;
  anzahlGaeste: number;
  notizen?: string;
}) {
  console.log('Starte Bestellungsanlage...');

  // 1. Set-Artikel laden
  const { data: setArtikel, error: setError } = await supabase
    .from('waescheset_artikel')
    .select(`
      menge,
      berechnungsart,
      waescheartikel (id)
    `)
    .eq('set_id', params.setId);

  if (setError) {
    console.error('Set-Artikel laden fehlgeschlagen:', setError);
    return null;
  }

  // 2. Positionen berechnen
  const positionen = setArtikel.map(sa => ({
    artikel_id: sa.waescheartikel.id,
    menge: sa.berechnungsart === 'pro_gast'
      ? sa.menge * params.anzahlGaeste
      : sa.menge
  }));

  // 3. Bestellnummer generieren
  const { data: lastOrder } = await supabase
    .from('waeschebestellungen')
    .select('bestellnummer')
    .order('bestellnummer', { ascending: false })
    .limit(1);

  const year = new Date().getFullYear();
  let nextNum = 1;
  if (lastOrder?.[0]) {
    const parts = lastOrder[0].bestellnummer.split('-');
    if (parts[0] === `B${year}`) {
      nextNum = parseInt(parts[1]) + 1;
    }
  }
  const bestellnummer = `B${year}-${nextNum.toString().padStart(4, '0')}`;

  // 4. Lieferdatum berechnen
  const checkInDate = new Date(params.checkIn);
  checkInDate.setDate(checkInDate.getDate() - 1);
  const lieferdatum = checkInDate.toISOString().split('T')[0];

  // 5. Bestellung erstellen
  const { data: bestellung, error: bestellError } = await supabase
    .from('waeschebestellungen')
    .insert({
      bestellnummer,
      kunde_id: params.kundeId,
      objekt_id: params.objektId,
      gastname: params.gastname,
      check_in: params.checkIn,
      check_out: params.checkOut,
      anzahl_personen: params.anzahlGaeste,
      lieferdatum,
      notizen: params.notizen,
      status: 'neu'
    })
    .select()
    .single();

  if (bestellError) {
    console.error('Bestellung erstellen fehlgeschlagen:', bestellError);
    return null;
  }

  // 6. Positionen einfügen
  const positionenMitBestellung = positionen.map(p => ({
    ...p,
    bestellung_id: bestellung.id
  }));

  const { error: posError } = await supabase
    .from('bestellpositionen')
    .insert(positionenMitBestellung);

  if (posError) {
    console.error('Positionen einfügen fehlgeschlagen:', posError);
    // Bestellung aufräumen
    await supabase.from('waeschebestellungen').delete().eq('id', bestellung.id);
    return null;
  }

  // 7. History-Eintrag
  await supabase.from('bestellung_history').insert({
    bestellung_id: bestellung.id,
    status: 'neu',
    bearbeiter_name: 'System',
    notiz: 'Bestellung automatisch erstellt'
  });

  console.log(`✅ Bestellung ${bestellnummer} erfolgreich erstellt!`);
  return bestellung;
}

// Verwendung:
const bestellung = await createCompleteOrder({
  kundeId: 'uuid-des-kunden',
  objektId: 'uuid-des-objekts',
  setId: 'uuid-des-sets',
  gastname: 'Familie Mustermann',
  checkIn: '2024-08-01',
  checkOut: '2024-08-08',
  anzahlGaeste: 4,
  notizen: 'Allergiker, keine Daunen'
});
```

---

**Letzte Aktualisierung:** Dezember 2024

**Kontakt für API-Fragen:** Siehe Rechnungseinstellungen für Firmenkontakt
