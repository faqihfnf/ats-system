"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitApplication(jobId: string, data: any) {
  try {
    // Validasi job masih OPEN
    const job = await prisma.job.findUnique({
      where: { id: jobId, status: "OPEN" },
    });

    if (!job) {
      return { error: "Lowongan tidak tersedia atau sudah ditutup" };
    }

    // Get first stage untuk set sebagai current stage
    const firstStage = await prisma.stage.findFirst({
      orderBy: { order: "asc" },
    });

    // Create application
    await prisma.application.create({
      data: {
        jobId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        religion: data.religion,
        ktpAddress: data.ktpAddress,
        domicileAddress: data.domicileAddress,
        sameAsKtp: data.sameAsKtp,
        province: data.province,
        city: data.city,
        district: data.district,
        subdistrict: data.subdistrict,
        educationId: data.educationId,
        institution: data.institution,
        startYear: data.startYear,
        endYear: data.endYear,
        currentSalary: data.currentSalary,
        expectedSalary: data.expectedSalary,
        cvUrl: data.cvUrl,
        currentStageId: firstStage?.id,
        status: "ACTIVE",
        // ← Fix: hanya create answers jika ada
        ...(data.answers && data.answers.length > 0
          ? {
              answers: {
                create: data.answers.map((ans: any) => ({
                  questionId: ans.questionId,
                  answer: ans.answer,
                })),
              },
            }
          : {}),
      },
    });

    revalidatePath(`/jobs/${jobId}`);
    return { success: true };
  } catch (error) {
    console.error("Submit application error:", error);
    return { error: "Terjadi kesalahan saat mengirim lamaran" };
  }
}

export async function getJobForApplication(id: string) {
  const job = await prisma.job.findUnique({
    where: { id, status: "OPEN" },
    include: {
      position: {
        include: {
          divisi: true,
          level: true,
        },
      },
      branch: true,
      employmentStatus: true,
      customQuestions: {
        orderBy: { order: "asc" },
      },
    },
  });

  return job;
}
