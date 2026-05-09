## Ziel

Das Wäscheportal wieder auf seine eigene, dedizierte Lovable-Cloud-Datenbank (`pkpnowevagxmhyqlawng`) umstellen. Die Verbindung zur Kundenportal-DB (`uzworhojxcxbtsbttstp`) wird vollständig entfernt.

## Schritte

### 1. Externen Client und Typen entfernen
- Datei `src/integrations/external/client.ts` löschen
- Datei `src/integrations/external/types.ts` löschen
- Verzeichnis `src/integrations/external/` entfernen

### 2. Imports zurück auf den Lovable-Cloud-Client
In allen betroffenen Dateien Import von `@/integrations/external/client` → `@/integrations/supabase/client` zurückändern, sowie `@/integrations/external/types` → `@/integrations/supabase/types`. Betroffen:
- `src/contexts/AuthContext.tsx`
- `src/pages/Bestellungen.tsx`
- `src/hooks/useKunden.ts`, `useObjekte.ts`, `useWaescheartikel.ts`, `useWaeschesets.ts`, `useBestellungen.ts`, `useBestellungDetail.ts`, `useBestellungenMitDetails.ts`, `useManagementBestellungen.ts`, `useLiefertouren.ts`, `useRoutenvorlagen.ts`, `useRechnungen.ts`, `useRechnungseinstellungen.ts`, `useWaeschekraefte.ts`, `useDashboard.ts`

### 3. Verifikation
- TypeScript-Check (`tsc --noEmit`) muss grün sein
- App lädt, Network-Tab zeigt Requests an `pkpnowevagxmhyqlawng.supabase.co`
- Kundenliste zeigt die ursprünglich in dieser App angelegten Datensätze

## Hinweise

- Die ursprüngliche Lovable-Cloud-DB war die ganze Zeit aktiv und enthält alle Daten und Tabellen wie zuvor – nichts ist verloren.
- Verwaltung der DB erfolgt über den **Cloud**-Tab im Lovable-Editor (Tabellen, Users, Storage, Edge Functions, Secrets).
- Beide Apps (Kundenportal und Wäscheportal) sind danach datentechnisch komplett getrennt. Falls später ein Datenaustausch gewünscht ist (z. B. Bestellungen aus dem Kundenportal automatisch ins Wäscheportal), kann dafür die bestehende Edge Function `external-order-import` genutzt werden – das wäre eine eigene Folgeaufgabe.
