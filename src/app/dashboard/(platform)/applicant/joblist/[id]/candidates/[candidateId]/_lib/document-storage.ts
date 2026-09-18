import { createAdminClient } from "@/lib/supabase/server";

const BUCKET = "cv-uploads";

export type UploadedDocument = {
  path: string; // path di storage
  publicUrl: string;
};

// Upload satu dokumen pendukung kandidat. Kembalikan path & publicUrl, atau throw.
export async function uploadCandidateDocument(
  applicationId: string,
  documentId: string,
  data: Uint8Array,
  originalFileName: string,
): Promise<UploadedDocument> {
  const supabase = createAdminClient();
  const path = `documents/applications/${applicationId}/${documentId}.pdf`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, data, {
    contentType: "application/pdf",
    cacheControl: "3600",
    upsert: false,
  });

  if (error) {
    throw new Error(
      `Gagal upload dokumen "${originalFileName}": ${error.message}`,
    );
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { path, publicUrl };
}

// Hapus dokumen dari storage. Dipakai saat delete maupun rollback upload.
export async function removeCandidateDocuments(paths: string[]): Promise<void> {
  if (paths.length === 0) return;
  const supabase = createAdminClient();
  try {
    await supabase.storage.from(BUCKET).remove(paths);
  } catch (e) {
    console.error("Cleanup dokumen gagal:", e);
  }
}
