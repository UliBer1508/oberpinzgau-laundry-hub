import * as XLSX from "xlsx";

export interface ExportColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
}

export function exportXlsx<T extends Record<string, unknown>>(
  rows: T[],
  columns: ExportColumn<T>[],
  filename: string,
) {
  const data = rows.map((row) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((c) => {
      obj[c.label] = (row as Record<string, unknown>)[c.key as string] ?? "";
    });
    return obj;
  });
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Export");
  XLSX.writeFile(wb, filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`);
}

export function printList<T extends Record<string, unknown>>({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: ExportColumn<T>[];
  rows: T[];
}) {
  const win = window.open("", "_blank");
  if (!win) return;
  const today = new Date().toLocaleString("de-AT");
  const head = columns.map((c) => `<th>${escapeHtml(c.label)}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns
          .map((c) => `<td>${escapeHtml(String((row as Record<string, unknown>)[c.key as string] ?? ""))}</td>`)
          .join("")}</tr>`,
    )
    .join("");
  win.document.write(`<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title>
<style>
  body { font-family: -apple-system, system-ui, sans-serif; padding: 24px; color: #111; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  .meta { font-size: 11px; color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  th { background: #f3f4f6; }
  tr:nth-child(even) td { background: #fafafa; }
  @media print { body { padding: 0; } .noprint { display: none; } }
</style></head><body>
<h1>${escapeHtml(title)}</h1>
<div class="meta">Erstellt am ${today} · ${rows.length} Einträge</div>
<table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
<script>window.onload = () => window.print();</script>
</body></html>`);
  win.document.close();
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
