## Dashboard-Kacheln: 2 pro Reihe auf Mobile

Aktuell zeigt das Dashboard auf Mobile **eine Kachel pro Reihe**, weil das Grid erst ab `sm` (640 px) auf 2 Spalten geht. Die Anzeige wird so angepasst, dass schon auf Mobile **immer 2 Kacheln nebeneinander** stehen.

### Änderung

`src/pages/Index.tsx` (Zeile 38)

Vorher:
```
grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5
```
Nachher:
```
grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-5
```

- `grid-cols-2` ab Mobile aktiv → Bestellungen + Kunden in einer Reihe, Arbeitsaufträge + Liefertouren in der nächsten, Rechnungen darunter.
- Etwas reduzierter Gap (`gap-3` statt `gap-4`) auf Mobile, damit die Kacheln nicht zu eng wirken.
- Ab `lg` weiter 3 Spalten, ab `xl` 5 Spalten — wie bisher.

Falls du auch innerhalb der Kachel (Padding, Schriftgröße) was anpassen willst (kompakteres Layout für 2 Spalten), sag kurz Bescheid — sonst bleibt das Innenleben unverändert.
