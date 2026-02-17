import { z } from "zod";

export const createUserSchema = z.object({
  nama: z.string().min(1, "Nama tidak boleh kosong").min(3, "Nama minimal 3 karakter").max(50).trim(),
  email: z.string().min(1, "Email tidak boleh kosong").email("Format email tidak valid"),
  password: z.string().min(8, "Password minimal 8 karakter"),
  role: z.enum(["ADMIN", "RECRUITER"]).refine((val) => val !== undefined, {
    message: "Role harus dipilih",
  }),
});

export const updateUserSchema = z.object({
  nama: z.string().min(1, "Nama tidak boleh kosong").min(3, "Nama minimal 3 karakter").max(50).trim(),
  role: z.enum(["ADMIN", "RECRUITER"]).refine((val) => val !== undefined, {
    message: "Role harus dipilih",
  }),
});

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;