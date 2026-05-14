# PWA-Installation reparieren

## Gefundene Probleme

1. **Icons sind kaputt** (Hauptproblem – verhindert „Installieren"-Button auf Android/Chrome):
   - `public/pwa-192x192.png` → tatsächlich **512×512 JPEG** (falscher Inhalt, falsches Format)
   - `public/pwa-512x512.png` → tatsächlich **512×512 JPEG** (als PNG deklariert)
   - Chrome/Android verlangen mindestens ein **echtes 192×192 PNG** und ein **512×512 PNG** mit korrektem MIME‑Type, sonst wird die App nicht als installierbar erkannt – auf iOS sieht das Home‑Screen‑Icon zudem kaputt/verzerrt aus.

2. **Kein dediziertes maskable Icon**: Aktuell wird `pwa-512x512.png` doppelt verwendet (einmal `any`, einmal `any maskable`). Maskable Icons brauchen einen Sicherheitsbereich (Safe Zone), sonst wird das Icon auf Android am Rand abgeschnitten.

3. **Apple Touch Icon fehlt korrekt**: `index.html` referenziert `pwa-192x192.png` (das ist ein JPEG) – iOS zeigt dann ggf. gar kein Icon beim „Zum Home‑Bildschirm".

## Was sonst bereits gut ist (muss nicht geändert werden)

- `vite-plugin-pwa` ist korrekt konfiguriert (`registerType: autoUpdate`, `devOptions.enabled: false`, `NetworkFirst` für Supabase).
- `main.tsx` unregistered den Service Worker im Lovable‑Preview/iframe – richtig.
- `usePWAInstall` + `PWAInstallButton` mit iOS‑Anleitung sind sauber implementiert.
- Manifest (`name`, `short_name`, `start_url`, `display: standalone`, `theme_color`) ist vollständig.
- Meta‑Tags in `index.html` (theme‑color, apple‑mobile‑web‑app‑*) sind gesetzt.

→ Sobald die Icons korrekt sind, sollte die Installation auf Android (Chrome), Desktop (Chrome/Edge) und iOS (Safari → Teilen → Zum Home‑Bildschirm) zuverlässig funktionieren.

## Umsetzung

### 1. Icons neu generieren
Drei neue, korrekt dimensionierte PNGs mit dem Wäscheportal‑Branding (Paket‑Symbol, Primärfarbe `#1e3a5f`):

- `public/pwa-192x192.png` – echtes 192×192 PNG, „any"-Variante (Logo füllt den Großteil)
- `public/pwa-512x512.png` – echtes 512×512 PNG, „any"-Variante
- `public/pwa-512x512-maskable.png` – 512×512 PNG mit ~20% Safe‑Zone Padding, damit Android das Icon nicht abschneidet
- `public/apple-touch-icon.png` – 180×180 PNG mit abgerundetem Look für iOS Home Screen

### 2. `vite.config.ts` Manifest anpassen
Drei Icon‑Einträge statt zwei – das maskable Icon zeigt auf die neue Datei:

```ts
icons: [
  { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
  { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
  { src: "pwa-512x512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
]
```

Außerdem `apple-touch-icon.png` in `includeAssets` aufnehmen.

### 3. `index.html` Apple Touch Icon korrigieren
```html
<link rel="apple-touch-icon" href="/apple-touch-icon.png" />
```

### 4. Verifikation
- Build laufen lassen und prüfen, dass Manifest + Icons korrekt ausgeliefert werden.
- In der **publizierten** App (nicht im Lovable‑Preview, dort ist SW absichtlich deaktiviert) testen:
  - Chrome Desktop: Installations‑Icon in der Adressleiste erscheint
  - Android Chrome: „App installieren"‑Banner / Menüeintrag erscheint
  - iOS Safari: Über Teilen → Zum Home‑Bildschirm erscheint korrektes Icon

## Hinweis an dich

Die Installation funktioniert **nur in der publizierten Version** (`oberpinzgau-laundry-hub.lovable.app` oder eigene Domain), nicht in der Lovable‑Vorschau. Das ist Absicht – im Editor‑Preview würde der Service Worker sonst alte Builds cachen. Nach dem Fix musst du also **„Publish → Update"** klicken und dann auf einem echten Gerät testen.
