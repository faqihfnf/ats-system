import { z } from "zod";

export const stageSchema = z.object({
  name: z
    .string()
    .min(1, "Nama stage tidak boleh kosong")
    .min(3, "Nama stage minimal 3 karakter")
    .max(50, "Nama stage maksimal 50 karakter")
    .trim(),
});

export type StageFormValues = z.infer<typeof stageSchema>;