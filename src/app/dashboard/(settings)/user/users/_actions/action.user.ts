"use server";

import { prisma } from "@/lib/prisma";
import { createAdminClient } from "@/lib/supabase/server";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { revalidatePath } from "next/cache";

// Ambil semua user dari profiles
export async function getUsers() {
  return await prisma.profile.findMany({
    include: {
      divisions: {
        select: {
          divisiId: true,
          divisi: {
            select: {
              id: true,
              nama: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

// Tambah user baru via Supabase Admin + simpan profile
export async function createUser(formData: FormData) {
  const parsed = createUserSchema.safeParse({
    nama: formData.get("nama"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
    divisiIds: formData.get("divisiIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const supabase = createAdminClient();

  if (parsed.data.role === "USER" && parsed.data.divisiIds.length > 0) {
    const count = await prisma.divisi.count({
      where: { id: { in: parsed.data.divisiIds } },
    });
    if (count !== parsed.data.divisiIds.length) {
      return { error: "Salah satu divisi tidak ditemukan" };
    }
  }

  // Buat user di Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email: parsed.data.email,
    password: parsed.data.password,
    email_confirm: true,
  });

  if (error) {
    if (error.message.includes("already registered")) {
      return { error: "Email sudah terdaftar" };
    }
    return { error: error.message };
  }

  // Simpan profile ke database
  await prisma.profile.create({
    data: {
      id: data.user.id,
      nama: parsed.data.nama,
      role: parsed.data.role,
      email: parsed.data.email,
      ...(parsed.data.role === "USER" && parsed.data.divisiIds.length > 0
        ? {
            divisions: {
              create: parsed.data.divisiIds.map((divisiId: string) => ({
                divisiId,
              })),
            },
          }
        : {}),
    },
  });

  revalidatePath("/dashboard/user/users");
  return { success: true };
}

// Update nama dan role user
export async function updateUser(id: string, formData: FormData) {
  const parsed = updateUserSchema.safeParse({
    nama: formData.get("nama"),
    role: formData.get("role"),
    divisiIds: formData.get("divisiIds"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  if (parsed.data.role === "USER" && parsed.data.divisiIds.length > 0) {
    const count = await prisma.divisi.count({
      where: { id: { in: parsed.data.divisiIds } },
    });
    if (count !== parsed.data.divisiIds.length) {
      return { error: "Salah satu divisi tidak ditemukan" };
    }
  }

  const divisiIds =
    parsed.data.role === "USER" ? parsed.data.divisiIds : [];

  // Delete existing divisions then recreate
  await prisma.$transaction([
    prisma.profileDivisi.deleteMany({ where: { profileId: id } }),
    prisma.profile.update({
      where: { id },
      data: {
        nama: parsed.data.nama,
        role: parsed.data.role,
        ...(divisiIds.length > 0
          ? {
              divisions: {
                create: divisiIds.map((divisiId: string) => ({ divisiId })),
              },
            }
          : {}),
      },
    }),
  ]);

  revalidatePath("/dashboard/user/users");
  return { success: true };
}

// Delete user dari Supabase Auth + profile
export async function deleteUser(id: string) {
  try {
    const supabase = createAdminClient();

    // Hapus dari Supabase Auth
    const { error } = await supabase.auth.admin.deleteUser(id);
    if (error) return { error: error.message };

    // Hapus profile (cascade)
    await prisma.profile.delete({ where: { id } });

    revalidatePath("/dashboard/user/users");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus user" };
  }
}
