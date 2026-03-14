// CANDIDATE TYPES

export type Candidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  birthPlace: string;
  gender: string;
  religion: string;
  district: string;
  city: string;
  province: string;
  subdistrict: string;
  education: { name: string };
  ktpAddress: string;
  domicileAddress: string;
  educationId: string;
  institution: string;
  startYear: number;
  endYear: string;
  expectedSalary: number;
  currentSalary: number | null;
  lastJobTitle: string | null;
  lastCompany: string | null;
  jobStartYear: number | null;
  jobEndYear: string | null;
  currentStageId: string | null;
  cvUrl: string | null;
  jobId: string;
  status: string;

  // Scoring fields (deprecated - keeping for backward compatibility)
  totalScore: number | null;
  educationScore: number | null;
  experienceScore: number | null;
  ageScore: number | null;
  salaryScore: number | null;
  genderScore: number | null;
  religionScore: number | null;
  scoredAt: Date | null;

  // AI Analysis fields
  aiRecommendation: string | null;
  aiMatchPercentage: number | null;
  aiStrengths: string | null;
  aiWeaknesses: string | null;
  aiConclusion: string | null;
  analyzedAt: Date | null;

  createdAt: Date;
  updatedAt: Date;
};

// Candidate with relations (for detail page)
export type CandidateWithRelations = Candidate & {
  education: Education;
  currentStage: Stage | null;
  job: {
    id: string;
    description: string | null;
    requirements: string | null;
    position: {
      nama: string;
      divisi: { nama: string };
      level: { nama: string };
    };
    customQuestions: CustomQuestion[];
  };
  answers: Answer[];
};

// JOB TYPES

export type Job = {
  id: string;
  status: string;
  createdAt: Date;
  title: string;
  description: string | null;
  requirements: string | null;
  responsibilities: string | null;
  minSalary: number;
  maxSalary: number;
  minAge: number;
  maxAge: number;
  gender: string;
  religion: string;
  minEducationId: string;
  positionId: string;
  position: Position;
  minEducation: Education;
  minExperience: Experience;
  customQuestions: CustomQuestion[];
  applications: Candidate[];
  creator: {
    id: string;
    nama: string;
  };
};

// Job with relations (for detail page)
export type JobWithRelations = Job & {
  position: Position;
  minEducation: Education;
  minExperience: Experience;
  customQuestions: CustomQuestion[];
  creator: {
    id: string;
    nama: string;
  };
};

export type JobListItem = {
  id: string;
  status: string;
  createdAt: Date;
  position: {
    nama: string;
    divisi: { nama: string };
    level: { nama: string };
  };
  creator: {
    nama: string;
  };
  applications: Array<{
    currentStageId: string | null;
  }>;
};

// POSITION & ORGANIZATION TYPES

export type Position = {
  id: string;
  nama: string;
  divisi: Divisi;
  level: Level;
};

export type Divisi = {
  id: string;
  nama: string;
};

export type Level = {
  id: string;
  nama: string;
};

// EDUCATION & EXPERIENCE TYPES

export type Education = {
  id: string;
  name: string;
};

export type Experience = {
  id: string;
  minYears: number;
};

// STAGE TYPES

export type Stage = {
  id: string;
  name: string;
  order: number;
};

export type StageWithCount = Stage & {
  count: number;
};

// CUSTOM QUESTION & ANSWER TYPES

export type CustomQuestion = {
  id: string;
  question: string;
  type: string;
  order: number;
  required: boolean;
};

export type Answer = {
  id: string;
  answer: string;
  question: CustomQuestion;
};

// FILTER TYPES

export type CandidateFilters = {
  search: string;
  education: string;
  gender: string;
  religion: string;
  minSalary: string;
  maxSalary: string;
  minAge: string;
  maxAge: string;
  location: string;
  yoe: string;
};
