## Ziel

Die Erstellung eines Vorlagen-Sets (Teuni-zentral) soll exakt dieselbe Artikel-Komposition-UX bieten wie die Erstellung eines Kunden-Wäschesets – nur ohne Kunden-/Objekt-Auswahl, weil eine Vorlage nicht an ein Objekt gebunden ist.

## Was bleibt gleich (bereits vorhanden)

- Datenmodell `waescheset_vorlagen` + `waescheset_vorlage_artikel` (mit `menge`, `berechnungsart` `pro_buchung`/`pro_gast`).
- Hooks `useVorlagenSets`, `useAddVorlageArtikel`, `useRemoveVorlageArtikel`, `useUpdateVorlageArtikel`.
- Übersichtsseite `/vorlagen-sets` mit Karten + „Neue Vorlage"-Button.
- „Vorlage übernehmen"-Flow auf `/waeschesets`.

## Was sich ändert – `VorlageFormDialog`

Den Dialog so umbauen, dass er sich beim Komponieren der Artikel exakt wie `WaeschesetFormDialog` verhält. Konkret:

### 1. Kopfbereich der Vorlage
- Felder `Name *`, `Kategorie`, `Beschreibung`, `Bild-URL`, `Aktiv` bleiben.
- Kein Kunden-/Objekt-Select (Vorlagen sind kundenunabhängig).

### 2. Artikel-Editor (identisch zum Kunden-Set)
- **Pending-Artikel-Liste** beim Neuanlegen: Artikel können bereits vor dem Speichern hinzugefügt werden, beim Klick auf „Erstellen" werden Vorlage + Positionen gemeinsam in einem Zug gespeichert. Nicht erst Vorlage anlegen → nochmal öffnen → Artikel pflegen.
- **Artikel-Auswahl als Combobox mit Suche** (Popover + Command), nicht einfaches Select.
- **Tabelle mit allen Artikel-Infos**:
  - Artikelnummer (mono)
  - Name + ggf. Bezeichnung
  - Kategorie als Badge
  - Farbe als Farbpunkt + Text
  - Einzelpreis
  - Menge mit `−`/`+`-Buttons + Number-Input
  - Summe (Menge × Preis)
  - Berechnung als Toggle-Button mit Icon (`Calendar` = pro Buchung, `User` = pro Gast) + Tooltip
  - Trash-Icon zum Entfernen
  - Footer-Zeile **„Gesamtpreis"** wenn Preise vorhanden
- **Add-Bereich** unter der Tabelle: Combobox + Menge + RadioGroup `Pro Buchung` / `Pro Gast` + Hinzufügen-Button.
- Bereits ausgewählte Artikel werden aus der Auswahl gefiltert.
- Leerzustand mit Package-Icon und Hinweistext.

### 3. Save-Logik
- **Neue Vorlage:** `createVorlage` → mit der zurückgegebenen `id` alle Pending-Positionen via `addVorlageArtikel` einfügen. Bei Fehler: angelegte Vorlage löschen (Rollback) und Toast.
- **Bestehende Vorlage:** wie bisher direkter Update + Live-Mutationen pro Position.

### 4. Konsistenz-Details
- Dialog-Größe `max-w-4xl` (wie Kunden-Set).
- Titel: „Neues Wäscheset" / „Wäscheset bearbeiten" (statt „Vorlagen-Set").
- Button-Text in der Übersichts-Card auf der Seite `/vorlagen-sets`: „Bearbeiten" statt zwei separate Schritte.
- Empty-State der Übersichtsseite: „Noch keine Wäschesets erstellt" (bereits gemacht).

## Was nicht angefasst wird

- Die externe API (`/external-vorlagen-sets`) liefert weiterhin denselben JSON, weil Datenmodell unverändert.
- Sidebar-Eintrag „Unsere-Wäschesets" bleibt.
- „Vorlage übernehmen"-Dialog bleibt unverändert.
- Kunden-Wäschesets-Seite/-Dialog werden nicht angefasst.

## Technischer Bereich

**Dateien:**
- `src/components/vorlagen/VorlageFormDialog.tsx` – kompletter Rewrite des Artikelteils. Übernimmt die Pattern aus `WaeschesetFormDialog.tsx` (PendingArtikel-Flow, Combobox, +/−-Buttons, Toggle-Button, Tooltips, Gesamtpreis-Footer).
- `src/hooks/useVorlagenSets.ts` – evtl. kleine Erweiterung: `createVorlage` so anpassen, dass es nach erfolgreichem Insert direkt mit `pendingArtikel[]` befüllt werden kann (oder im Dialog sequentiell aufrufen).
- `src/pages/VorlagenSets.tsx` – `handleSubmit` so anpassen, dass beim Neuanlegen die Pending-Artikel mitgegeben werden; Dialog nicht mehr ein zweites Mal automatisch öffnen.

**Hilfsfunktionen wiederverwendet:** `formatPreis`, `FARB_STYLES` (kann in shared util ausgelagert werden, oder einfach kopiert um Refactor klein zu halten).

## Definition of Done

- Klick auf „Neue Vorlage": Dialog öffnet, Name/Kategorie eintragen, Artikel per Suche hinzufügen, Mengen + Berechnungsart festlegen, einmal „Erstellen" → Vorlage inkl. aller Artikel ist gespeichert.
- Klick auf „Bearbeiten" einer bestehenden Vorlage: identische Tabelle, Live-Updates pro Position.
- Visuell und in der Bedienung nicht von der Kunden-Wäscheset-Erstellung zu unterscheiden (außer dass Kunde/Objekt fehlen).
