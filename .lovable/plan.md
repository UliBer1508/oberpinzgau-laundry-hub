# PWA aktivieren & Installations-Funktion

Die PWA-Konfiguration ist bereits vorhanden (`vite-plugin-pwa`, Manifest, Icons, Meta-Tags), aber es fehlen drei Dinge:
1. Sichere Registrierung (verhindert Probleme im Lovable-Editor-Preview / iframe)
2. Eine sichtbare „App installieren"-Funktion
3. Service-Worker-Schutz für OAuth-Routen

## Was umgesetzt wird

### 1. Sichere Service-Worker-Registrierung
- `src/main.tsx`: PWA-Registrierung nur wenn **nicht** im iframe und **nicht** auf einer Lovable-Preview-Domain. In Preview/iframe werden bestehende Service Worker abgemeldet, damit der Editor stabil bleibt.
- `vite.config.ts`: `devOptions: { enabled: false }` (SW nur im Production-Build aktiv) und `navigateFallbackDenylist: [/^\/~oauth/]` ergänzen.

### 2. Installations-UI
- Neuer Hook `src/hooks/usePWAInstall.ts`: fängt das `beforeinstallprompt`-Event ab, erkennt iOS (Safari liefert kein Event → Anleitung zeigen) und meldet ob die App schon installiert ist (`display-mode: standalone`).
- Neue Komponente `src/components/PWAInstallButton.tsx`: 
  - Auf Android/Desktop-Chrome → Button „App installieren" → ruft den Browser-Prompt auf
  - Auf iOS Safari → Dialog mit Anleitung „Teilen → Zum Home-Bildschirm"
  - Wenn bereits installiert → versteckt
- Integration im Header/Sidebar (`src/components/Layout` oder vergleichbar) als dezenter Button, plus optionales Banner auf der Startseite `/` für nicht-installierte mobile Nutzer.

### 3. Hinweis an dich
- PWA-Funktionen (Install-Prompt, Offline) funktionieren **nur in der veröffentlichten Version** (`oberpinzgau-laundry-hub.lovable.app`), **nicht im Editor-Preview**. Im Preview ist der Button bewusst inaktiv.
- iOS unterstützt keinen automatischen Install-Prompt — Nutzer müssen über „Teilen → Zum Home-Bildschirm" installieren. Die Komponente zeigt das automatisch an.

## Technische Details

**Geänderte/neue Dateien:**
- `vite.config.ts` — `devOptions.enabled: false`, `navigateFallbackDenylist`
- `src/main.tsx` — Iframe-/Preview-Guard vor SW-Registrierung
- `src/hooks/usePWAInstall.ts` — neu
- `src/components/PWAInstallButton.tsx` — neu
- `src/components/Layout.tsx` (oder Header) — Button einhängen

**Erkennung iOS:** `/iphone|ipad|ipod/i.test(navigator.userAgent) && !/CriOS|FxiOS/i.test(...)`
**Erkennung installiert:** `window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone`
