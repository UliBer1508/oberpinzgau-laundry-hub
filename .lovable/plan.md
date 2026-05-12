## Plan: „Rechnungen Übersicht öffnen"-Karte aus Schnellaktionen entfernen

Die Karte „Rechnungen · Übersicht öffnen" in den Schnellaktionen ist eine reine Navigations-Verknüpfung und doppelt sich mit der „Rechnungen"-Kachel in der Übersicht. Schnellaktionen sollen Aktionen ausführen (erstellen/drucken), nicht navigieren.

### Änderung

**`src/components/dashboard/QuickActionsUpdated.tsx`**
- Entfernen: `<QuickActionCard label="Rechnungen" description="Übersicht öffnen" … />`
- Import `Receipt` aus `lucide-react` entfernen (nicht mehr verwendet)

Alle anderen Karten bleiben unverändert: „Neue Bestellung", „Neuen Arbeitsauftrag", „Tour planen", „Bestellungen drucken", „Arbeitsaufträge drucken", „Rechnungen drucken".
