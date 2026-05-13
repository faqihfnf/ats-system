"use server";

import { getSessionProfile } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const jobStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);

type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "NUMBER"
  | "DATE"
  | "MULTIPLE_CHOICE"
  | "CHECKBOX"
  | "DROPDOWN"
  | "YES_NO";

type JobQuestionPayload = {
  id?: string;
  question: string;
  type: QuestionType;
  required: boolean;
  options?: string[] | null;
};

type JobPayload = {
  positionId: string;
  branchId: string;
  employmentStatusId: string;
  province: string;
  city: string;
  minSalary: number;
  maxSalary: number;
  showSalary: boolean;
  description?: string | null;
  requirements?: string | null;
  minEducationId: string;
  minExperienceId: string;
  minAge: number;
  maxAge: number;
  showAge: boolean;
  gender: "MALE" | "FEMALE" | "ANY";
  showGender: boolean;
  religion: "ISLAM" | "KRISTEN" | "KATOLIK" | "HINDU" | "BUDDHA" | "KONGHUCU" | "ANY";
  showReligion: boolean;
  questions?: JobQuestionPayload[];
};

export async function createJob(data: JobPayload) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return { error: "Tidak terautentikasi" };
    }
    if (profile.role === "USER") {
      return { error: "Anda tidak memiliki akses untuk membuat lowongan" };
    }

    // Create job dengan custom questions
    await prisma.job.create({
      data: {
        // Step 1
        positionId: data.positionId,
        branchId: data.branchId,
        employmentStatusId: data.employmentStatusId,
        province: data.province,
        city: data.city,
        minSalary: data.minSalary,
        maxSalary: data.maxSalary,
        showSalary: data.showSalary,

        // Step 2
        description: data.description,
        requirements: data.requirements,

        // Step 3
        minEducationId: data.minEducationId,
        minExperienceId: data.minExperienceId,
        minAge: data.minAge,
        maxAge: data.maxAge,
        showAge: data.showAge,
        gender: data.gender,
        showGender: data.showGender,
        religion: data.religion,
        showReligion: data.showReligion,

        // Step 4 - Custom Questions
        ...(data.questions &&
        Array.isArray(data.questions) &&
        data.questions.length > 0
          ? {
              customQuestions: {
                create: data.questions.map(
                  (q: JobQuestionPayload, index: number) => ({
                    question: q.question,
                    type: q.type,
                    required: q.required,
                    order: index + 1,
                    options:
                      q.options &&
                      Array.isArray(q.options) &&
                      q.options.length > 0
                        ? JSON.stringify(q.options)
                        : null,
                  }),
                ),
              },
            }
          : {}),

        // Meta
        createdBy: profile.id,
        status: "DRAFT",
      },
      include: {
        customQuestions: true,
      },
    });

    revalidatePath("/dashboard/applicant/joblist");
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Create job error:", error);
    return {
      error: `Terjadi kesalahan saat menyimpan lowongan: ${message}`,
    };
  }
}

