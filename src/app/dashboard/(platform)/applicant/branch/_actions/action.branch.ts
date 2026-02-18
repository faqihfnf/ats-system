"use server";

import { prisma } from "@/lib/prisma";
import { branchSchema } from "@/lib/validations/branch";
import { revalidatePath } from "next/cache";

export async function getBranches() {
  return await prisma.branch.findMany({
    orderBy: { createdAt: "asc" },
  });
}

export async function createBranch(formData: FormData) {
  const parsed = branchSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.branch.create({
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/branch");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama branch sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateBranch(id: string, formData: FormData) {
  const parsed = branchSchema.safeParse({
    name: formData.get("name"),
    address: formData.get("address") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.branch.update({
      where: { id },
      data: parsed.data,
    });
    revalidatePath("/dashboard/applicant/branch");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama branch sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteBranch(id: string) {
  try {
    await prisma.branch.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/branch");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}