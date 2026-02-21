"use server";

import { prisma } from "@/lib/prisma";

export async function getPublicJobs(divisiId?: string) {
  const jobs = await prisma.job.findMany({
    where: {
      status: "OPEN",
      ...(divisiId && {
        position: {
          divisiId: divisiId,
        },
      }),
    },
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
    },
    orderBy: { createdAt: "desc" },
  });

  return jobs;
}

export async function getPublicJobDetail(id: string) {
  const job = await prisma.job.findFirst({
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
      minEducation: true,
      minExperience: true,
    },
  });

  return job;
}

export async function getDivisions() {
  return await prisma.divisi.findMany({
    orderBy: { nama: "asc" },
  });
}