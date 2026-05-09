## Ziel

Auf `/bestellungen/management` die aktuellen "Gesamt" / "Offen" Info-Badges durch das gleiche **klickbare StatCard-Widget-Layout** ersetzen, das schon in Liefertouren und Kunden verwendet wird (2 Spalten mobil, 4 Spalten ab `lg`).

## Änderungen

### 1. Neue Komponente `src/components/management/ManagementStats.tsx`
Analog zu `LiefertourenStats.tsx`, basierend auf `StatCard` aus `@/components/dashboard/StatCard`.

Vier Widgets, jeweils klickbar (toggelt `statusFilter`):

| Widget | Quelle | Variant | Filter |
|---|---|---|---|
| Gesamt | `bestellungen.length` | primary | `statusFilter = "all"` |
| Neu | `status === "neu"` | info | `statusFilter = "neu"` |
| In Bearbeitung | `status === "in_bearbeitung"` | warning | `statusFilter = "in_bearbeitung"` |
| Ausgeliefert | `status === "ausgeliefert"` | success | `statusFilter = "ausgeliefert"` |

Klick auf eine bereits aktive Karte setzt den Filter zurück auf `"all"` (gleiches Verhalten wie in Liefertouren/Kunden).

Props:
```ts
{
  bestellungen: ManagementBestellung[];
  statusFilter: string;
  onStatusChange: (s: string) => void;
}
```

### 2. `src/pages/BestellungsManagement.tsx`
- Import von `ManagementStats`
- Direkt unter `<ManagementHeader />` einfügen:
  ```tsx
  <ManagementStats
    bestellungen={filteredBestellungen}
    statusFilter={statusFilter}
    onStatusChange={setStatusFilter}
  />
  ```

### 3. `src/components/management/ManagementHeader.tsx`
- Die beiden Info-Boxen "Gesamt:" und "Offen:" entfernen (werden durch die neuen Widgets ersetzt)
- `totalCount` / `openCount` Props entfernen
- Aufrufer in `BestellungsManagement.tsx` entsprechend anpassen
- Datums-Navigation und Heute/7 Tage/Alle bleiben unverändert

## Out of scope
- Keine Änderungen an Filter-Bar, Tabelle, Daten-Hook oder Business-Logik
- Keine Style-Änderungen am bestehenden StatCard-Komponent
