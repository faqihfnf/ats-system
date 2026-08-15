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

    // Form apply bersifat publik (tanpa session), jadi gunakan profile ADMIN
    // pertama sebagai aktor "Sistem" untuk pencatatan history awal
    const systemProfile = await prisma.profile.findFirst({
      where: { role: "ADMIN" },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    // Create application + initial stage history
    await prisma.application.create({
      data: {
        jobId,
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        birthPlace: data.birthPlace,
        birthDate: new Date(data.birthDate),
        religion: data.religion,
        gender: data.gender,
        ktpAddress: data.ktpAddress,
        domicileAddress: data.domicileAddress,
        sameAsKtp: data.sameAsKtp,
        province: data.province,
        city: data.city,
        district: data.district,
        subdistrict: data.subdistrict,
        // Pendidikan
        educationId: data.educationId,
        institution: data.institution,
        startYear: data.startYear,
        endYear: data.endYear,

        // Pengalaman Kerja (TAMBAH INI)
        lastJobTitle: data.lastJobTitle,
        lastCompany: data.lastCompany,
        jobStartYear: data.jobStartYear,
        jobEndYear: data.jobEndYear,
        stillWorking: data.stillWorking,

        // Gaji
        currentSalary: data.currentSalary,
        expectedSalary: data.expectedSalary,
        cvUrl: data.cvUrl,
        currentStageId: firstStage?.id,
        status: "ACTIVE",
        // Catat riwayat awal: masuk ke stage pertama
        ...(firstStage && systemProfile
          ? {
              stageHistories: {
                create: {
                  fromStageId: null,
                  toStageId: firstStage.id,
                  changedById: systemProfile.id,
                  note: "Melamar (masuk stage awal)",
                },
              },
            }
          : {}),
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
