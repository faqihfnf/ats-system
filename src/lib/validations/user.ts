import { z } from "zod";

const roleSchema = z.enum(["ADMIN", "RECRUITER", "USER"]);

const divisiIdsSchema = z.preprocess((value) => {
  if (Array.isArray(value)) return value.filter((v) => typeof v === "string" && v.trim().length > 0);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((v: string) => v.trim().length > 0);
    } catch {}
    return value.trim().length > 0 ? [value] : [];
  }
  return [];
}, z.array(z.string()).min(0));

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
    divisiIds: divisiIdsSchema,
  })
  .superRefine((data, ctx) => {
    if (data.role === "USER" && data.divisiIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimal 1 divisi wajib dipilih untuk role User",
        path: ["divisiIds"],
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
    divisiIds: divisiIdsSchema,
  })
  .superRefine((data, ctx) => {
    if (data.role === "USER" && data.divisiIds.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Minimal 1 divisi wajib dipilih untuk role User",
        path: ["divisiIds"],
      });
    }
  });

export type CreateUserValues = z.infer<typeof createUserSchema>;
export type UpdateUserValues = z.infer<typeof updateUserSchema>;
