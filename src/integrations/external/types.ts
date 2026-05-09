// Minimal type export for the external Supabase database (uzworhojxcxbtsbttstp).
// Allows supabase.from('table') to compile without full column typings.
// To get full types later, run:
//   supabase gen types typescript --project-id uzworhojxcxbtsbttstp > src/integrations/external/types.ts

type GenericRow = { [key: string]: any };

type GenericTable = {
  Row: GenericRow;
  Insert: GenericRow;
  Update: GenericRow;
  Relationships: [];
};

const tableNames = [
  "kunden",
  "objekte",
  "waeschebestellungen",
  "bestellpositionen",
  "waeschesets",
  "waescheset_artikel",
  "waescheartikel",
  "rechnungen",
  "rechnungspositionen",
  "rechnungseinstellungen",
  "zahlungen",
  "user_roles",
  "liefertouren",
  "liefertour_stopps",
  "routenvorlagen",
  "routenvorlage_kunden",
  "waeschekraefte",
  "bestellung_history",
  "profiles",
] as const;

type TableName = (typeof tableNames)[number];

export type Database = {
  public: {
    Tables: Record<TableName, GenericTable>;
    Views: Record<string, never>;
    Functions: {
      has_role: {
        Args: { _user_id: string; _role: string };
        Returns: boolean;
      };
      [key: string]: {
        Args: GenericRow;
        Returns: any;
      };
    };
    Enums: Record<string, string>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];
