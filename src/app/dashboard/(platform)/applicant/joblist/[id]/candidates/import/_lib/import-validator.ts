import { prisma } from "@/lib/prisma";
import {
  type ImportRowError,
  type ImportValidationResult,
  type ParsedApplicantRow,
} from "./import-types";
import {
  cellString,
  normalizeCvFilename,
  normalizeEmail,
  normalizeExternalId,
  normalizeFreeText,
  normalizePhone,
  parseBoolean01,
  parseExcelDate,
  parseOptionalSalary,
  parseOptionalYear,
  parseSalary,
  parseYear,
} from "./import-normalizers";
import type { ZipEntry } from "./zip-parser";

const GENDER_CODES = new Set(["MALE", "FEMALE"]);
const RELIGION_CODES = new Set([
  "ISLAM",
  "KRISTEN",
  "KATOLIK",
  "HINDU",
  "BUDDHA",
  "KONGHUCU",
]);

type MasterMaps = {
  sources: Map<string, string>;
  sourceNames: Map<string, string>;
  educations: Map<string, string>;
};

export async function loadMasterMaps(): Promise<MasterMaps> {
  const [sources, educations] = await Promise.all([
    prisma.applicantSource.findMany({
      where: { isActive: true },
      select: { id: true, code: true, name: true },
    }),
    prisma.education.findMany({ select: { id: true, name: true } }),
  ]);

  return {
    sources: new Map(sources.map((s) => [s.code, s.id])),
    sourceNames: new Map(sources.map((s) => [s.code, s.name])),
    educations: new Map(educations.map((e) => [e.name, e.id])),
  };
}

export async function findDbDuplicates(
  jobId: string,
  emails: string[],
  phones: string[],
  externalKeys: { sourceId: string; externalId: string }[],
): Promise<{
  duplicateEmails: Set<string>;
  duplicatePhones: Set<string>;
  duplicateExternalKeys: Set<string>;
}> {
  const byEmail =
    emails.length > 0
      ? await prisma.application.findMany({
          where: { jobId, email: { in: emails } },
          select: { email: true },
        })
      : [];

  const byPhone =
    phones.length > 0
      ? await prisma.application.findMany({
          where: { jobId, phone: { in: phones } },
          select: { phone: true },
        })
      : [];

  const byExternal =
    externalKeys.length > 0
      ? await prisma.application.findMany({
          where: {
            jobId,
            OR: externalKeys.map((k) => ({
              sourceId: k.sourceId,
              externalApplicantId: k.externalId,
            })),
          },
          select: { sourceId: true, externalApplicantId: true },
        })
      : [];

  return {
    duplicateEmails: new Set(byEmail.map((a) => normalizeEmail(a.email))),
    duplicatePhones: new Set(byPhone.map((a) => normalizePhone(a.phone))),
    duplicateExternalKeys: new Set(
      byExternal.map(
        (a) => `${a.sourceId}|${normalizeExternalId(a.externalApplicantId ?? "")}`,
      ),
    ),
  };
}

