"use server";

import { getSessionProfile } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";

export async function getDiscInvitations() {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "USER") return [];

  const invitations = await prisma.discInvitation.findMany({
    include: {
      application: {
        select: {
          id: true,
          fullName: true,
          email: true,
          job: {
            select: {
              id: true,
              position: {
                select: {
                  nama: true,
                  divisi: { select: { nama: true } },
                },
              },
            },
          },
        },
      },
      result: {
        select: {
          scoreD: true,
          scoreI: true,
          scoreS: true,
          scoreC: true,
          dominantType: true,
          profileLabel: true,
          completedAt: true,
        },
      },
      sentBy: {
        select: { nama: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return invitations;
}

export async function getDiscResultDetail(invitationId: string) {
  const profile = await getSessionProfile();
  if (!profile || profile.role === "USER") return null;

  const invitation = await prisma.discInvitation.findUnique({
    where: { id: invitationId },
    include: {
      application: {
        select: {
          id: true,
          fullName: true,
          email: true,
          phone: true,
          job: {
            select: {
              position: {
                select: {
                  nama: true,
                  divisi: { select: { nama: true } },
                  level: { select: { nama: true } },
                },
              },
            },
          },
        },
      },
      result: true,
      sentBy: {
        select: { nama: true },
      },
      answers: {
        include: {
          question: true,
        },
        orderBy: { question: { groupNo: "asc" } },
      },
    },
  });

  return invitation;
}
