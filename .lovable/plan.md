## Mint-Hintergrund für die gesamte App

### Ziel
Das aktuelle Blue/Gray-Design-System auf ein professionelles Mint-Theme umstellen.

### Änderungen

**1. `src/index.css` — Design-Token anpassen**
- `--background`: Hellmint statt Hellgrau (HSL ca. 150–160, 30–40%, 95–97%)
- `--primary`: Dunkles Mint/Teal statt Blau (HSL ca. 160–170, 70%, 35–40%)
- `--accent`: Subtiler Mint-Ton statt Blau-Ton
- `--sidebar-background`: Dunkles Mint/Slate statt Dunkelblau
- `--sidebar-primary`, `--sidebar-accent`, `--sidebar-ring`: Passend zu Mint harmonisieren
- Alle weiteren abgeleiteten Tokens (Secondary, Muted, Border, Input, Ring) auf Mint-Palette abstimmen

**2. Kontrast & Lesbarkeit**
- Sicherstellen, dass `--foreground` auf `--background` ausreichend Kontrast bietet
- `--sidebar-foreground` und `--sidebar-accent-foreground` prüfen

**3. Verifikation**
- Screenshot der Objekte-Seite nach den Änderungen zur visuellen Prüfung

### Technische Details
- Keine neuen Dependencies nötig
- Reine CSS-Variablen-Änderung in `index.css`
- Tailwind-Klassen bleiben unverändert (verwenden die Tokens automatisch)
- Keine Dateien außer `src/index.css` werden angefasst