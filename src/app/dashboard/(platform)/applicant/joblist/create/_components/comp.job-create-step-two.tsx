"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "./rich-text-editor";
import { jobStepTwoSchema } from "@/lib/validations/job";

type Props = {
  initialData: any;
  onNext: (data: any) => void;
  onBack: () => void;
};

export function StepTwo({ initialData, onNext, onBack }: Props) {
  const [description, setDescription] = useState(initialData.description || "");
  const [requirements, setRequirements] = useState(initialData.requirements || "");
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);

    const formData = {
      description,
      requirements,
    };

    // Validasi dengan Zod
    const result = jobStepTwoSchema.safeParse(formData);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setValidationError(firstError.message);
      return;
    }

    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {/* Description */}
        <div className="space-y-2">
          <Label>
            Deskripsi Pekerjaan <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Jelaskan detail peran pekerjaan, tanggung jawab, dan ekspektasi.
          </p>
          <RichTextEditor
            content={description}
            onChange={setDescription}
            placeholder="Tulis deskripsi pekerjaan minimal 100 karakter..."
          />
          <p className="text-xs text-muted-foreground text-right">
            {description.length} / 2500
          </p>
        </div>

        {/* Requirements */}
        <div className="space-y-2">
          <Label>
            Persyaratan <span className="text-destructive">*</span>
          </Label>
          <p className="text-sm text-muted-foreground">
            Tuliskan kualifikasi dan persyaratan untuk posisi ini.
          </p>
          <RichTextEditor
            content={requirements}
            onChange={setRequirements}
            placeholder="Tulis persyaratan minimal 200 karakter..."
          />
          <p className="text-xs text-muted-foreground text-right">
            {requirements.length} / 2500
          </p>
        </div>
      </div>

      {/* Validation Error dari Zod */}
      {validationError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
          {validationError}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="submit">
          Selanjutnya
        </Button>
      </div>
    </form>
  );
}