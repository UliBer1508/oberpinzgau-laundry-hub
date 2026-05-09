Ziel: Auf dem Handy keinen Überlauf nach rechts mehr, und die wichtigsten Bereiche über eine feste Bottom-Navigation erreichbar machen (wie im Referenzbild). Die Sidebar bleibt auf Tablet/Desktop wie bisher.

## Was geändert wird

1. Neue Bottom-Navigation für Mobile
   - Neue Komponente `MobileBottomNav` mit 5 festen Einträgen: Start, Objekte, Bestellen, Rechnungen, Sets.
   - Fixiert am unteren Rand, volle Breite, mit Safe-Area-Padding für iPhones.
   - Aktiver Eintrag wird im Mint-Akzent hervorgehoben (Pille hinter dem Icon, farbiger Text), inaktive grau – analog zum Referenzbild.
   - Nur sichtbar < `md` Breakpoint (Mobile). Auf Tablet/Desktop bleibt die Sidebar.

2. Sidebar mobil ausblenden
   - Auf Mobile wird die Sidebar inkl. Hamburger-Trigger im Header ausgeblendet, da Navigation jetzt über Bottom-Nav läuft.
   - Sidebar-Overlay-Modus auf Mobile bleibt deaktiviert; ab `md` funktioniert die Sidebar wie gewohnt.
   - Header zeigt auf Mobile nur noch Titel/Datum, ohne Sidebar-Toggle.

3. Layout-Padding für Bottom-Nav
   - Haupt-Content (`main`) bekommt unten zusätzliches Padding (`pb-20`) auf Mobile, damit Inhalte nicht von der Bottom-Nav verdeckt werden.
   - Wird zentral über das Layout aller betroffenen Seiten angewandt (Dashboard, Kunden, Objekte, Bestellungen, Bestellungs­management, Liefertouren, Rechnungen, Wäscheartikel, Wäschesets, Wäschekräfte).

4. Überlauf nach rechts beheben
   - Dashboard-Bestellkarten: rechte Spalte (Datum + Pfeil) auf Mobile unterhalb statt daneben, lange Tags brechen sauber um.
   - Tabs „Neu / In Bearbeitung / Versandbereit“ werden auf Mobile horizontal scrollbar, statt 3 Spalten zu erzwingen.
   - Container und Cards bekommen durchgängig `min-w-0` und `max-w-full`, damit Inhalte nie über den Viewport hinauslaufen.
   - Padding-Reduktion in `StatCard` (`p-6` → `p-4 sm:p-6`) und Karten generell auf Mobile.

5. Mobile-Verifikation
   - Nach dem Umbau bei 390px Breite die Hauptseiten prüfen: keine horizontale Scrollbar, Bottom-Nav vorhanden, Inhalte komplett sichtbar.

## Bottom-Nav Einträge

Vorgeschlagene 5 Tabs (passen zur täglichen Nutzung am Handy):

```text
[ Start ]  [ Objekte ]  [ Bestellen ]  [ Rechnungen ]  [ Sets ]
   /         /objekte     /bestellungen   /rechnungen    /waeschesets
```

Falls du andere 5 Einträge bevorzugst (z. B. „Touren“ statt „Sets“ oder „Arbeit“ statt „Objekte“), sag kurz Bescheid – sonst gehe ich mit obiger Auswahl live.