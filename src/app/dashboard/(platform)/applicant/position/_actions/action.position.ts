"use server";

import { prisma } from "@/lib/prisma";
import { positionSchema } from "@/lib/validations/position";
import { revalidatePath } from "next/cache";

export async function getPositions() {
  return await prisma.position.findMany({
    include: {
      divisi: true,
      level: true,
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getDivisiOptions() {
  return await prisma.divisi.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });
}

export async function getLevelOptions() {
  return await prisma.level.findMany({
    orderBy: { nama: "asc" },
    select: { id: true, nama: true },
  });
}

export async function createPosition(formData: FormData) {
  const parsed = positionSchema.safeParse({
    nama: formData.get("nama"),
    divisiId: formData.get("divisiId"),
    levelId: formData.get("levelId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.position.create({
      data: {
        nama: parsed.data.nama,
        divisiId: parsed.data.divisiId,
        levelId: parsed.data.levelId,
      },
    });
    revalidatePath("/dashboard/position");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menyimpan" };
  }
}

export async function updatePosition(id: string, formData: FormData) {
  const parsed = positionSchema.safeParse({
    nama: formData.get("nama"),
    divisiId: formData.get("divisiId"),
    levelId: formData.get("levelId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.position.update({
      where: { id },
      data: {
        nama: parsed.data.nama,
        divisiId: parsed.data.divisiId,
        levelId: parsed.data.levelId,
      },
    });
    revalidatePath("/dashboard/position");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menyimpan" };
  }
}

export async function deletePosition(id: string) {
  try {
    await prisma.position.delete({
      where: { id },
    });
    revalidatePath("/dashboard/position");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}