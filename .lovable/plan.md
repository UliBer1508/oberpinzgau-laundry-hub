## Ziel

Klick auf das Verwaltungs-Icon im Dashboard-Header soll nicht mehr direkt zur Benutzerverwaltung führen, sondern zu einer **Verwaltungs-Übersichtsseite**, auf der alle Verwaltungs-Bereiche als große, klickbare Widgets angezeigt werden.

## Verwaltungs-Bereiche (6 Widgets)

Identisch zu den Einträgen in der Sidebar-Sektion "Verwaltung":

| Widget | Route | Icon | Variant |
|---|---|---|---|
| Wäschekräfte/Fahrer | `/waeschekraefte` | `UserCheck` | primary |
| Wäscheartikel | `/waescheartikel` | `Package` | info |
| Wäschesets | `/waeschesets` | `Layers` | success |
| Rechnungseinstellungen | `/rechnungseinstellungen` | `FileText` | warning |
| Benutzerverwaltung | `/benutzer` | `Settings` | primary |
| API & Integrationen | `/integrationen` | `Plug` | info |

## Änderungen

### 1. Neue Seite `src/pages/Verwaltung.tsx`
- Layout analog zu `/` (SidebarProvider + AppSidebar + Header)
- Header: "Verwaltung" mit Untertitel "Stammdaten und Einstellungen"
- Inhalt: 2-spaltiges Grid (mobil) bzw. 3-spaltig ab `lg` mit den 6 Widgets
- Wiederverwendung der bestehenden `QuickActionCard`-Komponente — gleiche Optik wie Dashboard-Schnellaktionen, Konsistenz gewährleistet
- Jedes Widget mit Titel + kurzer Beschreibung, navigiert per Klick zur jeweiligen Route

### 2. `src/App.tsx`
- Neue Route: `<Route path="/verwaltung" element={<RequireAccess resource="benutzer"><Verwaltung /></RequireAccess>} />`
- Import der neuen Seite

### 3. `src/pages/Index.tsx`
- Settings-Icon im Dashboard-Header: `navigate("/benutzer")` → `navigate("/verwaltung")`

## Out of Scope
- Keine Änderungen an den einzelnen Verwaltungs-Seiten selbst
- Keine Änderung an der Sidebar (Einträge bleiben unverändert)
- Keine Berechtigungs-Filterung pro Widget (Route ist via RequireAccess geschützt)
