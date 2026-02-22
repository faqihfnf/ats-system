"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, FileText, X } from "lucide-react";

type Props = {
  initialData: any;
  onNext: (data: any) => void;
  onBack: () => void;
};

export function StepCV({ initialData, onNext, onBack }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (!allowedTypes.includes(selectedFile.type)) {
      setValidationError("Format file harus PDF atau DOC/DOCX");
      return;
    }

    // Validate file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      setValidationError("Ukuran file maksimal 5MB");
      return;
    }

    setValidationError(null);
    setFile(selectedFile);
  }

  function handleRemoveFile() {
    setFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (!file && !initialData.cvUrl) {
      setValidationError("CV wajib diupload");
      return;
    }

    if (file) {
      // TODO: Upload file to storage (Supabase Storage or similar)
      // For now, we'll just store the filename
      setUploading(true);

      // Simulate upload
      await new Promise((resolve) => setTimeout(resolve, 1000));

      onNext({
        cvUrl: file.name, // In production, this should be the actual URL from storage
      });

      setUploading(false);
    } else {
      onNext({
        cvUrl: initialData.cvUrl,
      });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Upload CV *</Label>
          <p className="text-muted-foreground text-sm">
            Format: PDF, DOC, DOCX (Maksimal 5MB)
          </p>

          {!file && !initialData.cvUrl ? (
            <label
              htmlFor="cv-upload"
              className="hover:bg-muted/50 flex h-64 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="text-muted-foreground mb-4 h-12 w-12" />
                <p className="text-muted-foreground mb-2 text-sm">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-muted-foreground text-xs">
                  PDF, DOC, DOCX (MAX. 5MB)
                </p>
              </div>
              <Input
                id="cv-upload"
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
              />
            </label>
          ) : (
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <FileText className="text-primary h-10 w-10" />
              <div className="flex-1">
                <p className="font-medium">{file?.name || initialData.cvUrl}</p>
                <p className="text-muted-foreground text-sm">
                  {file
                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                    : "Previously uploaded"}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleRemoveFile}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {validationError && (
        <div className="text-destructive bg-destructive/10 border-destructive rounded-md border p-3 text-sm">
          {validationError}
        </div>
      )}

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={uploading}
        >
          Kembali
        </Button>
        <Button type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Selanjutnya"}
        </Button>
      </div>
    </form>
  );
}
