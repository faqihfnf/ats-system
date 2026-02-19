"use server";

import { prisma } from "@/lib/prisma";
import { experienceSchema } from "@/lib/validations/experience";
import { revalidatePath } from "next/cache";

export async function getExperiences() {
  return await prisma.experience.findMany({
    orderBy: { minYears: "asc" },
  });
}

export async function createExperience(formData: FormData) {
  const parsed = experienceSchema.safeParse({
    name: formData.get("name"),
    minYears: Number(formData.get("minYears")),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.experience.create({
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/experience");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama pengalaman sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateExperience(id: string, formData: FormData) {
  const parsed = experienceSchema.safeParse({
    name: formData.get("name"),
    minYears: Number(formData.get("minYears")),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.experience.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/experience");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama pengalaman sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteExperience(id: string) {
  try {
    await prisma.experience.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/experience");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}