"use server";

import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

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
  return await prisma.job.findMany({
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
}