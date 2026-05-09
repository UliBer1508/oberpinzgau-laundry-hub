## Ziel
Auf der Bestellungen-Seite einen Button "Excel-Export" hinzufügen, der die aktuell gefilterten Bestellungen als `.xlsx`-Datei herunterlädt.

## Änderungen

### 1. Dependency
- `xlsx` (SheetJS) hinzufügen — leichtgewichtig, läuft komplett im Browser, kein Backend nötig.

### 2. Neue Datei: `src/lib/exportBestellungen.ts`
Hilfsfunktion `exportBestellungenToExcel(bestellungen: Bestellung[])`:
- Mappt jede Bestellung auf ein Zeilenobjekt mit deutschen Spaltenüberschriften:
  Bestellnr., Kunde, Objekt, Status, Lieferdatum, Lieferzeit, Abholdatum, Wäschekraft, Positionen, Betrag (€), Rechnungsnr., Zahlungsstatus, Gastname, Personen, Check-in, Check-out, Priorität, Notizen, Erstellt am.
- Daten werden mit `date-fns` als `dd.MM.yyyy` formatiert, Preise als Zahlen (Excel-Währungsformat).
- Erstellt Workbook via `XLSX.utils.json_to_sheet` + `XLSX.utils.book_append_sheet`.
- Spaltenbreiten setzen für gute Lesbarkeit.
- Dateiname: `bestellungen_YYYY-MM-DD.xlsx` via `XLSX.writeFile`.

### 3. `src/pages/Bestellungen.tsx`
- Button "Excel-Export" (Icon `Download` aus lucide-react) im Header neben "Bestellung erstellen", `variant="outline"`.
- onClick ruft `exportBestellungenToExcel(filteredBestellungen)` auf, zeigt `toast.success` mit Anzahl.
- Disabled wenn `filteredBestellungen.length === 0`.

## Außerhalb des Scope
- Keine serverseitige Generierung, keine PDF-Variante.
- Keine separaten Sheets pro Status (eine flache Liste).
- Bestellpositionen-Details (Artikel-Aufschlüsselung) werden nicht je Zeile exportiert — nur die Anzahl. Falls gewünscht, später nachrüstbar.
