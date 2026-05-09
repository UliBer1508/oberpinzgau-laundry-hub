# Plan: Objektbilder hinzufügen

## Ziel
Objekte können mit einem Foto hinterlegt werden (z.B. Gebäudeansicht, Hausfassade). Bild wird im Dialog hochgeladen, als Thumbnail in der Liste angezeigt.

## Datenbank-Änderungen

1. **Spalte ergänzen**
   - `ALTER TABLE public.objekte ADD COLUMN IF NOT EXISTS bild_url text;`

2. **Storage-Bucket erstellen**
   - Bucket `objekt-bilder`, public = true
   - RLS-Policies: Lesen öffentlich, Hochladen/Aktualisieren/Löschen nur für authentifizierte Nutzer

## UI-Änderungen

### 1. ObjektFormDialog – Bild-Upload
- Neuer Abschnitt "Objektbild" im Dialog
- Bild-Vorschau falls `bild_url` vorhanden
- Upload-Button: Datei wählen → hochladen zu `objekt-bilder/{objekt_id}/{filename}`
- Löschen-Button um Bild zu entfernen
- Upload-State (Lade-Spinner) während Hochladen

### 2. ObjekteTable – Thumbnail-Spalte
- Neue erste Spalte mit Bild-Thumbnail (z.B. 48x48, rounded)
- Fallback-Icon (Building2) wenn kein Bild vorhanden
- Bild bleibt responsiv, ohne die Tabelle zu sprengen

### 3. Hooks – Upload-Logik
- `useObjekte.ts`: Upload-Funktion `uploadObjektBild(objektId, file)`
- Lösch-Funktion `deleteObjektBild(objektId, bildUrl)`
- Beide nutzen Supabase Storage Client

### 4. TypeScript-Types
- `Objekt` Type erweitern um `bild_url?: string | null`
- Automatisch via Supabase-Types nach Migration

## Technische Details

- **Speicherpfad:** `objekt-bilder/{objekt_id}/{timestamp}_{filename}`
- **Cache-Invalidation:** Nach Upload/Delete `queryClient.invalidateQueries(['objekte'])`
- **Fehlerbehandlung:** Toast bei Upload-Fehlern, Dateigrößen-Limit (5MB), nur Bild-Dateitypen (jpg, png, webp)
- **Keine Breaking Changes:** `bild_url` ist nullable, bestehende Objekte funktionieren unverändert

## Dateien, die geändert werden

- `src/components/objekte/ObjektFormDialog.tsx`
- `src/components/objekte/ObjekteTable.tsx`
- `src/hooks/useObjekte.ts`
- Datenbank-Migration (separater Schritt)
