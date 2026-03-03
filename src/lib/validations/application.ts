import { z } from "zod";

export const applicationSchema = z.object({
  // Data Personal
  fullName: z.string().min(3, "Nama lengkap minimal 3 karakter"),
  email: z.string().email("Email tidak valid"),
  phone: z.string().min(10, "Nomor telepon minimal 10 digit"),
  birthPlace: z.string().min(2, "Tempat lahir tidak boleh kosong"),
  birthDate: z.date("Tanggal lahir tidak valid"),
  gender: z.enum(["MALE", "FEMALE"]),
  religion: z.enum([
    "ISLAM",
    "KRISTEN",
    "KATOLIK",
    "HINDU",
    "BUDDHA",
    "KONGHUCU",
  ]),
  ktpAddress: z.string().min(10, "Alamat KTP minimal 10 karakter"),
  domicileAddress: z.string().min(10, "Alamat domisili minimal 10 karakter"),
  sameAsKtp: z.boolean(),
  province: z.string().min(1, "Provinsi harus dipilih"),
  city: z.string().min(1, "Kota harus dipilih"),
  district: z.string().min(1, "Kecamatan harus dipilih"),
  subdistrict: z.string().min(1, "Kelurahan harus dipilih"),

  // Pendidikan & Pekerjaan
  educationId: z.string().min(1, "Pendidikan terakhir harus dipilih"),
  institution: z.string().min(2, "Institusi tidak boleh kosong"),
  startYear: z
    .number()
    .min(1900, "Tahun mulai tidak valid")
    .max(new Date().getFullYear()),
  endYear: z.string().min(1, "Tahun selesai harus diisi"), // "present" atau tahun
  currentSalary: z.number().optional(),
  expectedSalary: z.number().min(0, "Ekspektasi gaji harus diisi"),

  // CV
  cvUrl: z.string().optional(),

  // Custom answers
  answers: z.array(
    z.object({
      questionId: z.string(),
      answer: z.string(),
    }),
  ),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
