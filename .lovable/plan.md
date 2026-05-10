## Ziel

Die Arbeitsverwaltung (`/bestellungen/management`) soll vom Look & Feel exakt der Bestellungen-Seite (`/bestellungen`) entsprechen:
- Stats-Karten oben in der gewohnten Größe (4 Karten nebeneinander auf Desktop, 2×2 auf Tablet/Mobile)
- Arbeitsaufträge in der Liste **immer** als einzelne Karten – auch auf Desktop, statt der bisherigen Tabelle

## Änderungen

### 1. Stats-Karten kleiner (`src/components/management/ManagementStats.tsx`)
Grid-Klassen wieder auf das Standardraster setzen:
```text
grid-cols-2 lg:grid-cols-4
```
(aktuell `grid-cols-2` ohne lg-Stufe → die Karten werden auf Desktop unnötig riesig)

Damit verhalten sich die 4 Status-Karten (Gesamt / Neu / In Bearbeitung / Ausgeliefert) genau wie auf Bestellungen und Rechnungen.

### 2. Arbeitsaufträge immer als Karten (`src/components/management/ManagementTable.tsx`)
- Die Desktop-Tabelle (mit Drag-and-Drop, `ManagementTableRow`) wird entfernt.
- Auf allen Breakpoints wird die Karten-Liste (`ManagementMobileList`) gerendert, identisch zum Bestellungen-Layout.
- `md:hidden` / `hidden md:block` Wrapper entfallen.
- DnD-Kit-Imports, `useUpdateReihenfolge`-Hook und der gesamte `handleDragEnd`-Block werden entfernt, da nicht mehr verwendet.
- Das Empty-State-Markup bleibt (nur einmal, ohne Tabelle).

### 3. Folge: Drag-and-Drop-Reihenfolge entfällt
Die manuelle Sortierung per Drag-and-Drop war an die Tabelle gebunden und wird mit dem Wegfall der Tabelle entfernt. Die Sortierung erfolgt weiterhin automatisch nach Priorität und Lieferdatum (Logik in `BestellungsManagement.tsx` bleibt unverändert). Die Datenbank-Spalte `reihenfolge` wird nicht angefasst.

## Nicht betroffen
- `BestellungsManagement.tsx` (Filter, Sortierung, Header, Excel-Export) – keine Änderungen nötig
- `ManagementMobileList.tsx` – wurde bereits ans Bestellungen-Karten-Design angeglichen
- `ManagementFilterBar.tsx`, Detail-Dialog, Hooks
