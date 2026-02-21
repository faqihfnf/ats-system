import { z } from "zod";

export const jobStepOneSchema = z
  .object({
    positionId: z.string().min(1, "Posisi harus dipilih"),
    branchId: z.string().min(1, "Branch harus dipilih"),
    employmentStatusId: z.string().min(1, "Status kepegawaian harus dipilih"),
    province: z.string().min(1, "Provinsi harus dipilih"),
    city: z.string().min(1, "Kota harus dipilih"),
    minSalary: z.number().min(0, "Minimal salary tidak boleh negatif"),
    maxSalary: z.number().min(0, "Maksimal salary tidak boleh negatif"),
    showSalary: z.boolean(),
  })
  .refine((data) => data.maxSalary >= data.minSalary, {
    message:
      "Maksimal salary harus lebih besar atau sama dengan minimal salary",
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

export const jobStepThreeSchema = z
  .object({
    minEducationId: z.string().min(1, "Pendidikan minimal harus dipilih"),
    minExperienceId: z.string().min(1, "Pengalaman minimal harus dipilih"),
    minAge: z
      .number()
      .min(17, "Usia minimal tidak boleh kurang dari 17")
      .max(100, "Usia tidak valid"),
    maxAge: z
      .number()
      .min(17, "Usia maksimal tidak boleh kurang dari 17")
      .max(100, "Usia tidak valid"),
    showAge: z.boolean(),
    gender: z.enum(["MALE", "FEMALE", "ANY"]),
    showGender: z.boolean(),
    religion: z.enum([
      "ISLAM",
      "KRISTEN",
      "KATOLIK",
      "HINDU",
      "BUDDHA",
      "KONGHUCU",
      "ANY",
    ]),
    showReligion: z.boolean(),
  })
  .refine((data) => data.maxAge >= data.minAge, {
    message: "Usia maksimal harus lebih besar atau sama dengan usia minimal",
    path: ["maxAge"],
  });

export const customQuestionSchema = z.object({
  question: z
    .string()
    .min(5, "Pertanyaan minimal 5 karakter")
    .max(500, "Pertanyaan maksimal 500 karakter"),
  type: z.enum([
    "SHORT_TEXT",
    "LONG_TEXT",
    "NUMBER",
    "DATE",
    "MULTIPLE_CHOICE",
    "CHECKBOX",
    "DROPDOWN",
    "YES_NO",
  ]),
  required: z.boolean(),
  options: z.array(z.string()).optional(), // Untuk MULTIPLE_CHOICE, CHECKBOX, DROPDOWN
});

export const jobStepFourSchema = z.object({
  questions: z.array(customQuestionSchema),
});

export type CustomQuestionValues = z.infer<typeof customQuestionSchema>;

export type JobStepOneValues = z.infer<typeof jobStepOneSchema>;
export type JobStepTwoValues = z.infer<typeof jobStepTwoSchema>;
export type JobStepThreeValues = z.infer<typeof jobStepThreeSchema>;
export type JobStepFourValues = z.infer<typeof jobStepFourSchema>;
