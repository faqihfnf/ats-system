"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowLeft,
  ArrowRightLeft,
  Download,
  FileText,
  MessageCircle,
  MessageSquare,
  Info,
} from "lucide-react";
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
import { JobInfo } from "./_sections/comp.job-info";
import { CandidateNotes } from "./_sections/comp.candidate-notes";
import { AIAnalysis } from "./_sections/comp.ai-analysis";
import {
  calculateAge,
  calculateYearsOfExperience,
} from "@/lib/helpers/candidate-helper";

import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateCandidateStage } from "../../_actions/action.candidates";
import { CandidateWithRelations, Stage } from "@/types/types";
import { TransferCandidateDialog } from "../../_components/comp.transfer-candidate-dialog";

type Note = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    id: string;
    nama: string;
    email: string;
    role: string;
  };
};

type Props = {
  candidate: CandidateWithRelations;
  jobId: string;
  stages: Stage[];
  canManageCandidateActions: boolean;
  notes: Note[];
  currentUserId: string;
  currentUserRole: string;
};

export function CandidateDetailView({
  candidate,
  jobId,
  stages,
  canManageCandidateActions,
  notes,
  currentUserId,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const [showTransferDialog, setShowTransferDialog] = useState(false);

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

  function handleInvite() {
    let cleaned = candidate.phone.replace(/\D/g, "");
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    }
    if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    const message = encodeURIComponent(
      `Halo ${candidate.fullName}, terima kasih telah melamar di perusahaan kami. Kami ingin mengundang Anda untuk tahap selanjutnya.`,
    );
    const whatsappUrl = `https://wa.me/${cleaned}?text=${message}`;

    window.open(whatsappUrl, "_blank");
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
          {canManageCandidateActions && (
            <>
              {/* Transfer Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTransferDialog(true)}
              >
                <ArrowRightLeft className="mr-2 h-4 w-4 text-blue-600" />
                Pindahkan
              </Button>
              {/* WhatsApp Invite Button */}
              <Button variant="outline" size="sm" onClick={handleInvite}>
                <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
                Undang
              </Button>
            </>
          )}
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

      {/* Top Section: Tabs + Information */}
      <div className="grid grid-cols-4 gap-6">
        {/* Tabs (3/4) */}
        <div className="col-span-3">
          <Tabs defaultValue="cv" className="w-full">
            <TabsList>
              <TabsTrigger value="cv" className="gap-2">
                <FileText className="h-4 w-4" />
                Preview CV
              </TabsTrigger>
              <TabsTrigger value="job-info" className="gap-2">
                <Info className="h-4 w-4" />
                Detail Job
              </TabsTrigger>
              <TabsTrigger value="notes" className="gap-2">
                <MessageSquare className="h-4 w-4" />
                Notes {notes.length > 0 && `(${notes.length})`}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="cv" className="mt-4">
              {candidate.cvUrl ? (
                <CVPreview cvUrl={candidate.cvUrl} isPDF={isPDF || false} />
              ) : (
                <div className="flex h-96 items-center justify-center rounded-lg border">
                  <div className="text-center">
                    <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
                    <p className="text-muted-foreground">
                      Kandidat tidak mengupload CV
                    </p>
                  </div>
                </div>
              )}
            </TabsContent>
            <TabsContent value="job-info" className="mt-4">
              <JobInfo job={candidate.job} />
            </TabsContent>
            <TabsContent value="notes" className="mt-4">
              <CandidateNotes
                applicationId={candidate.id}
                notes={notes}
                currentUserId={currentUserId}
                currentUserRole={currentUserRole}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Information Sidebar (1/4) */}
        <div className="col-span-1">
          <div className="space-y-6 mt-12">
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
        canAnalyze={canManageCandidateActions}
      />

      {/* Transfer Dialog */}
      {canManageCandidateActions && (
        <TransferCandidateDialog
          open={showTransferDialog}
          onOpenChange={setShowTransferDialog}
          candidateId={candidate.id}
          candidateName={candidate.fullName}
          currentJobId={jobId}
          currentJobTitle={candidate.job.position.nama}
          currentStage={candidate.currentStage?.name || "Not Set"}
        />
      )}
    </div>
  );
}
