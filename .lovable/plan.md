## Ziel

Diese Management-App (Teuni) zusätzlich an die externe Supabase-Datenbank `uzworhojxcxbtsbttstp` anbinden – dieselbe DB, die das Kundenportal nutzt. Dadurch sehen beide Apps dieselben Kunden, Objekte, Artikel, Sets, Bestellungen und Rechnungen. Lovable Cloud bleibt technisch aktiv (lässt sich nicht deaktivieren), wird aber im App-Code nicht mehr verwendet.

## Architektur

```
Kundenportal (andere App) ─┐
                           ├──► Supabase  uzworhojxcxbtsbttstp  (gemeinsam)
Wäscheportal (diese App) ──┘
```

## Schritte

### 1. Externer Supabase-Client (parallel zum Lovable-Cloud-Client)
Neue Datei `src/integrations/external/client.ts`:
- URL `https://uzworhojxcxbtsbttstp.supabase.co` und Anon-Key hardcoded (Lovable verwaltet `.env` selbst und überschreibt sie).
- Optionen: `persistSession: true`, `autoRefreshToken: true`, `storage: localStorage`.
- Eigener `storageKey` (z. B. `sb-uzworhoj-auth`), damit kein Konflikt mit dem Lovable-Cloud-Client entsteht.
- Export als benannter `supabase` (Drop-in-Ersatz für bisherige Imports).

### 2. Minimaler Typ-Export
Neue Datei `src/integrations/external/types.ts`:
- Generisches `Database`-Interface mit `{ Row: any; Insert: any; Update: any }` für jede genutzte Tabelle:
  `kunden`, `objekte`, `waeschebestellungen`, `bestellpositionen`, `waeschesets`, `waescheset_artikel`, `waescheartikel`, `rechnungen`, `rechnungspositionen`, `rechnungseinstellungen`, `zahlungen`, `user_roles`, `liefertouren`, `liefertour_stopps`, `routenvorlagen`, `routenvorlage_kunden`, `waeschekraefte`, `bestellung_history`, `profiles`.
- `supabase.from('kunden')` kompiliert ohne Fehler, allerdings ohne Spalten-Autovervollständigung.

### 3. Auth auf externe DB umstellen
- `src/contexts/AuthContext.tsx` und `src/pages/Auth.tsx` nutzen den neuen externen Client.
- `onAuthStateChange` vor `getSession()` registrieren (Pattern bleibt).
- Profile-Fetch nur durchführen, wenn `profiles` in externer DB existiert (sonst entfernen).
- Helper `hasRole(userId, 'admin' | 'waeschekraft' | 'kunde')` per `supabase.rpc('has_role', { _user_id, _role })`. Wird später für Berechtigungsprüfungen in der UI benötigt.

### 4. Alle App-Hooks und Komponenten umbiegen
Imports von `@/integrations/supabase/client` → `@/integrations/external/client` in:
- Hooks: `useKunden`, `useObjekte`, `useWaescheartikel`, `useWaeschesets`, `useBestellungen`, `useBestellungDetail`, `useBestellungenMitDetails`, `useManagementBestellungen`, `useLiefertouren`, `useRoutenvorlagen`, `useRechnungen`, `useRechnungseinstellungen`, `useWaeschekraefte`, `useDashboard`
- Pages/Komponenten, die direkt importieren (per Suche identifiziert)
- `AuthContext.tsx`, `Auth.tsx`

Der Lovable-Cloud-Client (`src/integrations/supabase/client.ts`) bleibt unangetastet, wird aber nirgends mehr referenziert.

### 5. Edge Functions (nicht in diesem Schritt)
`supabase/functions/external-order-import` und `create-invoice` laufen weiter auf der Lovable-Cloud-Infrastruktur und greifen auf die alte (jetzt ungenutzte) DB zu. Sie werden in diesem Schritt **nicht** migriert – das wäre eine Folgeaufgabe (Deployment auf der externen Supabase-Instanz via deren CLI).

### 6. Verifikation
Nach dem Umbau:
- App lädt ohne Build-Fehler, Login-Maske erscheint.
- Login mit existierendem User aus externer DB funktioniert.
- Network-Tab zeigt Requests an `uzworhojxcxbtsbttstp.supabase.co`.
- Kundenliste, Objekte und Bestellungen aus dem Kundenportal sind sichtbar.
- Console frei von RLS-/Auth-Fehlern.

## Wichtige Hinweise

- **RLS aktiv**: Damit Teuni in der Management-App schreiben/lesen darf, muss sein User in der externen `user_roles`-Tabelle die Rolle `admin` haben. Falls noch nicht vorhanden, muss ein Eintrag direkt in der externen DB ergänzt werden (ich kann das nicht von hier aus tun).
- **Storage-Bucket `objekt-bilder`** ist in der externen DB bereits vorhanden und wird automatisch über den neuen Client verwendet.
- **Schema-Änderungen** an der externen DB müssen direkt im Supabase-Dashboard von `uzworhojxcxbtsbttstp` erfolgen – Lovable-Migrationen wirken weiterhin nur auf die alte Cloud-DB.
- **Typ-Sicherheit eingeschränkt**: Bei Bedarf später eine echte `types.ts` per `supabase gen types typescript --project-id uzworhojxcxbtsbttstp` lokal generieren und einsetzen.
