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
    select: {
      id: true,
      city: true,
      province: true,
      createdAt: true,
      position: {
        select: {
          nama: true,
          divisi: { select: { id: true, nama: true } },
          level: { select: { id: true, nama: true } },
        },
      },
      employmentStatus: { select: { name: true } },
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

export async function getLevels() {
  return await prisma.level.findMany({
    orderBy: { nama: "asc" },
  });
}