export async function getJobs() {
  const profile = await getSessionProfile();

  const stages = await prisma.stage.findMany({
    orderBy: { order: "asc" },
  });

  if (!profile) {
    return { jobs: [], stages, canManageJobs: false, role: null };
  }

  const isUserRole = profile.role === "USER";
  if (isUserRole && !profile.divisiId) {
    return { jobs: [], stages, canManageJobs: false, role: profile.role };
  }

  const jobs = await prisma.job.findMany({
    where: isUserRole
      ? {
          position: {
            divisiId: profile.divisiId!,
          },
        }
      : undefined,
    include: {
      position: {
        include: {
          divisi: true,
          level: true,
        },
      },
      branch: true,
      employmentStatus: true,
      minEducation: true,
      minExperience: true,
      creator: true,
      applications: {
        select: {
          currentStageId: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    jobs,
    stages,
    canManageJobs: profile.role !== "USER",
    role: profile.role,
  };
}

export async function getAvailablePositions() {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "USER") return [];

  const usedPositions = await prisma.job.findMany({
    where: {
      status: {
        in: ["OPEN", "DRAFT"],
      },
    },
    select: {
      positionId: true,
    },
  });

  const usedPositionIds = usedPositions.map((job) => job.positionId);

  const allPositions = await prisma.position.findMany({
    include: {
      divisi: true,
      level: true,
    },
    orderBy: { nama: "asc" },
  });

  const availablePositions = allPositions.filter(
    (pos) => !usedPositionIds.includes(pos.id),
  );

  return availablePositions;
}

export async function getAllPositions() {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "USER") return [];

  return await prisma.position.findMany({
    include: {
      divisi: true,
      level: true,
    },
    orderBy: { nama: "asc" },
  });
}

export async function deleteJob(id: string) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };
    if (profile.role === "USER") {
      return { error: "Anda tidak memiliki akses untuk menghapus lowongan" };
    }

    await prisma.job.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/joblist");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}

export async function updateJobStatus(id: string, status: string) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };
    if (profile.role === "USER") {
      return { error: "Anda tidak memiliki akses untuk mengubah status" };
    }

    const validStatus = jobStatusSchema.parse(status);

    await prisma.job.update({
      where: { id },
      data: { status: validStatus },
    });
    revalidatePath("/dashboard/applicant/joblist");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat mengubah status" };
  }
}

export async function getJobForEdit(id: string) {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "USER") return null;

  const job = await prisma.job.findUnique({
    where: { id },
    include: {
      position: {
        include: {
          divisi: true,
          level: true,
        },
      },
      branch: true,
      employmentStatus: true,
      minEducation: true,
      minExperience: true,
      customQuestions: {
        orderBy: { order: "asc" },
      },
      _count: {
        select: {
          applications: true,
        },
      },
    },
  });

  if (!job) return null;

  // Get answer counts for each question
  const questionsWithAnswerCount = await Promise.all(
    job.customQuestions.map(async (q) => {
      const answerCount = await prisma.applicationAnswer.count({
        where: { questionId: q.id },
      });
      return {
        ...q,
        answerCount,
      };
    }),
  );

  return {
    ...job,
    customQuestions: questionsWithAnswerCount,
    hasApplications: job._count.applications > 0,
  };
}

