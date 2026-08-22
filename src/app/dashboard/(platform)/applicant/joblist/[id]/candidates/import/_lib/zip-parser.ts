import { unzipSync } from "fflate";
import {
  IMPORT_MAX_PDF_SIZE_MB,
  IMPORT_MAX_ZIP_SIZE_MB,
  type ImportRowError,
} from "./import-types";
import { normalizeCvFilename } from "./import-normalizers";

export type ZipEntry = {
  filename: string; // basename (case-insensitive key)
  originalPath: string; // path asli dalam ZIP
  data: Uint8Array;
  size: number;
};

export type ParsedZipResult = {
  entries: Map<string, ZipEntry>; // key: normalized basename
  errors: ImportRowError[];
};

// Validasi signature PDF (%PDF)
function isPdf(data: Uint8Array): boolean {
  return (
    data.length >= 4 &&
    data[0] === 0x25 && // %
    data[1] === 0x50 && // P
    data[2] === 0x44 && // D
    data[3] === 0x46 // F
  );
}

export async function parseApplicantZip(file: File): Promise<ParsedZipResult> {
  const errors: ImportRowError[] = [];
  const entries = new Map<string, ZipEntry>();

  // 1. Cek ukuran total ZIP
  if (file.size > IMPORT_MAX_ZIP_SIZE_MB * 1024 * 1024) {
    errors.push({
      row: 0,
      field: "_zip",
      message: `Ukuran ZIP melebihi batas (${IMPORT_MAX_ZIP_SIZE_MB} MB)`,
    });
    return { entries, errors };
  }

  const buf = await file.arrayBuffer();
  let files: Record<string, Uint8Array>;
  try {
    files = unzipSync(new Uint8Array(buf), {
      // Filter hanya file (skip folder)
      filter: (entry) =>
        !entry.name.endsWith("/") && entry.name.length > 0,
    });
  } catch (e) {
    errors.push({
      row: 0,
      field: "_zip",
      message: `ZIP tidak valid atau corrupt: ${(e as Error).message}`,
    });
    return { entries, errors };
  }

  const fileNames = Object.keys(files);

  if (fileNames.length === 0) {
    errors.push({
      row: 0,
      field: "_zip",
      message: "ZIP kosong atau tidak berisi file",
    });
    return { entries, errors };
  }

  // 2. Proses setiap file
  for (const path of fileNames) {
    // Cegah path traversal
    if (path.includes("..")) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `Path berbahaya terdeteksi: ${path}`,
      });
      continue;
    }

    const data = files[path];

    // Ambil basename
    const basename = path.split("/").pop() || path;

    // Harus PDF
    if (!basename.toLowerCase().endsWith(".pdf")) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `File "${basename}" bukan PDF. ZIP hanya boleh berisi PDF.`,
      });
      continue;
    }

    // Cek ukuran per file
    if (data.length > IMPORT_MAX_PDF_SIZE_MB * 1024 * 1024) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `File "${basename}" melebihi batas ukuran (${IMPORT_MAX_PDF_SIZE_MB} MB)`,
      });
      continue;
    }

    // Cek tidak kosong
    if (data.length === 0) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `File "${basename}" kosong`,
      });
      continue;
    }

    // Validasi signature PDF
    if (!isPdf(data)) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `File "${basename}" bukan PDF valid (signature tidak cocok)`,
      });
      continue;
    }

    // Cek basename duplicate
    const key = normalizeCvFilename(basename);
    if (entries.has(key)) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `Nama file PDF ganda dalam ZIP: "${basename}"`,
      });
      continue;
    }

    entries.set(key, {
      filename: basename,
      originalPath: path,
      data,
      size: data.length,
    });
  }

  return { entries, errors };
}