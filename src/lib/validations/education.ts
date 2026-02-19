import { z } from "zod";

export const educationSchema = z.object({
  name: z
    .string()
    .min(1, "Nama pendidikan tidak boleh kosong")
    .min(2, "Nama pendidikan minimal 2 karakter")
    .max(50, "Nama pendidikan maksimal 50 karakter")
    .trim(),
});

export type EducationFormValues = z.infer<typeof educationSchema>;