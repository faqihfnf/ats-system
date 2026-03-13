"use server";

import { analyzeCVWithGemini } from "@/lib/gemini/gemini-service";
import { prisma } from "@/lib/prisma";
import {
  calculateScore,
  calculateYearsOfExperience,
  calculateAge,
} from "@/lib/scoring/scoring-engine";
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

export async function scoreAndAnalyzeCandidate(candidateId: string) {
  try {
    console.log("=== START SCORE AND ANALYZE ===");
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

    // 2. Calculate Rule-based Score
    console.log("=== CALCULATING SCORE ===");

    const educations = await prisma.education.findMany({
      orderBy: { id: "asc" },
    });

    const educationLevels = new Map<string, number>();
    educations.forEach((edu, index) => {
      educationLevels.set(edu.id, index);
    });

    const candidateYoE = calculateYearsOfExperience(
      candidate.jobStartYear,
      candidate.jobEndYear,
    );

    const candidateAge = calculateAge(candidate.birthDate);

    const scoringResult = calculateScore({
      candidateEducationId: candidate.educationId,
      candidateYearsOfExperience: candidateYoE,
      candidateAge,
      candidateExpectedSalary: candidate.expectedSalary,
      candidateGender: candidate.gender,
      candidateReligion: candidate.religion,
      jobMinEducationId: candidate.job.minEducationId,
      jobMinExperience: candidate.job.minExperience.minYears,
      jobMaxExperience: candidate.job.minExperience.minYears + 5,
      jobMinAge: candidate.job.minAge,
      jobMaxAge: candidate.job.maxAge,
      jobMinSalary: candidate.job.minSalary,
      jobMaxSalary: candidate.job.maxSalary,
      jobGender: candidate.job.gender,
      jobReligion: candidate.job.religion,
      educationLevels,
    });

    console.log("Scoring result:", scoringResult);

    // 3. AI Analysis with Gemini
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
      console.log("No CV URL, skipping AI analysis");
    }

    // 4. Update database
    console.log("=== UPDATING DATABASE ===");

    const updateData = {
      // Rule-based scoring
      totalScore: scoringResult.totalScore,
      educationScore: scoringResult.educationScore,
      experienceScore: scoringResult.experienceScore,
      ageScore: scoringResult.ageScore,
      salaryScore: scoringResult.salaryScore,
      genderScore: scoringResult.genderScore,
      religionScore: scoringResult.religionScore,
      scoredAt: new Date(),

      // AI analysis (if available)
      ...(aiAnalysis && {
        aiStrengths: aiAnalysis.strengths,
        aiWeaknesses: aiAnalysis.weaknesses,
        aiConclusion: aiAnalysis.conclusion,
        aiRecommendation: aiAnalysis.recommendation,
        aiMatchPercentage: aiAnalysis.matchPercentage,
        analyzedAt: new Date(),
      }),
    };

    console.log("Update data:", updateData);

    await prisma.application.update({
      where: { id: candidateId },
      data: updateData,
    });

    console.log("Database updated successfully");

    revalidatePath(
      `/dashboard/applicant/joblist/${candidate.jobId}/candidates`,
    );

    console.log("=== SCORE AND ANALYZE COMPLETE ===");

    return {
      success: true,
      data: {
        scoring: scoringResult,
        analysis: aiAnalysis,
      },
      ...(aiError && { warnings: [`AI analysis failed: ${aiError}`] }),
    };
  } catch (error) {
    console.error("=== SCORE AND ANALYZE ERROR ===");
    console.error("Error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "Failed to score and analyze candidate",
    };
  }
}

// Alias for backward compatibility - NOW CALLS scoreAndAnalyzeCandidate
export async function scoreCandidate(candidateId: string) {
  return scoreAndAnalyzeCandidate(candidateId);
}
