import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json({ error: "Token wajib" }, { status: 400 });
    }

    const invitation = await prisma.discInvitation.findUnique({
      where: { token },
    });

    if (!invitation || invitation.status !== "IN_PROGRESS") {
      return NextResponse.json({ error: "Session tidak valid" }, { status: 400 });
    }

    // Increment tab switch count
    await prisma.discInvitation.update({
      where: { id: invitation.id },
      data: {
        tabSwitchCount: { increment: 1 },
      },
    });

    return NextResponse.json({
      success: true,
      tabSwitchCount: invitation.tabSwitchCount + 1,
    });
  } catch (error) {
    console.error("Log tab switch error:", error);
    return NextResponse.json(
      { error: "Gagal mencatat" },
      { status: 500 },
    );
  }
}
