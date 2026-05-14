"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getModels() {
  return await prisma.aiModel.findMany({
    orderBy: { name: "asc" },
  });
}

export async function createModel(formData: FormData) {
  const name = formData.get("name") as string;
  const modelId = formData.get("modelId") as string;

  if (!name || name.trim().length < 1) {
    return { error: "Nama model tidak boleh kosong" };
  }
  if (!modelId || modelId.trim().length < 1) {
    return { error: "Model ID tidak boleh kosong" };
  }

  try {
    await prisma.aiModel.create({
      data: { name: name.trim(), modelId: modelId.trim() },
    });
    revalidatePath("/dashboard/applicant/models");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama atau Model ID sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateModel(id: string, formData: FormData) {
  const name = formData.get("name") as string;
  const modelId = formData.get("modelId") as string;

  if (!name || name.trim().length < 1) {
    return { error: "Nama model tidak boleh kosong" };
  }
  if (!modelId || modelId.trim().length < 1) {
    return { error: "Model ID tidak boleh kosong" };
  }

  try {
    await prisma.aiModel.update({
      where: { id },
      data: { name: name.trim(), modelId: modelId.trim() },
    });
    revalidatePath("/dashboard/applicant/models");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama atau Model ID sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteModel(id: string) {
  try {
    await prisma.aiModel.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/models");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}
