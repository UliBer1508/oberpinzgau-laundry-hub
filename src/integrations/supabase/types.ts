export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bestellpositionen: {
        Row: {
          artikel_id: string
          bestellung_id: string
          id: string
          menge: number
          notizen: string | null
        }
        Insert: {
          artikel_id: string
          bestellung_id: string
          id?: string
          menge?: number
          notizen?: string | null
        }
        Update: {
          artikel_id?: string
          bestellung_id?: string
          id?: string
          menge?: number
          notizen?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bestellpositionen_artikel_id_fkey"
            columns: ["artikel_id"]
            isOneToOne: false
            referencedRelation: "waescheartikel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bestellpositionen_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
        ]
      }
      bestellung_history: {
        Row: {
          bearbeiter_name: string | null
          bestellung_id: string
          id: string
          notiz: string | null
          status: string
          zeitpunkt: string
        }
        Insert: {
          bearbeiter_name?: string | null
          bestellung_id: string
          id?: string
          notiz?: string | null
          status: string
          zeitpunkt?: string
        }
        Update: {
          bearbeiter_name?: string | null
          bestellung_id?: string
          id?: string
          notiz?: string | null
          status?: string
          zeitpunkt?: string
        }
        Relationships: [
          {
            foreignKeyName: "bestellung_history_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
        ]
      }
      kunden: {
        Row: {
          aktiv: boolean | null
          anlieferadresse: string | null
          bestellart: Database["public"]["Enums"]["bestellart"] | null
          bestellmodus: Database["public"]["Enums"]["bestellmodus"]
          created_at: string
          email: string | null
          firma: string | null
          id: string
          kundennummer: string
          name: string
          notizen: string | null
          ort: string | null
          plz: string | null
          strasse: string | null
          telefon: string | null
          updated_at: string
        }
        Insert: {
          aktiv?: boolean | null
          anlieferadresse?: string | null
          bestellart?: Database["public"]["Enums"]["bestellart"] | null
          bestellmodus?: Database["public"]["Enums"]["bestellmodus"]
          created_at?: string
          email?: string | null
          firma?: string | null
          id?: string
          kundennummer: string
          name: string
          notizen?: string | null
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          aktiv?: boolean | null
          anlieferadresse?: string | null
          bestellart?: Database["public"]["Enums"]["bestellart"] | null
          bestellmodus?: Database["public"]["Enums"]["bestellmodus"]
          created_at?: string
          email?: string | null
          firma?: string | null
          id?: string
          kundennummer?: string
          name?: string
          notizen?: string | null
          ort?: string | null
          plz?: string | null
          strasse?: string | null
          telefon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      liefertour_stopps: {
        Row: {
          ankunftszeit: string | null
          bestellung_id: string
          erledigt: boolean | null
          id: string
          notizen: string | null
          reihenfolge: number
          tour_id: string
        }
        Insert: {
          ankunftszeit?: string | null
          bestellung_id: string
          erledigt?: boolean | null
          id?: string
          notizen?: string | null
          reihenfolge: number
          tour_id: string
        }
        Update: {
          ankunftszeit?: string | null
          bestellung_id?: string
          erledigt?: boolean | null
          id?: string
          notizen?: string | null
          reihenfolge?: number
          tour_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "liefertour_stopps_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "liefertour_stopps_tour_id_fkey"
            columns: ["tour_id"]
            isOneToOne: false
            referencedRelation: "liefertouren"
            referencedColumns: ["id"]
          },
        ]
      }
      liefertouren: {
        Row: {
          created_at: string
          datum: string
          id: string
          name: string
          notizen: string | null
          status: string | null
          tournummer: string
          updated_at: string
          waeschekraft_id: string | null
        }
        Insert: {
          created_at?: string
          datum: string
          id?: string
          name: string
          notizen?: string | null
          status?: string | null
          tournummer: string
          updated_at?: string
          waeschekraft_id?: string | null
        }
        Update: {
          created_at?: string
          datum?: string
          id?: string
          name?: string
          notizen?: string | null
          status?: string | null
          tournummer?: string
          updated_at?: string
          waeschekraft_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "liefertouren_waeschekraft_id_fkey"
            columns: ["waeschekraft_id"]
            isOneToOne: false
            referencedRelation: "waeschekraefte"
            referencedColumns: ["id"]
          },
        ]
      }
      objekte: {
        Row: {
          aktiv: boolean | null
          ansprechpartner: string | null
          bild_url: string | null
          created_at: string
          id: string
          kunde_id: string
          name: string
          notizen: string | null
          objektnummer: string
          ort: string | null
          plz: string | null
          schnellbestellung_set_id: string | null
          strasse: string | null
          telefon: string | null
          typ: Database["public"]["Enums"]["objekt_typ"]
          updated_at: string
        }
        Insert: {
          aktiv?: boolean | null
          ansprechpartner?: string | null
          bild_url?: string | null
          created_at?: string
          id?: string
          kunde_id: string
          name: string
          notizen?: string | null
          objektnummer: string
          ort?: string | null
          plz?: string | null
          schnellbestellung_set_id?: string | null
          strasse?: string | null
          telefon?: string | null
          typ: Database["public"]["Enums"]["objekt_typ"]
          updated_at?: string
        }
        Update: {
          aktiv?: boolean | null
          ansprechpartner?: string | null
          bild_url?: string | null
          created_at?: string
          id?: string
          kunde_id?: string
          name?: string
          notizen?: string | null
          objektnummer?: string
          ort?: string | null
          plz?: string | null
          schnellbestellung_set_id?: string | null
          strasse?: string | null
          telefon?: string | null
          typ?: Database["public"]["Enums"]["objekt_typ"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "objekte_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          telefon: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          name: string
          telefon?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          telefon?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rechnungen: {
        Row: {
          bearbeitungsgebuehr: number
          bestellung_id: string
          bezahlt_am: string | null
          bruttobetrag: number
          created_at: string
          faelligkeitsdatum: string | null
          id: string
          kunde_email: string | null
          kunde_firma: string | null
          kunde_id: string
          kunde_kundennummer: string | null
          kunde_name: string
          kunde_ort: string | null
          kunde_plz: string | null
          kunde_strasse: string | null
          lieferadresse_ort: string | null
          lieferadresse_plz: string | null
          lieferadresse_strasse: string | null
          mahnung_anzahl: number | null
          mahnung_gesendet_am: string | null
          mwst_betrag: number
          mwst_satz: number
          nettobetrag: number
          notizen: string | null
          rechnungsdatum: string
          rechnungsnummer: string
          status: string
          updated_at: string
        }
        Insert: {
          bearbeitungsgebuehr?: number
          bestellung_id: string
          bezahlt_am?: string | null
          bruttobetrag: number
          created_at?: string
          faelligkeitsdatum?: string | null
          id?: string
          kunde_email?: string | null
          kunde_firma?: string | null
          kunde_id: string
          kunde_kundennummer?: string | null
          kunde_name: string
          kunde_ort?: string | null
          kunde_plz?: string | null
          kunde_strasse?: string | null
          lieferadresse_ort?: string | null
          lieferadresse_plz?: string | null
          lieferadresse_strasse?: string | null
          mahnung_anzahl?: number | null
          mahnung_gesendet_am?: string | null
          mwst_betrag: number
          mwst_satz?: number
          nettobetrag: number
          notizen?: string | null
          rechnungsdatum?: string
          rechnungsnummer: string
          status?: string
          updated_at?: string
        }
        Update: {
          bearbeitungsgebuehr?: number
          bestellung_id?: string
          bezahlt_am?: string | null
          bruttobetrag?: number
          created_at?: string
          faelligkeitsdatum?: string | null
          id?: string
          kunde_email?: string | null
          kunde_firma?: string | null
          kunde_id?: string
          kunde_kundennummer?: string | null
          kunde_name?: string
          kunde_ort?: string | null
          kunde_plz?: string | null
          kunde_strasse?: string | null
          lieferadresse_ort?: string | null
          lieferadresse_plz?: string | null
          lieferadresse_strasse?: string | null
          mahnung_anzahl?: number | null
          mahnung_gesendet_am?: string | null
          mwst_betrag?: number
          mwst_satz?: number
          nettobetrag?: number
          notizen?: string | null
          rechnungsdatum?: string
          rechnungsnummer?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rechnungen_bestellung_id_fkey"
            columns: ["bestellung_id"]
            isOneToOne: false
            referencedRelation: "waeschebestellungen"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rechnungen_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
        ]
      }
      rechnungseinstellungen: {
        Row: {
          bank_bic: string | null
          bank_iban: string | null
          bank_name: string | null
          bearbeitungsgebuehr: number
          firma_bezeichnung: string | null
          firma_email: string | null
          firma_fn: string | null
          firma_hg: string | null
          firma_name: string | null
          firma_ort: string | null
          firma_plz: string | null
          firma_strasse: string | null
          firma_telefon: string | null
          firma_uid: string | null
          id: string
          mahnung_betreff: string | null
          mahnung_email_absender: string | null
          mahnung_nach_tagen: number
          mahnung_text: string | null
          mwst_satz: number
          updated_at: string
          zahlungsfrist_tage: number
          zahlungskondition_text: string | null
        }
        Insert: {
          bank_bic?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bearbeitungsgebuehr?: number
          firma_bezeichnung?: string | null
          firma_email?: string | null
          firma_fn?: string | null
          firma_hg?: string | null
          firma_name?: string | null
          firma_ort?: string | null
          firma_plz?: string | null
          firma_strasse?: string | null
          firma_telefon?: string | null
          firma_uid?: string | null
          id?: string
          mahnung_betreff?: string | null
          mahnung_email_absender?: string | null
          mahnung_nach_tagen?: number
          mahnung_text?: string | null
          mwst_satz?: number
          updated_at?: string
          zahlungsfrist_tage?: number
          zahlungskondition_text?: string | null
        }
        Update: {
          bank_bic?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bearbeitungsgebuehr?: number
          firma_bezeichnung?: string | null
          firma_email?: string | null
          firma_fn?: string | null
          firma_hg?: string | null
          firma_name?: string | null
          firma_ort?: string | null
          firma_plz?: string | null
          firma_strasse?: string | null
          firma_telefon?: string | null
          firma_uid?: string | null
          id?: string
          mahnung_betreff?: string | null
          mahnung_email_absender?: string | null
          mahnung_nach_tagen?: number
          mahnung_text?: string | null
          mwst_satz?: number
          updated_at?: string
          zahlungsfrist_tage?: number
          zahlungskondition_text?: string | null
        }
        Relationships: []
      }
      rechnungspositionen: {
        Row: {
          artikelnummer: string
          bezeichnung: string
          einzelpreis: number
          farbe: string | null
          gesamtpreis: number
          id: string
          menge: number
          rechnung_id: string
        }
        Insert: {
          artikelnummer: string
          bezeichnung: string
          einzelpreis: number
          farbe?: string | null
          gesamtpreis: number
          id?: string
          menge: number
          rechnung_id: string
        }
        Update: {
          artikelnummer?: string
          bezeichnung?: string
          einzelpreis?: number
          farbe?: string | null
          gesamtpreis?: number
          id?: string
          menge?: number
          rechnung_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rechnungspositionen_rechnung_id_fkey"
            columns: ["rechnung_id"]
            isOneToOne: false
            referencedRelation: "rechnungen"
            referencedColumns: ["id"]
          },
        ]
      }
      routenvorlage_kunden: {
        Row: {
          id: string
          kunde_id: string
          notizen: string | null
          reihenfolge: number
          vorlage_id: string
        }
        Insert: {
          id?: string
          kunde_id: string
          notizen?: string | null
          reihenfolge: number
          vorlage_id: string
        }
        Update: {
          id?: string
          kunde_id?: string
          notizen?: string | null
          reihenfolge?: number
          vorlage_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "routenvorlage_kunden_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routenvorlage_kunden_vorlage_id_fkey"
            columns: ["vorlage_id"]
            isOneToOne: false
            referencedRelation: "routenvorlagen"
            referencedColumns: ["id"]
          },
        ]
      }
      routenvorlagen: {
        Row: {
          aktiv: boolean | null
          beschreibung: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          aktiv?: boolean | null
          beschreibung?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          aktiv?: boolean | null
          beschreibung?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      waescheartikel: {
        Row: {
          aktiv: boolean | null
          artikelnummer: string
          bezeichnung: string | null
          bild_url: string | null
          created_at: string
          farbe: string | null
          groesse: string | null
          id: string
          kategorie: string | null
          name: string
          preis: number | null
          updated_at: string
        }
        Insert: {
          aktiv?: boolean | null
          artikelnummer: string
          bezeichnung?: string | null
          bild_url?: string | null
          created_at?: string
          farbe?: string | null
          groesse?: string | null
          id?: string
          kategorie?: string | null
          name: string
          preis?: number | null
          updated_at?: string
        }
        Update: {
          aktiv?: boolean | null
          artikelnummer?: string
          bezeichnung?: string | null
          bild_url?: string | null
          created_at?: string
          farbe?: string | null
          groesse?: string | null
          id?: string
          kategorie?: string | null
          name?: string
          preis?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      waeschebestellungen: {
        Row: {
          abholdatum: string | null
          abholzeit: string | null
          anzahl_personen: number | null
          bearbeitung_deadline: string | null
          bearbeitung_notizen: string | null
          bestellnummer: string
          check_in: string | null
          check_out: string | null
          created_at: string
          gastname: string | null
          id: string
          kunde_id: string
          lieferdatum: string | null
          lieferzeit: string | null
          notizen: string | null
          objekt_id: string | null
          prioritaet: number | null
          reihenfolge: number | null
          status: Database["public"]["Enums"]["bestellung_status"] | null
          updated_at: string
          waeschekraft_id: string | null
        }
        Insert: {
          abholdatum?: string | null
          abholzeit?: string | null
          anzahl_personen?: number | null
          bearbeitung_deadline?: string | null
          bearbeitung_notizen?: string | null
          bestellnummer: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          gastname?: string | null
          id?: string
          kunde_id: string
          lieferdatum?: string | null
          lieferzeit?: string | null
          notizen?: string | null
          objekt_id?: string | null
          prioritaet?: number | null
          reihenfolge?: number | null
          status?: Database["public"]["Enums"]["bestellung_status"] | null
          updated_at?: string
          waeschekraft_id?: string | null
        }
        Update: {
          abholdatum?: string | null
          abholzeit?: string | null
          anzahl_personen?: number | null
          bearbeitung_deadline?: string | null
          bearbeitung_notizen?: string | null
          bestellnummer?: string
          check_in?: string | null
          check_out?: string | null
          created_at?: string
          gastname?: string | null
          id?: string
          kunde_id?: string
          lieferdatum?: string | null
          lieferzeit?: string | null
          notizen?: string | null
          objekt_id?: string | null
          prioritaet?: number | null
          reihenfolge?: number | null
          status?: Database["public"]["Enums"]["bestellung_status"] | null
          updated_at?: string
          waeschekraft_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waeschebestellungen_kunde_id_fkey"
            columns: ["kunde_id"]
            isOneToOne: false
            referencedRelation: "kunden"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waeschebestellungen_objekt_id_fkey"
            columns: ["objekt_id"]
            isOneToOne: false
            referencedRelation: "objekte"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waeschebestellungen_waeschekraft_id_fkey"
            columns: ["waeschekraft_id"]
            isOneToOne: false
            referencedRelation: "waeschekraefte"
            referencedColumns: ["id"]
          },
        ]
      }
      waeschekraefte: {
        Row: {
          aktiv: boolean | null
          created_at: string
          email: string | null
          id: string
          name: string
          notizen: string | null
          ort: string | null
          personalnummer: string
          plz: string | null
          portalzugang: boolean | null
          strasse: string | null
          telefon: string | null
          typ: Database["public"]["Enums"]["mitarbeiter_typ"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          aktiv?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notizen?: string | null
          ort?: string | null
          personalnummer: string
          plz?: string | null
          portalzugang?: boolean | null
          strasse?: string | null
          telefon?: string | null
          typ?: Database["public"]["Enums"]["mitarbeiter_typ"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          aktiv?: boolean | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notizen?: string | null
          ort?: string | null
          personalnummer?: string
          plz?: string | null
          portalzugang?: boolean | null
          strasse?: string | null
          telefon?: string | null
          typ?: Database["public"]["Enums"]["mitarbeiter_typ"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      waescheset_artikel: {
        Row: {
          artikel_id: string
          berechnungsart: Database["public"]["Enums"]["berechnungsart"]
          id: string
          menge: number
          set_id: string
        }
        Insert: {
          artikel_id: string
          berechnungsart?: Database["public"]["Enums"]["berechnungsart"]
          id?: string
          menge?: number
          set_id: string
        }
        Update: {
          artikel_id?: string
          berechnungsart?: Database["public"]["Enums"]["berechnungsart"]
          id?: string
          menge?: number
          set_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "waescheset_artikel_artikel_id_fkey"
            columns: ["artikel_id"]
            isOneToOne: false
            referencedRelation: "waescheartikel"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "waescheset_artikel_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "waeschesets"
            referencedColumns: ["id"]
          },
        ]
      }
      waeschesets: {
        Row: {
          aktiv: boolean | null
          beschreibung: string | null
          created_at: string
          id: string
          name: string
          objekt_id: string
          updated_at: string
        }
        Insert: {
          aktiv?: boolean | null
          beschreibung?: string | null
          created_at?: string
          id?: string
          name: string
          objekt_id: string
          updated_at?: string
        }
        Update: {
          aktiv?: boolean | null
          beschreibung?: string | null
          created_at?: string
          id?: string
          name?: string
          objekt_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "waeschesets_objekt_id_fkey"
            columns: ["objekt_id"]
            isOneToOne: false
            referencedRelation: "objekte"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_bestellnummer: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "waeschekraft" | "kunde"
      berechnungsart: "pro_buchung" | "pro_gast"
      bestellart: "lieferung" | "abholung" | "beides"
      bestellmodus: "mit_buchung" | "nur_sets"
      bestellung_status:
        | "neu"
        | "in_bearbeitung"
        | "ausgeliefert"
        | "abgeholt"
        | "abgeschlossen"
        | "storniert"
      mitarbeiter_typ: "waeschekraft" | "fahrer" | "beides"
      objekt_typ: "hotel" | "apartmenthaus" | "ferienhaus" | "ferienwohnung"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "waeschekraft", "kunde"],
      berechnungsart: ["pro_buchung", "pro_gast"],
      bestellart: ["lieferung", "abholung", "beides"],
      bestellmodus: ["mit_buchung", "nur_sets"],
      bestellung_status: [
        "neu",
        "in_bearbeitung",
        "ausgeliefert",
        "abgeholt",
        "abgeschlossen",
        "storniert",
      ],
      mitarbeiter_typ: ["waeschekraft", "fahrer", "beides"],
      objekt_typ: ["hotel", "apartmenthaus", "ferienhaus", "ferienwohnung"],
    },
  },
} as const
