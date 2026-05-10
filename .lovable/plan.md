## Ziel

Liefertouren (`/liefertouren`) und Rechnungen (`/rechnungen`) bekommen das gleiche Layout wie die Bestellungen-Liste: einheitliche Karten auf allen Bildschirmgrößen statt Desktop-Tabelle, im selben Stil wie `BestellungenTable` (rounded-xl, Border, Shadow, Header mit Nummer + Status-Badge, Footer mit Icon-Werten, Aktions-Dropdown rechts).

## Änderungen

### 1. `src/components/liefertouren/LiefertourenTable.tsx`
Komplett neu im Bestellungen-Karten-Stil:
- `<div className="grid gap-3">` mit einer Karte pro Tour (statt Mobile/Desktop-Split)
- **Header:** `tournummer` (mono) + `name` (fett) + `LiefertourStatusBadge` + `MoreHorizontal`-Dropdown (Stopps verwalten / Bearbeiten / Status-Aktionen)
- **Footer:** Datum (Calendar-Icon), Wäschekraft (User-Icon), Stopps-Progress (`erledigtCount/stoppCount` + Progress-Bar)
- Klick auf Karte → `onManageStopps(tour)` (wie bisher mobile)
- Empty-State im gleichen Stil wie Bestellungen (Card mit Icon + Text)

### 2. `src/components/rechnungen/RechnungenTable.tsx`
Komplett neu im Bestellungen-Karten-Stil:
- `<div className="grid gap-3">` mit einer Karte pro Rechnung
- **Header:** `rechnungsnummer` (mono) + `bestellnummer` (klein) + `RechnungStatusBadge` + Überfällig-/Mahnung-Badges + `MoreHorizontal`-Dropdown (Details / Bezahlt / Mahnung / Stornieren)
- **Kunde:** Firma + Name
- **Footer:** Rechnungsdatum (Calendar-Icon), Fälligkeitsdatum (Clock-Icon, rot wenn überfällig), Bruttobetrag (Euro-Icon, rechtsbündig fett)
- Klick auf Karte → `onViewDetails(rechnung)`
- Empty-State analog

### 3. Nicht angefasst
- Stats-Komponenten beider Seiten (sind bereits 2/4-spaltig korrekt)
- Filter-Bars
- Detail-Dialoge, Hooks, Page-Komponenten
