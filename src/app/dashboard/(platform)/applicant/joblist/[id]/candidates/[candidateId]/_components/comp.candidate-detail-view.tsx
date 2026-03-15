"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { ProfileHeader } from "./_sections/comp.profile-header";
import { ContactInfo } from "./_sections/comp.contact-info";
import { PersonalInfo } from "./_sections/comp.personal-info";
import { EducationInfo } from "./_sections/comp.education-info";
import { WorkExperience } from "./_sections/comp.work-experience";
import { SalaryInfo } from "./_sections/comp.salary-info";
import { AdditionalQuestions } from "./_sections/comp.additional-questions";
import { CVPreview } from "./_sections/comp.cv-preview";
import { AIAnalysis } from "./_sections/comp.ai-analysis";
import {
  calculateAge,
  calculateYearsOfExperience,
} from "@/lib/helpers/candidate-helper";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCandidateStage } from "../../_actions/action.candidates";
import { CandidateWithRelations, Stage } from "@/types/types";

type Props = {
  candidate: CandidateWithRelations;
  jobId: string;
  stages: Stage[];
};

export function CandidateDetailView({ candidate, jobId, stages }: Props) {
  const router = useRouter();
  const [showCV, setShowCV] = useState(true);

  const initials = candidate.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const age = calculateAge(candidate.birthDate);
  const yoe = calculateYearsOfExperience(
    candidate.jobStartYear,
    candidate.jobEndYear,
  );
  const isPDF = candidate.cvUrl?.toLowerCase().endsWith(".pdf");

  async function handleStageChange(stageId: string) {
    const result = await updateCandidateStage(candidate.id, stageId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Stage updated successfully", { position: "top-right" });
      router.refresh();
    }
  }

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href={`/dashboard/applicant/joblist/${jobId}/candidates`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Candidates
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          {/* Stage Selector */}
          <div className="flex items-center gap-2">
            <Select
              value={candidate.currentStageId || ""}
              onValueChange={handleStageChange}
            >
              <SelectTrigger className="w-40">
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
          </div>

          {candidate.cvUrl && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCV(!showCV)}
              >
                <FileText className="mr-2 h-4 w-4" />
                {showCV ? "Hide CV" : "Show CV"}
              </Button>
              <Link href={candidate.cvUrl} target="_blank" download>
                <Button size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Download CV
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Top Section: CV Preview + Information */}
      <div className="grid grid-cols-4 gap-6">
        {/* CV Preview (3/4) */}
        {candidate.cvUrl && showCV && (
          <div className="col-span-3">
            <CVPreview cvUrl={candidate.cvUrl} isPDF={isPDF || false} />
          </div>
        )}

        {/* Information Sidebar (1/4) */}
        <div
          className={candidate.cvUrl && showCV ? "col-span-1" : "col-span-4"}
        >
          <div className="space-y-6">
            <ProfileHeader
              fullName={candidate.fullName}
              initials={initials}
              position={candidate.job.position.nama}
              currentStage={candidate.currentStage?.name || null}
              status={candidate.status}
              appliedDate={candidate.createdAt}
            />

            <ContactInfo
              email={candidate.email}
              phone={candidate.phone}
              district={candidate.district}
              city={candidate.city}
            />

            <PersonalInfo
              birthPlace={candidate.birthPlace}
              birthDate={candidate.birthDate}
              age={age}
              gender={candidate.gender}
              religion={candidate.religion}
              ktpAddress={candidate.ktpAddress}
              domicileAddress={candidate.domicileAddress}
            />

            <SalaryInfo
              currentSalary={candidate.currentSalary}
              expectedSalary={candidate.expectedSalary}
            />

            <WorkExperience
              jobTitle={candidate.lastJobTitle}
              company={candidate.lastCompany}
              startYear={candidate.jobStartYear}
              endYear={candidate.jobEndYear}
              yearsOfExperience={yoe}
            />

            <EducationInfo
              educationLevel={candidate.education.name}
              institution={candidate.institution}
              startYear={candidate.startYear}
              endYear={candidate.endYear}
            />

            <AdditionalQuestions answers={candidate.answers} />
          </div>
        </div>
      </div>

      {/* Bottom Section: Score & Analyze */}
      <AIAnalysis
        candidateId={candidate.id}
        aiStrengths={candidate.aiStrengths}
        aiWeaknesses={candidate.aiWeaknesses}
        aiConclusion={candidate.aiConclusion}
        aiRecommendation={candidate.aiRecommendation}
        aiMatchPercentage={candidate.aiMatchPercentage}
        analyzedAt={candidate.analyzedAt}
      />
    </div>
  );
}
