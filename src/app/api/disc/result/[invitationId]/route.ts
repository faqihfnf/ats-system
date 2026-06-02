import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionProfile } from "@/lib/auth/session-profile";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invitationId: string }> },
) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    if (profile.role === "USER") {
      return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
    }

    const { invitationId } = await params;

    const invitation = await prisma.discInvitation.findUnique({
      where: { id: invitationId },
      include: {
        application: {
          select: {
            id: true,
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
        result: true,
        sentBy: {
          select: { nama: true },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Undangan tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        status: invitation.status,
        sentBy: invitation.sentBy.nama,
        createdAt: invitation.createdAt,
        openedAt: invitation.openedAt,
        completedAt: invitation.completedAt,
        tabSwitchCount: invitation.tabSwitchCount,
        candidate: {
          name: invitation.application.fullName,
          email: invitation.application.email,
          position: invitation.application.job.position.nama,
        },
        result: invitation.result
          ? {
              scoreD: invitation.result.scoreD,
              scoreI: invitation.result.scoreI,
              scoreS: invitation.result.scoreS,
              scoreC: invitation.result.scoreC,
              dominantType: invitation.result.dominantType,
              profileLabel: invitation.result.profileLabel,
              completedAt: invitation.result.completedAt,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("DISC result error:", error);
    return NextResponse.json(
      { error: "Gagal mengambil hasil" },
      { status: 500 },
    );
  }
}
