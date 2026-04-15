import ExcelJS from "exceljs";

export type XlsxColumn = {
  key: string;
  header: string;
  width?: number;
  type?: "text" | "date" | "number";
};

export async function buildXlsx(
  columns: XlsxColumn[],
  rows: Array<Record<string, unknown>>,
  sheetName = "Sheet1",
): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName, {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  ws.columns = columns.map((c) => ({
    key: c.key,
    header: c.header,
    width: c.width ?? Math.max(c.header.length + 2, 12),
  }));

  const headerRow = ws.getRow(1);
  headerRow.font = { bold: true };
  headerRow.alignment = { vertical: "middle" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE8EEF4" },
  };
  headerRow.border = {
    bottom: { style: "thin", color: { argb: "FFB8C2CC" } },
  };

  columns.forEach((c, idx) => {
    const col = ws.getColumn(idx + 1);
    if (c.type === "text") col.numFmt = "@";
    else if (c.type === "date") col.numFmt = "yyyy-mm-dd";
  });

  for (const row of rows) {
    const excelRow: Record<string, unknown> = {};
    for (const c of columns) {
      const v = row[c.key];
      if (c.type === "date" && typeof v === "string" && v) {
        const d = new Date(v);
        excelRow[c.key] = isNaN(d.getTime()) ? v : d;
      } else if (c.type === "text") {
        excelRow[c.key] = v == null ? "" : String(v);
      } else {
        excelRow[c.key] = v ?? "";
      }
    }
    ws.addRow(excelRow);
  }

  ws.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: columns.length },
  };

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}

export async function parseXlsx(buffer: Buffer | ArrayBuffer): Promise<Array<Record<string, string>>> {
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(buffer as ArrayBuffer);
  const ws = wb.worksheets[0];
  if (!ws) return [];

  const headerRow = ws.getRow(1);
  const headers: string[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headers[colNumber - 1] = String(cell.value ?? "").trim();
  });

  const out: Array<Record<string, string>> = [];
  ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber === 1) return;
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => {
      if (!h) return;
      const cell = row.getCell(idx + 1);
      obj[h] = cellToString(cell.value);
    });
    if (Object.values(obj).some((v) => v.trim() !== "")) {
      out.push(obj);
    }
  });
  return out;
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value == null) return "";
  if (value instanceof Date) return value.toISOString().split("T")[0];
  if (typeof value === "object") {
    if ("text" in value && typeof value.text === "string") return value.text;
    if ("result" in value && value.result != null) return String(value.result);
    if ("richText" in value && Array.isArray(value.richText)) {
      return value.richText.map((r) => r.text).join("");
    }
    if ("hyperlink" in value && typeof value.text === "string") return value.text;
  }
  return String(value);
}
