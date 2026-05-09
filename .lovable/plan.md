## Ziel

Die Sidebar verlinkt `/benutzer`, aber es existiert keine Seite – derzeit landet man auf "Not Found". Wir bauen eine vollständige Benutzerverwaltung, die nur Admins benutzen dürfen.

## Datenbank

Bestehende Tabellen werden genutzt:
- `profiles` (id, email, name, telefon)
- `user_roles` (user_id, role) mit Enum `app_role`: `admin`, `waeschekraft`, `kunde`

Migration:
- Security-Definer-Funktion `public.has_role(_user_id uuid, _role app_role)` anlegen (falls nicht vorhanden), um Rollen rekursionssicher zu prüfen.
- RLS auf `profiles` und `user_roles` aktivieren mit Policies:
  - Jeder eingeloggte User darf seine eigenen Daten lesen/aktualisieren.
  - Admins (`has_role(auth.uid(), 'admin')`) dürfen alles lesen, ändern, löschen.
- Die "Rollen definieren"-Anforderung wird so umgesetzt, dass die drei vorhandenen Rollen (`admin`, `waeschekraft`, `kunde`) als feste Auswahl angeboten werden. Neue Rollen-Werte würden eine Schema-Erweiterung des Enums erfordern – das machen wir nur, falls du tatsächlich zusätzliche Rollen möchtest.

## Edge Functions (Service-Role-Zugriff nötig)

`auth.users` lässt sich nur mit Service-Role anlegen/löschen, deshalb zwei Functions:

1. `admin-create-user` – Input: email, password, name, role
   - Prüft per JWT, dass Aufrufer Admin ist (`has_role`)
   - Legt Auth-User mit `auth.admin.createUser({ email_confirm: true })` an
   - Profil-Eintrag entsteht automatisch via bestehendem Trigger `handle_new_user`
   - Fügt Eintrag in `user_roles` ein

2. `admin-delete-user` – Input: user_id
   - Prüft Admin-Rechte
   - Löscht Auth-User; Profile/Rollen werden via FK-Cascade entfernt (FK ggf. in Migration ergänzen)

Rollen-Updates (Zuweisung/Wechsel) laufen ohne Edge Function direkt über die `user_roles`-Tabelle (Admin-RLS-Policy erlaubt das).

## Frontend

Neue Seite `src/pages/Benutzerverwaltung.tsx`, in `App.tsx` als Route `/benutzer` registriert.

Aufbau analog zu bestehenden Verwaltungs-Seiten (Sidebar + Header + Card-Layout):

- Header mit Titel "Benutzerverwaltung" und Button "Neuer Benutzer".
- Such-/Filterleiste (Name, E-Mail, Rolle).
- Tabelle: Avatar/Initialen, Name, E-Mail, Rolle (Select-Badge), Erstellt am, Aktionen (Bearbeiten, Löschen).
- Dialog `BenutzerFormDialog` zum Anlegen (E-Mail, Passwort, Name, Rolle) und Bearbeiten (Name, Telefon, Rolle).
- Rollen-Wechsel direkt in der Zeile per Select – speichert sofort.
- Lösch-Bestätigungs-Dialog.

Hooks: `useBenutzer`, `useCreateBenutzer`, `useUpdateBenutzer`, `useDeleteBenutzer`, `useUpdateRolle` (React Query).

## Zugriffsschutz

- `useCurrentUserRole`-Hook: liest aus `user_roles` für `auth.uid()`.
- Auf `/benutzer`: Falls Rolle ≠ `admin`, Redirect auf `/` mit Toast "Keine Berechtigung".
- Sidebar-Eintrag "Benutzerverwaltung" wird für Nicht-Admins ausgeblendet.

## Hinweise

- Da im Dev-Modus aktuell RLS deaktiviert und Auth offen ist, erstellen wir die Policies trotzdem – sie greifen sobald RLS reaktiviert wird. Für die Schutzlogik im Frontend brauchen wir aber einen eingeloggten Admin, sonst kommt niemand auf die Seite. Falls du die Seite vorerst auch ohne Login erreichen willst, sag Bescheid – dann lassen wir den Rolle-Check weg.
- Erster Admin: muss einmalig manuell in `user_roles` eingetragen werden (via SQL). Ich kann das nach dem Migrations-Schritt für deinen vorhandenen Account erledigen, wenn du mir die User-ID nennst.
