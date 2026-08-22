"use server";

import { prisma } from "@/lib/prisma";
import { applicantSourceSchema } from "@/lib/validations/applicant-source";
import { revalidatePath } from "next/cache";

export type ApplicantSourceItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  isActive: boolean;
  _count: { applications: number };
};

export async function getApplicantSources(): Promise<ApplicantSourceItem[]> {
  return await prisma.applicantSource.findMany({
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { applications: true } } },
  });
}

export async function createApplicantSource(formData: FormData) {
  const parsed = applicantSourceSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  try {
    await prisma.applicantSource.create({
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/sources");
    return { success: true };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      return { error: "Kode atau nama source sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateApplicantSource(id: string, formData: FormData) {
  const parsed = applicantSourceSchema.safeParse({
    code: String(formData.get("code") ?? "").toUpperCase(),
    name: formData.get("name"),
    category: formData.get("category"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Data tidak valid" };
  }

  try {
    await prisma.applicantSource.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/sources");
    return { success: true };
  } catch (e) {
    const code = (e as { code?: string }).code;
    if (code === "P2002") {
      return { error: "Kode atau nama source sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteApplicantSource(id: string) {
  try {
    // Cegah delete jika sudah dipakai applicant
    const usageCount = await prisma.application.count({
      where: { sourceId: id },
    });

    if (usageCount > 0) {
      return {
        error: `Source sudah dipakai oleh ${usageCount} applicant dan tidak dapat dihapus. Nonaktifkan saja jika tidak ingin dipakai lagi.`,
      };
    }

    await prisma.applicantSource.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/sources");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}

export async function toggleApplicantSourceActive(id: string, isActive: boolean) {
  try {
    await prisma.applicantSource.update({
      where: { id },
      data: { isActive },
    });
    revalidatePath("/dashboard/applicant/sources");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat mengubah status" };
  }
}