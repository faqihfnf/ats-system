"use server";

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

export async function scoreCandidate(candidateId: string) {
  try {
    // Get candidate data with job requirements
    const candidate = await prisma.application.findUnique({
      where: { id: candidateId },
      include: {
        education: true,
        job: {
          include: {
            minEducation: true,
            minExperience: true,
          },
        },
      },
    });

    if (!candidate) {
      return { error: "Candidate not found" };
    }

    // Get all educations to build hierarchy
    const educations = await prisma.education.findMany({
      orderBy: { id: "asc" },
    });

    // Build education levels map (assuming educations are ordered by level)
    const educationLevels = new Map<string, number>();
    educations.forEach((edu, index) => {
      educationLevels.set(edu.id, index);
    });

    // Calculate candidate's years of experience
    const candidateYoE = calculateYearsOfExperience(
      candidate.jobStartYear,
      candidate.jobEndYear,
    );

    // Calculate candidate's age
    const candidateAge = calculateAge(candidate.birthDate);

    // Calculate score
    const scoringResult = calculateScore({
      candidateEducationId: candidate.educationId,
      candidateYearsOfExperience: candidateYoE,
      candidateAge,
      candidateExpectedSalary: candidate.expectedSalary,
      candidateGender: candidate.gender,
      candidateReligion: candidate.religion,

      jobMinEducationId: candidate.job.minEducationId,
      jobMinExperience: candidate.job.minExperience.minYears,
      jobMaxExperience: candidate.job.minExperience.minYears + 5, // Assuming max = min + 5
      jobMinAge: candidate.job.minAge,
      jobMaxAge: candidate.job.maxAge,
      jobMinSalary: candidate.job.minSalary,
      jobMaxSalary: candidate.job.maxSalary,
      jobGender: candidate.job.gender,
      jobReligion: candidate.job.religion,

      educationLevels,
    });

    // Update candidate with scores
    await prisma.application.update({
      where: { id: candidateId },
      data: {
        totalScore: scoringResult.totalScore,
        educationScore: scoringResult.educationScore,
        experienceScore: scoringResult.experienceScore,
        ageScore: scoringResult.ageScore,
        salaryScore: scoringResult.salaryScore,
        genderScore: scoringResult.genderScore,
        religionScore: scoringResult.religionScore,
        scoredAt: new Date(),
      },
    });

    revalidatePath(
      `/dashboard/applicant/joblist/${candidate.jobId}/candidates`,
    );

    return { success: true, data: scoringResult };
  } catch (error) {
    console.error("Score candidate error:", error);
    return { error: "Failed to score candidate" };
  }
}
