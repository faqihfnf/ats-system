import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params;

    const invitation = await prisma.discInvitation.findUnique({
      where: { token },
      include: {
        application: {
          select: {
            fullName: true,
            email: true,
          },
        },
      },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Token tidak valid", code: "INVALID_TOKEN" },
        { status: 404 },
      );
    }

    // Check if already completed
    if (invitation.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Tes sudah diselesaikan", code: "ALREADY_COMPLETED" },
        { status: 410 },
      );
    }

    // Check if expired (24h since created)
    if (invitation.status === "EXPIRED" || new Date() > invitation.expiresAt) {
      // Update status if not already expired
      if (invitation.status !== "EXPIRED") {
        await prisma.discInvitation.update({
          where: { id: invitation.id },
          data: { status: "EXPIRED" },
        });
      }
      return NextResponse.json(
        { error: "Undangan sudah kadaluarsa", code: "EXPIRED" },
        { status: 410 },
      );
    }

    // Check session deadline (90 min since opened)
    if (invitation.sessionDeadline && new Date() > invitation.sessionDeadline) {
      await prisma.discInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Waktu pengerjaan sudah habis", code: "SESSION_EXPIRED" },
        { status: 410 },
      );
    }

    // If first time opening, set openedAt and sessionDeadline
    if (!invitation.openedAt) {
      const now = new Date();
      const sessionDeadline = new Date(now.getTime() + 90 * 60 * 1000); // +90 menit

      await prisma.discInvitation.update({
        where: { id: invitation.id },
        data: {
          status: "IN_PROGRESS",
          openedAt: now,
          sessionDeadline,
          ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || null,
          userAgent: request.headers.get("user-agent") || null,
        },
      });

      // Fetch questions
      const questions = await prisma.discQuestion.findMany({
        where: { isActive: true },
        orderBy: { groupNo: "asc" },
      });

      return NextResponse.json({
        success: true,
        candidateName: invitation.application.fullName,
        sessionDeadline: sessionDeadline.toISOString(),
        totalQuestions: questions.length,
        questions: questions.map((q) => ({
          id: q.id,
          groupNo: q.groupNo,
          words: [
            { dimension: "D", word: q.wordD },
            { dimension: "I", word: q.wordI },
            { dimension: "S", word: q.wordS },
            { dimension: "C", word: q.wordC },
          ],
        })),
      });
    }

    // Already opened — return session info + questions
    const questions = await prisma.discQuestion.findMany({
      where: { isActive: true },
      orderBy: { groupNo: "asc" },
    });

    // Get already answered questions
    const existingAnswers = await prisma.discAnswer.findMany({
      where: { invitationId: invitation.id },
      select: { questionId: true, answerMost: true, answerLeast: true },
    });

    return NextResponse.json({
      success: true,
      candidateName: invitation.application.fullName,
      sessionDeadline: invitation.sessionDeadline!.toISOString(),
      totalQuestions: questions.length,
      questions: questions.map((q) => ({
        id: q.id,
        groupNo: q.groupNo,
        words: [
          { dimension: "D", word: q.wordD },
          { dimension: "I", word: q.wordI },
          { dimension: "S", word: q.wordS },
          { dimension: "C", word: q.wordC },
        ],
      })),
      existingAnswers: existingAnswers.map((a) => ({
        questionId: a.questionId,
        answerMost: a.answerMost,
        answerLeast: a.answerLeast,
      })),
    });
  } catch (error) {
    console.error("DISC session error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 },
    );
  }
}
