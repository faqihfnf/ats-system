import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionProfile } from "@/lib/auth/session-profile";

export async function GET(request: NextRequest) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    if (profile.role === "USER") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");

    const where = applicationId ? { applicationId } : {};

    const invitations = await prisma.discInvitation.findMany({
      where,
      include: {
        application: {
          select: {
            fullName: true,
            email: true,
            job: {
              select: {
                position: {
                  select: { nama: true },
                },
              },
            },
          },
        },
        result: {
          select: {
            dominantType: true,
            profileLabel: true,
          },
        },
        sentBy: {
          select: { nama: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      invitations: invitations.map((inv) => ({
        id: inv.id,
        token: inv.token,
        status: inv.status,
        sentBy: inv.sentBy.nama,
        createdAt: inv.createdAt,
        openedAt: inv.openedAt,
        completedAt: inv.completedAt,
        expiresAt: inv.expiresAt,
        tabSwitchCount: inv.tabSwitchCount,
        candidate: {
          name: inv.application.fullName,
          email: inv.application.email,
          position: inv.application.job.position.nama,
        },
        result: inv.result
          ? {
              dominantType: inv.result.dominantType,
              profileLabel: inv.result.profileLabel,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("DISC invitations error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data undangan" },
      { status: 500 },
    );
  }
}
