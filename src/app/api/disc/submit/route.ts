import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDiscScore, validateDiscAnswers } from "@/lib/disc/scoring";
import type { DiscDimension } from "@/lib/disc/scoring";

type AnswerPayload = {
  questionId: string;
  answerMost: DiscDimension;
  answerLeast: DiscDimension;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, answers } = body as {
      token: string;
      answers: AnswerPayload[];
    };

    if (!token || !answers) {
      return NextResponse.json(
        { error: "Token dan answers wajib diisi" },
        { status: 400 },
      );
    }

    // Validate token
    const invitation = await prisma.discInvitation.findUnique({
      where: { token },
    });

    if (!invitation) {
      return NextResponse.json(
        { error: "Token tidak valid" },
        { status: 404 },
      );
    }

    if (invitation.status === "COMPLETED") {
      return NextResponse.json(
        { error: "Tes sudah diselesaikan" },
        { status: 410 },
      );
    }

    if (invitation.status === "EXPIRED") {
      return NextResponse.json(
        { error: "Undangan sudah kadaluarsa" },
        { status: 410 },
      );
    }

    // Check session deadline
    if (invitation.sessionDeadline && new Date() > invitation.sessionDeadline) {
      await prisma.discInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
      return NextResponse.json(
        { error: "Waktu pengerjaan sudah habis" },
        { status: 410 },
      );
    }

    // Validate answers
    const validation = validateDiscAnswers(
      answers.map((a) => ({
        answerMost: a.answerMost,
        answerLeast: a.answerLeast,
      })),
    );

    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 },
      );
    }

    // Save answers (upsert to handle partial saves)
    for (const answer of answers) {
      await prisma.discAnswer.upsert({
        where: {
          invitationId_questionId: {
            invitationId: invitation.id,
            questionId: answer.questionId,
          },
        },
        update: {
          answerMost: answer.answerMost,
          answerLeast: answer.answerLeast,
          answeredAt: new Date(),
        },
        create: {
          invitationId: invitation.id,
          questionId: answer.questionId,
          answerMost: answer.answerMost,
          answerLeast: answer.answerLeast,
        },
      });
    }

    // Calculate score
    const scoreResult = calculateDiscScore(
      answers.map((a) => ({
        answerMost: a.answerMost,
        answerLeast: a.answerLeast,
      })),
    );

    // Save result
    const now = new Date();

    await prisma.discResult.upsert({
      where: { invitationId: invitation.id },
      update: {
        scoreD: scoreResult.scoreD,
        scoreI: scoreResult.scoreI,
        scoreS: scoreResult.scoreS,
        scoreC: scoreResult.scoreC,
        dominantType: scoreResult.dominantType,
        profileLabel: scoreResult.profileLabel,
        completedAt: now,
      },
      create: {
        invitationId: invitation.id,
        applicationId: invitation.applicationId,
        scoreD: scoreResult.scoreD,
        scoreI: scoreResult.scoreI,
        scoreS: scoreResult.scoreS,
        scoreC: scoreResult.scoreC,
        dominantType: scoreResult.dominantType,
        profileLabel: scoreResult.profileLabel,
        completedAt: now,
      },
    });

    // Update invitation status
    await prisma.discInvitation.update({
      where: { id: invitation.id },
      data: {
        status: "COMPLETED",
        completedAt: now,
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        dominantType: scoreResult.dominantType,
        profileLabel: scoreResult.profileLabel,
      },
    });
  } catch (error) {
    console.error("DISC submit error:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan jawaban" },
      { status: 500 },
    );
  }
}
