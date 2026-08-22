import * as XLSX from "xlsx";
import {
  APPLICANT_COLUMNS,
  APPLICANT_SHEET_NAME,
  IMPORT_MAX_ROWS,
  type ImportRowError,
} from "./import-types";
import { cellString } from "./import-normalizers";

export type ParsedExcelResult = {
  rows: Record<string, unknown>[];
  errors: ImportRowError[];
  metadataJobId?: string;
  templateVersion?: string;
};

export async function parseApplicantExcel(
  file: File,
): Promise<ParsedExcelResult> {
  const buf = await file.arrayBuffer();
  const workbook = XLSX.read(buf, { type: "array", cellDates: true });
  const errors: ImportRowError[] = [];

  // 1. Cek sheet Applicants
  const sheetName = workbook.SheetNames.find(
    (n) => n.toLowerCase().includes("applicants"),
  );
  if (!sheetName) {
    errors.push({
      row: 0,
      field: "_sheet",
      message: `Sheet "${APPLICANT_SHEET_NAME}" tidak ditemukan`,
    });
    return { rows: [], errors };
  }

  const sheet = workbook.Sheets[sheetName];
  const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
    defval: "",
    raw: false,
  });

  // 2. Validasi header — pastikan semua kolom wajib tersedia
  if (json.length > 0) {
    const headers = Object.keys(json[0]).map((h) => h.trim());
    for (const col of APPLICANT_COLUMNS) {
      if (!headers.includes(col)) {
        errors.push({
          row: 1,
          field: col,
          message: `Kolom wajib "${col}" tidak ditemukan. Jangan ubah header template.`,
        });
      }
    }
    // Cek header duplicate
    const seen = new Set<string>();
    for (const h of headers) {
      if (seen.has(h)) {
        errors.push({
          row: 1,
          field: h,
          message: `Kolom "${h}" muncul lebih dari satu kali`,
        });
      }
      seen.add(h);
    }
  }

  // 3. Validasi batas jumlah baris
  if (json.length > IMPORT_MAX_ROWS) {
    errors.push({
      row: 0,
      field: "_rows",
      message: `Jumlah kandidat (${json.length}) melebihi batas maksimal (${IMPORT_MAX_ROWS})`,
    });
  }

  // 4. Parse metadata sheet (untuk verifikasi job_id)
  let metadataJobId: string | undefined;
  let templateVersion: string | undefined;
  const metaSheetName = workbook.SheetNames.find((n) =>
    n.toLowerCase().includes("metadata"),
  );
  if (metaSheetName) {
    const metaSheet = workbook.Sheets[metaSheetName];
    const metaJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(
      metaSheet,
      { defval: "" },
    );
    for (const r of metaJson) {
      const k = cellString(r.key ?? r.Key);
      const v = cellString(r.value ?? r.Value);
      if (k === "job_id") metadataJobId = v;
      if (k === "template_version") templateVersion = v;
    }
  }

  return { rows: json, errors, metadataJobId, templateVersion };
}