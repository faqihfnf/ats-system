import { z } from "zod";

export const positionSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama posisi tidak boleh kosong")
    .min(3, "Nama posisi minimal 3 karakter")
    .max(50, "Nama posisi maksimal 50 karakter")
    .trim(),
  divisiId: z
    .string()
    .min(1, "Divisi harus dipilih"),
});

export type PositionFormValues = z.infer<typeof positionSchema>;