export function validateApplicants(
  rows: Record<string, unknown>[],
  zipEntries: Map<string, ZipEntry>,
  masters: MasterMaps,
  dbDuplicates: {
    duplicateEmails: Set<string>;
    duplicatePhones: Set<string>;
    duplicateExternalKeys: Set<string>;
  },
): { applicants: ParsedApplicantRow[]; errors: ImportRowError[]; matchedCvCount: number } {
  const errors: ImportRowError[] = [];
  const applicants: ParsedApplicantRow[] = [];
  const seenEmails = new Set<string>();
  const seenPhones = new Set<string>();
  const seenExternalKeys = new Set<string>();
  const seenCvFilenames = new Set<string>();
  let matchedCvCount = 0;

  const currentYear = new Date().getFullYear();

  rows.forEach((raw, idx) => {
    const rowNumber = idx + 2;
    const rowErrors: ImportRowError[] = [];
    const pushErr = (field: string, message: string) =>
      rowErrors.push({ row: rowNumber, field, message });

    const applicant: ParsedApplicantRow = { rowNumber, hasErrors: false };

    // source_code
    const sourceCode = cellString(raw.source_code).toUpperCase();
    if (!sourceCode) {
      pushErr("source_code", "Source wajib diisi");
    } else if (!masters.sources.has(sourceCode)) {
      pushErr("source_code", `Source "${sourceCode}" tidak ditemukan di master`);
    } else {
      applicant.sourceCode = sourceCode;
      applicant.sourceId = masters.sources.get(sourceCode)!;
    }

    // external_applicant_id
    const extIdRaw = cellString(raw.external_applicant_id);
    applicant.externalApplicantId = extIdRaw ? normalizeExternalId(extIdRaw) : null;

    // cv_filename
    const cvFnRaw = cellString(raw.cv_filename);
    if (!cvFnRaw) {
      pushErr("cv_filename", "Nama file CV wajib diisi");
    } else if (!cvFnRaw.toLowerCase().endsWith(".pdf")) {
      pushErr("cv_filename", "File CV harus berakhiran .pdf");
    } else {
      const cvKey = normalizeCvFilename(cvFnRaw);
      applicant.cvFileName = cvFnRaw;
      if (seenCvFilenames.has(cvKey)) {
        pushErr("cv_filename", `Nama CV "${cvFnRaw}" digunakan lebih dari satu kali`);
      } else {
        seenCvFilenames.add(cvKey);
      }
      if (zipEntries.has(cvKey)) {
        matchedCvCount++;
      } else {
        pushErr("cv_filename", `File "${cvFnRaw}" tidak ditemukan dalam ZIP`);
      }
    }

    // full_name
    const fullName = cellString(raw.full_name);
    if (fullName.length < 3) {
      pushErr("full_name", "Nama lengkap minimal 3 karakter");
    } else {
      applicant.fullName = fullName;
    }

    // email
    const emailRaw = cellString(raw.email);
    const email = normalizeEmail(emailRaw);
    if (!email) {
      pushErr("email", "Email wajib diisi");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      pushErr("email", "Format email tidak valid");
    } else {
      applicant.email = emailRaw;
      applicant.normalizedEmail = email;
      if (seenEmails.has(email)) {
        pushErr("email", `Email "${email}" muncul lebih dari satu kali dalam file`);
      } else {
        seenEmails.add(email);
      }
      if (dbDuplicates.duplicateEmails.has(email)) {
        pushErr("email", `Email sudah terdaftar pada lowongan ini`);
      }
    }

    // phone
    const phoneRaw = cellString(raw.phone);
    if (!phoneRaw) {
      pushErr("phone", "Nomor telepon wajib diisi");
    } else {
      const phone = normalizePhone(phoneRaw);
      if (phone.length < 9 || phone.length > 15) {
        pushErr("phone", "Nomor telepon tidak valid (9-15 digit)");
      } else {
        applicant.phone = phoneRaw;
        applicant.normalizedPhone = phone;
        if (seenPhones.has(phone)) {
          pushErr("phone", `Nomor telepon muncul lebih dari satu kali dalam file`);
        } else {
          seenPhones.add(phone);
        }
        if (dbDuplicates.duplicatePhones.has(phone)) {
          pushErr("phone", `Nomor telepon sudah terdaftar pada lowongan ini`);
        }
      }
    }

    // external ID duplicate
    if (applicant.sourceId && applicant.externalApplicantId) {
      const extKey = `${applicant.sourceId}|${applicant.externalApplicantId}`;
      if (seenExternalKeys.has(extKey)) {
        pushErr("external_applicant_id", `External ID untuk source ini sudah dipakai baris lain`);
      } else {
        seenExternalKeys.add(extKey);
      }
      if (dbDuplicates.duplicateExternalKeys.has(extKey)) {
        pushErr("external_applicant_id", `External ID sudah terdaftar pada lowongan ini`);
      }
    }

    // birth_place
    const birthPlace = cellString(raw.birth_place);
    if (!birthPlace) {
      pushErr("birth_place", "Tempat lahir wajib diisi");
    } else {
      applicant.birthPlace = birthPlace;
    }

    // birth_date
    try {
      const bd = parseExcelDate(raw.birth_date);
      if (bd.getTime() > Date.now()) {
        pushErr("birth_date", "Tanggal lahir tidak boleh di masa depan");
      } else {
        applicant.birthDate = bd;
      }
    } catch (e) {
      pushErr("birth_date", (e as Error).message);
    }

    // religion_code
    const religion = cellString(raw.religion_code).toUpperCase();
    if (!religion) {
      pushErr("religion_code", "Agama wajib diisi");
    } else if (!RELIGION_CODES.has(religion)) {
      pushErr("religion_code", `Agama "${religion}" tidak valid`);
    } else {
      applicant.religion = religion;
    }

    // gender_code
    const gender = cellString(raw.gender_code).toUpperCase();
    if (!gender) {
      pushErr("gender_code", "Gender wajib diisi");
    } else if (!GENDER_CODES.has(gender)) {
      pushErr("gender_code", `Gender "${gender}" tidak valid (gunakan MALE/FEMALE)`);
    } else {
      applicant.gender = gender;
    }

    // ktp_address
    const ktpAddress = cellString(raw.ktp_address);
    if (ktpAddress.length < 10) {
      pushErr("ktp_address", "Alamat KTP minimal 10 karakter");
    } else {
      applicant.ktpAddress = ktpAddress;
    }

    // same_as_ktp + domicile_address
    let sameAsKtp = false;
    try {
      sameAsKtp = parseBoolean01(raw.same_as_ktp);
      applicant.sameAsKtp = sameAsKtp;
    } catch (e) {
      pushErr("same_as_ktp", (e as Error).message);
    }
    const domicileRaw = cellString(raw.domicile_address);
    if (sameAsKtp) {
      applicant.domicileAddress = domicileRaw || applicant.ktpAddress || "";
    } else {
      if (domicileRaw.length < 10) {
        pushErr("domicile_address", "Alamat domisili minimal 10 karakter (atau set same_as_ktp=1)");
      } else {
        applicant.domicileAddress = domicileRaw;
      }
    }

    // wilayah free text
    const province = normalizeFreeText(cellString(raw.province));
    const city = normalizeFreeText(cellString(raw.city));
    const district = normalizeFreeText(cellString(raw.district));
    const subdistrict = normalizeFreeText(cellString(raw.subdistrict));
    if (!province) pushErr("province", "Provinsi wajib diisi");
    if (!city) pushErr("city", "Kota wajib diisi");
    if (!district) pushErr("district", "Kecamatan wajib diisi");
    if (!subdistrict) pushErr("subdistrict", "Kelurahan wajib diisi");
    applicant.province = province;
    applicant.city = city;
    applicant.district = district;
    applicant.subdistrict = subdistrict;

    // education_name
    const eduName = cellString(raw.education_name);
    if (!eduName) {
      pushErr("education_name", "Pendidikan wajib diisi");
    } else if (!masters.educations.has(eduName)) {
      pushErr("education_name", `Pendidikan "${eduName}" tidak ditemukan di master`);
    } else {
      applicant.educationName = eduName;
      applicant.educationId = masters.educations.get(eduName)!;
    }

    // institution
    const institution = cellString(raw.institution);
    if (institution.length < 2) {
      pushErr("institution", "Institusi minimal 2 karakter");
    } else {
      applicant.institution = institution;
    }

    // education years
    try {
      const sy = parseYear(raw.education_start_year);
      if (sy < 1900 || sy > currentYear) {
        pushErr("education_start_year", `Tahun mulai harus antara 1900-${currentYear}`);
      } else {
        applicant.startYear = sy;
      }
    } catch (e) {
      pushErr("education_start_year", (e as Error).message);
    }
    const eyRaw = cellString(raw.education_end_year);
    if (!eyRaw) {
      pushErr("education_end_year", "Tahun selesai wajib diisi");
    } else {
      const ey = parseInt(eyRaw, 10);
      if (isNaN(ey) || ey < 1900 || ey > currentYear + 10) {
        pushErr("education_end_year", `Tahun selesai tidak valid`);
      } else if (applicant.startYear && ey < applicant.startYear) {
        pushErr("education_end_year", "Tahun selesai tidak boleh sebelum tahun mulai");
      } else {
        applicant.endYear = eyRaw;
      }
    }

    // pengalaman kerja
    applicant.lastJobTitle = cellString(raw.last_job_title) || null;
    applicant.lastCompany = cellString(raw.last_company) || null;
    try {
      applicant.jobStartYear = parseOptionalYear(raw.job_start_year);
    } catch (e) {
      pushErr("job_start_year", (e as Error).message);
    }

    let stillWorking = false;
    try {
      stillWorking = parseBoolean01(raw.still_working);
      applicant.stillWorking = stillWorking;
    } catch (e) {
      pushErr("still_working", (e as Error).message);
    }

    const jobEndRaw = cellString(raw.job_end_year);
    if (stillWorking) {
      if (jobEndRaw) {
        pushErr("job_end_year", "Kosongkan job_end_year jika still_working=1");
      }
      applicant.jobEndYear = "present";
    } else {
      if (applicant.lastJobTitle || applicant.lastCompany || applicant.jobStartYear) {
        if (!jobEndRaw) {
          pushErr("job_end_year", "Tahun selesai wajib diisi jika still_working=0 dan ada pengalaman");
        } else {
          const ey = parseInt(jobEndRaw, 10);
          if (isNaN(ey) || ey < 1900 || ey > currentYear) {
            pushErr("job_end_year", `Tahun selesai tidak valid`);
          } else if (applicant.jobStartYear && ey < applicant.jobStartYear) {
            pushErr("job_end_year", "Tahun selesai tidak boleh sebelum tahun mulai");
          } else {
            applicant.jobEndYear = jobEndRaw;
          }
        }
      } else {
        applicant.jobEndYear = jobEndRaw || null;
      }
    }

    // gaji
    try {
      applicant.currentSalary = parseOptionalSalary(raw.current_salary);
    } catch (e) {
      pushErr("current_salary", (e as Error).message);
    }
    try {
      const exp = parseSalary(raw.expected_salary);
      if (exp < 0) {
        pushErr("expected_salary", "Ekspektasi gaji tidak boleh negatif");
      } else {
        applicant.expectedSalary = exp;
      }
    } catch (e) {
      pushErr("expected_salary", (e as Error).message);
    }

    if (rowErrors.length > 0) {
      applicant.hasErrors = true;
      errors.push(...rowErrors);
    }
    applicants.push(applicant);
  });

  // PDF tambahan di ZIP yang tidak terpakai
  const usedCvKeys = new Set(
    applicants
      .filter((a) => a.cvFileName)
      .map((a) => normalizeCvFilename(a.cvFileName!)),
  );
  for (const [key, entry] of zipEntries) {
    if (!usedCvKeys.has(key)) {
      errors.push({
        row: 0,
        field: "_zip",
        message: `File PDF "${entry.filename}" ada di ZIP tetapi tidak tercantum di Excel`,
      });
    }
  }

  return { applicants, errors, matchedCvCount };
}

export function buildValidationResult(
  totalRows: number,
  applicants: ParsedApplicantRow[],
  errors: ImportRowError[],
  matchedCvCount: number,
): ImportValidationResult {
  const errorCount = errors.length;
  const validRows = applicants.filter((a) => !a.hasErrors).length;
  return {
    status: errorCount === 0 && validRows === totalRows && totalRows > 0 ? "VALID" : "INVALID",
    totalRows,
    validRows,
    errorCount,
    matchedCvCount,
    errors,
  };
}