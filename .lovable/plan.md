## Ziel
Bestellungen-Liste neu gestalten: Klick auf eine Bestellung öffnet direkt den Bearbeiten-Dialog, und das Layout wird moderner und übersichtlicher (keine horizontale Scrollleiste mehr).

## Änderungen

### 1. `src/pages/Bestellungen.tsx`
- `onViewDetails` der Tabelle so umverdrahten, dass beim Zeilen-Klick `handleEditBestellung` (Bearbeiten-Dialog) aufgerufen wird statt des Detail-Dialogs.
- Detail-Dialog bleibt verfügbar, aber nicht mehr per Zeilenklick (wird über separaten Button "Details" zugänglich gemacht).

### 2. `src/components/bestellungen/BestellungenTable.tsx` – komplettes Redesign
Statt klassischer breiter Tabelle mit 10 Spalten → moderne **Card-/Listen-Ansicht**:

```text
┌─────────────────────────────────────────────────────────────────┐
│ B0001  ●Ausgeliefert  [⚡Priorität]                  ⋮ Menü   │
│ Uli Berresheim · Chalet Wald                                    │
│ 🛏 3× Bettlaken weiß  · 2× Handtuch grau  +2 weitere            │
│ ─────────────────────────────────────────────────────────────── │
│ 📅 19.12.25 10:23   👤 Maria K.   💶 86,40 €   🧾 Ausstehend   │
└─────────────────────────────────────────────────────────────────┘
```

Pro Zeile:
- **Kopfzeile**: Bestellnummer (mono, fett), Status-Badge, ggf. Prioritäts-Badge, rechts ein Dropdown-Menü (⋮) mit "Bearbeiten", "Details ansehen", "Status ändern", "Löschen".
- **Kunde / Objekt** als zweite Zeile (Kunde fett, Objekt muted).
- **Positionen-Vorschau**: erste 3 Artikel als kleine Badges, "+N weitere" wenn mehr.
- **Footer-Zeile** mit Icons: Lieferdatum + Zeit, Wäschekraft, Betrag, Zahlungsstatus.

Karten sind klickbar (gesamte Karte) → öffnet Bearbeiten-Dialog. Aktions-Menü stoppt Event-Propagation.

Vorteile gegenüber der aktuellen Tabelle:
- Kein horizontales Scrollen mehr (passt in 994 px Viewport).
- Mobile-freundlich, da vertikal gestapelt.
- Wichtige Infos stärker gewichtet (Status & Bestellnr. oben, Geld & Datum unten).
- Konsistent mit dem Stil der bestehenden Dashboard-Bestellkarten (`BestellungenDashboard.tsx`).

### 3. Daten / Hooks
Keine Änderungen am Datenmodell oder den Hooks nötig — `useBestellungen` liefert bereits alle benötigten Felder. Positions-Vorschau lässt sich aus dem bestehenden `bestellungen[].positionen` (analog zum Dashboard) ziehen; falls nicht vorhanden, lediglich aus `useBestellungenMitDetails` ergänzen.

## Außerhalb des Scope
- Filter, Stats-Widgets, Detail-Dialog selbst, Form-Dialog: bleiben unverändert.
- Keine DB-/Backend-Änderungen.
