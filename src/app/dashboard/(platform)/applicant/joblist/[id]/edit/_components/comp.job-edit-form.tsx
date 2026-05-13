"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StepOne } from "../../../create/_components/comp.job-create-step-one";
import { StepTwo } from "../../../create/_components/comp.job-create-step-two";
import { StepThree } from "../../../create/_components/comp.job-create-step-three";
import { StepFour } from "../../../create/_components/comp.job-create-step-four";
import { toast } from "sonner";
import { updateJob } from "../../../_actions/action.job";

type Position = {
  id: string;
  nama: string;
  divisi: { nama: string };
  level: { nama: string };
};
type Branch = { id: string; name: string };
type Status = { id: string; name: string };
type Education = { id: string; name: string };
type Experience = { id: string; name: string; minYears: number };

type Job = {
  id: string;
  positionId: string;
  branchId: string;
  employmentStatusId: string;
  province: string;
  city: string;
  minSalary: number;
  maxSalary: number;
  showSalary: boolean;
  description: string | null;
  requirements: string | null;
  minEducationId: string;
  minExperienceId: string;
  minAge: number;
  maxAge: number;
  showAge: boolean;
  gender: string;
  showGender: boolean;
  religion: string;
  showReligion: boolean;
  hasApplications: boolean;
  customQuestions: Array<{
    id: string;
    question: string;
    type: string;
    required: boolean;
    options: string | null;
    answerCount: number;
  }>;
};

type Props = {
  job: Job;
  positions: Position[];
  branches: Branch[];
  statuses: Status[];
  educations: Education[];
  experiences: Experience[];
};

export function JobEditForm({
  job,
  positions,
  branches,
  statuses,
  educations,
  experiences,
}: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({
    positionId: job.positionId,
    branchId: job.branchId,
    employmentStatusId: job.employmentStatusId,
    province: job.province,
    city: job.city,
    minSalary: job.minSalary,
    maxSalary: job.maxSalary,
    showSalary: job.showSalary,
    description: job.description || "",
    requirements: job.requirements || "",
    minEducationId: job.minEducationId,
    minExperienceId: job.minExperienceId,
    minAge: job.minAge,
    maxAge: job.maxAge,
    showAge: job.showAge,
    gender: job.gender,
    showGender: job.showGender,
    religion: job.religion,
    showReligion: job.showReligion,
    questions: job.customQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.type,
      required: q.required,
      options: q.options ? JSON.parse(q.options) : undefined,
    })),
  });

  const steps = [
    { number: 1, title: "Informasi Umum" },
    { number: 2, title: "Informasi Pekerjaan" },
    { number: 3, title: "Kualifikasi dan Pengalaman" },
    { number: 4, title: "Custom Questions" },
  ];

  // Questions yang tidak boleh dihapus (sudah ada jawaban)
  const lockedQuestionIds = job.customQuestions
    .filter((q) => q.answerCount > 0)
    .map((q) => q.id);

  async function handleFinalSubmit(step4Data: any) {
    // Explicitly override questions dengan data terbaru
    const completeData = {
      ...formData,
      questions: step4Data.questions, // ← Key fix di sini
    };

    console.log("Final data being sent:", completeData.questions); // ← Debug

    const result = await updateJob(job.id, completeData as Parameters<typeof updateJob>[1]);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
      return false;
    } else {
      toast.success("Lowongan berhasil diupdate", { position: "top-right" });
      setTimeout(() => {
        router.push("/dashboard/applicant/joblist");
      }, 500);
      return true;
    }
  }

  return (
    <div className="space-y-6">
      {job.hasApplications && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm text-amber-800">
            <strong>Perhatian:</strong> Lowongan ini sudah memiliki pelamar.
            Pertanyaan yang sudah dijawab tidak dapat dihapus (tapi masih bisa
            diedit).
          </p>
        </div>
      )}

      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex flex-1 items-center">
            <div className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full font-semibold ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <p
                className={`mt-2 text-center text-sm ${currentStep >= step.number ? "text-primary font-medium" : "text-muted-foreground"}`}
              >
                {step.title}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`}
              />
            )}
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepOne
              positions={positions}
              branches={branches}
              statuses={statuses}
              initialData={formData}
              onNext={(data) => {
                setFormData({ ...formData, ...data });
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 2 && (
            <StepTwo
              initialData={formData}
              onNext={(data) => {
                setFormData({ ...formData, ...data });
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <StepThree
              educations={educations}
              experiences={experiences}
              initialData={formData}
              onSubmit={(data) => {
                setFormData({ ...formData, ...data });
                setCurrentStep(4);
                return Promise.resolve(true);
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <StepFour
              initialData={formData}
              onSubmit={handleFinalSubmit} // ← Gunakan function yang sudah ada
              onBack={() => setCurrentStep(3)}
              isEdit={true}
              lockedQuestionIds={lockedQuestionIds}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
