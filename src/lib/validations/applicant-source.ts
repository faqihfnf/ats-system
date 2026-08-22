import { z } from "zod";

export const applicantSourceSchema = z.object({
  code: z
    .string()
    .min(2, "Kode source minimal 2 karakter")
    .max(30, "Kode source maksimal 30 karakter")
    .trim()
    .regex(
      /^[A-Z0-9_]+$/,
      "Kode hanya boleh huruf besar, angka, dan underscore (contoh: LINKEDIN)",
    ),
  name: z
    .string()
    .min(2, "Nama source minimal 2 karakter")
    .max(50, "Nama source maksimal 50 karakter")
    .trim(),
  category: z.enum(["CAREER_SITE", "JOB_PORTAL", "SOCIAL_MEDIA", "REFERRAL", "OTHER"], {
    message: "Kategori tidak valid",
  }),
});

export type ApplicantSourceFormValues = z.infer<typeof applicantSourceSchema>;