export type EducationCategory = "SCHOOL" | "UNIVERSITY";

const SCHOOL_NAME_PATTERNS = [
  /^sd\b/i,
  /^tk\b/i,
  /^paud\b/i,
  /^kb\b/i,
  /^ra\b/i,
  /^smp\b/i,
  /^sma\b/i,
  /^smk\b/i,
  /^slb\b/i,
  /^mi\b/i,
  /^mts\b/i,
  /^ma\b/i,
  /sekolah/i,
];

export function inferEducationCategory(name: string): EducationCategory {
  const normalizedName = name.trim();

  if (SCHOOL_NAME_PATTERNS.some((pattern) => pattern.test(normalizedName))) {
    return "SCHOOL";
  }

  return "UNIVERSITY";
}
