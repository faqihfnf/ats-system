import { z } from "zod";

export const employmentStatusSchema = z.object({
  name: z
    .string()
    .min(1, "Nama status tidak boleh kosong")
    .min(3, "Nama status minimal 3 karakter")
    .max(50, "Nama status maksimal 50 karakter")
    .trim(),
});

export type EmploymentStatusFormValues = z.infer<typeof employmentStatusSchema>;