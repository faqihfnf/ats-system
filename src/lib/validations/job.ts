import { z } from "zod";

export const jobStepOneSchema = z.object({
  positionId: z.string().min(1, "Posisi harus dipilih"),
  branchId: z.string().min(1, "Branch harus dipilih"),
  employmentStatusId: z.string().min(1, "Status kepegawaian harus dipilih"),
  province: z.string().min(1, "Provinsi harus dipilih"),
  city: z.string().min(1, "Kota harus dipilih"),
  minSalary: z.number().min(0, "Minimal salary tidak boleh negatif"),
  maxSalary: z.number().min(0, "Maksimal salary tidak boleh negatif"),
  showSalary: z.boolean(),
}).refine((data) => data.maxSalary >= data.minSalary, {
  message: "Maksimal salary harus lebih besar atau sama dengan minimal salary",
  path: ["maxSalary"],
});

export const jobStepTwoSchema = z.object({
  description: z
    .string()
    .min(100, "Deskripsi minimal 100 karakter")
    .max(2500, "Deskripsi maksimal 2500 karakter"),
  requirements: z
    .string()
    .min(200, "Persyaratan minimal 200 karakter")
    .max(2500, "Persyaratan maksimal 2500 karakter"),
});

export type JobStepOneValues = z.infer<typeof jobStepOneSchema>;
export type JobStepTwoValues = z.infer<typeof jobStepTwoSchema>;