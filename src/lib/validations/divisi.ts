import { z } from "zod";

export const divisiSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama divisi tidak boleh kosong")
    .min(3, "Nama divisi minimal 3 karakter")
    .max(50, "Nama divisi maksimal 50 karakter")
    .trim(),
});

export type DivisiFormValues = z.infer<typeof divisiSchema>;