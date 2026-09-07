"use server";

import { getSessionProfile } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";

export type DashboardPeriod = {
  from?: string;
  to?: string;
};

function periodWhere(period: DashboardPeriod) {
  if (!period.from && !period.to) return {};
  const where: { gte?: Date; lte?: Date } = {};
  if (period.from) where.gte = new Date(`${period.from}T00:00:00.000`);
  if (period.to) where.lte = new Date(`${period.to}T23:59:59.999`);
  return { createdAt: where };
}

export async function getDashboardStats(period: DashboardPeriod = {}) {
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
    if (isUserRole && profile.divisiIds.length === 0) {
      return {
        totalJobs: 0,
        newCandidates: 0,
        totalCandidates: 0,
      };
    }

    const userFilter = isUserRole
      ? { position: { divisiId: { in: profile.divisiIds } } }
      : {};

    // 1. Total Active Jobs
    const totalJobs = await prisma.job.count({
      where: {
        status: "OPEN",
        ...(isUserRole ? userFilter : {}),
      },
    });

    // 2. New Candidates (this month)
    const newCandidates = await prisma.application.count({
      where: {
        ...periodWhere(period),
        ...(isUserRole
          ? { job: { position: { divisiId: { in: profile.divisiIds } } } }
          : {}),
      },
    });

    // 3. Total Candidates (all time)
    const totalCandidates = await prisma.application.count({
      where: {
        ...periodWhere(period),
        ...(isUserRole
          ? {
            job: {
              position: {
                divisiId: { in: profile.divisiIds },
              },
            },
          }
          : {}),
      },
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

export async function getCandidatesByStage(period: DashboardPeriod = {}) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return [];

    const isUserRole = profile.role === "USER";
    if (isUserRole && profile.divisiIds.length === 0) return [];

    const stages = await prisma.stage.findMany({
      orderBy: { order: "asc" },
      include: {
        applications: {
          where: isUserRole
            ? {
                ...periodWhere(period),
                job: {
                  position: {
                    divisiId: { in: profile.divisiIds },
                  },
                },
              }
            : periodWhere(period),
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

export async function getLatestApplications(period: DashboardPeriod = {}) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return [];

    const isUserRole = profile.role === "USER";
    if (isUserRole && profile.divisiIds.length === 0) return [];

    const applications = await prisma.application.findMany({
      take: 10,
      orderBy: { createdAt: "desc" },
      where: {
        ...periodWhere(period),
        ...(isUserRole
          ? {
            job: {
              position: {
                divisiId: { in: profile.divisiIds },
              },
            },
          }
          : {}),
      },
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

export async function getApplicantTrend(period: DashboardPeriod = {}) {
  const profile = await getSessionProfile();
  if (!profile || (profile.role === "USER" && profile.divisiIds.length === 0)) return [];
  const rows = await prisma.application.findMany({
    where: {
      ...periodWhere(period),
      ...(profile.role === "USER"
        ? { job: { position: { divisiId: { in: profile.divisiIds } } } }
        : {}),
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  const grouped = new Map<string, number>();
  rows.forEach(({ createdAt }) => {
    const key = createdAt.toISOString().slice(0, 10);
    grouped.set(key, (grouped.get(key) ?? 0) + 1);
  });
  return [...grouped].map(([date, count]) => ({ date, count }));
}

export async function getApplicantsBySource(period: DashboardPeriod = {}) {
  const profile = await getSessionProfile();
  if (!profile || (profile.role === "USER" && profile.divisiIds.length === 0)) return [];
  const rows = await prisma.application.findMany({
    where: {
      ...periodWhere(period),
      ...(profile.role === "USER"
        ? { job: { position: { divisiId: { in: profile.divisiIds } } } }
        : {}),
    },
    select: { source: { select: { name: true } } },
  });
  const grouped = new Map<string, number>();
  rows.forEach(({ source }) => grouped.set(source.name, (grouped.get(source.name) ?? 0) + 1));
  return [...grouped]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
