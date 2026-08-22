"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSessionProfile, canAccessDivision } from "@/lib/auth/session-profile";
import { generateImportTemplate } from "../_lib/excel-template";
import { parseApplicantExcel } from "../_lib/excel-parser";
import { parseApplicantZip } from "../_lib/zip-parser";
import {
  loadMasterMaps,
  findDbDuplicates,
  validateApplicants,
  buildValidationResult,
} from "../_lib/import-validator";
import { normalizeCvFilename, normalizeEmail, normalizeExternalId, normalizePhone } from "../_lib/import-normalizers";
import { type ImportValidationResult } from "../_lib/import-types";
import { uploadImportPdf, cleanupUploadedPdfs, type UploadedPdf } from "../_lib/import-storage";

// ===== 1. Download Template =====
export async function downloadImportTemplate(jobId: string) {
  const profile = await getSessionProfile();
  if (!profile) throw new Error("Tidak terautentikasi");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, position: { select: { divisiId: true, nama: true } } },
  });
  if (!job) throw new Error("Job tidak ditemukan");
  if (!canAccessDivision(profile, job.position.divisiId)) {
    throw new Error("Anda tidak memiliki akses ke job ini");
  }

  try {
    const buf = await generateImportTemplate(jobId);
    return {
      buffer: Array.from(buf),
      filename: `import-template-${job.position.nama.replace(/\s+/g, "-").toLowerCase()}.xlsx`,
    };
  } catch (e) {
    return { error: (e as Error).message };
  }
}

// ===== 2. Validate Import =====
export async function validateImport(
  jobId: string,
  excelFile: File,
  zipFile: File,
): Promise<ImportValidationResult> {
  const profile = await getSessionProfile();
  if (!profile) return { status: "INVALID", totalRows: 0, validRows: 0, errorCount: 1, matchedCvCount: 0, errors: [{ row: 0, field: "_auth", message: "Tidak terautentikasi" }] };

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, position: { select: { divisiId: true } } },
  });
  if (!job) return { status: "INVALID", totalRows: 0, validRows: 0, errorCount: 1, matchedCvCount: 0, errors: [{ row: 0, field: "_job", message: "Job tidak ditemukan" }] };
  if (!canAccessDivision(profile, job.position.divisiId)) {
    return { status: "INVALID", totalRows: 0, validRows: 0, errorCount: 1, matchedCvCount: 0, errors: [{ row: 0, field: "_auth", message: "Anda tidak memiliki akses ke job ini" }] };
  }

  // Parse Excel
  const excelResult = await parseApplicantExcel(excelFile);
  if (excelResult.errors.length > 0) {
    return buildValidationResult(0, [], excelResult.errors, 0);
  }

  // Verifikasi metadata job_id cocok
  if (excelResult.metadataJobId && excelResult.metadataJobId !== jobId) {
    return {
      status: "INVALID",
      totalRows: 0,
      validRows: 0,
      errorCount: 1,
      matchedCvCount: 0,
      errors: [{ row: 0, field: "_metadata", message: "Template ini dibuat untuk lowongan yang berbeda" }],
    };
  }

  // Parse ZIP
  const zipResult = await parseApplicantZip(zipFile);
  if (zipResult.errors.length > 0) {
    return buildValidationResult(0, [], zipResult.errors, 0);
  }

  // Load master
  const masters = await loadMasterMaps();

  // Kumpulkan identifier untuk cek duplicate DB
  const emails: string[] = [];
  const phones: string[] = [];
  const externalKeys: { sourceId: string; externalId: string }[] = [];
  for (const raw of excelResult.rows) {
    const email = normalizeEmail(String(raw.email ?? ""));
    if (email) emails.push(email);
    const phone = normalizePhone(String(raw.phone ?? ""));
    if (phone) phones.push(phone);
    const srcCode = String(raw.source_code ?? "").toUpperCase().trim();
    const srcId = masters.sources.get(srcCode);
    const extId = normalizeExternalId(String(raw.external_applicant_id ?? ""));
    if (srcId && extId) externalKeys.push({ sourceId: srcId, externalId: extId });
  }

  const dbDuplicates = await findDbDuplicates(jobId, emails, phones, externalKeys);

  // Validasi semua row
  const { applicants, errors, matchedCvCount } = validateApplicants(
    excelResult.rows,
    zipResult.entries,
    masters,
    dbDuplicates,
  );

  return buildValidationResult(excelResult.rows.length, applicants, errors, matchedCvCount);
}

