import { z } from "zod";

export const experienceSchema = z.object({
  name: z
    .string()
    .min(1, "Nama pengalaman tidak boleh kosong")
    .min(3, "Nama pengalaman minimal 3 karakter")
    .max(50, "Nama pengalaman maksimal 50 karakter")
    .trim(),
  minYears: z
    .number({ error: "Minimal tahun harus berupa angka" })
    .int("Minimal tahun harus bilangan bulat")
    .min(0, "Minimal tahun tidak boleh negatif"),
});

export type ExperienceFormValues = z.infer<typeof experienceSchema>;