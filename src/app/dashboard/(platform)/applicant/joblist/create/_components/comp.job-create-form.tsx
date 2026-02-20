"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { StepOne } from "./comp.job-create-step-one";
import { StepTwo } from "./comp.job-create-step-two";
import { StepThree } from "./comp.job-create-step-three";
import { toast } from "sonner";
import { createJob } from "../../_actions/action.job";

type Position = { id: string; nama: string; divisi: { nama: string }; level: { nama: string } };
type Branch = { id: string; name: string };
type Status = { id: string; name: string };
type Education = { id: string; name: string };
type Experience = { id: string; name: string; minYears: number };

type Props = {
  positions: Position[];
  branches: Branch[];
  statuses: Status[];
  educations: Education[];
  experiences: Experience[];
};

export function JobCreateForm({ positions, branches, statuses, educations, experiences }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({});

  const steps = [
    { number: 1, title: "Informasi Umum" },
    { number: 2, title: "Informasi Pekerjaan" },
    { number: 3, title: "Kualifikasi dan Pengalaman" },
  ];

  async function handleFinalSubmit(step3Data: any) {
    const completeData = { ...formData, ...step3Data };
    
    const result = await createJob(completeData);
    
    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
      return false; // return false untuk tidak close loading
    } else {
      toast.success("Lowongan berhasil dibuat", { position: "top-right" });
      setTimeout(() => {
        router.push("/dashboard/applicant/joblist");
      }, 500);
      return true;
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <div key={step.number} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-1">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  currentStep >= step.number
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {step.number}
              </div>
              <p className={`text-sm mt-2 ${currentStep >= step.number ? "text-primary font-medium" : "text-muted-foreground"}`}>
                {step.title}
              </p>
            </div>
            {idx < steps.length - 1 && (
              <div className={`h-0.5 flex-1 ${currentStep > step.number ? "bg-primary" : "bg-muted"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
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
              onSubmit={handleFinalSubmit}
              onBack={() => setCurrentStep(2)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}