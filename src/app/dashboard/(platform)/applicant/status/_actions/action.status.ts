"use server";

import { prisma } from "@/lib/prisma";
import { employmentStatusSchema } from "@/lib/validations/employment-status";
import { revalidatePath } from "next/cache";

export async function getStatuses() {
  return await prisma.employmentStatus.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createStatus(formData: FormData) {
  const parsed = employmentStatusSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.employmentStatus.create({
      data: { name: parsed.data.name },
    });
    revalidatePath("/dashboard/applicant/status");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama status sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateStatus(id: string, formData: FormData) {
  const parsed = employmentStatusSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.employmentStatus.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    revalidatePath("/dashboard/applicant/status");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama status sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteStatus(id: string) {
  try {
    await prisma.employmentStatus.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/status");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}