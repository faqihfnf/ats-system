import { z } from "zod";

export const levelSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama level tidak boleh kosong")
    .min(3, "Nama level minimal 3 karakter")
    .max(50, "Nama level maksimal 50 karakter")
    .trim(),
});

export type LevelFormValues = z.infer<typeof levelSchema>;