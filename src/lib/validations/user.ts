import { z } from "zod";

const roleSchema = z.enum(["ADMIN", "RECRUITER", "USER"]);

const divisiIdSchema = z.preprocess((value) => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}, z.string().optional());

export const createUserSchema = z
  .object({
    nama: z
      .string()
      .min(1, "Nama tidak boleh kosong")
      .min(3, "Nama minimal 3 karakter")
      .max(50)
      .trim(),
    email: z
      .string()
      .min(1, "Email tidak boleh kosong")
      .email("Format email tidak valid"),
    password: z.string().min(8, "Password minimal 8 karakter"),
    role: roleSchema.refine((val) => val !== undefined, {
      message: "Role harus dipilih",
    }),
    divisiId: divisiIdSchema,
  })
  .superRefine((data, ctx) => {
    if (data.role === "USER" && !data.divisiId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Divisi wajib dipilih untuk role User",
        path: ["divisiId"],
      });
    }
  });

export const updateUserSchema = z
  .object({
    nama: z
      .string()
      .min(1, "Nama tidak boleh kosong")
      .min(3, "Nama minimal 3 karakter")
      .max(50)
      .trim(),
    role: roleSchema.refine((val) => val !== undefined, {
      message: "Role harus dipilih",
    }),
    divisiId: divisiIdSchema,
  })
  .superRefine((data, ctx) => {
    if (data.role === "USER" && !data.divisiId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Divisi wajib dipilih untuk role User",
        path: ["divisiId"],
      });
    }
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
