import { createClient } from "@/lib/supabase/client";

export async function uploadCV(
  file: File,
  applicantName?: string,
): Promise<{ url?: string; originalFileName?: string; error?: string }> {
  try {
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "Ukuran file maksimal 2MB" };
    }

    const supabase = createClient();

    // Gunakan nama applicant + identifier pendek agar mudah ditelusuri dan tetap unik.
    const fileExt = file.name.split(".").pop();
    const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const baseName = applicantName || originalName;
    const sanitizedName = baseName
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 100) || "applicant";
    const uploadId = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
    const fileName = `${sanitizedName}-${uploadId}.${fileExt?.toLowerCase() || "pdf"}`;
    const filePath = `cvs/applications/${fileName}`;

    // Upload to Supabase Storage
    const { error } = await supabase.storage
      .from("cv-uploads")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Upload error:", error);
      return { error: "Gagal mengupload CV" };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("cv-uploads").getPublicUrl(filePath);

    return { url: publicUrl, originalFileName: file.name };
  } catch (error) {
    console.error("Upload exception:", error);
    return { error: "Terjadi kesalahan saat upload" };
  }
}
