Ziel: Kunden und ihre Objekte in einer einzigen Ansicht darstellen. Der eigene Sidebar-Eintrag „Objekte“ entfällt; Objekte werden ausschließlich aus dem Kontext eines Kunden gepflegt.

## Neue Darstellung der Kundenliste

Die bisherige reine Tabelle wird durch eine **aufklappbare Kundenkarten-Liste** ersetzt:

```text
┌─────────────────────────────────────────────────────────────┐
│ ▸ K470214  Uli Berresheim · 5741 Neukirchen   [Lieferung] 2 │  Aktiv
└─────────────────────────────────────────────────────────────┘
   beim Aufklappen ▾:
   ┌──────────────────────────────────────────────────────────┐
   │ Objekte (2)                          [+ Neues Objekt]    │
   │ ───────────────────────────────────────────────────────── │
   │ 🏨 Chalet Wald            Ferienhaus  · Neukirchen   ⋯   │
   │ 🏨 Exklusives Chalet…     Chalet      · Neukirchen   ⋯   │
   └──────────────────────────────────────────────────────────┘
```

- Pro Kunde eine kompakte Zeile mit Kd-Nr., Name/Firma, Ort, Bestellart-Badge, Objekte-Anzahl, Aktiv-Status, „Bearbeiten“-Menü.
- Klick auf die Zeile (oder den Pfeil) klappt einen Bereich auf, der alle Objekte des Kunden listet.
- Im aufgeklappten Bereich:
  - Liste der Objekte mit Name, Typ, Ort, optional Bild-Thumbnail.
  - Pro Objekt: Bearbeiten, Wäschesets verwalten, Aktiv/Inaktiv, Löschen.
  - Button „+ Neues Objekt“ legt direkt ein Objekt für diesen Kunden an (Kunden-ID vorbelegt, Auswahl entfällt).
- Mehrere Kunden können gleichzeitig aufgeklappt sein (Accordion mit `type="multiple"`).
- Filter/Suche bleiben oben: Kundensuche, Bestellart, „Nur aktive“. Suche durchsucht zusätzlich Objektnamen, sodass passende Kunden mit aufgeklapptem Objekt-Treffer angezeigt werden.

## Sidebar / Navigation

- Eintrag „Objekte“ wird aus Sidebar und Bottom-Nav entfernt.
- Die Route `/objekte` bleibt zunächst bestehen, leitet jedoch auf `/kunden` um, damit alte Links und QuickActions nicht ins Leere laufen.
- Die bisherige Kundenkarten-Aktion „Objekte anzeigen“ entfällt (oder klappt einfach den Eintrag auf).

## Datenfluss

- Neuer Hook bzw. Erweiterung: pro Kunde werden seine Objekte direkt mitgeladen (entweder über `useObjekte()` clientseitig nach `kunde_id` gruppiert, oder `useKunden()` erweitern um `objekte: Objekt[]`).
- Anlegen/Bearbeiten/Status-Toggle/Löschen nutzt die bestehenden Hooks `useCreateObjekt`, `useUpdateObjekt`, `useToggleObjektAktiv`.
- Anlage über die Karte: `ObjektFormDialog` wird mit vorbelegtem `kunde_id` geöffnet; der Kunden-Selector im Dialog wird ausgeblendet/disabled.

## Komponenten

- Neue Komponente `KundenWithObjekteList` (Accordion-basiert), ersetzt `KundenTable` in der Kundenseite.
- `KundeObjekteSection` (eingebettet pro Kunde) zeigt die Objekt-Liste + Aktionen.
- `ObjektFormDialog` bekommt eine optionale Prop `lockedKundeId`, mit der die Kunden-Auswahl ausgeblendet wird.
- Bestehende `KundenTable.tsx`, `ObjekteTable.tsx`, `ObjekteFilter.tsx`, `ObjekteStats.tsx` bleiben verfügbar, werden aber in der UI nicht mehr verlinkt.

## Aufräumen

- Sidebar-Eintrag „Objekte“ entfernen.
- Bottom-Nav-Eintrag „Objekte“ entfernen.
- `/objekte` als Redirect zu `/kunden` definieren.
- Verweise wie `window.location.href = "/objekte?kunde=…"` entfallen, weil alles in der Kundenkarte passiert.

## Verifikation

- Mobile (390px) und Desktop:
  - Kundenliste erscheint mit Aufklapp-Symbol.
  - Aufklappen zeigt die zugehörigen Objekte korrekt.
  - „+ Neues Objekt“ legt ein Objekt direkt für den richtigen Kunden an.
  - Bearbeiten/Aktiv-Toggle funktioniert.
  - „Objekte“ erscheint nicht mehr in Sidebar / Bottom-Nav.
  - Aufruf von `/objekte` leitet auf `/kunden` um.