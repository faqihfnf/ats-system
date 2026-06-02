import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionProfile } from "@/lib/auth/session-profile";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    const profile = await getSessionProfile();
    if (!profile) {
      return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
    }

    if (profile.role === "USER") {
      return NextResponse.json(
        { error: "Tidak memiliki akses" },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { applicationId } = body;

    if (!applicationId) {
      return NextResponse.json(
        { error: "applicationId wajib diisi" },
        { status: 400 },
      );
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        id: true,
        jobId: true,
        fullName: true,
        email: true,
      },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Kandidat tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if there's already an active invitation (PENDING or IN_PROGRESS)
    const existingInvitation = await prisma.discInvitation.findFirst({
      where: {
        applicationId,
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
    });

    if (existingInvitation) {
      return NextResponse.json(
        { error: "Kandidat sudah memiliki undangan DISC yang aktif" },
        { status: 409 },
      );
    }

    // Generate token and create invitation
    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // +24 jam

    const invitation = await prisma.discInvitation.create({
      data: {
        token,
        applicationId,
        sentById: profile.id,
        status: "PENDING",
        expiresAt,
      },
    });

    return NextResponse.json({
      success: true,
      invitation: {
        id: invitation.id,
        token: invitation.token,
        expiresAt: invitation.expiresAt,
        testUrl: `${process.env.NEXT_PUBLIC_APP_URL}/disc/${token}`,
      },
    });
  } catch (error) {
    console.error("DISC invite error:", error);
    return NextResponse.json(
      { error: "Gagal mengirim undangan DISC" },
      { status: 500 },
    );
  }
}
