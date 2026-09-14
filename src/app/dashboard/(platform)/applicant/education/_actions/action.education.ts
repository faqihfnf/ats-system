"use server";

import { prisma } from "@/lib/prisma";
import { educationSchema } from "@/lib/validations/education";
import { revalidatePath } from "next/cache";
import { inferEducationCategory } from "@/lib/education-category";

export async function getEducations() {
  return await prisma.education.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createEducation(formData: FormData) {
  const parsed = educationSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    const category =
      parsed.data.category ?? inferEducationCategory(parsed.data.name);

    await prisma.education.create({
      data: {
        name: parsed.data.name,
        category,
      },
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
    category: formData.get("category") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    const category =
      parsed.data.category ?? inferEducationCategory(parsed.data.name);

    await prisma.education.update({
      where: { id },
      data: {
        name: parsed.data.name,
        category,
      },
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
    const [jobCount, applicationCount] = await Promise.all([
      prisma.job.count({ where: { minEducationId: id } }),
      prisma.application.count({ where: { educationId: id } }),
    ]);

    if (jobCount > 0 || applicationCount > 0) {
      const reasons = [];
      if (jobCount > 0) reasons.push(`${jobCount} lowongan`);
      if (applicationCount > 0) reasons.push(`${applicationCount} kandidat`);
      return {
        error: `Pendidikan tidak dapat dihapus karena masih dipakai oleh ${reasons.join(" dan ")}.`,
      };
    }

    await prisma.education.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/education");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}
