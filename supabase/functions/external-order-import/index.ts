import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderPosition {
  artikelnummer: string;
  menge: number;
  notizen?: string;
}

interface OrderRequest {
  kundennummer: string;
  objektnummer?: string;
  gastname?: string;
  check_in?: string;
  check_out?: string;
  anzahl_personen?: number;
  lieferdatum?: string;
  abholdatum?: string;
  lieferzeit?: string;
  abholzeit?: string;
  notizen?: string;
  prioritaet?: number;
  positionen: OrderPosition[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate API Key
    const authHeader = req.headers.get('Authorization');
    const expectedApiKey = Deno.env.get('EXTERNAL_API_KEY');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Missing Authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const providedApiKey = authHeader.replace('Bearer ', '');
    if (providedApiKey !== expectedApiKey) {
      console.error('Invalid API key provided');
      return new Response(
        JSON.stringify({ error: 'Unauthorized', message: 'Invalid API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const orderData: OrderRequest = await req.json();
    console.log('Received order request:', JSON.stringify(orderData, null, 2));

    // Validate required fields
    if (!orderData.kundennummer) {
      return new Response(
        JSON.stringify({ error: 'Validation Error', message: 'kundennummer is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!orderData.positionen || orderData.positionen.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Validation Error', message: 'positionen array is required and must not be empty' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate customer exists
    const { data: kunde, error: kundeError } = await supabase
      .from('kunden')
      .select('id, aktiv')
      .eq('kundennummer', orderData.kundennummer)
      .maybeSingle();

    if (kundeError) {
      console.error('Error fetching customer:', kundeError);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: 'Error fetching customer' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!kunde) {
      return new Response(
        JSON.stringify({ error: 'Validation Error', message: `Customer with kundennummer '${orderData.kundennummer}' not found` }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!kunde.aktiv) {
      return new Response(
        JSON.stringify({ error: 'Validation Error', message: `Customer with kundennummer '${orderData.kundennummer}' is inactive` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate object if provided
    let objektId: string | null = null;
    if (orderData.objektnummer) {
      const { data: objekt, error: objektError } = await supabase
        .from('objekte')
        .select('id, aktiv, kunde_id')
        .eq('objektnummer', orderData.objektnummer)
        .maybeSingle();

      if (objektError) {
        console.error('Error fetching object:', objektError);
        return new Response(
          JSON.stringify({ error: 'Database Error', message: 'Error fetching object' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!objekt) {
        return new Response(
          JSON.stringify({ error: 'Validation Error', message: `Object with objektnummer '${orderData.objektnummer}' not found` }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!objekt.aktiv) {
        return new Response(
          JSON.stringify({ error: 'Validation Error', message: `Object with objektnummer '${orderData.objektnummer}' is inactive` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (objekt.kunde_id !== kunde.id) {
        return new Response(
          JSON.stringify({ error: 'Validation Error', message: `Object '${orderData.objektnummer}' does not belong to customer '${orderData.kundennummer}'` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      objektId = objekt.id;
    }

    // Validate articles and collect IDs
    const artikelnummern = orderData.positionen.map(p => p.artikelnummer);
    const { data: artikel, error: artikelError } = await supabase
      .from('waescheartikel')
      .select('id, artikelnummer, aktiv')
      .in('artikelnummer', artikelnummern);

    if (artikelError) {
      console.error('Error fetching articles:', artikelError);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: 'Error fetching articles' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for missing or inactive articles
    const artikelMap = new Map(artikel?.map(a => [a.artikelnummer, a]) || []);
    const missingArticles: string[] = [];
    const inactiveArticles: string[] = [];

    for (const pos of orderData.positionen) {
      const art = artikelMap.get(pos.artikelnummer);
      if (!art) {
        missingArticles.push(pos.artikelnummer);
      } else if (!art.aktiv) {
        inactiveArticles.push(pos.artikelnummer);
      }
    }

    if (missingArticles.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation Error', 
          message: `Articles not found: ${missingArticles.join(', ')}` 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (inactiveArticles.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Validation Error', 
          message: `Articles inactive: ${inactiveArticles.join(', ')}` 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate order number
    const { data: lastOrder, error: lastOrderError } = await supabase
      .from('waeschebestellungen')
      .select('bestellnummer')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let bestellnummer = 'B0001';
    if (lastOrder?.bestellnummer) {
      const lastNum = parseInt(lastOrder.bestellnummer.replace('B', ''), 10);
      bestellnummer = `B${String(lastNum + 1).padStart(4, '0')}`;
    }

    // Create order
    const { data: newOrder, error: orderError } = await supabase
      .from('waeschebestellungen')
      .insert({
        bestellnummer,
        kunde_id: kunde.id,
        objekt_id: objektId,
        gastname: orderData.gastname || null,
        check_in: orderData.check_in || null,
        check_out: orderData.check_out || null,
        anzahl_personen: orderData.anzahl_personen || 1,
        lieferdatum: orderData.lieferdatum || null,
        abholdatum: orderData.abholdatum || null,
        lieferzeit: orderData.lieferzeit || null,
        abholzeit: orderData.abholzeit || null,
        notizen: orderData.notizen || null,
        prioritaet: orderData.prioritaet || 0,
        status: 'neu'
      })
      .select('id, bestellnummer')
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: 'Error creating order', details: orderError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Order created:', newOrder);

    // Create order positions
    const positionen = orderData.positionen.map(pos => ({
      bestellung_id: newOrder.id,
      artikel_id: artikelMap.get(pos.artikelnummer)!.id,
      menge: pos.menge,
      notizen: pos.notizen || null
    }));

    const { error: positionenError } = await supabase
      .from('bestellpositionen')
      .insert(positionen);

    if (positionenError) {
      console.error('Error creating order positions:', positionenError);
      // Rollback: delete the order
      await supabase.from('waeschebestellungen').delete().eq('id', newOrder.id);
      return new Response(
        JSON.stringify({ error: 'Database Error', message: 'Error creating order positions', details: positionenError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create initial history entry
    await supabase.from('bestellung_history').insert({
      bestellung_id: newOrder.id,
      status: 'neu',
      bearbeiter_name: 'External API',
      notiz: 'Bestellung über externe API importiert'
    });

    console.log('Order import completed successfully:', newOrder.bestellnummer);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Order created successfully',
        data: {
          bestellnummer: newOrder.bestellnummer,
          id: newOrder.id,
          positionen_count: positionen.length
        }
      }),
      { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: 'Internal Server Error', message: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
