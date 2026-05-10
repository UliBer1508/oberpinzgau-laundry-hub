# Karten-Layout für Personal, Wäscheartikel, Wäschesets, Benutzer

Einheitliches Karten-Layout (wie Liefertouren/Rechnungen) auf alle vier Seiten anwenden. Bestehende Tabellen-Ansichten werden durch das Karten-Grid ersetzt.

Karten-Format (analog `LiefertourenTable`):
- `grid gap-3` (1 Spalte mobil, `md:grid-cols-2 xl:grid-cols-3`)
- Karte: `group rounded-xl border bg-card p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-primary/30`, `role="button"` mit Enter/Space
- Kopf: ID/Schlüssel + Status-Badge + `MoreVertical` Dropdown rechts
- Titel: Name (`text-base font-semibold`)
- Footer (durch `border-t pt-3` getrennt): Icons + Sekundär-Infos
- Inaktive Karten: `opacity-60`

## 1. `src/components/waeschekraefte/WaeschekraefteTable.tsx`
Tabellen + Mobile-Block ersetzen durch Karten-Grid.
- Kopf: `personalnummer` (mono) · Typ-Badge (`Wäschekraft`/`Fahrer`/`Beides`) · Status-Badge (Aktiv/Inaktiv) · Dropdown (Bearbeiten / Aktivieren / Portal / Löschen)
- Titel: `name`
- Footer: `Phone` telefon · `Mail` email · `MapPin` adresse · `Key`-Badge Portal-Status
- Klick auf Karte → `onEdit`

## 2. `src/components/waescheartikel/WaescheartikelTable.tsx`
Tabelle + Mobile-Block ersetzen durch Karten-Grid. Sortierung wird auf Filter-Bar verschoben? **Nein** – Sortier-Steuerung bleibt erhalten als kleine `Select`-Leiste (`sortField` + `asc/desc`) oberhalb des Grids, statt Spaltenkopf-Buttons.
- Kopf-Bereich: links 56×56-Bild (oder `ImageIcon`-Platzhalter), daneben `artikelnummer` (mono) + Status-Badge + Dropdown (Bearbeiten / Aktivieren)
- Titel: `name`
- Meta-Zeile: Kategorie-Badge · Farb-Punkt + Farbe · Größe · `bezeichnung` (truncate)
- Footer: Preis rechts (mono, `text-sm font-medium`)

## 3. `src/components/waeschesets/WaeschesetsTable.tsx`
Tabelle + Mobile-Block ersetzen durch Karten-Grid. Empty-State bleibt unverändert.
- Kopf: `name` · Status-Badge · Dropdown (Artikel verwalten / Bearbeiten / Aktivieren)
- Sub-Titel: `kundeName`
- Footer: `Building`-Badge `objektName` · `Package`-Badge `${artikelCount} Artikel` · Preis rechts (mono)
- Beschreibung (falls vorhanden): `text-xs text-muted-foreground line-clamp-2`
- Klick → `onEdit`

## 4. `src/pages/Benutzerverwaltung.tsx` (Tab "Benutzer")
`<Table>` + Wrapper `rounded-lg border bg-card overflow-hidden` ersetzen durch Karten-Grid (gleiche Loader-/Empty-States bleiben).
- Kopf: Avatar-Initialen (`h-9 w-9 rounded-full bg-primary/10`) + `name` + Telefon (klein) | rechts: Rollen-`Select` als Inline-Badge + Action-Icons (`Pencil`, `Trash2` destructive, deaktiviert für eigenen Account)
- Footer: `Mail` email · `Calendar` Erstellt am `dd.MM.yyyy`
- Karte hat KEIN `role="button"` (Inline-Aktionen bleiben), `MoreVertical` wird nicht eingeführt

## Nicht betroffen
- Stats- und Filter-Komponenten der jeweiligen Seiten
- Form-Dialoge
- Hooks und Datenmodell
- Rollen-Tab in der Benutzerverwaltung
