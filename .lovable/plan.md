## Plan: Speicherbare Export-Voreinstellungen pro Benutzer

Klick auf eine Druck-/Export-Karte führt — sofern eine Voreinstellung gespeichert ist — den Export direkt aus. Ein Zahnrad-Icon auf der Karte öffnet weiterhin den Dialog zum Ändern.

### 1. Datenbank (Migration)

Neue Tabelle `user_export_presets` (pro Benutzer + Export-Typ genau ein Preset):

```text
- user_id          uuid (auth.users)
- preset_type      text  ('bestellungen' | 'arbeitsauftraege' | 'rechnungen')
- statuses         text[]
- date_mode        text  ('heute' | 'morgen' | 'woche' | 'alle' | 'custom')
- von              date  (nullable, nur bei custom)
- bis              date  (nullable, nur bei custom)
- action           text  ('print' | 'excel')
- created_at, updated_at
- UNIQUE(user_id, preset_type)
```

RLS:
- SELECT/INSERT/UPDATE/DELETE: nur eigener `user_id` (`auth.uid() = user_id`).
- Trigger `update_updated_at_column` auf `updated_at`.

### 2. Frontend

**`src/hooks/useExportPresets.ts`** *(neu)*
- React-Query-Hook lädt alle Presets des aktuellen Benutzers (`['export_presets']`).
- `savePreset(type, preset)` (upsert auf `user_id, preset_type`).
- `deletePreset(type)`.

**`src/lib/runExport.ts`** *(neu)*
- Extrahiert `loadRows()`-Logik aus `ExportDialog.tsx` (Bestellungen/Arbeitsaufträge/Rechnungen-Queries).
- Helper `resolveDateRange(mode, von, bis)` rechnet `heute/morgen/woche` aktuell aus.
- `executeExport(type, preset)` lädt Daten und ruft entweder `printList` oder `exportXlsx`.

**`src/components/dashboard/ExportDialog.tsx`** *(refactor)*
- Beim Öffnen Preset laden und State (statuses, mode, von, bis, action) damit vorbelegen.
- Quick-Buttons setzen `mode`; manuelle Datumsänderung → `mode = "custom"`.
- Footer erweitert um:
  - Switch „Diese Auswahl als Schnell-Aktion speichern".
  - Wenn aktiv → Drucken/Excel speichert zusätzlich Preset (mit gewählter Aktion).
  - Bei vorhandenem Preset: kleiner Button „Voreinstellung entfernen".
- Datenladen nutzt jetzt `runExport.ts`.

**`src/components/dashboard/QuickActionCard.tsx`** *(erweitern)*
- Neue optionale Props: `badge?: ReactNode`, `secondaryAction?: { icon, label, onClick }`.
- Rendert oben rechts ein kleines Zahnrad-Icon (klickt nicht durch zur Hauptaktion) wenn `secondaryAction` gesetzt ist, plus dezentes „Auto"-Badge wenn `badge` gesetzt.

**`src/components/dashboard/QuickActionsUpdated.tsx`**
- Hook `useExportPresets()` einbinden.
- Pro Export-Karte:
  - Hauptklick: `runExport(type)` wenn Preset existiert, sonst Dialog öffnen.
  - Zahnrad-Icon (sekundär): immer Dialog öffnen.
  - „Auto"-Badge wenn Preset existiert, mit Tooltip „Aktuelle Voreinstellung: <Status, Zeitraum, Aktion>".

### 3. Verhalten / UX

- Direktausführung zeigt Toast „X Einträge exportiert" (wie heute) plus Aktion „Einstellungen ändern" → öffnet Dialog.
- Ohne eingeloggten Benutzer: Presets nicht verfügbar → Karten verhalten sich wie bisher (Dialog).
- Quick-Modus „heute/morgen/woche" wird relativ gespeichert — datum wird bei jeder Ausführung neu berechnet.

### Offene Implementierungs-Notiz

`waeschebestellungen` hat aktuell keine RLS — der Export liest dort weiter direkt. Nur die neue Tabelle `user_export_presets` bekommt strikte RLS pro Benutzer.
