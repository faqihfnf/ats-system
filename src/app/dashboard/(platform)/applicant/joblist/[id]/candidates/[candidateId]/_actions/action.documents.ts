"use server";

import {
  getSessionProfile,
  canAccessDivision,
} from "@/lib/auth/session-profile";
import { prisma } from "@/lib/prisma";
import { isPdfSignature } from "@/lib/helpers/file-helper";
import { revalidatePath } from "next/cache";
import {
  removeCandidateDocuments,
  uploadCandidateDocument,
} from "../_lib/document-storage";
import {
  MAX_DOC_SIZE_MB,
  MAX_DOCS_PER_CANDIDATE,
} from "../_lib/document-constants";

export async function getCandidateDocuments(applicationId: string) {
  const profile = await getSessionProfile();
  if (!profile) return [];

  const documents = await prisma.applicationDocument.findMany({
    where: { applicationId },
    include: {
      uploadedBy: {
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

  return documents;
}

export async function uploadCandidateDocuments(formData: FormData) {
  const uploadedPaths: string[] = [];

  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };

    if (profile.role === "USER") {
      return { error: "Role User tidak memiliki akses upload dokumen" };
    }

    const applicationId = formData.get("applicationId");
    if (typeof applicationId !== "string" || !applicationId) {
      return { error: "Kandidat tidak valid" };
    }

    const rawLabel = formData.get("label");
    const label =
      typeof rawLabel === "string" && rawLabel.trim() !== ""
        ? rawLabel.trim().slice(0, 100)
        : null;

    const files = formData.getAll("files").filter((f): f is File => f instanceof File);
    if (files.length === 0) {
      return { error: "Tidak ada file yang dipilih" };
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

    // Cek kuota dokumen per kandidat
    const existingCount = await prisma.applicationDocument.count({
      where: { applicationId },
    });

    if (existingCount + files.length > MAX_DOCS_PER_CANDIDATE) {
      return {
        error: `Maksimal ${MAX_DOCS_PER_CANDIDATE} dokumen per kandidat (saat ini ${existingCount})`,
      };
    }

    // Validasi seluruh file dulu sebelum upload apa pun
    const validated: { file: File; data: Uint8Array }[] = [];

    for (const file of files) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        return { error: `File "${file.name}" bukan PDF` };
      }

      if (file.size === 0) {
        return { error: `File "${file.name}" kosong` };
      }

      if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
        return {
          error: `Ukuran file "${file.name}" melebihi ${MAX_DOC_SIZE_MB}MB`,
        };
      }

      const data = new Uint8Array(await file.arrayBuffer());

      if (!isPdfSignature(data)) {
        return {
          error: `File "${file.name}" bukan PDF valid (signature tidak cocok)`,
        };
      }

      validated.push({ file, data });
    }

    // Upload ke storage
    const rows: {
      id: string;
      applicationId: string;
      uploadedById: string;
      label: string | null;
      originalFileName: string;
      storagePath: string;
      url: string;
      fileSize: number;
    }[] = [];

    for (const { file, data } of validated) {
      const documentId = crypto.randomUUID();
      const { path, publicUrl } = await uploadCandidateDocument(
        applicationId,
        documentId,
        data,
        file.name,
      );
      uploadedPaths.push(path);

      rows.push({
        id: documentId,
        applicationId,
        uploadedById: profile.id,
        label,
        originalFileName: file.name,
        storagePath: path,
        url: publicUrl,
        fileSize: file.size,
      });
    }

    await prisma.applicationDocument.createMany({ data: rows });

    revalidatePath(`/dashboard/applicant/joblist`);

    return { success: true, count: rows.length };
  } catch (error) {
    console.error("Upload document error:", error);
    // Rollback file yang terlanjur naik ke storage
    await removeCandidateDocuments(uploadedPaths);
    return { error: "Gagal mengupload dokumen" };
  }
}

export async function deleteCandidateDocument(documentId: string) {
  try {
    const profile = await getSessionProfile();
    if (!profile) return { error: "Tidak terautentikasi" };

    if (profile.role === "USER") {
      return { error: "Role User tidak memiliki akses hapus dokumen" };
    }

    const document = await prisma.applicationDocument.findUnique({
      where: { id: documentId },
      select: {
        uploadedById: true,
        storagePath: true,
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

    if (!document) {
      return { error: "Dokumen tidak ditemukan" };
    }

    if (!canAccessDivision(profile, document.application.job.position.divisiId)) {
      return { error: "Anda tidak memiliki akses ke kandidat ini" };
    }

    // Only uploader or ADMIN can delete
    if (document.uploadedById !== profile.id && profile.role !== "ADMIN") {
      return { error: "Anda tidak memiliki akses untuk menghapus dokumen ini" };
    }

    await prisma.applicationDocument.delete({
      where: { id: documentId },
    });

    await removeCandidateDocuments([document.storagePath]);

    revalidatePath(`/dashboard/applicant/joblist`);

    return { success: true };
  } catch (error) {
    console.error("Delete document error:", error);
    return { error: "Gagal menghapus dokumen" };
  }
}
