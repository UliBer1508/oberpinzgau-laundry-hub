## Plan: Vorlagen-Set-Karten an Wäschesets-Optik angleichen

Die `/vorlagen-sets`-Karten werden auf das identische Layout der `/waeschesets`-Karten umgebaut (siehe Screenshot). Das macht die Karte komplett klickbar zum Bearbeiten und der separate „Bearbeiten"-Button entfällt.

### Antwort: Übernehmen-Button
Aktuell leitet er nur auf `/waeschesets` weiter. Im **Teuni-Portal** (zentrale Standard-Sets) ist „Übernehmen" fehl am Platz – das passiert im Kunden-Workflow, nicht in der Vorlagen-Verwaltung. **Wird entfernt.**

### Änderungen

**1. Neue Komponente** `src/components/vorlagen/VorlagenSetsGrid.tsx`
   - Visuell identisch zu `WaeschesetsTable` (Card-Style, Hover, Aktiv-Badge oben rechts, Dreipunktmenü, Footer mit Badges + Preis rechts)
   - Anpassungen für Vorlagen-Kontext:
     - **Subtitle** statt Kundenname: Kategorie mit `Tag`-Icon (oder leer)
     - **Footer-Badges**: nur „X Artikel" (kein Objekt-Badge, da Vorlagen nicht objektgebunden)
     - **Dropdown-Menü** (3-Punkte): „Bearbeiten", „Aktivieren/Deaktivieren", „Löschen" (rot)
   - Ganze Karte → `onClick={() => onEdit(v)}`, Tastatur-Support

**2. `src/pages/VorlagenSets.tsx`**
   - Inline-`<Card>`-Grid (Zeilen 134–175) durch `<VorlagenSetsGrid sets={vorlagen} onEdit={...} onToggleAktiv={...} onDelete={setDeleteId} />` ersetzen
   - Imports `Card*`, `Pencil`, `ArrowDownToLine`, `Trash2`, `Switch`, `useNavigate` (falls ungenutzt) entfernen
   - „Übernehmen"-Logik vollständig entfernen
   - Bestehende Hooks/Daten/Filter/Dialoge unverändert

### Nicht geändert
- `VorlageFormDialog`, Hooks, Daten, Routen.
- `/waeschesets`-Seite und `VorlageUebernehmenDialog` (bleibt für Kundenportal-Nutzung).
