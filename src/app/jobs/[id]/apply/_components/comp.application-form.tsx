"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { submitApplication } from "../_actions/action.application";
import { toast } from "sonner";
import { StepPersonal } from "./comp.step-personal";
import { StepEducation } from "./comp.step-education";
import { StepCV } from "./comp.step-cv";
import { StepCustomQuestions } from "./comp.step-custom-questions";
import { uploadCV } from "@/lib/supabase/storage";

type Job = {
  id: string;
  position: { nama: string };
  customQuestions: any[];
};

type Education = {
  id: string;
  name: string;
};

type Props = {
  job: Job;
  educations: Education[];
};

export function ApplicationForm({ job, educations }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});
  const [submitting, setSubmitting] = useState(false);

  const hasCustomQuestions = job.customQuestions.length > 0;

  const steps = [
    { number: 1, title: "Data Personal" },
    { number: 2, title: "Pendidikan & Pekerjaan" },
    { number: 3, title: "Upload CV" },
    ...(hasCustomQuestions
      ? [{ number: 4, title: "Pertanyaan Tambahan" }]
      : []),
  ];

  async function handleFinalSubmit(finalData: any) {
    setSubmitting(true);
    const completeData = { ...formData, ...finalData };

    // Upload CV jika ada file
    if (completeData.cvFile) {
      toast.info("Uploading CV...", { position: "top-right" });

      const result = await uploadCV(completeData.cvFile);

      if (result.error) {
        toast.error(result.error, { position: "top-right" });
        setSubmitting(false);
        return false;
      }

      completeData.cvUrl = result.url;
      delete completeData.cvFile; // Remove file object
    }

    // Submit application
    const result = await submitApplication(job.id, completeData);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
      setSubmitting(false);
      return false;
    } else {
      toast.success("Lamaran berhasil dikirim!", { position: "top-right" });
      setTimeout(() => {
        router.push(`/jobs/${job.id}/success`);
      }, 500);
      return true;
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
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

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepPersonal
              initialData={formData}
              onNext={(data) => {
                setFormData({ ...formData, ...data });
                setCurrentStep(2);
              }}
            />
          )}
          {currentStep === 2 && (
            <StepEducation
              educations={educations}
              initialData={formData}
              onNext={(data) => {
                setFormData({ ...formData, ...data });
                setCurrentStep(3);
              }}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <StepCV
              initialData={formData}
              hasCustomQuestions={hasCustomQuestions}
              submitting={submitting}
              onNext={async (data) => {
                setFormData({ ...formData, ...data });
                if (hasCustomQuestions) {
                  // Ada custom questions, lanjut ke step 4
                  setCurrentStep(4);
                } else {
                  // Tidak ada custom questions, langsung submit
                  await handleFinalSubmit(data);
                }
              }}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && hasCustomQuestions && (
            <StepCustomQuestions
              questions={job.customQuestions}
              initialData={formData}
              onSubmit={handleFinalSubmit}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
