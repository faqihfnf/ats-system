"use server";

import { prisma } from "@/lib/prisma";
import { stageSchema } from "@/lib/validations/stage";
import { revalidatePath } from "next/cache";

export async function getStages() {
  return await prisma.stage.findMany({
    orderBy: { order: "asc" },
  });
}

export async function createStage(formData: FormData) {
  const parsed = stageSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    // Taruh di order terakhir
    const lastStage = await prisma.stage.findFirst({
      orderBy: { order: "desc" },
    });
    const order = lastStage ? lastStage.order + 1 : 1;

    await prisma.stage.create({
      data: { name: parsed.data.name, order },
    });
    revalidatePath("/dashboard/stages");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama stage sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function updateStage(id: string, formData: FormData) {
  const parsed = stageSchema.safeParse({
    name: formData.get("name"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  try {
    await prisma.stage.update({
      where: { id },
      data: { name: parsed.data.name },
    });
    revalidatePath("/dashboard/stages");
    return { success: true };
  } catch (e: any) {
    if (e.code === "P2002") {
      return { error: "Nama stage sudah ada" };
    }
    return { error: "Terjadi kesalahan" };
  }
}

export async function deleteStage(id: string) {
  try {
    const [candidateCount, historyCount] = await Promise.all([
      prisma.application.count({ where: { currentStageId: id } }),
      prisma.stageHistory.count({ where: { toStageId: id } }),
    ]);

    if (candidateCount > 0) {
      return {
        error: `Stage tidak dapat dihapus karena masih ditempati oleh ${candidateCount} kandidat. Pindahkan kandidat ke stage lain terlebih dahulu.`,
      };
    }

    if (historyCount > 0) {
      return {
        error: `Stage tidak dapat dihapus karena sudah tercatat di riwayat perpindahan stage (${historyCount} riwayat).`,
      };
    }

    await prisma.stage.delete({ where: { id } });
    revalidatePath("/dashboard/stages");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}

// Update order setelah drag and drop
export async function reorderStages(orderedIds: string[]) {
  try {
    await Promise.all(
      orderedIds.map((id, index) =>
        prisma.stage.update({
          where: { id },
          data: { order: index + 1 },
        })
      )
    );
    revalidatePath("/dashboard/stages");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menyimpan order" };
  }
}