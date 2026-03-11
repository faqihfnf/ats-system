type ScoringInput = {
  // Candidate data
  candidateEducationId: string;
  candidateYearsOfExperience: number;
  candidateAge: number;
  candidateExpectedSalary: number;
  candidateGender: string;
  candidateReligion: string;

  // Job requirements
  jobMinEducationId: string;
  jobMinExperience: number;
  jobMaxExperience: number;
  jobMinAge: number;
  jobMaxAge: number;
  jobMinSalary: number;
  jobMaxSalary: number;
  jobGender: string;
  jobReligion: string;

  // Education hierarchy for comparison
  educationLevels: Map<string, number>; // educationId -> level number
};

type ScoringResult = {
  totalScore: number;
  educationScore: number;
  experienceScore: number;
  ageScore: number;
  salaryScore: number;
  genderScore: number;
  religionScore: number;
  breakdown: {
    education: { score: number; max: number; percentage: number };
    experience: { score: number; max: number; percentage: number };
    age: { score: number; max: number; percentage: number };
    salary: { score: number; max: number; percentage: number };
    gender: { score: number; max: number; percentage: number };
    religion: { score: number; max: number; percentage: number };
  };
  category: "Excellent" | "Good" | "Fair" | "Poor";
};

// Score weights (total = 100)
const WEIGHTS = {
  EDUCATION: 20,
  EXPERIENCE: 25,
  AGE: 15,
  SALARY: 15,
  GENDER: 10,
  RELIGION: 15,
};

export function calculateScore(input: ScoringInput): ScoringResult {
  const educationScore = calculateEducationScore(
    input.candidateEducationId,
    input.jobMinEducationId,
    input.educationLevels,
  );

  const experienceScore = calculateExperienceScore(
    input.candidateYearsOfExperience,
    input.jobMinExperience,
    input.jobMaxExperience,
  );

  const ageScore = calculateAgeScore(
    input.candidateAge,
    input.jobMinAge,
    input.jobMaxAge,
  );

  const salaryScore = calculateSalaryScore(
    input.candidateExpectedSalary,
    input.jobMinSalary,
    input.jobMaxSalary,
  );

  const genderScore = calculateGenderScore(
    input.candidateGender,
    input.jobGender,
  );

  const religionScore = calculateReligionScore(
    input.candidateReligion,
    input.jobReligion,
  );

  const totalScore =
    educationScore +
    experienceScore +
    ageScore +
    salaryScore +
    genderScore +
    religionScore;

  const category = getCategoryFromScore(totalScore);

  return {
    totalScore,
    educationScore,
    experienceScore,
    ageScore,
    salaryScore,
    genderScore,
    religionScore,
    breakdown: {
      education: {
        score: educationScore,
        max: WEIGHTS.EDUCATION,
        percentage: Math.round((educationScore / WEIGHTS.EDUCATION) * 100),
      },
      experience: {
        score: experienceScore,
        max: WEIGHTS.EXPERIENCE,
        percentage: Math.round((experienceScore / WEIGHTS.EXPERIENCE) * 100),
      },
      age: {
        score: ageScore,
        max: WEIGHTS.AGE,
        percentage: Math.round((ageScore / WEIGHTS.AGE) * 100),
      },
      salary: {
        score: salaryScore,
        max: WEIGHTS.SALARY,
        percentage: Math.round((salaryScore / WEIGHTS.SALARY) * 100),
      },
      gender: {
        score: genderScore,
        max: WEIGHTS.GENDER,
        percentage: Math.round((genderScore / WEIGHTS.GENDER) * 100),
      },
      religion: {
        score: religionScore,
        max: WEIGHTS.RELIGION,
        percentage: Math.round((religionScore / WEIGHTS.RELIGION) * 100),
      },
    },
    category,
  };
}

// Education scoring (max 20 points)
function calculateEducationScore(
  candidateEducationId: string,
  jobMinEducationId: string,
  educationLevels: Map<string, number>,
): number {
  const candidateLevel = educationLevels.get(candidateEducationId) || 0;
  const requiredLevel = educationLevels.get(jobMinEducationId) || 0;

  const levelDiff = candidateLevel - requiredLevel;

  if (levelDiff >= 0) return WEIGHTS.EDUCATION; // Match or higher
  if (levelDiff === -1) return 15; // 1 level below
  if (levelDiff === -2) return 10; // 2 levels below
  return 5; // 3+ levels below
}

// Experience scoring (max 25 points)
function calculateExperienceScore(
  candidateYoE: number,
  minYoE: number,
  maxYoE: number,
): number {
  if (candidateYoE >= minYoE && candidateYoE <= maxYoE) {
    return WEIGHTS.EXPERIENCE; // Perfect fit
  }

  if (candidateYoE < minYoE) {
    // Under-qualified: -2.5 points per year gap
    const gap = minYoE - candidateYoE;
    return Math.max(10, WEIGHTS.EXPERIENCE - gap * 2.5);
  }

  // Over-qualified: -1.5 points per year over
  const excess = candidateYoE - maxYoE;
  return Math.max(15, WEIGHTS.EXPERIENCE - excess * 1.5);
}

// Age scoring (max 15 points)
function calculateAgeScore(
  candidateAge: number,
  minAge: number,
  maxAge: number,
): number {
  if (candidateAge >= minAge && candidateAge <= maxAge) {
    return WEIGHTS.AGE; // Perfect fit
  }

  const gap = Math.min(
    Math.abs(candidateAge - minAge),
    Math.abs(candidateAge - maxAge),
  );

  return Math.max(5, WEIGHTS.AGE - gap * 1.5);
}

// Salary scoring (max 15 points)
function calculateSalaryScore(
  expectedSalary: number,
  minSalary: number,
  maxSalary: number,
): number {
  if (expectedSalary <= maxSalary) {
    return WEIGHTS.SALARY; // Affordable
  }

  // Penalize over-budget candidates
  const excessPercentage = ((expectedSalary - maxSalary) / maxSalary) * 100;

  if (excessPercentage <= 10) return 12; // 10% over
  if (excessPercentage <= 20) return 10; // 20% over
  if (excessPercentage <= 30) return 7; // 30% over
  return 5; // 30%+ over
}

// Gender scoring (max 10 points)
function calculateGenderScore(
  candidateGender: string,
  jobGender: string,
): number {
  if (jobGender === "ANY") return WEIGHTS.GENDER; // No preference
  if (candidateGender === jobGender) return WEIGHTS.GENDER;
  return 0;
}

// Religion scoring (max 15 points)
function calculateReligionScore(
  candidateReligion: string,
  jobReligion: string,
): number {
  if (jobReligion === "ANY") return WEIGHTS.RELIGION; // No preference
  if (candidateReligion === jobReligion) return WEIGHTS.RELIGION;
  return 0;
}

// Get category from total score
function getCategoryFromScore(
  score: number,
): "Excellent" | "Good" | "Fair" | "Poor" {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

// Helper: Calculate years of experience from job data
export function calculateYearsOfExperience(
  startYear: number | null,
  endYear: string | null,
): number {
  if (!startYear) return 0;

  const currentYear = new Date().getFullYear();
  const end = endYear === "present" ? currentYear : parseInt(endYear || "0");

  if (!end || end < startYear) return 0;

  return end - startYear;
}

// Helper: Calculate age from birth date
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}
