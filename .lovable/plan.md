## Ziel

Die "Schnellaktionen"-Karte auf dem Dashboard durch **4 größere, klickbare Widget-Karten** im 2×2-Raster (mobil 2 Spalten, Desktop bis zu 4 Spalten) ersetzen. Jede Karte führt direkt in den entsprechenden Erstellungs-Flow.

## Widgets

| Widget | Icon | Variant | Zielroute | Aktion auf Zielseite |
|---|---|---|---|---|
| Neue Bestellung | `ShoppingCart` | primary | `/bestellungen?neu=1` | Bestellungs-Formular-Dialog öffnet automatisch |
| Arbeitsauftrag erstellen | `ClipboardList` | warning | `/bestellungen/management` | Direkt in die Arbeitsverwaltung |
| Tour planen | `Truck` | info | `/liefertouren?neu=1` | Tour-Erstellungs-Dialog öffnet automatisch |
| Rechnung erstellen | `Receipt` | success | `/rechnungen?neu=1` | Rechnungs-Erstellungs-Flow öffnet automatisch |

Klick auf das gesamte Widget triggert die Navigation. Größeres Format mit Icon oben/links, Titel groß darunter, optional kurze Sub-Beschreibung.

## Änderungen

### 1. Neue Komponente `src/components/dashboard/QuickActionCard.tsx`
- Klickbare Card mit Icon (groß, in farbigem Badge-Kreis), Titel und Beschreibung
- Variants: `primary | info | warning | success`
- Hover-Effekt (Schatten + leichtes Skalieren), Cursor pointer
- `min-h-[120px]` für deutlich größere Touch-Fläche als bisher

### 2. `src/components/dashboard/QuickActionsUpdated.tsx` (umschreiben)
- 2×2 Grid: `grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4`
- Vier `QuickActionCard`-Einträge gemäß Tabelle oben
- CardHeader "Schnellaktionen" bleibt
- Card-Wrapper bleibt, damit Layout in `Index.tsx` konsistent ist

### 3. Deep-Link-Unterstützung auf den Zielseiten

**`src/pages/Bestellungen.tsx`**
- `useSearchParams` lesen
- `useEffect`: wenn `?neu=1`, `handleAddBestellung()` aufrufen und Param entfernen

**`src/pages/Liefertouren.tsx`**
- `useSearchParams` lesen
- `useEffect`: wenn `?neu=1`, vorhandenen "Tour erstellen"-Dialog öffnen (State auf `true`) und Param entfernen

**`src/pages/Rechnungen.tsx`**
- `useSearchParams` lesen
- `useEffect`: wenn `?neu=1`, vorhandenen Rechnungs-Erstellungs-Dialog/Flow öffnen und Param entfernen
- Falls aktuell kein expliziter "Rechnung erstellen"-Dialog existiert: Auto-Fokus auf die bestehende Erstellungs-Aktion bzw. Hinweis-Toast

**Arbeitsauftrag-Widget** benötigt keinen Deep-Link — `/bestellungen/management` ist die Arbeitsauftragsseite selbst.

## Out of Scope
- Keine Änderungen an der Daten-Schicht oder den Erstellungs-Mutations
- Keine Anpassung der StatCards oben auf dem Dashboard
- Keine neuen Routen
