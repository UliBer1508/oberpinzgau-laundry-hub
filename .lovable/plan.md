## Ziel

In der Benutzerverwaltung (`/benutzer`) wird ein neuer Bereich ergänzt, in dem Admins **Rollen** und deren **Zugriffsrechte** auf die einzelnen Bereiche der App zentral definieren können. Bisher sind die Rollen (`admin`, `waeschekraft`, `kunde`) hartkodiert und Berechtigungen über die App verteilt — danach gibt es eine zentrale Stelle.

## UI-Aufbau

Die Seite `/benutzer` bekommt **Tabs**:

1. **Benutzer** (bisheriger Inhalt — Liste, anlegen, löschen, Rolle zuweisen)
2. **Rollen & Rechte** (NEU)

### Tab „Rollen & Rechte"

```text
┌─ Rollen ──────────────┐  ┌─ Rechte für Rolle: [Admin ▾] ───────────────┐
│ ● Admin               │  │ Bereich            Anzeigen  Bearbeiten     │
│ ○ Wäschekraft         │  │ Dashboard            ☑          ☑           │
│ ○ Kunde               │  │ Kunden               ☑          ☑           │
│ ○ Fahrer  (custom)    │  │ Objekte              ☑          ☑           │
│                       │  │ Wäscheartikel        ☑          ☑           │
│ [+ Neue Rolle]        │  │ Wäsche-Sets          ☑          ☑           │
│                       │  │ Bestellungen (CRUD)  ☑          ☑           │
│                       │  │ Bestellungen Mgmt.   ☑          ☑           │
│                       │  │ Liefertouren         ☑          ☑           │
│                       │  │ Rechnungen           ☑          ☑           │
│                       │  │ Wäschekräfte         ☑          ☑           │
│                       │  │ Benutzerverwaltung   ☑          ☑           │
│                       │  │ Einstellungen        ☑          ☑           │
│                       │  │                                              │
│                       │  │              [Abbrechen] [Speichern]         │
└───────────────────────┘  └──────────────────────────────────────────────┘
```

- Linke Spalte: Liste aller Rollen, „Neue Rolle" anlegen, Rolle umbenennen/löschen (Systemrollen `admin`, `waeschekraft`, `kunde` schreibgeschützt).
- Rechte Spalte: Matrix aller App-Bereiche × Aktionen (`view`, `edit`). Änderungen werden gesammelt gespeichert.

### Tab „Benutzer"

- Im Rollen-Dropdown pro Benutzer erscheinen jetzt **alle definierten Rollen** (System + eigene), nicht mehr nur die Enum-Werte.

## Datenbank-Modell

Neue Tabellen:

- **`roles`** — `id`, `key` (slug, z.B. `fahrer`), `label`, `is_system` (bool), `description`
  - Vorbefüllt mit `admin`, `waeschekraft`, `kunde` (alle `is_system = true`).
- **`role_permissions`** — `role_id`, `resource` (z.B. `kunden`, `bestellungen`, `rechnungen`, …), `action` (`view`, `edit`), unique zusammen.
- **`user_roles`** wird erweitert: zusätzlich zu `role` (enum) bekommt es eine optionale `role_id` → `roles.id`. Migration befüllt `role_id` aus dem bestehenden Enum-Wert. Mittelfristig wird die Logik auf `role_id` umgestellt; das Enum bleibt für Abwärtskompatibilität bestehen.

Zugriffsregeln:
- Nur Admins dürfen `roles` und `role_permissions` lesen/ändern (RLS via `has_role(auth.uid(), 'admin')`).
- Eingeloggte User dürfen ihre **eigenen** effektiven Rechte lesen (View `my_permissions`).

## Frontend-Integration

- **Hook `usePermissions()`** liefert für den eingeloggten User ein Set `{resource}:{action}`.
- **Helper `can(resource, action)`** für Inline-Checks (z.B. „Bearbeiten"-Button verstecken).
- **`<RequireAccess resource="..." action="view">`** als Route-Wrapper in `App.tsx`. Fehlt das Recht → Redirect auf `/` mit Toast.
- **AppSidebar** zeigt nur Menüpunkte, für die `view` erlaubt ist.
- Während Dev-Modus (`RLS disabled`) kann ein „Dev-Bypass"-Flag gesetzt werden, damit niemand ausgesperrt wird.

## Bereiche (Resources) initial

`dashboard`, `kunden`, `objekte`, `waescheartikel`, `waeschesets`, `bestellungen`, `bestellungen_management`, `liefertouren`, `rechnungen`, `waeschekraefte`, `benutzer`, `einstellungen`.

Standard-Defaults nach Migration:
- **admin**: alle Bereiche, `view` + `edit`.
- **waeschekraft**: `dashboard`, `bestellungen_management`, `liefertouren` → `view` + `edit`; sonst nichts.
- **kunde**: `dashboard`, `bestellungen` → `view`; `bestellungen` zusätzlich `edit` (nur eigene — feinere Filterung läuft weiter über RLS).

## Technische Details

- Migration: `roles`, `role_permissions`, RLS-Policies, Seed System-Rollen + Default-Permissions, `role_id`-Spalte in `user_roles` + Backfill.
- Neue Komponenten: `src/components/benutzer/RollenTab.tsx`, `RolleFormDialog.tsx`, `RechteMatrix.tsx`.
- Neue Hooks: `useRoles`, `useRolePermissions`, `usePermissions`.
- Neuer Wrapper: `src/components/auth/RequireAccess.tsx`.
- `App.tsx`: alle geschützten Routes mit `<RequireAccess resource="..." />` umschließen.
- `AppSidebar.tsx`: Menüpunkte per `can('xxx','view')` filtern (statt aktueller Rollen-Hardcheck).

## Was nicht enthalten ist

- Feingranulare Feld-Permissions (z.B. „Preis sehen, aber nicht bearbeiten") — bleibt für später.
- Eigene Permissions pro einzelnem User (nur über Rolle).
- Anpassung der Datenbank-RLS auf alle anderen Tabellen — bleibt Dev-State (RLS disabled). Frontend-Schutz greift dennoch sofort.
