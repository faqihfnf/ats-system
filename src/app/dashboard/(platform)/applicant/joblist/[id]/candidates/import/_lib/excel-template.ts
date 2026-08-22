import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import {
  APPLICANT_COLUMNS,
  IMPORT_TEMPLATE_VERSION,
} from "./import-types";

export async function generateImportTemplate(jobId: string): Promise<Buffer> {
  // Ambil master data
  const [sources, educations, job] = await Promise.all([
    prisma.applicantSource.findMany({
      where: { isActive: true },
      select: { code: true, name: true, category: true },
      orderBy: { name: "asc" },
    }),
    prisma.education.findMany({
      select: { name: true, category: true },
      orderBy: { name: "asc" },
    }),
    prisma.job.findUnique({
      where: { id: jobId },
      select: { id: true, position: { select: { nama: true } } },
    }),
  ]);

  if (!job) throw new Error("Job tidak ditemukan");

  const wb = XLSX.utils.book_new();

  // ===== 01_Applicants =====
  const aoa: unknown[][] = [Array.from(APPLICANT_COLUMNS)];
  const applicantsSheet = XLSX.utils.aoa_to_sheet(aoa);
  // Set lebar kolom
  applicantsSheet["!cols"] = APPLICANT_COLUMNS.map(() => ({ wch: 22 }));
  XLSX.utils.book_append_sheet(wb, applicantsSheet, "01_Applicants");

  // ===== 02_Instructions =====
  const instructions = [
    ["Field", "Label", "Wajib", "Format", "Contoh", "Keterangan"],
    ["source_code", "Sumber", "Ya", "Master source", "JOBSTREET", "Lihat sheet 04_Sources"],
    ["external_applicant_id", "ID Eksternal", "Tidak", "Text", "JS-10001", "ID dari portal asal"],
    ["cv_filename", "Nama File CV", "Ya", "Text .pdf", "andi-wijaya.pdf", "Harus ada dalam ZIP"],
    ["full_name", "Nama Lengkap", "Ya", "Text", "Andi Wijaya", "Minimal 3 karakter"],
    ["email", "Email", "Ya", "Email", "andi@mail.com", "Format email valid"],
    ["phone", "Nomor Telepon", "Ya", "Text", "081234567890", "Jangan format angka"],
    ["birth_place", "Tempat Lahir", "Ya", "Text", "Bandung", ""],
    ["birth_date", "Tanggal Lahir", "Ya", "YYYY-MM-DD", "1998-08-17", "Format ISO"],
    ["religion_code", "Agama", "Ya", "Master", "ISLAM", "Lihat sheet 05_Reference"],
    ["gender_code", "Gender", "Ya", "Master", "MALE", "MALE atau FEMALE"],
    ["ktp_address", "Alamat KTP", "Ya", "Text", "Jl. Mawar 10", "Minimal 10 karakter"],
    ["domicile_address", "Alamat Domisili", "Ya*", "Text", "Jl. Melati 5", "*Boleh kosong jika same_as_ktp=1"],
    ["same_as_ktp", "Sama dengan KTP", "Ya", "0 atau 1", "1", "0=Tidak, 1=Ya"],
    ["province", "Provinsi", "Ya", "Text", "Jawa Barat", "Free text"],
    ["city", "Kota", "Ya", "Text", "Kota Bandung", "Free text"],
    ["district", "Kecamatan", "Ya", "Text", "Coblong", "Free text"],
    ["subdistrict", "Kelurahan", "Ya", "Text", "Dago", "Free text"],
    ["education_name", "Pendidikan", "Ya", "Master", "S1", "Lihat sheet 03_Educations"],
    ["institution", "Institusi", "Ya", "Text", "Universitas X", "Minimal 2 karakter"],
    ["education_start_year", "Tahun Mulai Pendidikan", "Ya", "Angka", "2016", "1900 - tahun ini"],
    ["education_end_year", "Tahun Selesai Pendidikan", "Ya", "Angka", "2020", ">= tahun mulai"],
    ["last_job_title", "Pekerjaan Terakhir", "Tidak", "Text", "Software Engineer", ""],
    ["last_company", "Perusahaan Terakhir", "Tidak", "Text", "PT ABC", ""],
    ["job_start_year", "Tahun Mulai Kerja", "Tidak", "Angka", "2020", ""],
    ["job_end_year", "Tahun Selesai Kerja", "Tidak*", "Angka", "2024", "*Wajib jika still_working=0 dan ada pengalaman"],
    ["still_working", "Masih Bekerja", "Ya", "0 atau 1", "0", "0=Tidak, 1=Ya"],
    ["current_salary", "Gaji Saat Ini", "Tidak", "Angka", "7000000", "Tanpa format Rp"],
    ["expected_salary", "Ekspektasi Gaji", "Ya", "Angka", "9000000", "Tanpa format Rp"],
  ];
  const instrSheet = XLSX.utils.aoa_to_sheet(instructions);
  instrSheet["!cols"] = [{ wch: 24 }, { wch: 22 }, { wch: 6 }, { wch: 14 }, { wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, instrSheet, "02_Instructions");

  // ===== 03_Educations =====
  const eduAoa = [["education_name", "category"], ...educations.map((e) => [e.name, e.category])];
  const eduSheet = XLSX.utils.aoa_to_sheet(eduAoa);
  eduSheet["!cols"] = [{ wch: 24 }, { wch: 14 }];
  XLSX.utils.book_append_sheet(wb, eduSheet, "03_Educations");

  // ===== 04_Sources =====
  const srcAoa = [
    ["source_code", "source_name", "category"],
    ...sources.map((s) => [s.code, s.name, s.category]),
  ];
  const srcSheet = XLSX.utils.aoa_to_sheet(srcAoa);
  srcSheet["!cols"] = [{ wch: 20 }, { wch: 24 }, { wch: 16 }];
  XLSX.utils.book_append_sheet(wb, srcSheet, "04_Sources");

  // ===== 05_Reference =====
  const refAoa = [
    ["gender_code", "gender_name"],
    ["MALE", "Laki-laki"],
    ["FEMALE", "Perempuan"],
    [],
    ["religion_code", "religion_name"],
    ["ISLAM", "Islam"],
    ["KRISTEN", "Kristen"],
    ["KATOLIK", "Katolik"],
    ["HINDU", "Hindu"],
    ["BUDDHA", "Buddha"],
    ["KONGHUCU", "Konghucu"],
    [],
    ["boolean_value", "meaning"],
    ["0", "No / Tidak"],
    ["1", "Yes / Ya"],
  ];
  const refSheet = XLSX.utils.aoa_to_sheet(refAoa);
  refSheet["!cols"] = [{ wch: 16 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, refSheet, "05_Reference");

  // ===== 06_Metadata =====
  const metaAoa = [
    ["key", "value"],
    ["template_version", IMPORT_TEMPLATE_VERSION],
    ["job_id", job.id],
    ["job_title", job.position.nama],
    ["generated_at", new Date().toISOString()],
    ["template_type", "APPLICANT_IMPORT"],
  ];
  const metaSheet = XLSX.utils.aoa_to_sheet(metaAoa);
  metaSheet["!cols"] = [{ wch: 20 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, metaSheet, "06_Metadata");

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return buf;
}