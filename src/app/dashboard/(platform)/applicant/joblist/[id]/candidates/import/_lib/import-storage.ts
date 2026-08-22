import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "cv-uploads";

export type UploadedPdf = {
  path: string; // path di storage
  publicUrl: string;
  originalFileName: string;
};

// Upload satu PDF ke folder import. Kembalikan path & publicUrl, atau throw.
export async function uploadImportPdf(
  importId: string,
  applicationId: string,
  data: Uint8Array,
  originalFileName: string,
): Promise<UploadedPdf> {
  const supabase = createAdminClient();
  const path = `cvs/imports/${importId}/${applicationId}.pdf`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, data, {
      contentType: "application/pdf",
      cacheControl: "3600",
      upsert: false,
    });

  if (error) {
    throw new Error(`Gagal upload CV "${originalFileName}": ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, publicUrl, originalFileName };
}

// Hapus seluruh PDF yang sudah ter-upload (rollback)
export async function cleanupUploadedPdfs(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createAdminClient();
  try {
    await supabase.storage.from(BUCKET).remove(paths);
  } catch (e) {
    console.error("Cleanup PDF gagal:", e);
  }
}