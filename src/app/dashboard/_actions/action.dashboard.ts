"use server";

import { getSessionProfile } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";

export async function getDashboardStats() {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return {
        totalJobs: 0,
        newCandidates: 0,
        totalCandidates: 0,
      };
    }

    const isUserRole = profile.role === "USER";
    if (isUserRole && !profile.divisiId) {
      return {
        totalJobs: 0,
        newCandidates: 0,
        totalCandidates: 0,
      };
    }

    // 1. Total Active Jobs
    const totalJobs = await prisma.job.count({
      where: {
        status: "OPEN",
        ...(isUserRole
          ? {
              position: {
                divisiId: profile.divisiId!,
              },
            }
          : {}),
      },
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
        ...(isUserRole
          ? {
              job: {
                position: {
                  divisiId: profile.divisiId!,
                },
              },
            }
          : {}),
      },
    });

    // 3. Total Candidates (all time) - UPDATED
    const totalCandidates = await prisma.application.count({
      where: isUserRole
        ? {
            job: {
              position: {
                divisiId: profile.divisiId!,
              },
            },
          }
        : undefined,
    });

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
    const profile = await getSessionProfile();
    if (!profile) return [];

    const isUserRole = profile.role === "USER";
    if (isUserRole && !profile.divisiId) return [];

    const stages = await prisma.stage.findMany({
      orderBy: { order: "asc" },
      include: {
        applications: {
          where: isUserRole
            ? {
                job: {
                  position: {
                    divisiId: profile.divisiId!,
                  },
                },
              }
            : undefined,
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
    const profile = await getSessionProfile();
    if (!profile) return [];

    const isUserRole = profile.role === "USER";
    if (isUserRole && !profile.divisiId) return [];

    const applications = await prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: isUserRole
        ? {
            job: {
              position: {
                divisiId: profile.divisiId!,
              },
            },
          }
        : undefined,
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
