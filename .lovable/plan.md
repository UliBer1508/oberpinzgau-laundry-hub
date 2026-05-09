## Ziel
Dashboard-Layout neu strukturieren: 5 Übersichts-Kacheln (Bestellungen, Kunden, Arbeitsaufträge, Liefertouren, Rechnungen) statt der bisherigen Status-Filter. „Dashboard" aus der Sidebar entfernen.

## Änderungen

### 1. Sidebar bereinigen
**`src/components/layout/AppSidebar.tsx`** und **`src/components/layout/MobileBottomNav.tsx`**
- Eintrag „Dashboard" aus `mainNavItems` entfernen.
- Logo/Header in der Sidebar bleibt klickbar als Link auf `/` (Dashboard bleibt als Startseite erreichbar).

### 2. Dashboard-Statistiken erweitern
**`src/hooks/useDashboard.ts`** – `useDashboardStats` erweitern um:
- `bestellungen.total` (vorhanden)
- `kunden.total` (neu, `kunden` count)
- `arbeitsauftraege` (neu) – Bestellungen mit Status `neu` + `in_bearbeitung`
- `liefertouren.total` + `liefertouren.heute` (vorhanden)
- `rechnungen.total` + `rechnungen.offen` (neu, `rechnungen` count)

### 3. Dashboard-Seite umbauen
**`src/pages/Index.tsx`**
- Stats-Grid auf 5 Kacheln umstellen (responsive: 1 / 2 / 3 / 5 Spalten):
  1. **Bestellungen** → klick → `/bestellungen`
  2. **Kunden & Objekte** → klick → `/kunden`
  3. **Arbeitsaufträge** (offen) → klick → `/bestellungen/management`
  4. **Liefertouren** (heute / gesamt) → klick → `/liefertouren`
  5. **Rechnungen** (offen / gesamt) → klick → `/rechnungen`
- Jede Kachel zeigt Hauptzahl + kleinen Subtext (z. B. „3 heute", „2 offen").
- `BestellungenDashboard` mit Status-Filter wird entfernt – stattdessen darunter zwei kompakte Sektionen behalten:
  - `TodayLiefertouren` (heutige Touren)
  - `QuickActionsUpdated` (Schnellaktionen)
- Die alten Filter-States (`filter`, `setFilter`, `DashboardFilter`) entfallen auf dieser Seite.

### 4. Navigation
- `/` bleibt als Dashboard-Route bestehen.
- Logo / App-Name in Sidebar als Link nach `/` setzen, damit der Einstieg ins Dashboard ohne eigenen Menüpunkt möglich ist.

## Layout-Skizze

```text
┌───────────────────────────────────────────────────────────┐
│ Header: Dashboard · Samstag, 9. Mai 2026                  │
├───────────────────────────────────────────────────────────┤
│ [Bestellungen] [Kunden] [Arbeitsauftr.] [Touren] [Rechn.] │
├───────────────────────────────────────────────────────────┤
│ Liefertouren heute        │  Schnellaktionen              │
└───────────────────────────────────────────────────────────┘
```

## Verifikation
- `/` zeigt 5 Kacheln, jede ist klickbar und führt zur jeweiligen Seite.
- Sidebar (Desktop) und Bottom-Nav (Mobil) enthalten keinen „Dashboard"-Eintrag mehr.
- Klick auf Logo/App-Name führt nach `/`.
- Keine Konsolen-Fehler; Counts entsprechen den DB-Werten.