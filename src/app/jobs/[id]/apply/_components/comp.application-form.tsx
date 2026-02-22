"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StepPersonal } from "./comp.step-personal";
import { StepEducation } from "./comp.step-education";
import { StepCV } from "./comp.step-cv";
import { StepCustomQuestions } from "./comp.step-custom-questions";
import { submitApplication } from "../_actions/action.application";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Props = { job: any; educations: any[] };

export function ApplicationForm({ job, educations }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({});

  // Definisi Step secara dinamis
  const steps = [
    { number: 1, title: "Data Personal" },
    { number: 2, title: "Pendidikan" },
    { number: 3, title: "Upload CV" },
    ...(job.customQuestions?.length > 0
      ? [{ number: 4, title: "Pertanyaan" }]
      : []),
  ];

  const totalSteps = steps.length;

  // Fungsi navigasi yang mendukung Promise<boolean> untuk Step 4
  const handleNextStep = async (stepData: any): Promise<boolean> => {
    const updatedData = { ...formData, ...stepData };
    setFormData(updatedData);

    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
      return true;
    } else {
      return await handleFinalSubmit(updatedData);
    }
  };

  async function handleFinalSubmit(data: any): Promise<boolean> {
    const result = await submitApplication(job.id, data);
    if (result?.error) {
      toast.error(result.error);
      return false;
    }
    toast.success("Lamaran berhasil dikirim!");
    router.push(`/jobs/${job.id}/success`);
    return true;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6 py-10">
      {/* Progress Bar UI */}
      <div className="mb-8 flex items-center justify-between px-4">
        {steps.map((s) => (
          <div key={s.number} className="flex flex-col items-center gap-2">
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-full text-sm font-bold",
                currentStep >= s.number
                  ? "bg-primary text-white"
                  : "bg-slate-200 text-slate-500",
              )}
            >
              {s.number}
            </div>
            <span className="text-xs font-medium">{s.title}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardContent className="pt-6">
          {currentStep === 1 && (
            <StepPersonal initialData={formData} onNext={handleNextStep} />
          )}
          {currentStep === 2 && (
            <StepEducation
              educations={educations}
              initialData={formData}
              onNext={handleNextStep}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <StepCV
              initialData={formData}
              onNext={handleNextStep}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <StepCustomQuestions
              questions={job.customQuestions}
              initialData={formData}
              onSubmit={handleNextStep}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
