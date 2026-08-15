"use server";

import { getSessionProfile, canAccessDivision } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";

export async function getCandidateStageHistory(applicationId: string) {
  const profile = await getSessionProfile();
  if (!profile) return [];

  // Verify access ke kandidat ini (guard sama seperti notes)
  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: {
      job: {
        select: {
          position: {
            select: { divisiId: true },
          },
        },
      },
    },
  });

  if (!application) return [];
  if (!canAccessDivision(profile, application.job.position.divisiId)) return [];

  return await prisma.stageHistory.findMany({
    where: { applicationId },
    include: {
      fromStage: { select: { id: true, name: true } },
      toStage: { select: { id: true, name: true } },
      changedBy: { select: { id: true, nama: true, email: true, role: true } },
    },
    orderBy: { createdAt: "desc" }, // terbaru di atas, konsisten dengan Notes
  });
}