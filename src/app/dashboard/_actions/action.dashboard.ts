"use server";

import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    // 1. Total Active Jobs
    const totalJobs = await prisma.job.count({
      where: { status: "OPEN" },
    });

    // 2. New Candidates (this month)
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCandidates = await prisma.application.count({
      where: {
        createdAt: {
          gte: startOfMonth,
        },
      },
    });

    // 3. Total Candidates (all time) - UPDATED
    const totalCandidates = await prisma.application.count();

    return {
      totalJobs,
      newCandidates,
      totalCandidates,
    };
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    return {
      totalJobs: 0,
      newCandidates: 0,
      totalCandidates: 0,
    };
  }
}

export async function getCandidatesByStage() {
  try {
    const stages = await prisma.stage.findMany({
      orderBy: { order: "asc" },
      include: {
        applications: {
          select: { id: true },
        },
      },
    });

    return stages.map((stage) => ({
      name: stage.name,
      count: stage.applications.length,
      order: stage.order,
    }));
  } catch (error) {
    console.error("Get candidates by stage error:", error);
    return [];
  }
}

export async function getLatestApplications() {
  try {
    const applications = await prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      include: {
        job: {
          include: {
            position: true,
          },
        },
        currentStage: true,
      },
    });

    return applications;
  } catch (error) {
    console.error("Get latest applications error:", error);
    return [];
  }
}
