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
import {
  scoreAndAnalyzeCandidate,
  updateCandidateStage,
} from "../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  calculateAge,
  calculateYearsOfExperience,
  getAIRecommendationBadgeClass,
  getAIRecommendationIcon,
  getAIRecommendationShort,
  toProperCase,
} from "@/lib/helpers/candidate-helper";
import { cn } from "@/lib/utils";
import { toUpperCase } from "zod";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles } from "lucide-react";
import { useState } from "react";

type Candidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: string;
  religion: string;
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
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);

  async function handleAnalyze(candidateId: string) {
    setAnalyzingId(candidateId);

    const result = await scoreAndAnalyzeCandidate(candidateId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Candidate analyzed successfully!", {
        position: "top-right",
      });
      router.refresh();
    }

    setAnalyzingId(null);
  }
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
            <TableHead className="w-17.5">AI Score</TableHead>
            <TableHead className="w-17.5">Age</TableHead>
            <TableHead className="w-30">Phone</TableHead>
            <TableHead className="w-50">Kota</TableHead>
            <TableHead className="w-50">Kecamatan</TableHead>
            <TableHead className="w-30">Education</TableHead>
            <TableHead className="w-30">Institution</TableHead>
            <TableHead className="w-50">Exp. Salary</TableHead>
            <TableHead className="w-32.5">Past Role</TableHead>
            <TableHead className="w-32.5">Past Company</TableHead>
            <TableHead className="w-17.5">YoE</TableHead>
            <TableHead className="w-20">Gender</TableHead>
            <TableHead className="w-25">Religion</TableHead>
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
            const isAnalyzing = analyzingId === candidate.id;

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
                              "mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium",
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

                {/* AI Match Score - with Analyze Button */}
                <TableCell className="text-center">
                  {hasAIScore ? (
                    <div className="flex flex-col items-center gap-1">
                      <div
                        className={cn(
                          "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-opacity hover:opacity-80",
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
                      {/* Re-analyze button */}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:text-primary hover:bg-transparent"
                        onClick={() => handleAnalyze(candidate.id)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleAnalyze(candidate.id)}
                      disabled={isAnalyzing}
                      className="hover:text-primary hover:bg-transparent"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-3 w-3" />
                        </>
                      )}
                    </Button>
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

                {/* Location - 2 lines: District + City */}
                <TableCell>
                  <span className="text-sm">
                    {" "}
                    {toProperCase(candidate.district)}
                  </span>
                </TableCell>

                <TableCell>
                  <span className="text-sm">
                    {toProperCase(candidate.city)}
                  </span>
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

                {/* Gender  */}
                <TableCell className="text-center">
                  <span className="text-xs">
                    {toProperCase(candidate.gender)}
                  </span>
                </TableCell>

                {/* Religion */}
                <TableCell className="text-center">
                  <span className="text-xs">
                    {toProperCase(candidate.religion)}
                  </span>
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
