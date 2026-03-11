"use server";

import { prisma } from "@/lib/prisma";

export async function getCandidates(jobId: string) {
  const job = await prisma.job.findUnique({
    where: { id: jobId },
    include: {
      position: {
        include: {
          divisi: true,
          level: true,
        },
      },
    },
  });

  if (!job) return null;

  const candidates = await prisma.application.findMany({
    where: { jobId },
    include: {
      education: true,
      currentStage: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return { job, candidates };
}

export async function updateCandidateStage(
  applicationId: string,
  stageId: string,
) {
  try {
    await prisma.application.update({
      where: { id: applicationId },
      data: { currentStageId: stageId },
    });

    return { success: true };
  } catch (error) {
    console.error("Update stage error:", error);
    return { error: "Gagal mengupdate stage" };
  }
}

export async function getCandidateDetail(candidateId: string) {
  const candidate = await prisma.application.findUnique({
    where: { id: candidateId },
    include: {
      education: true,
      currentStage: true,
      job: {
        include: {
          position: {
            include: {
              divisi: true,
              level: true,
            },
          },
          customQuestions: {
            orderBy: { order: "asc" },
          },
        },
      },
      answers: {
        include: {
          question: true,
        },
      },
    },
  });

  return candidate;
}
