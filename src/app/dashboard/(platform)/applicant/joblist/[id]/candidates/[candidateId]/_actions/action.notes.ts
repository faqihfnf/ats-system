"use server";

import { getSessionProfile, canAccessDivision } from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCandidateNotes(applicationId: string) {
  const profile = await getSessionProfile();
  if (!profile) return [];

  const notes = await prisma.candidateNote.findMany({
    where: { applicationId },
    include: {
      author: {
        select: {
          id: true,
          nama: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return notes;
}

export async function createCandidateNote(
  applicationId: string,
  content: string,
) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };

    if (!content || content.trim() === "" || content === "<p></p>") {
      return { error: "Note tidak boleh kosong" };
    }

    // Verify access to this candidate
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      select: {
        job: {
          select: {
            position: {
              select: { divisiId: true },
            },
          },
        },
      },
    });

    if (!application) {
      return { error: "Kandidat tidak ditemukan" };
    }

    if (!canAccessDivision(profile, application.job.position.divisiId)) {
      return { error: "Anda tidak memiliki akses ke kandidat ini" };
    }

    const note = await prisma.candidateNote.create({
      data: {
        applicationId,
        authorId: profile.id,
        content,
      },
    });

    revalidatePath(`/dashboard/applicant/joblist`);

    return { success: true, note };
  } catch (error) {
    console.error("Create note error:", error);
    return { error: "Gagal membuat note" };
  }
}

export async function deleteCandidateNote(noteId: string) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };

    const note = await prisma.candidateNote.findUnique({
      where: { id: noteId },
      select: {
        authorId: true,
        application: {
          select: {
            job: {
              select: {
                position: {
                  select: { divisiId: true },
                },
              },
            },
          },
        },
      },
    });

    if (!note) {
      return { error: "Note tidak ditemukan" };
    }

    // Only author or ADMIN can delete
    if (note.authorId !== profile.id && profile.role !== "ADMIN") {
      return { error: "Anda tidak memiliki akses untuk menghapus note ini" };
    }

    await prisma.candidateNote.delete({
      where: { id: noteId },
    });

    revalidatePath(`/dashboard/applicant/joblist`);

    return { success: true };
  } catch (error) {
    console.error("Delete note error:", error);
    return { error: "Gagal menghapus note" };
  }
}


export async function updateCandidateNote(noteId: string, content: string) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };

    if (!content || content.trim() === "" || content === "<p></p>") {
      return { error: "Note tidak boleh kosong" };
    }

    const note = await prisma.candidateNote.findUnique({
      where: { id: noteId },
      select: { authorId: true },
    });

    if (!note) {
      return { error: "Note tidak ditemukan" };
    }

    // Only author can edit
    if (note.authorId !== profile.id) {
      return { error: "Hanya penulis yang bisa mengedit note ini" };
    }

    await prisma.candidateNote.update({
      where: { id: noteId },
      data: { content },
    });

    revalidatePath(`/dashboard/applicant/joblist`);

    return { success: true };
  } catch (error) {
    console.error("Update note error:", error);
    return { error: "Gagal mengupdate note" };
  }
}
