## Plan: Lovable-Prompt für Hausverwaltung-Integration

Ich erstelle einen kopierfertigen Prompt, den du in einem **neuen Lovable-Projekt** (deine Hausverwaltung) einfügen kannst. Der Prompt baut die Anbindung an die Teuni-Schnittstelle, zeigt Wäscheartikel + Teuni-Wäschesets-Vorlagen an und erlaubt die Auswahl/Erstellung pro Haus. **Bestellfunktion ist explizit ausgeklammert.**

### Inhalt des Prompts

**1. Projektkontext**
- Ziel: In bestehende Hausverwaltung-App eine „Wäsche"-Sektion ergänzen
- Stack-Annahme: React + Tailwind + shadcn/ui + Lovable Cloud (Supabase)

**2. Verwendete Teuni-Endpoints** (read-only)
- `GET /functions/v1/external-articles` → Liste Wäscheartikel (Filter: `aktiv`, `kategorie`, `search`)
- `GET /functions/v1/external-vorlagen-sets` → Teuni-Vorlagen mit Positionen (Filter: `aktiv`, `kategorie`)
- Base-URL: `https://pkpnowevagxmhyqlawng.supabase.co`
- Auth: `Authorization: Bearer <EXTERNAL_API_KEY>` → Secret in Lovable Cloud anlegen lassen
- Beispielresponses werden mitgegeben

**3. UI-Anforderungen**
- Seite „Teuni-Katalog" mit zwei Tabs: **Artikel** und **Vorlagen-Sets**
- Artikel: Tabelle/Karten mit Bild, Name, Kategorie, Größe, Farbe, Preis – Such- und Kategoriefilter
- Vorlagen-Sets: Karten-Grid (Bild, Name, Kategorie, Anzahl Positionen, Preisaufstellung), klickbar für Detail-Dialog mit Positionsliste (`menge` + `berechnungsart` `pro_buchung`/`pro_gast`)
- Auf Haus-Detailseite Sektion „Wäschesets": Liste der zugewiesenen Sets + Buttons:
  - „Vorlage übernehmen" (öffnet Picker mit Teuni-Vorlagen → kopiert Positionen)
  - „Eigenes Set erstellen" (Editor: Artikel aus Teuni-Katalog wählen, Menge + Berechnungsart pro Zeile)
  - „Bearbeiten" / „Löschen"

**4. Datenmodell – zwei Varianten beschrieben**

*Variante A: Lokale Speicherung (empfohlen, sofort einsatzbereit)*
- Tabellen in eigener Lovable-Cloud-DB:
  - `haus_waeschesets` (id, haus_id, name, vorlage_quelle_id nullable, beschreibung)
  - `haus_waescheset_positionen` (id, set_id, artikelnummer, artikel_name_snapshot, menge, berechnungsart)
- Vorlagen werden beim Übernehmen **kopiert** (Snapshot), künftige Änderungen bei Teuni schlagen nicht durch
- Optional: Versions-/Resync-Button

*Variante B: Sync zurück zu Teuni*
- Erfordert zusätzliche Teuni-Endpoints (`POST/PUT/DELETE` für Kunden-Sets), die aktuell **nicht existieren**
- Kurzer Hinweis im Prompt: bei Bedarf bei Teuni anfordern

**5. Implementierungs-Hints**
- Edge Function Wrapper (`teuni-proxy`) in eigener App, der `EXTERNAL_API_KEY` server-seitig hält → nicht im Browser
- React Query Hooks: `useTeuniArtikel()`, `useTeuniVorlagen()`
- Caching 5 Min, Stale-While-Revalidate
- Berechnungsart-Hinweis: `pro_buchung` = fixe Menge je Buchung, `pro_gast` = Menge × Anzahl Gäste (für spätere Bestellauslösung wichtig, hier nur anzeigen)

**6. Explizit ausgeklammert**
- Bestellung an Teuni senden (separater späterer Schritt via `external-order-import`)
- Rechnungsabruf

### Lieferung
Die fertige Prompt-Datei wird unter `/mnt/documents/teuni-hausverwaltung-prompt.md` als Download bereitgestellt – damit kannst du sie 1:1 in ein neues Lovable-Projekt einfügen.
