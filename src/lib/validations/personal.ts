import { z } from "zod";

export const updateProfileSchema = z.object({
  nama: z
    .string()
    .min(1, "Nama tidak boleh kosong")
    .min(3, "Nama minimal 3 karakter")
    .max(50)
    .trim(),
});

export const updatePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini tidak boleh kosong"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password tidak boleh kosong"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

export type UpdateProfileValues = z.infer<typeof updateProfileSchema>;
export type UpdatePasswordValues = z.infer<typeof updatePasswordSchema>;