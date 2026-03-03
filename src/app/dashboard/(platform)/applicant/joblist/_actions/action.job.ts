"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const jobStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);

export async function createJob(data: any) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Tidak terautentikasi" };
    }

    // Create job dengan custom questions
    const job = await prisma.job.create({
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
                create: data.questions.map((q: any, index: number) => ({
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
                })),
              },
            }
          : {}),

        // Meta
        createdBy: user.id,
        status: "DRAFT",
      },
      include: {
        customQuestions: true,
      },
    });

    revalidatePath("/dashboard/applicant/joblist");
    return { success: true };
  } catch (error: any) {
    console.error("Create job error:", error);
    return {
      error: `Terjadi kesalahan saat menyimpan lowongan: ${error.message}`,
    };
  }
}

export async function getJobs() {
  const stages = await prisma.stage.findMany({
    orderBy: { order: "asc" },
  });

  const jobs = await prisma.job.findMany({
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
    },
    orderBy: { createdAt: "desc" },
  });

  return { jobs, stages };
}

export async function getAvailablePositions() {
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
    await prisma.job.delete({ where: { id } });
    revalidatePath("/dashboard/applicant/joblist");
    return { success: true };
  } catch {
    return { error: "Terjadi kesalahan saat menghapus" };
  }
}

export async function updateJobStatus(id: string, status: string) {
  try {
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

export async function updateJob(id: string, data: any) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { error: "Tidak terautentikasi" };
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
          ?.filter((q: any) => q.id) // Only questions dengan ID = existing
          .map((q: any) => q.id) || [];

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
      const existingToUpdate = data.questions?.filter((q: any) => q.id) || [];
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
      const newQuestions = data.questions?.filter((q: any) => !q.id) || [];
      if (newQuestions.length > 0) {
        const maxOrder =
          existingQuestions.length > 0
            ? Math.max(...existingQuestions.map((q) => q.order))
            : 0;

        await prisma.customQuestion.createMany({
          data: newQuestions.map((q: any, index: number) => ({
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
          gender: data.gender,
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
          gender: data.gender,
          showGender: data.showGender,
          religion: data.religion,
          showReligion: data.showReligion,

          ...(data.questions &&
          Array.isArray(data.questions) &&
          data.questions.length > 0
            ? {
                customQuestions: {
                  create: data.questions.map((q: any, index: number) => ({
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
                  })),
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
  } catch (error: any) {
    console.error("Update job error:", error);
    return {
      error: `Terjadi kesalahan saat mengupdate lowongan: ${error.message}`,
    };
  }
}
