## Ziel
Im Dialog "Neues Wäscheset erstellen" (Vorlagen-Sets) die bisherige Suche-und-Hinzufügen-Combobox durch eine **scrollbare Artikelliste mit Inline-Steuerung** ersetzen. Pro Zeile: Bild, Art.-Nr., Name, Kategorie/Farbe, Mengen-Stepper, Toggle Pro Buchung / Pro Gast, Plus-Button.

## Änderungen in `src/components/vorlagen/VorlageFormDialog.tsx`

**Entfernen** (Add-article-Sektion, ca. Zeile 567–670):
- Popover/Combobox `artikelPopoverOpen`, `selectedArtikel`
- Globale Eingabefelder `menge`, `berechnungsart` (RadioGroup unten)
- "Hinzufügen"-Button am Footer der Sektion

**Neu** statt dessen: Block "Artikel auswählen" mit
1. Header-Zeile mit
   - Suchfeld (`Input` + Lucide `Search`-Icon), filtert nach `artikelnummer`, `name`, `bezeichnung`
   - Kategorie-`Select` (Optionen: "Alle" + die 5 Standardkategorien aus `KATEGORIEN_ARTIKEL`)
2. Scrollbare Liste (`max-h-[360px] overflow-y-auto`, gerahmt) mit einer Zeile je verfügbarem Artikel:
   - links: Thumbnail (`bild_url` 40×40, Fallback Package-Icon)
   - Art.-Nr. (mono) + Name + Kategorie-Badge + Farb-Punkt
   - rechts: Mengen-Stepper (lokaler State `rowMengen[artikelId]`, Default 1) mit `–` / Input / `+`
   - Toggle-Button (lokaler State `rowBerechnung[artikelId]`, Default `pro_buchung`) – gleicher Stil wie in der Set-Tabelle (Calendar/User Icon)
   - Plus-Button "Hinzufügen" – ruft bestehende `handleAddArtikel`-Logik mit `(artikelId, menge, berechnungsart)` auf
3. Bereits hinzugefügte Artikel werden in der Liste **ausgegraut** und der Plus-Button durch ein grünes Check-Icon ersetzt (Hinweis "Bereits im Set"). Liste filtert sie nicht raus, damit Position stabil bleibt.

**Bestehend bleibt unverändert**:
- Tabelle "Artikel im Set" oben (Mengen-Anpassung, Toggle, Trash dort wie bisher)
- `pendingArtikel` / `existingArtikel` Logik, `useAddVorlageArtikel`, Submit-Flow
- Bild-Upload, Name/Kategorie/Beschreibung-Felder

## Technisch
- `verfuegbareArtikel` (bereits vorhanden) bleibt Quelle, aber **ohne** Filterung gegen "schon hinzugefügt" – ersetzt durch `alleArtikel`. Stattdessen Set aus aktuell vergebenen `artikel_id` für die Ausgrau-Logik.
- `handleAddArtikel` wird angepasst, sodass Menge/Berechnungsart als Argumente übergeben werden statt aus globalem State zu lesen.
- Neuer Imports: `Search` aus lucide-react. `RadioGroup`, `Popover`, `Command*`, `ChevronsUpDown` werden nicht mehr gebraucht und entfernt.

## Nicht geändert
- `WaeschesetFormDialog` (Kundenportal) bleibt wie es ist.
- Datenbank, Hooks, externe API.
