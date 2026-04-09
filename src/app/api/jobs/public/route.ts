import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const jobs = await prisma.job.findMany({
      where: {
        status: "OPEN",
      },
      select: {
        id: true,
        createdAt: true,
        position: {
          select: {
            nama: true,
            divisi: {
              select: {
                nama: true,
              },
            },
            level: {
              select: {
                nama: true,
              },
            },
          },
        },
        branch: {
          select: {
            name: true,
          },
        },
        employmentStatus: {
          select: {
            name: true,
          },
        },
        city: true,
        minSalary: true,
        maxSalary: true,
        showSalary: true,
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform for WordPress
    const transformedJobs = jobs.map((job) => ({
      id: job.id,
      title: job.position.nama,
      division: job.position.divisi.nama,
      level: job.position.level.nama,
      branch: job.branch.name,
      employmentType: job.employmentStatus.name,
      city: job.city,
      salary: job.showSalary
        ? `Rp ${job.minSalary.toLocaleString("id-ID")} - Rp ${job.maxSalary.toLocaleString("id-ID")}`
        : null,
      totalApplicants: job._count.applications,
      postedAt: job.createdAt,
      detailUrl: `${process.env.NEXT_PUBLIC_APP_URL}/jobs/${job.id}`,
    }));

    const response = NextResponse.json({
      success: true,
      total: transformedJobs.length,
      jobs: transformedJobs,
    });

    // CORS headers for WordPress
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type");

    return response;
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch jobs",
      },
      { status: 500 },
    );
  }
}
