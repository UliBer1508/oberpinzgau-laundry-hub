## Plan: Einheitlicher „Zurück"-Button in allen Unterseiten

Damit Benutzer nicht über die Sidebar zurücknavigieren müssen, bekommt jede Unterseite einen Zurück-Button im Header.

### Neue Komponente

**`src/components/layout/BackButton.tsx`** *(neu)*
- Ghost-Button mit `ArrowLeft`-Icon und Label „Zurück".
- Verhalten: `navigate(-1)` wenn Historie vorhanden (`window.history.length > 1`), sonst Fallback `navigate("/")` (z. B. bei Direktlink).
- Styling konsistent zur Sidebar-Header-Leiste (`text-sidebar-foreground hover:bg-sidebar-accent`, `h-9`).
- Mobile: nur Icon; ab `sm:` zusätzlich Label.

### Einbau

In jeder Unterseite den Button im sticky `<header>` direkt nach `SidebarTrigger` und vor dem Titelblock einfügen.

Betroffene Seiten:
- `src/pages/Bestellungen.tsx`
- `src/pages/BestellungsManagement.tsx`
- `src/pages/Kunden.tsx`
- `src/pages/Objekte.tsx`
- `src/pages/Liefertouren.tsx`
- `src/pages/Rechnungen.tsx`
- `src/pages/Rechnungseinstellungen.tsx`
- `src/pages/Waescheartikel.tsx`
- `src/pages/Waeschesets.tsx`
- `src/pages/Waeschekraefte.tsx`
- `src/pages/Benutzerverwaltung.tsx`
- `src/pages/Integrationen.tsx`
- `src/pages/Verwaltung.tsx`

**Nicht betroffen:**
- `src/pages/Index.tsx` (Dashboard / Startseite – kein Zurück nötig)
- `src/pages/Auth.tsx`, `src/pages/NotFound.tsx`

### Verhalten

- Klick → eine Seite zurück in der Browser-Historie.
- Ohne Historie (Direkteinstieg, neuer Tab) → Dashboard `/`.
- Mobile: nur Icon; Desktop: Icon + „Zurück".