// ===== 3. Import Applicant (final) =====
export async function importApplicants(
  jobId: string,
  excelFile: File,
  zipFile: File,
): Promise<{ success: boolean; totalApplicants?: number; error?: string }> {
  const profile = await getSessionProfile();
  if (!profile) return { success: false, error: "Tidak terautentikasi" };

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, position: { select: { divisiId: true } } },
  });
  if (!job) return { success: false, error: "Job tidak ditemukan" };
  if (!canAccessDivision(profile, job.position.divisiId)) {
    return { success: false, error: "Anda tidak memiliki akses ke job ini" };
  }

  // ===== Validasi ulang (server-side) =====
  const excelResult = await parseApplicantExcel(excelFile);
  if (excelResult.errors.length > 0) {
    return { success: false, error: "Validasi gagal: Excel tidak valid" };
  }
  if (excelResult.metadataJobId && excelResult.metadataJobId !== jobId) {
    return { success: false, error: "Template untuk lowongan berbeda" };
  }

  const zipResult = await parseApplicantZip(zipFile);
  if (zipResult.errors.length > 0) {
    return { success: false, error: "Validasi gagal: ZIP tidak valid" };
  }

  const masters = await loadMasterMaps();
  const emails = excelResult.rows.map((r) => normalizeEmail(String(r.email ?? ""))).filter(Boolean);
  const phones = excelResult.rows.map((r) => normalizePhone(String(r.phone ?? ""))).filter(Boolean);
  const externalKeys = excelResult.rows
    .map((r) => {
      const srcId = masters.sources.get(String(r.source_code ?? "").toUpperCase().trim());
      const extId = normalizeExternalId(String(r.external_applicant_id ?? ""));
      return srcId && extId ? { sourceId: srcId, externalId: extId } : null;
    })
    .filter((x): x is { sourceId: string; externalId: string } => x !== null);

  const dbDuplicates = await findDbDuplicates(jobId, emails, phones, externalKeys);
  const { applicants, errors } = validateApplicants(excelResult.rows, zipResult.entries, masters, dbDuplicates);

  if (errors.length > 0 || applicants.some((a) => a.hasErrors)) {
    return { success: false, error: "Validasi gagal. Perbaiki file dan coba lagi." };
  }

  // ===== Ambil stage pertama =====
  const firstStage = await prisma.stage.findFirst({ orderBy: { order: "asc" } });
  if (!firstStage) return { success: false, error: "Tidak ada stage di sistem" };

  // ===== Generate importId untuk folder storage =====
  const importId = `imp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // ===== Upload semua PDF =====
  const uploadedPdfs: UploadedPdf[] = [];
  try {
    for (const applicant of applicants) {
      const cvKey = normalizeCvFilename(applicant.cvFileName!);
      const zipEntry = zipResult.entries.get(cvKey)!;
      // Generate application ID sementara untuk nama file
      const tempAppId = `app-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const uploaded = await uploadImportPdf(importId, tempAppId, zipEntry.data, applicant.cvFileName!);
      uploadedPdfs.push({ ...uploaded, _tempAppId: tempAppId } as UploadedPdf & { _tempAppId: string });
    }
  } catch (e) {
    // Rollback: hapus semua PDF yang sudah ter-upload
    await cleanupUploadedPdfs(uploadedPdfs.map((p) => p.path));
    return { success: false, error: (e as Error).message };
  }

  // ===== Database transaction =====
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Buat ApplicantImport record
      const importRecord = await tx.applicantImport.create({
        data: {
          jobId,
          importedById: profile.id,
          excelFileName: excelFile.name,
          zipFileName: zipFile.name,
          totalApplicants: applicants.length,
        },
      });

      // 2. Buat semua Application + StageHistory
      for (let i = 0; i < applicants.length; i++) {
        const a = applicants[i];
        const pdf = uploadedPdfs[i];

        await tx.application.create({
          data: {
            jobId,
            fullName: a.fullName!,
            email: a.email!,
            phone: a.phone!,
            birthPlace: a.birthPlace!,
            birthDate: a.birthDate!,
            religion: a.religion as never,
            gender: a.gender as never,
            ktpAddress: a.ktpAddress!,
            domicileAddress: a.domicileAddress!,
            sameAsKtp: a.sameAsKtp ?? false,
            province: a.province!,
            city: a.city!,
            district: a.district!,
            subdistrict: a.subdistrict!,
            educationId: a.educationId!,
            institution: a.institution!,
            startYear: a.startYear!,
            endYear: a.endYear!,
            lastJobTitle: a.lastJobTitle,
            lastCompany: a.lastCompany,
            jobStartYear: a.jobStartYear,
            jobEndYear: a.jobEndYear,
            stillWorking: a.stillWorking ?? false,
            currentSalary: a.currentSalary,
            expectedSalary: a.expectedSalary!,
            cvUrl: pdf.publicUrl,
            originalCvFileName: a.cvFileName,
            sourceId: a.sourceId!,
            externalApplicantId: a.externalApplicantId,
            importId: importRecord.id,
            currentStageId: firstStage.id,
            status: "ACTIVE",
            stageHistories: {
              create: {
                fromStageId: null,
                toStageId: firstStage.id,
                changedById: profile.id,
                note: `Imported applicant via bulk import`,
              },
            },
          },
        });

        // Rename PDF di storage agar pakai application.id sebenarnya
        // (opsional — untuk MVP biarkan path tempAppId, sudah unik)
      }
    });
  } catch (e) {
    // Rollback database + hapus PDF
    await cleanupUploadedPdfs(uploadedPdfs.map((p) => p.path));
    console.error("Import transaction error:", e);
    return { success: false, error: `Gagal menyimpan data: ${(e as Error).message}` };
  }

  revalidatePath(`/dashboard/applicant/joblist/${jobId}/candidates`);
  return { success: true, totalApplicants: applicants.length };
}