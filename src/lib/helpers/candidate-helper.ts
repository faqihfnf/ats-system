import { Trophy, AlertCircle, CircleX } from "lucide-react";

// Calculate age from birth date
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

// Calculate Years of Experience
export function calculateYearsOfExperience(
  startYear: number | null,
  endYear: string | null,
): string {
  if (!startYear) return "Fresh Graduate";

  const currentYear = new Date().getFullYear();
  const end = endYear === "present" ? currentYear : parseInt(endYear || "0");

  if (!end || end < startYear) return "Fresh Graduate";

  const years = end - startYear;

  if (years === 0) return "< 1 year";
  if (years === 1) return "1 year";
  return `${years} years`;
}

// AI Recommendation Badge Classes (Custom Colors)
export function getAIRecommendationBadgeClass(
  recommendation: string | null,
): string {
  switch (recommendation) {
    case "RECOMMENDED":
      return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-100";
    case "SUGGESTED":
      return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-100";
    case "NOT_RECOMMENDED":
      return "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-100";
    default:
      return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-900 dark:text-gray-100";
  }
}

// AI Recommendation Icon
export function getAIRecommendationIcon(recommendation: string | null) {
  switch (recommendation) {
    case "RECOMMENDED":
      return Trophy;
    case "SUGGESTED":
      return AlertCircle;
    case "NOT_RECOMMENDED":
      return CircleX;
    default:
      return AlertCircle;
  }
}

// AI Recommendation Short Label
export function getAIRecommendationShort(
  recommendation: string | null,
): string {
  switch (recommendation) {
    case "RECOMMENDED":
      return "Match";
    case "SUGGESTED":
      return "Good";
    case "NOT_RECOMMENDED":
      return "Bad";
    default:
      return "";
  }
}

// AI Recommendation Full Label
export function getAIRecommendationLabel(
  recommendation: string | null,
): string {
  switch (recommendation) {
    case "RECOMMENDED":
      return "Match";
    case "SUGGESTED":
      return "Good";
    case "NOT_RECOMMENDED":
      return "Bad";
    default:
      return " - ";
  }
}

// AI Recommendation Color (for circles, text, etc)
export function getAIRecommendationColor(
  recommendation: string | null,
): string {
  switch (recommendation) {
    case "RECOMMENDED":
      return "text-green-500";
    case "SUGGESTED":
      return "text-yellow-500";
    case "NOT_RECOMMENDED":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}
