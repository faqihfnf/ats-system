"use server";

import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations/education";
import { revalidatePath } from "next/cache";

export async function getEducations() {
  return await prisma.education.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createEducation(formData: FormData) {
  const parsed = educationSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.education.create({
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/education");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama pendidikan sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateEducation(id: string, formData: FormData) {
  const parsed = educationSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.education.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/education");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama pendidikan sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteEducation(id: string) {
  try {
    await prisma.education.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/education");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}