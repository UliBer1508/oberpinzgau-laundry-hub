## Problem
In jeder Zeile zeigt der aktuelle Toggle nur den **aktiven** Wert (z. B. „📅 Pro Buchung"). Dass dieser Button anklickbar ist und auf „Pro Gast" wechselt, ist nicht erkennbar – der User denkt, es gibt nur „Pro Buchung".

## Lösung
Ersetze den Single-Button durch ein **Segmented-Control mit beiden Optionen sichtbar**. Beide Knöpfe sind immer zu sehen, der aktive ist farblich hervorgehoben.

## Änderung in `src/components/vorlagen/VorlageFormDialog.tsx`

Im Artikel-Picker (innerhalb der Listen-Zeilen) den bisherigen Toggle-Button ersetzen durch einen kompakten Zwei-Tasten-Block:

```text
┌─────────────────┬──────────────┐
│ 📅 Pro Buchung  │  👤 Pro Gast │   ← aktiver Eintrag = primary, inaktiver = ghost
└─────────────────┴──────────────┘
```

Verhalten:
- Klick auf einen der beiden Knöpfe setzt direkt `rowBerechnung[a.id]` auf den entsprechenden Wert (kein Toggle-Logik mehr nötig).
- Aktive Seite: `bg-primary text-primary-foreground`, inaktive: transparent + Hover.
- Container: `inline-flex rounded-md border bg-background p-0.5`, Höhe ~28 px, kompakt damit Layout passt.
- Bei `disabled` (Artikel bereits im Set) bleiben beide sichtbar, aber nicht klickbar.

## Nicht geändert
- Logik / State / Submit / Datenbank.
- Toggle in der oberen „Artikel im Set"-Tabelle bleibt wie er ist (dort ist Kontext klar, eine Spalte).
