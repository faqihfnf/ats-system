"use server";

import { extractTextFromPDF } from "@/lib/pdf/pdf";
import { analyzeCVWithOpenRouter } from "@/lib/openrouter/openrouter-service";
import { canAccessDivision, getSessionProfile } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getModelsForScoring() {
  return await prisma.aiModel.findMany({
    orderBy: { name: "asc" },
  });
}

export async function getCandidates(jobId: string) {
  const profile = await getSessionProfile();
  if (!profile) return null;

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
  if (!canAccessDivision(profile, job.position.divisiId)) return null;

  const candidates = await prisma.application.findMany({
    where: { jobId },
    include: {
      education: true,
      currentStage: true,
      job: {
        select: {
          position: {
            select: {
              nama: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    job: { ...job, applications: candidates },
    candidates,
    canManageCandidateActions: profile.role !== "USER",
  };
}

export async function updateCandidateStage(
  applicationId: string,
  stageId: string,
) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        job: {
          select: {
            position: {
              select: {
                divisiId: true,
              },
            },
          },
        },
      },
    });

    if (!application) {
      return { error: "Kandidat tidak ditemukan" };
    }

    if (!canAccessDivision(profile, application.job.position.divisiId)) {
      return { error: "Anda tidak memiliki akses ke kandidat ini" };
    }

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
  const profile = await getSessionProfile();
  if (!profile) return null;

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

  if (!candidate) return null;
  if (!canAccessDivision(profile, candidate.job.position.divisiId)) return null;

  return candidate;
}

export async function scoreAndAnalyzeCandidate(candidateId: string, modelId: string) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };
    if (profile.role === "USER") {
      return { error: "Role User tidak memiliki akses analisis kandidat" };
    }

    console.log("=== START AI ANALYSIS ===");
    console.log("Candidate ID:", candidateId);
    console.log("Model ID:", modelId);

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
    if (!canAccessDivision(profile, candidate.job.position.divisiId)) {
      return { error: "Anda tidak memiliki akses ke kandidat ini" };
    }

    if (!candidate.cvUrl) {
      return { error: "CV not found, cannot analyze" };
    }

    // 2. Extract text from PDF
    console.log("=== EXTRACTING PDF TEXT ===");
    let cvText: string;
    try {
      cvText = await extractTextFromPDF(candidate.cvUrl);
      console.log(`PDF text extracted: ${cvText.length} characters`);
    } catch (error: any) {
      console.error("PDF extraction failed:", error.message);
      return { error: `Gagal mengekstrak teks dari CV: ${error.message}` };
    }

    // 3. AI Analysis with OpenRouter
    console.log("=== AI ANALYSIS START ===");
    let aiAnalysis = null;
    let aiError = null;

    try {
      aiAnalysis = await analyzeCVWithOpenRouter(
        cvText,
        candidate.job.description || "",
        candidate.job.requirements || "",
        candidate.job.position.nama,
        modelId,
      );
      console.log("AI Analysis SUCCESS:", aiAnalysis);
    } catch (error) {
      console.error("=== AI ANALYSIS FAILED ===");
      console.error("Error:", error);
      aiError = error instanceof Error ? error.message : "Unknown error";
    }

    // 4. Update database
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
    const profile = await getSessionProfile();
    if (!profile) return { prev: null, next: null, current: 0, total: 0 };

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: {
        position: {
          select: {
            divisiId: true,
          },
        },
      },
    });

    if (!job || !canAccessDivision(profile, job.position.divisiId)) {
      return { prev: null, next: null, current: 0, total: 0 };
    }

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
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };
    if (profile.role === "USER") {
      return { error: "Role User tidak memiliki akses hapus kandidat" };
    }

    const candidate = await prisma.application.findUnique({
      where: { id: candidateId },
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

    if (!candidate || !canAccessDivision(profile, candidate.job.position.divisiId)) {
      return { error: "Kandidat tidak ditemukan atau tidak dapat diakses" };
    }

    await prisma.application.delete({
      where: { id: candidateId },
    });

    return { success: true };
  } catch (error) {
    console.error("Delete candidate error:", error);
    return { error: "Failed to delete candidate" };
  }
}
export async function transferCandidate(
  candidateId: string,
  fromJobId: string,
  toJobId: string,
) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };
    if (profile.role === "USER") {
      return { error: "Role User tidak memiliki akses pindah kandidat" };
    }

    // 1. Get first stage
    const firstStage = await prisma.stage.findFirst({
      orderBy: { order: "asc" },
    });

    if (!firstStage) {
      return { error: "No stages found in the system" };
    }

    // 2. Verify target job exists
    const targetJob = await prisma.job.findUnique({
      where: { id: toJobId },
      select: {
        id: true,
        position: {
          select: {
            divisiId: true,
          },
        },
      },
    });

    if (!targetJob) {
      return { error: "Target job not found" };
    }

    const sourceCandidate = await prisma.application.findUnique({
      where: { id: candidateId },
      select: {
        job: {
          select: {
            position: {
              select: {
                divisiId: true,
              },
            },
          },
        },
      },
    });

    if (
      !sourceCandidate ||
      !canAccessDivision(profile, sourceCandidate.job.position.divisiId) ||
      !canAccessDivision(profile, targetJob.position.divisiId)
    ) {
      return { error: "Kandidat tidak dapat dipindahkan lintas akses divisi" };
    }

    // 3. Delete all custom question answers (ApplicationAnswer)
    await prisma.applicationAnswer.deleteMany({
      where: { applicationId: candidateId },
    });

    // 4. Update candidate to new job and reset stage
    await prisma.application.update({
      where: { id: candidateId },
      data: {
        jobId: toJobId,
        currentStageId: firstStage.id,
        // Reset AI Scoring
        totalScore: 0,
        educationScore: 0,
        experienceScore: 0,
        ageScore: 0,
        salaryScore: 0,
        genderScore: 0,
        religionScore: 0,
        scoredAt: null,
        // Reset AI Analysis
        aiStrengths: null,
        aiWeaknesses: null,
        aiConclusion: null,
        aiRecommendation: null,
        aiMatchPercentage: null,
        analyzedAt: null,
      },
    });

    revalidatePath(`/dashboard/applicant/joblist/${fromJobId}/candidates`);
    revalidatePath(`/dashboard/applicant/joblist/${toJobId}/candidates`);

    return { success: true };
  } catch (error) {
    console.error("Transfer candidate error:", error);
    return { error: "Failed to transfer candidate" };
  }
}

// Get all active jobs for transfer dropdown
export async function getActiveJobs() {
  try {
    const profile = await getSessionProfile();
    if (!profile || profile.role === "USER") return [];

    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
      },
      select: {
        id: true,
        position: {
          select: {
            nama: true,
            divisi: { select: { nama: true } },
            level: { select: { nama: true } },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return jobs;
  } catch (error) {
    console.error("Get active jobs error:", error);
    return [];
  }
}
