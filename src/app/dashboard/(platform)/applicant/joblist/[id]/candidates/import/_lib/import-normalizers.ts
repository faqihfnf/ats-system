// ===== Normalisasi identifier untuk duplicate detection & matching =====

export function normalizeEmail(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

export function normalizePhone(value: string): string {
  let phone = (value ?? "").replace(/\D/g, "");

  if (phone.startsWith("62")) {
    // sudah format internasional
  } else if (phone.startsWith("0")) {
    phone = `62${phone.slice(1)}`;
  } else if (phone.length > 0) {
    phone = `62${phone}`;
  }

  return phone;
}

export function normalizeExternalId(value: string): string {
  return (value ?? "").trim().toUpperCase();
}

export function normalizeCvFilename(value: string): string {
  return (value ?? "").trim().toLowerCase();
}

// Normalisasi free-text wilayah: trim + collapse multiple spaces
export function normalizeFreeText(value: string): string {
  return (value ?? "").trim().replace(/\s+/g, " ");
}

// Parse boolean 0/1 — tolak nilai lain
export function parseBoolean01(value: unknown): boolean {
  if (value === 1 || value === "1" || value === true) return true;
  if (value === 0 || value === "0" || value === false) return false;
  throw new Error("Nilai harus 0 atau 1");
}

// Parse tanggal dari berbagai format Excel (serial, Date, string ISO)
export function parseExcelDate(value: unknown): Date {
  if (value instanceof Date) return value;

  if (typeof value === "number") {
    // Excel date serial (origin 1899-12-30)
    const ms = Math.round((value - 25569) * 86400 * 1000);
    return new Date(ms);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    // ISO format YYYY-MM-DD
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (iso) {
      return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);
    }
    // DD/MM/YYYY atau MM/DD/YYYY — anggap DD/MM/YYYY (id-ID)
    const dmy = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(trimmed);
    if (dmy) {
      const d = dmy[1].padStart(2, "0");
      const m = dmy[2].padStart(2, "0");
      return new Date(`${dmy[3]}-${m}-${d}T00:00:00`);
    }
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  throw new Error("Format tanggal tidak valid (gunakan YYYY-MM-DD)");
}

// Parse tahun (number atau string angka)
export function parseYear(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    throw new Error("Tahun wajib diisi");
  }
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  if (isNaN(n)) throw new Error("Tahun harus berupa angka");
  return n;
}

export function parseOptionalYear(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value), 10);
  if (isNaN(n)) throw new Error("Tahun harus berupa angka");
  return n;
}

// Parse salary (number atau string angka)
export function parseSalary(value: unknown): number {
  if (value === null || value === undefined || value === "") {
    throw new Error("Gaji wajib diisi");
  }
  const n = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(n)) throw new Error("Gaji harus berupa angka");
  return n;
}

export function parseOptionalSalary(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseInt(String(value).replace(/\D/g, ""), 10);
  if (isNaN(n)) throw new Error("Gaji harus berupa angka");
  return n;
}

// Trim string cell, kembalikan "" jika null/undefined
export function cellString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}