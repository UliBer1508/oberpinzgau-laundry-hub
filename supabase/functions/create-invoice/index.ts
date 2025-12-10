import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { bestellung_id } = await req.json();

    if (!bestellung_id) {
      console.error("create-invoice: Keine bestellung_id übergeben");
      return new Response(
        JSON.stringify({ error: "bestellung_id ist erforderlich" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`create-invoice: Starte Rechnungserstellung für Bestellung ${bestellung_id}`);

    // Supabase Client mit Service Role Key erstellen
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Prüfen ob bereits eine Rechnung für diese Bestellung existiert
    const { data: existingInvoice } = await supabase
      .from("rechnungen")
      .select("id, rechnungsnummer")
      .eq("bestellung_id", bestellung_id)
      .single();

    if (existingInvoice) {
      console.log(`create-invoice: Rechnung ${existingInvoice.rechnungsnummer} existiert bereits für Bestellung ${bestellung_id}`);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Rechnung existiert bereits",
          rechnungsnummer: existingInvoice.rechnungsnummer 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Bestellung mit Kundendaten laden
    const { data: bestellung, error: bestellungError } = await supabase
      .from("waeschebestellungen")
      .select(`
        *,
        kunden (*)
      `)
      .eq("id", bestellung_id)
      .single();

    if (bestellungError) {
      console.error("create-invoice: Fehler beim Laden der Bestellung:", bestellungError);
      throw new Error(`Bestellung nicht gefunden: ${bestellungError.message}`);
    }

    console.log(`create-invoice: Bestellung ${bestellung.bestellnummer} geladen`);

    // Positionen mit Artikelpreisen und Farbe laden
    const { data: positionen, error: positionenError } = await supabase
      .from("bestellpositionen")
      .select(`
        *,
        waescheartikel (artikelnummer, name, preis, farbe)
      `)
      .eq("bestellung_id", bestellung_id);

    if (positionenError) {
      console.error("create-invoice: Fehler beim Laden der Positionen:", positionenError);
      throw new Error(`Positionen nicht gefunden: ${positionenError.message}`);
    }

    console.log(`create-invoice: ${positionen?.length || 0} Positionen geladen`);

    // Nettobetrag berechnen
    let nettobetrag = 0;
    const rechnungsPositionen = (positionen || []).map(pos => {
      const einzelpreis = Number(pos.waescheartikel?.preis) || 0;
      const gesamtpreis = einzelpreis * pos.menge;
      nettobetrag += gesamtpreis;

      return {
        artikelnummer: pos.waescheartikel?.artikelnummer || "-",
        bezeichnung: pos.waescheartikel?.name || "-",
        farbe: pos.waescheartikel?.farbe || null,
        menge: pos.menge,
        einzelpreis,
        gesamtpreis
      };
    });

    // Globale Einstellungen laden
    const { data: einstellungen } = await supabase
      .from("rechnungseinstellungen")
      .select("*")
      .limit(1)
      .single();

    const mwstSatz = einstellungen?.mwst_satz ?? 20;
    const bearbeitungsgebuehr = einstellungen?.bearbeitungsgebuehr ?? 0;
    const zahlungsfristTage = einstellungen?.zahlungsfrist_tage ?? 14;

    console.log(`create-invoice: MwSt-Satz: ${mwstSatz}%, Bearbeitungsgebühr: ${bearbeitungsgebuehr}€, Zahlungsfrist: ${zahlungsfristTage} Tage`);

    // MwSt berechnen
    const mwstBetrag = nettobetrag * (mwstSatz / 100);
    const bruttobetrag = nettobetrag + mwstBetrag + bearbeitungsgebuehr;

    // Rechnungsnummer generieren
    const currentYear = new Date().getFullYear();
    const prefix = `R${currentYear}-`;

    const { data: lastRechnung } = await supabase
      .from("rechnungen")
      .select("rechnungsnummer")
      .like("rechnungsnummer", `${prefix}%`)
      .order("rechnungsnummer", { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (lastRechnung && lastRechnung.length > 0) {
      const lastNum = lastRechnung[0].rechnungsnummer.replace(prefix, "");
      nextNumber = parseInt(lastNum, 10) + 1;
    }
    const rechnungsnummer = `${prefix}${nextNumber.toString().padStart(4, "0")}`;

    console.log(`create-invoice: Generierte Rechnungsnummer: ${rechnungsnummer}`);

    // Fälligkeitsdatum basierend auf Einstellungen
    const faelligkeitsdatum = new Date();
    faelligkeitsdatum.setDate(faelligkeitsdatum.getDate() + zahlungsfristTage);

    const kunde = bestellung.kunden;

    // Rechnung erstellen
    const { data: rechnung, error: rechnungError } = await supabase
      .from("rechnungen")
      .insert({
        rechnungsnummer,
        bestellung_id,
        kunde_id: bestellung.kunde_id,
        rechnungsdatum: new Date().toISOString().split('T')[0],
        faelligkeitsdatum: faelligkeitsdatum.toISOString().split('T')[0],
        kunde_name: kunde.name,
        kunde_firma: kunde.firma,
        kunde_strasse: kunde.strasse,
        kunde_plz: kunde.plz,
        kunde_ort: kunde.ort,
        kunde_kundennummer: kunde.kundennummer,
        kunde_email: kunde.email,
        nettobetrag,
        mwst_satz: mwstSatz,
        mwst_betrag: mwstBetrag,
        bearbeitungsgebuehr,
        bruttobetrag
      })
      .select()
      .single();

    if (rechnungError) {
      console.error("create-invoice: Fehler beim Erstellen der Rechnung:", rechnungError);
      throw new Error(`Rechnung konnte nicht erstellt werden: ${rechnungError.message}`);
    }

    console.log(`create-invoice: Rechnung ${rechnungsnummer} erstellt (ID: ${rechnung.id})`);

    // Rechnungspositionen erstellen
    if (rechnungsPositionen.length > 0) {
      const { error: posError } = await supabase
        .from("rechnungspositionen")
        .insert(
          rechnungsPositionen.map(pos => ({
            rechnung_id: rechnung.id,
            ...pos
          }))
        );

      if (posError) {
        console.error("create-invoice: Fehler beim Erstellen der Positionen:", posError);
        throw new Error(`Rechnungspositionen konnten nicht erstellt werden: ${posError.message}`);
      }

      console.log(`create-invoice: ${rechnungsPositionen.length} Positionen erstellt`);
    }

    console.log(`create-invoice: Rechnung ${rechnungsnummer} erfolgreich erstellt`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        rechnungsnummer,
        rechnung_id: rechnung.id,
        bruttobetrag
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("create-invoice: Unerwarteter Fehler:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
