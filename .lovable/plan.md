# Schnellaktionen erweitern: Drucken & Exportieren

## Ziel
Teuni soll morgens mit einem Klick eine gefilterte Liste von Bestellungen, Arbeitsaufträgen oder Rechnungen drucken oder als Excel/CSV exportieren können. Dazu drei neue Schnellaktions-Karten ergänzen, alle Karten kompakter gestalten, sodass 7 Karten in einem responsiven Raster (4 pro Reihe ab `lg`) sauber passen.

## Änderungen

### 1. `QuickActionCard.tsx` — kompakter
- `min-h-[120px]` → `min-h-[96px]`
- Padding `p-4` → `p-3`
- Icon-Box `h-11 w-11` → `h-9 w-9`, Icon `h-5 w-5` → `h-4 w-4`
- Gap `gap-3` → `gap-2`
- Schrift bleibt (`text-sm` / `text-xs`)

### 2. `QuickActionsUpdated.tsx` — 3 neue Karten + neutrale Variante
Bestehende 4 Karten bleiben. Darunter (im selben Grid) drei zusätzliche Karten:

- **Bestellungen exportieren** (Icon `Printer`, neue Variante `neutral`) → öffnet `ExportDialog` mit Typ `bestellungen`
- **Arbeitsaufträge exportieren** (Icon `ClipboardList` mit `Printer`-Akzent) → `ExportDialog` Typ `arbeitsauftraege`
- **Rechnungen exportieren** (Icon `Receipt`/`Printer`) → `ExportDialog` Typ `rechnungen`

`QuickActionCard` bekommt zusätzlich Variante `neutral` (`bg-muted text-foreground`).

Grid bleibt `grid-cols-2 lg:grid-cols-4` — die 7 Karten fließen automatisch in zwei Reihen (4 + 3).

### 3. Neuer Dialog: `src/components/dashboard/ExportDialog.tsx`
Ein wiederverwendbarer Dialog mit Props `{ open, onOpenChange, type: "bestellungen" | "arbeitsauftraege" | "rechnungen" }`.

Inhalt je nach Typ:

**Statusauswahl (Checkboxen, vorausgewählt = sinnvolle Defaults für „morgens starten"):**
- `bestellungen`: `neu`, `in_bearbeitung`, `bereit`, `ausgeliefert`, `storniert` — Default: `neu` + `in_bearbeitung`
- `arbeitsauftraege`: gleiche Status, Default: `neu` + `in_bearbeitung` (Quelle = `waeschebestellungen` mit `waeschekraft_id` gesetzt)
- `rechnungen`: `offen`, `bezahlt`, `mahnung`, `storniert` — Default: `offen` + `mahnung`

**Datumsfilter:**
- Bestellungen / Arbeitsaufträge: Filter auf `lieferdatum` mit Quick-Picks „Heute", „Morgen", „Diese Woche", „Alle" + manuelles Von/Bis
- Rechnungen: Filter auf `rechnungsdatum` analog

**Aktionen (zwei Buttons):**
- `Drucken` → ruft `printList(rows, columns, title)` auf
- `Excel exportieren` → ruft `exportXlsx(rows, columns, filename)` mit `xlsx`

### 4. Neuer Helfer: `src/lib/exportHelpers.ts`
- `exportXlsx(rows, columns, filename)` — nutzt vorhandenes `xlsx`-Paket (`utils.json_to_sheet`, `writeFile`)
- `printList({ title, columns, rows })` — öffnet `window.open("", "_blank")`, schreibt minimales HTML mit Tabelle + `@media print` Styles + ruft `window.print()`. Spaltenkopf, Zebrastreifen, Druckdatum.

### 5. Daten laden
Im `ExportDialog` direkt per Supabase-Client laden (kein neues Hook nötig), beim Klick auf Drucken/Excel:

- Bestellungen / Arbeitsaufträge: `waeschebestellungen` join `kunden(name,kundennummer)`, `objekte(name)`, `waeschekraefte(name)` — Spalten: Bestellnummer, Kunde, Objekt, Lieferdatum, Status, Wäschekraft, Personen
- Rechnungen: `rechnungen` — Spalten: Rechnungsnummer, Kunde, Rechnungsdatum, Fällig, Brutto, Status

Status-Filter via `.in("status", selectedStatuses)`, Datumsfilter via `.gte/.lte`.

## Nicht-Änderungen
- Keine Schemaänderungen, kein neues Edge Function
- Bestehende Seiten (/bestellungen, /rechnungen, /liefertouren) bleiben unberührt
- Stats-Komponenten bleiben unberührt