export async function updateJob(id: string, data: JobPayload) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return { error: "Tidak terautentikasi" };
    }
    if (profile.role === "USER") {
      return { error: "Anda tidak memiliki akses untuk mengubah lowongan" };
    }

    // Get existing job with question answer counts
    const existingJob = await prisma.job.findUnique({
      where: { id },
      include: {
        customQuestions: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
    });

    if (!existingJob) {
      return { error: "Lowongan tidak ditemukan" };
    }

    const hasApplications = existingJob._count.applications > 0;

    if (hasApplications) {
      // Ada applicants - check delete restrictions
      const existingQuestions = existingJob.customQuestions;
      const existingQuestionIds = existingQuestions.map((q) => q.id);

      const incomingQuestionIds =
        data.questions
          ?.filter((q: JobQuestionPayload) => q.id) // Only questions dengan ID = existing
          .map((q: JobQuestionPayload) => q.id) || [];

      // Find EXISTING questions being deleted (yang sudah ada di DB)
      const deletedExistingQuestionIds = existingQuestionIds.filter(
        (eqId) => !incomingQuestionIds.includes(eqId),
      );

      if (deletedExistingQuestionIds.length > 0) {
        console.log(
          "Checking answers for deleted questions:",
          deletedExistingQuestionIds,
        );

        // Check each question individually
        for (const qId of deletedExistingQuestionIds) {
          const count = await prisma.applicationAnswer.count({
            where: { questionId: qId },
          });
          console.log(`Question ${qId}: ${count} answers`);
        }

        const answersCount = await prisma.applicationAnswer.count({
          where: {
            questionId: {
              in: deletedExistingQuestionIds,
            },
          },
        });

        console.log("Total answers count for deleted questions:", answersCount);

        if (answersCount > 0) {
          console.log("ERROR: Cannot delete questions with answers");

          // Find which specific questions have answers
          const questionsWithAnswers = await prisma.applicationAnswer.findMany({
            where: {
              questionId: {
                in: deletedExistingQuestionIds,
              },
            },
            select: {
              questionId: true,
              question: {
                select: {
                  question: true,
                },
              },
            },
            distinct: ["questionId"],
          });

          console.log("Questions with answers:", questionsWithAnswers);

          return {
            error:
              "Tidak dapat menghapus pertanyaan yang sudah dijawab oleh pelamar",
          };
        }

        console.log(
          "Safe to delete - deleting questions:",
          deletedExistingQuestionIds,
        );
        await prisma.customQuestion.deleteMany({
          where: {
            id: { in: deletedExistingQuestionIds },
          },
        });
      }

      // Update existing questions
      const existingToUpdate =
        data.questions?.filter((q: JobQuestionPayload) => q.id) || [];
      for (const q of existingToUpdate) {
        await prisma.customQuestion.update({
          where: { id: q.id },
          data: {
            question: q.question,
            type: q.type,
            required: q.required,
            options:
              q.options && Array.isArray(q.options) && q.options.length > 0
                ? JSON.stringify(q.options)
                : null,
          },
        });
      }

      // Create new questions (yang belum punya ID)
      const newQuestions =
        data.questions?.filter((q: JobQuestionPayload) => !q.id) || [];
      if (newQuestions.length > 0) {
        const maxOrder =
          existingQuestions.length > 0
            ? Math.max(...existingQuestions.map((q) => q.order))
            : 0;

        await prisma.customQuestion.createMany({
          data: newQuestions.map((q: JobQuestionPayload, index: number) => ({
            jobId: id,
            question: q.question,
            type: q.type,
            required: q.required,
            order: maxOrder + index + 1,
            options:
              q.options && Array.isArray(q.options) && q.options.length > 0
                ? JSON.stringify(q.options)
                : null,
          })),
        });
      }

      // Update job data (steps 1-3)
      await prisma.job.update({
        where: { id },
        data: {
          positionId: data.positionId,
          branchId: data.branchId,
          employmentStatusId: data.employmentStatusId,
          province: data.province,
          city: data.city,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
          showSalary: data.showSalary,
          description: data.description,
          requirements: data.requirements,
          minEducationId: data.minEducationId,
          minExperienceId: data.minExperienceId,
          minAge: data.minAge,
          maxAge: data.maxAge,
          showAge: data.showAge,
          gender: data.gender as "MALE" | "FEMALE" | "ANY",
          showGender: data.showGender,
          religion: data.religion,
          showReligion: data.showReligion,
        },
      });
    } else {
      // No applications - full freedom
      await prisma.customQuestion.deleteMany({
        where: { jobId: id },
      });

      await prisma.job.update({
        where: { id },
        data: {
          positionId: data.positionId,
          branchId: data.branchId,
          employmentStatusId: data.employmentStatusId,
          province: data.province,
          city: data.city,
          minSalary: data.minSalary,
          maxSalary: data.maxSalary,
          showSalary: data.showSalary,
          description: data.description,
          requirements: data.requirements,
          minEducationId: data.minEducationId,
          minExperienceId: data.minExperienceId,
          minAge: data.minAge,
          maxAge: data.maxAge,
          showAge: data.showAge,
          gender: data.gender as "MALE" | "FEMALE" | "ANY",
          showGender: data.showGender,
          religion: data.religion,
          showReligion: data.showReligion,

          ...(data.questions &&
          Array.isArray(data.questions) &&
          data.questions.length > 0
            ? {
                customQuestions: {
                  create: data.questions.map(
                    (q: JobQuestionPayload, index: number) => ({
                      question: q.question,
                      type: q.type,
                      required: q.required,
                      order: index + 1,
                      options:
                        q.options &&
                        Array.isArray(q.options) &&
                        q.options.length > 0
                          ? JSON.stringify(q.options)
                          : null,
                    }),
                  ),
                },
              }
            : {}),
        },
      });
    }
    console.log("=== UPDATE SUCCESS ===");
    revalidatePath("/dashboard/applicant/joblist");
    revalidatePath(`/dashboard/applicant/joblist/${id}`);
    return { success: true };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("Update job error:", error);
    return {
      error: `Terjadi kesalahan saat mengupdate lowongan: ${message}`,
    };
  }
}
