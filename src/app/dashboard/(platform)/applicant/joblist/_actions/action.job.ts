"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const jobStatusSchema = z.enum(["DRAFT", "OPEN", "CLOSED"]);


export async function createJob(data: any) {
  try {
    // Get current user
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { error: "Tidak terautentikasi" };
    }

    // Create job
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
        
        // Meta
        createdBy: user.id,
        status: "DRAFT", // default status
      },
    });

    revalidatePath("/dashboard/applicant/joblist");
    return { success: true };
  } catch (error) {
    console.error("Create job error:", error);
    return { error: "Terjadi kesalahan saat menyimpan lowongan" };
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
  // Ambil semua posisi yang sudah digunakan di job yang masih OPEN atau DRAFT
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

  // Ambil semua posisi
  const allPositions = await prisma.position.findMany({
    include: {
      divisi: true,
      level: true,
    },
    orderBy: { nama: "asc" },
  });

  // Filter posisi yang belum digunakan
  const availablePositions = allPositions.filter(
    (pos) => !usedPositionIds.includes(pos.id)
  );

  return availablePositions;
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
    // Validasi status
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