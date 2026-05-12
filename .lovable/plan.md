## Plan: Schnellaktionen direkt auf Dashboard

Den umschließenden Card-Container der Schnellaktionen entfernen und das gleiche Layout-Muster wie bei "Übersicht" verwenden — Section mit Header-Zeile und ein-/ausklappbarem Grid.

### Änderungen

**`src/components/dashboard/QuickActionsUpdated.tsx`**
- `Card`/`CardHeader`/`CardContent`/`CardTitle`-Wrapper entfernen
- Stattdessen `Collapsible` mit Header-Zeile analog zur Übersicht in `Index.tsx`:
  - `<h2 class="text-sm font-semibold text-muted-foreground">Schnellaktionen</h2>`
  - `CollapsibleTrigger` mit "Einklappen/Ausklappen"-Button und rotierendem Chevron
  - `CollapsibleContent` enthält das bestehende Grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`)
- Lokaler State `actionsOpen` (default `true`)
- `QuickActionCard`-Liste und Dialoge (`ArbeitsauftragErstellenDialog`, `ExportDialog`) bleiben unverändert

**`src/pages/Index.tsx`**
- Den umschließenden `<div className="grid gap-6">` um `<QuickActionsUpdated />` entfernen — direkter Aufruf im `space-y-6`-Container, damit Abstand zur Übersicht konsistent bleibt

### Ergebnis
Beide Sektionen ("Übersicht" und "Schnellaktionen") sind visuell gleichwertig: schlichte Überschrift, Ausklapp-Toggle, Kachel-Grid direkt auf dem Dashboard-Hintergrund — kein doppelter Card-Rahmen mehr.
