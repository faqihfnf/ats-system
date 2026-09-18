// Helper bersama untuk penanganan file (nama file & validasi PDF).

// Bersihkan potongan nama file: hilangkan diakritik & karakter non-alfanumerik.
export function sanitizeFilePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

// Validasi signature PDF (%PDF) agar file tidak bisa dipalsukan lewat ekstensi.
export function isPdfSignature(data: Uint8Array): boolean {
  return (
    data.length >= 4 &&
    data[0] === 0x25 && // %
    data[1] === 0x50 && // P
    data[2] === 0x44 && // D
    data[3] === 0x46 // F
  );
}

// Format ukuran file (bytes) menjadi teks yang mudah dibaca.
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}
