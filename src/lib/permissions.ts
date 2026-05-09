export type PermissionAction = "view" | "edit";

export type Resource =
  | "dashboard"
  | "kunden"
  | "waescheartikel"
  | "waeschesets"
  | "bestellungen"
  | "bestellungen_management"
  | "liefertouren"
  | "rechnungen"
  | "waeschekraefte"
  | "benutzer";

export const RESOURCES: { key: Resource; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "kunden", label: "Kunden & Objekte" },
  { key: "bestellungen", label: "Bestellungen" },
  { key: "bestellungen_management", label: "Arbeitsverwaltung" },
  { key: "liefertouren", label: "Liefertouren" },
  { key: "rechnungen", label: "Rechnungen" },
  { key: "waeschekraefte", label: "Wäschekräfte/Fahrer" },
  { key: "waescheartikel", label: "Wäscheartikel" },
  { key: "waeschesets", label: "Wäschesets" },
  { key: "benutzer", label: "Benutzerverwaltung" },
];

export const ACTIONS: PermissionAction[] = ["view", "edit"];

export const ACTION_LABEL: Record<PermissionAction, string> = {
  view: "Anzeigen",
  edit: "Bearbeiten",
};

export const permKey = (resource: string, action: string) => `${resource}:${action}`;
