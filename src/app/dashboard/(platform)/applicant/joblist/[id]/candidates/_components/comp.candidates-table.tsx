"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { updateCandidateStage } from "../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  calculateAge,
  calculateYearsOfExperience,
  getAIRecommendationBadgeClass,
  getAIRecommendationIcon,
  getAIRecommendationShort,
} from "@/lib/helpers/candidate-helper";
import { cn } from "@/lib/utils";

type Candidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  district: string;
  city: string;
  education: { name: string };
  institution: string;
  expectedSalary: number;
  lastJobTitle: string | null;
  lastCompany: string | null;
  jobStartYear: number | null;
  jobEndYear: string | null;
  currentStageId: string | null;
  currentStage: { id: string; name: string } | null;
  aiRecommendation: string | null;
  aiMatchPercentage: number | null;
};

type Stage = {
  id: string;
  name: string;
  order: number;
};

type Props = {
  candidates: Candidate[];
  stages: Stage[];
  jobId: string;
};

export function CandidatesTable({ candidates, stages, jobId }: Props) {
  const router = useRouter();

  async function handleStageChange(candidateId: string, stageId: string) {
    const result = await updateCandidateStage(candidateId, stageId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Stage updated successfully", { position: "top-right" });
      router.refresh();
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground text-sm">No candidates found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-50">Full Name</TableHead>
            <TableHead className="w-17.5 text-center">AI Score</TableHead>
            <TableHead className="w-17.5 text-center">Age</TableHead>
            <TableHead className="w-30">Phone</TableHead>
            <TableHead className="w-50">Location</TableHead>
            <TableHead className="w-30">Education</TableHead>
            <TableHead className="w-30">Institution</TableHead>
            <TableHead className="w-30 text-right">Exp. Salary</TableHead>
            <TableHead className="w-32.5">Past Role</TableHead>
            <TableHead className="w-32.5">Past Company</TableHead>
            <TableHead className="w-17.5 text-center">YoE</TableHead>
            <TableHead className="w-45">Stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const age = calculateAge(candidate.birthDate);
            const yoe = calculateYearsOfExperience(
              candidate.jobStartYear,
              candidate.jobEndYear,
            );
            const initials = candidate.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);
            const location = `${candidate.district} - ${candidate.city}`;
            const hasAIScore = candidate.aiMatchPercentage !== null;

            return (
              <TableRow key={candidate.id}>
                {/* Full Name - Clickable with AI Badge */}
                <TableCell>
                  <Link
                    href={`/dashboard/applicant/joblist/${jobId}/candidates/${candidate.id}`}
                    className="flex items-center gap-3 transition-opacity hover:opacity-80"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium hover:underline">
                        {candidate.fullName}
                      </p>
                      <div className="flex-col items-center gap-2">
                        <p className="text-muted-foreground text-xs">
                          {candidate.email}
                        </p>

                        {/* AI Recommendation Badge */}
                        {candidate.aiRecommendation && (
                          <div
                            className={cn(
                              "inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
                              getAIRecommendationBadgeClass(
                                candidate.aiRecommendation,
                              ),
                            )}
                          >
                            {(() => {
                              const Icon = getAIRecommendationIcon(
                                candidate.aiRecommendation,
                              );
                              return <Icon className="h-3 w-3" />;
                            })()}
                            {getAIRecommendationShort(
                              candidate.aiRecommendation,
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                </TableCell>

                {/* AI Match Score - with custom color */}
                <TableCell className="text-center">
                  {hasAIScore ? (
                    <div
                      className={cn(
                        "inline-flex cursor-pointer items-center rounded-full p-2 text-sm font-medium transition-opacity hover:opacity-80",
                        getAIRecommendationBadgeClass(
                          candidate.aiRecommendation,
                        ),
                      )}
                      onClick={() =>
                        router.push(
                          `/dashboard/applicant/joblist/${jobId}/candidates/${candidate.id}`,
                        )
                      }
                    >
                      {candidate.aiMatchPercentage}%
                    </div>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Not analyzed
                    </Badge>
                  )}
                </TableCell>

                {/* Age */}
                <TableCell className="text-center">
                  <span className="text-sm">{age}</span>
                </TableCell>

                {/* Phone */}
                <TableCell>
                  <span className="text-sm">{candidate.phone}</span>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <span className="text-sm">{location}</span>
                </TableCell>

                {/* Education */}
                <TableCell>
                  <span className="text-sm">{candidate.education.name}</span>
                </TableCell>

                {/* Institution */}
                <TableCell>
                  <span className="text-sm">{candidate.institution}</span>
                </TableCell>

                {/* Expected Salary */}
                <TableCell className="text-right">
                  <span className="text-sm font-medium">
                    Rp {candidate.expectedSalary.toLocaleString("id-ID")}
                  </span>
                </TableCell>

                {/* Past Role */}
                <TableCell>
                  <span className="text-sm">
                    {candidate.lastJobTitle || "-"}
                  </span>
                </TableCell>

                {/* Past Company */}
                <TableCell>
                  <span className="text-sm">
                    {candidate.lastCompany || "-"}
                  </span>
                </TableCell>

                {/* Years of Experience */}
                <TableCell className="text-center">
                  <span className="text-sm">{yoe}</span>
                </TableCell>

                {/* Stage Selector */}
                <TableCell>
                  <Select
                    value={candidate.currentStageId || ""}
                    onValueChange={(value) =>
                      handleStageChange(candidate.id, value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
