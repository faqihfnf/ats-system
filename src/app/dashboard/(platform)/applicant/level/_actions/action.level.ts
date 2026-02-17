"use server";

import { prisma } from "@/lib/prisma";
import { levelSchema } from "@/lib/validations/level";
import { revalidatePath } from "next/cache";

export async function getLevel() {
  return await prisma.level.findMany({
    include: {
      _count: {
        select: { positions: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createLevel(formData: FormData) {
  const parsed = levelSchema.safeParse({
    nama: formData.get("nama"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.level.create({
      data: { nama: parsed.data.nama },
    });
    revalidatePath("/dashboard/level");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama level sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateLevel(id: string, formData: FormData) {
  const parsed = levelSchema.safeParse({
    nama: formData.get("nama"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.level.update({
      where: { id },
      data: { nama: parsed.data.nama },
    });
    revalidatePath("/dashboard/level");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama level sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteLevel(id: string) {
  try {
    await prisma.level.delete({
      where: { id },
    });
    revalidatePath("/dashboard/level");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}