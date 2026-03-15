"use server";

import { analyzeCVWithGemini } from "@/lib/gemini/gemini-service";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
      minEducation: true,
      minExperience: true,
      creator: {
        select: {
          id: true,
          nama: true,
        },
      },
      customQuestions: true,
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

  return {
    job: { ...job, applications: candidates },
    candidates,
  };
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

export async function scoreAndAnalyzeCandidate(candidateId: string) {
  try {
    console.log("=== START AI ANALYSIS ===");
    console.log("Candidate ID:", candidateId);

    // 1. Get candidate data
    const candidate = await prisma.application.findUnique({
      where: { id: candidateId },
      include: {
        education: true,
        job: {
          include: {
            position: true,
            minEducation: true,
            minExperience: true,
          },
        },
      },
    });

    if (!candidate) {
      return { error: "Candidate not found" };
    }

    console.log("Candidate found:", candidate.fullName);
    console.log("CV URL:", candidate.cvUrl);

    // 2. AI Analysis with Gemini (ONLY THIS)
    let aiAnalysis = null;
    let aiError = null;

    if (candidate.cvUrl) {
      console.log("=== AI ANALYSIS START ===");
      try {
        aiAnalysis = await analyzeCVWithGemini(
          candidate.cvUrl,
          candidate.job.description || "",
          candidate.job.requirements || "",
          candidate.job.position.nama,
        );
        console.log("AI Analysis SUCCESS:", aiAnalysis);
      } catch (error) {
        console.error("=== AI ANALYSIS FAILED ===");
        console.error("Error:", error);
        aiError = error instanceof Error ? error.message : "Unknown error";
      }
    } else {
      console.log("No CV URL, cannot analyze");
      return { error: "CV not found, cannot analyze" };
    }

    // 3. Update database (AI analysis only)
    console.log("=== UPDATING DATABASE ===");

    if (aiAnalysis) {
      await prisma.application.update({
        where: { id: candidateId },
        data: {
          aiStrengths: aiAnalysis.strengths,
          aiWeaknesses: aiAnalysis.weaknesses,
          aiConclusion: aiAnalysis.conclusion,
          aiRecommendation: aiAnalysis.recommendation,
          aiMatchPercentage: aiAnalysis.matchPercentage,
          analyzedAt: new Date(),
        },
      });

      console.log("Database updated successfully");
    } else {
      console.log("No AI analysis to save");
      return { error: aiError || "Failed to analyze CV" };
    }

    revalidatePath(
      `/dashboard/applicant/joblist/${candidate.jobId}/candidates`,
    );

    console.log("=== AI ANALYSIS COMPLETE ===");

    return {
      success: true,
      data: {
        analysis: aiAnalysis,
      },
    };
  } catch (error) {
    console.error("=== AI ANALYSIS ERROR ===");
    console.error("Error:", error);
    return {
      error:
        error instanceof Error ? error.message : "Failed to analyze candidate",
    };
  }
}

export async function getCandidateNavigation(
  candidateId: string,
  jobId: string,
) {
  try {
    // Get all candidates for this job, ordered by createdAt
    const candidates = await prisma.application.findMany({
      where: { jobId },
      select: {
        id: true,
        fullName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const currentIndex = candidates.findIndex((c) => c.id === candidateId);

    if (currentIndex === -1) {
      return { prev: null, next: null, current: 0, total: 0 };
    }

    return {
      prev: currentIndex > 0 ? candidates[currentIndex - 1] : null,
      next:
        currentIndex < candidates.length - 1
          ? candidates[currentIndex + 1]
          : null,
      current: currentIndex + 1,
      total: candidates.length,
    };
  } catch (error) {
    console.error("Error getting candidate navigation:", error);
    return { prev: null, next: null, current: 0, total: 0 };
  }
}

export async function deleteCandidate(candidateId: string) {
  try {
    await prisma.application.delete({
      where: { id: candidateId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete candidate error:", error);
    return { error: "Failed to delete candidate" };
  }
}
