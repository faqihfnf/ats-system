import { createClient } from "@/lib/supabase/client";

export async function uploadCV(
  file: File,
): Promise<{ url?: string; error?: string }> {
  try {
    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      return { error: "Ukuran file maksimal 2MB" };
    }

    const supabase = createClient();

    // Generate filename: originalname-timestamp.ext
    const fileExt = file.name.split(".").pop();
    const originalName = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9-_]/g, "-"); // Sanitize
    const timestamp = Date.now();
    const fileName = `${sanitizedName}-${timestamp}.${fileExt}`;
    const filePath = `cvs/${fileName}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
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

    return { url: publicUrl };
  } catch (error) {
    console.error("Upload exception:", error);
    return { error: "Terjadi kesalahan saat upload" };
  }
}
