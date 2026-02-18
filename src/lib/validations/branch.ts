import { z } from "zod";

export const branchSchema = z.object({
  name: z
    .string()
    .min(1, "Nama branch tidak boleh kosong")
    .min(3, "Nama branch minimal 3 karakter")
    .max(50, "Nama branch maksimal 50 karakter")
    .trim(),
  address: z.string().optional(),
});

export type BranchFormValues = z.infer<typeof branchSchema>;