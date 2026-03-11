"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  Calendar,
  DollarSign,
  User,
  Church,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { scoreCandidate } from "../../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = {
  candidateId: string;
  totalScore: number | null;
  educationScore: number | null;
  experienceScore: number | null;
  ageScore: number | null;
  salaryScore: number | null;
  genderScore: number | null;
  religionScore: number | null;
  scoredAt: Date | null;
};

const WEIGHTS = {
  EDUCATION: 20,
  EXPERIENCE: 25,
  AGE: 15,
  SALARY: 15,
  GENDER: 10,
  RELIGION: 15,
};

export function ScoreBreakdown({
  candidateId,
  totalScore,
  educationScore,
  experienceScore,
  ageScore,
  salaryScore,
  genderScore,
  religionScore,
  scoredAt,
}: Props) {
  const router = useRouter();
  const [isScoring, setIsScoring] = useState(false);

  const hasScore = totalScore !== null && totalScore > 0;

  async function handleScore() {
    setIsScoring(true);

    const result = await scoreCandidate(candidateId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Candidate scored successfully!", {
        position: "top-right",
      });
      router.refresh();
    }

    setIsScoring(false);
  }

  if (!hasScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            Candidate Score
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="text-muted-foreground mb-4 h-16 w-16" />
          <p className="text-muted-foreground mb-6 text-center">
            This candidate has not been scored yet.
            <br />
            Click the button below to generate AI score.
          </p>
          <Button onClick={handleScore} disabled={isScoring}>
            {isScoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scoring...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Score
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const category = getCategoryFromScore(totalScore);
  const categoryColor = getCategoryColor(category);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          Candidate Score Details
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleScore}
          disabled={isScoring}
        >
          {isScoring ? (
            <>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Re-scoring...
            </>
          ) : (
            "Re-score"
          )}
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Disclaimer */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            AI candidate scoring can be inaccurate or misleading. Use as
            reference only.
          </AlertDescription>
        </Alert>

        {/* Total Score Circle */}
        <div className="flex flex-col items-center py-6">
          <div className="relative h-40 w-40">
            {/* Background circle */}
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-muted"
              />
              {/* Progress circle */}
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${(totalScore / 100) * 439.6} 439.6`}
                className={categoryColor}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-bold">{totalScore}%</span>
              <span className="text-muted-foreground mt-1 text-xs">
                Candidate final score
              </span>
            </div>
          </div>
          <Badge className="mt-4" variant={getBadgeVariant(category)}>
            {category} Match
          </Badge>
          {scoredAt && (
            <p className="text-muted-foreground mt-2 text-xs">
              Scored on {new Date(scoredAt).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Score Breakdown */}
        <div className="space-y-4">
          <h4 className="text-sm font-semibold">Score Breakdown</h4>

          <ScoreItem
            icon={GraduationCap}
            label="Education"
            score={educationScore || 0}
            max={WEIGHTS.EDUCATION}
          />

          <ScoreItem
            icon={Briefcase}
            label="Work Experience"
            score={experienceScore || 0}
            max={WEIGHTS.EXPERIENCE}
          />

          <ScoreItem
            icon={Calendar}
            label="Age"
            score={ageScore || 0}
            max={WEIGHTS.AGE}
          />

          <ScoreItem
            icon={DollarSign}
            label="Salary Expectation"
            score={salaryScore || 0}
            max={WEIGHTS.SALARY}
          />

          <ScoreItem
            icon={User}
            label="Gender"
            score={genderScore || 0}
            max={WEIGHTS.GENDER}
          />

          <ScoreItem
            icon={Church}
            label="Religion"
            score={religionScore || 0}
            max={WEIGHTS.RELIGION}
          />
        </div>
      </CardContent>
    </Card>
  );
}

// Score Item Component
type ScoreItemProps = {
  icon: React.ElementType;
  label: string;
  score: number;
  max: number;
};

function ScoreItem({ icon: Icon, label, score, max }: ScoreItemProps) {
  const percentage = Math.round((score / max) * 100);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="text-muted-foreground h-4 w-4" />
          <span className="text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-medium">
            {score}/{max}
          </span>
          <span className="text-muted-foreground text-xs">{percentage}%</span>
        </div>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
}

// Helper functions
function getCategoryFromScore(
  score: number,
): "Excellent" | "Good" | "Fair" | "Poor" {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Good";
  if (score >= 40) return "Fair";
  return "Poor";
}

function getCategoryColor(category: string): string {
  switch (category) {
    case "Excellent":
      return "text-green-500";
    case "Good":
      return "text-blue-500";
    case "Fair":
      return "text-yellow-500";
    case "Poor":
      return "text-red-500";
    default:
      return "text-gray-500";
  }
}

function getBadgeVariant(
  category: string,
): "default" | "secondary" | "destructive" | "outline" {
  switch (category) {
    case "Excellent":
      return "default";
    case "Good":
      return "secondary";
    case "Fair":
      return "outline";
    case "Poor":
      return "destructive";
    default:
      return "outline";
  }
}
