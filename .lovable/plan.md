## Ziel
Auf Mobile (< md) keine horizontal scrollenden Tabellen mehr. Stattdessen pro Zeile eine kompakte, klickbare Karte (Tap = Detail/Bearbeiten öffnen). Auf Tablet/Desktop bleibt die Tabelle unverändert.

## Betroffene Tabellen
Aktuell scrollt auf 390px-Mobile horizontal. Diese bekommen eine Mobile-Card-Variante:

1. `RechnungenTable` → Karte: Rechnungsnr. + Status-Badge oben, Kunde, Bestellnr., Brutto, Datum
2. `KundenTable` → Karte: Name/Firma, Kundennr., Ort, Status
3. `ObjekteTable` → Karte: Name, Typ, Kunde, Ort
4. `WaescheartikelTable` → Karte: Bild + Name, Artikelnr., Kategorie/Farbe, Preis
5. `WaeschesetsTable` → Karte: Name, Objekt, Anzahl Artikel
6. `WaeschekraefteTable` → Karte: Name, Personalnr., Typ, Telefon
7. `LiefertourenTable` → Karte: Tournr./Name, Datum, Fahrer, Status, # Stopps
8. `DeliveryTable` (Dashboard) → Karte: Bestellnr., Kunde, Lieferdatum, Status
9. `RollenTab` (Benutzerverwaltung) → Karte: Rollenname, Beschreibung
10. `RoutenvorlagenTab` → Karte: Name, # Kunden

Bereits OK (keine Änderung nötig):
- `ManagementTable` (hat bereits `ManagementMobileList`)
- `BestellungenTable` (rendert schon Karten)

Dialog-interne Tabellen (`BestellungenUebersichtDialog`, `BestellungPositionenDialog`, `Waesche­setArtikelDialog`, `WaeschesetFormDialog`) werden in diesem Schritt **nicht** angefasst, da Dialoge auf Mobile ohnehin Vollbild sind und meist eine eigene UX brauchen.

## Vorgehen pro Tabelle
- Tabellen-Wrapper: `hidden md:block` um Tabelle, `md:hidden` für neue Karten-Liste.
- Neue Komponente `*MobileList.tsx` neben jeder Table-Komponente nach Vorbild von `ManagementMobileList.tsx`.
- Karte: `Card` mit Klick-Handler (öffnet bestehenden `onViewDetails`/`onEdit`-Callback). Aktionen-Menü (Bearbeiten/Löschen) als Dropdown rechts oben in der Karte.
- Status-Badges, Bilder und Icons aus der Tabelle wiederverwenden für visuelle Konsistenz.
- Semantische Tokens nutzen (keine direkten Farb-Klassen).

## Technische Details
- Pattern: Container rendert beide Varianten, gleiche Props.
- Klick auf Kartenfläche → primäre Aktion (meist `onViewDetails` bzw. `onEdit` falls keine Detail-Ansicht existiert).
- Dropdown-Klicks via `e.stopPropagation()` damit der Karten-Click nicht ausgelöst wird.
- Keine Logik-/Datenänderungen, rein Präsentation.
