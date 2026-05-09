Ziel: Auf dem Dashboard werden die vier Status-Kacheln (Neue Bestellungen, In Bearbeitung, Versandbereit, Heute auszuliefern) zu Filterschaltern für die darunterliegende Bestellliste. Die separate Tab-Leiste (Neu / In Bearbeitung / Versandbereit) entfällt.

## Verhalten

- Beim Laden ist „Neue Bestellungen“ aktiv und die Liste zeigt nur neue Bestellungen.
- Klick auf eine Kachel:
  - Setzt den Filter der Liste auf den entsprechenden Status.
  - Hebt die aktive Kachel visuell hervor (kräftigerer Rand + leichter Schatten/Ring in der Akzentfarbe).
- Kachel-Mapping:
  - Neue Bestellungen → Status „neu“
  - In Bearbeitung → Status „in_bearbeitung“
  - Versandbereit → Status „ausgeliefert“ (wie bisher in der Tab-Logik)
  - Heute auszuliefern → alle Bestellungen mit Lieferdatum = heute (alle Status)

## UI-Anpassungen

- `StatCard` erhält optionale Props `onClick`, `active` und einen sichtbaren Aktiv-Zustand (Ring/Outline in passender Variant-Farbe, leicht erhöhter Hintergrund). Bleibt rückwärtskompatibel.
- `BestellungenDashboard`:
  - Tabs/TabsList werden entfernt.
  - Komponente nimmt eine `filter`-Prop entgegen (`"neu" | "in_bearbeitung" | "ausgeliefert" | "heute"`).
  - Header zeigt den aktuell aktiven Filter als Titel/Untertitel an (z. B. „Bestellungen · In Bearbeitung“).
  - „heute“ wird über einen passenden Hook abgefragt (entweder neuer Hook für heutige Bestellungen oder serverseitig vorhandene Daten kombinieren). Für „heute“ werden alle Status angezeigt, sortiert nach Priorität/Lieferzeit.
- `Index.tsx`:
  - Lokaler State `selectedFilter`, Default „neu“.
  - Vier `StatCard`s bekommen `onClick` und `active`.
  - `BestellungenDashboard filter={selectedFilter}` darunter.

## Verifikation

- Mobile (390px) und Desktop bei 994px prüfen:
  - Klick auf jede Kachel ändert die Liste sichtbar.
  - Aktive Kachel ist klar hervorgehoben.
  - Keine Tab-Leiste mehr sichtbar, keine Layout-Sprünge.