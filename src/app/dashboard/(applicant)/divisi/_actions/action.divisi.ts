"use server";

import { prisma } from "@/lib/prisma";
import { divisiSchema } from "@/lib/validations/divisi";
import { revalidatePath } from "next/cache";

export async function getDivisi() {
  return await prisma.divisi.findMany({
    include: {
      _count: {
        select: { positions: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createDivisi(formData: FormData) {
  const parsed = divisiSchema.safeParse({
    nama: formData.get("nama"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.divisi.create({
      data: { nama: parsed.data.nama },
    });
    revalidatePath("/dashboard/divisi");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama divisi sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateDivisi(id: string, formData: FormData) {
  const parsed = divisiSchema.safeParse({
    nama: formData.get("nama"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.divisi.update({
      where: { id },
      data: { nama: parsed.data.nama },
    });
    revalidatePath("/dashboard/divisi");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama divisi sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteDivisi(id: string) {
  try {
    await prisma.divisi.delete({
      where: { id },
    });
    revalidatePath("/dashboard/divisi");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}