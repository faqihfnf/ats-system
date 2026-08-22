// ===== Types untuk fitur Import Applicant =====

export const IMPORT_TEMPLATE_VERSION = "1.0";
export const IMPORT_MAX_ROWS = 200;
export const IMPORT_MAX_PDF_SIZE_MB = 5;
export const IMPORT_MAX_ZIP_SIZE_MB = 200;

export const APPLICANT_SHEET_NAME = "01_Applicants";
export const METADATA_SHEET_NAME = "06_Metadata";

export const APPLICANT_COLUMNS = [
  // Field import
  "source_code",
  "external_applicant_id",
  "cv_filename",
  // Data personal
  "full_name",
  "email",
  "phone",
  "birth_place",
  "birth_date",
  "religion_code",
  "gender_code",
  "ktp_address",
  "domicile_address",
  "same_as_ktp",
  "province",
  "city",
  "district",
  "subdistrict",
  // Pendidikan
  "education_name",
  "institution",
  "education_start_year",
  "education_end_year",
  // Pengalaman kerja
  "last_job_title",
  "last_company",
  "job_start_year",
  "job_end_year",
  "still_working",
  // Gaji
  "current_salary",
  "expected_salary",
] as const;

export type ApplicantColumnName = (typeof APPLICANT_COLUMNS)[number];

export type ImportRowError = {
  row: number; // nomor baris Excel (1-based, termasuk header)
  field: string;
  message: string;
};

export type ParsedApplicantRow = {
  rowNumber: number; // nomor baris Excel
  sourceCode?: string;
  sourceId?: string;
  externalApplicantId?: string | null;
  cvFileName?: string;
  fullName?: string;
  email?: string;
  normalizedEmail?: string;
  phone?: string;
  normalizedPhone?: string;
  birthPlace?: string;
  birthDate?: Date;
  religion?: string;
  gender?: string;
  ktpAddress?: string;
  domicileAddress?: string;
  sameAsKtp?: boolean;
  province?: string;
  city?: string;
  district?: string;
  subdistrict?: string;
  educationId?: string;
  educationName?: string;
  institution?: string;
  startYear?: number;
  endYear?: string;
  lastJobTitle?: string | null;
  lastCompany?: string | null;
  jobStartYear?: number | null;
  jobEndYear?: string | null;
  stillWorking?: boolean;
  currentSalary?: number | null;
  expectedSalary?: number;
  hasErrors: boolean;
};

export type ImportValidationResult = {
  status: "VALID" | "INVALID";
  totalRows: number;
  validRows: number;
  errorCount: number;
  matchedCvCount: number;
  errors: ImportRowError[];
};

export type ImportSuccessResult = {
  totalApplicants: number;
};