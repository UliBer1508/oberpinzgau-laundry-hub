## Ziel

Klick auf das Schnellaktion-Widget **"Arbeitsauftrag"** soll nicht mehr nur zur Verwaltungsseite navigieren, sondern direkt einen kleinen Dialog öffnen, mit dem ein Arbeitsauftrag erstellt werden kann (= Bestellung auswählen + Wäschekraft zuweisen + optional Priorität).

## Konzept "Arbeitsauftrag"

Im aktuellen Datenmodell existiert keine separate Tabelle. Ein **Arbeitsauftrag** entspricht einer `waeschebestellungen`-Zeile mit:
- zugewiesener `waeschekraft_id`
- Status `in_bearbeitung`
- optional gesetzter `prioritaet` und `bearbeitung_deadline`

Diese Zuweisung erfolgt heute zeilenweise auf `/bestellungen/management`. Das neue Widget bündelt diesen Vorgang in einem fokussierten Dialog.

## Änderungen

### 1. Neue Komponente `src/components/management/ArbeitsauftragErstellenDialog.tsx`

Dialog mit folgenden Feldern:

| Feld | Pflicht | Quelle |
|---|---|---|
| Bestellung | ja | Select über offene Bestellungen (Status `neu`, ohne `waeschekraft_id`); Anzeige: Bestellnummer + Kunde + Lieferdatum |
| Wäschekraft | ja | Select aus `useWaeschekraefteForSelect()` |
| Priorität | nein | Normal / Hoch / Dringend (Default Normal) |
| Bearbeitung bis | nein | DatePicker, leer = keine Deadline |

Verhalten:
- "Erstellen"-Button → führt **eine** Update-Mutation auf der gewählten Bestellung aus:
  - `waeschekraft_id` setzen
  - `status` → `in_bearbeitung`
  - `prioritaet` setzen (falls geändert)
  - `bearbeitung_deadline` setzen (falls gewählt)
- Nach Erfolg: Dialog schließen, Toast "Arbeitsauftrag erstellt", Navigation nach `/bestellungen/management`
- Keine offenen Bestellungen vorhanden → Hinweis im Dialog mit Link "Neue Bestellung erstellen"

### 2. Neuer Hook-Eintrag in `src/hooks/useManagementBestellungen.ts`

`useCreateArbeitsauftrag()` — ein einzelner Mutation-Hook, der die obigen Felder atomar in einem `update` schreibt und die Listen-Queries invalidiert (`bestellungen`, `management-bestellungen`, `dashboard-stats`).

Alternativ können bestehende Hooks (`useUpdateWaeschekraft`, `useUpdateManagementStatus`, ...) sequenziell genutzt werden — bevorzugt aber **ein** Update für Atomizität.

### 3. Daten-Hook für offene Bestellungen

In derselben Datei `useOffeneBestellungenForArbeitsauftrag()` ergänzen:
- Selektiert `id, bestellnummer, lieferdatum, kunde:kunden(name)` aus `waeschebestellungen`
- Filter: `status = 'neu'` UND `waeschekraft_id IS NULL`
- Sortierung nach `lieferdatum ASC`

### 4. `src/components/dashboard/QuickActionsUpdated.tsx`
- Lokaler State `arbeitsauftragOpen`
- "Arbeitsauftrag"-Widget: `onClick` öffnet den neuen Dialog statt zu navigieren
- Dialog wird am Ende der Komponente gerendert

## Out of Scope
- Keine Änderung am Datenmodell / kein Migration
- Keine Änderungen an `/bestellungen/management` selbst
- Keine Bulk-Zuweisung (mehrere Bestellungen gleichzeitig)
- Reihenfolge (`reihenfolge`) wird nicht gesetzt — bleibt bei Drag&Drop in der Management-Seite
