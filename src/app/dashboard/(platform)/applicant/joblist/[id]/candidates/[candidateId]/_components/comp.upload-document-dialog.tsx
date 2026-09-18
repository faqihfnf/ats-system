"use client";

import { useRef, useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { uploadCandidateDocuments } from "../_actions/action.documents";
import {
  MAX_DOC_SIZE_MB,
  MAX_DOCS_PER_CANDIDATE,
} from "../_lib/document-constants";
import { formatFileSize } from "@/lib/helpers/file-helper";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  applicationId: string;
  existingCount: number;
};

export function UploadDocumentDialog({
  open,
  onOpenChange,
  applicationId,
  existingCount,
}: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [label, setLabel] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isUploading, startUpload] = useTransition();

  const remainingSlot = MAX_DOCS_PER_CANDIDATE - existingCount;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    for (const file of selected) {
      if (!file.name.toLowerCase().endsWith(".pdf")) {
        setValidationError(`File "${file.name}" bukan PDF`);
        return;
      }
      if (file.size > MAX_DOC_SIZE_MB * 1024 * 1024) {
        setValidationError(
          `Ukuran file "${file.name}" melebihi ${MAX_DOC_SIZE_MB}MB`,
        );
        return;
      }
    }

    // Gabung dengan pilihan sebelumnya, buang duplikat berdasarkan nama + ukuran
    const merged = [...files];
    for (const file of selected) {
      const isDuplicate = merged.some(
        (f) => f.name === file.name && f.size === file.size,
      );
      if (!isDuplicate) merged.push(file);
    }

    if (merged.length > remainingSlot) {
      setValidationError(
        `Maksimal ${MAX_DOCS_PER_CANDIDATE} dokumen per kandidat (sisa ${remainingSlot} slot)`,
      );
      return;
    }

    setValidationError(null);
    setFiles(merged);

    // Reset input agar file yang sama bisa dipilih lagi setelah dibuang
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleRemoveFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setValidationError(null);
  }

  function resetState() {
    setFiles([]);
    setLabel("");
    setValidationError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  function handleOpenChange(next: boolean) {
    if (isUploading) return;
    if (!next) resetState();
    onOpenChange(next);
  }

  function handleUpload() {
    if (files.length === 0) {
      setValidationError("Pilih minimal 1 file PDF");
      return;
    }

    const formData = new FormData();
    formData.append("applicationId", applicationId);
    formData.append("label", label);
    files.forEach((file) => formData.append("files", file));

    startUpload(async () => {
      const result = await uploadCandidateDocuments(formData);

      if (result?.error) {
        toast.error(result.error, { position: "top-right" });
      } else {
        toast.success(`${result.count} dokumen berhasil diupload`, {
          position: "top-right",
        });
        resetState();
        onOpenChange(false);
        router.refresh();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Dokumen Pendukung</DialogTitle>
          <DialogDescription>
            Format PDF, maksimal {MAX_DOC_SIZE_MB}MB per file. Bisa pilih lebih
            dari satu file sekaligus.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="document-label">Label (opsional)</Label>
            <Input
              id="document-label"
              value={label}
              placeholder="Contoh: Ijazah S1"
              maxLength={100}
              disabled={isUploading}
              onChange={(e) => setLabel(e.target.value)}
            />
            <p className="text-muted-foreground text-xs">
              Kosongkan untuk memakai nama file asli.
            </p>
          </div>

          {/* File picker */}
          <div className="space-y-2">
            <Label>Dokumen PDF</Label>
            <label
              htmlFor="document-upload"
              className="hover:bg-muted/50 flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors"
            >
              <Upload className="text-muted-foreground mb-2 h-8 w-8" />
              <p className="text-muted-foreground text-sm">
                <span className="font-semibold">Klik untuk memilih file</span>
              </p>
              <p className="text-muted-foreground text-xs">
                PDF (MAX. {MAX_DOC_SIZE_MB}MB) &middot; sisa {remainingSlot} slot
              </p>
              <Input
                ref={inputRef}
                id="document-upload"
                type="file"
                className="hidden"
                accept="application/pdf,.pdf"
                multiple
                disabled={isUploading}
                onChange={handleFileChange}
              />
            </label>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {files.map((file, index) => (
                <div
                  key={`${file.name}-${file.size}-${index}`}
                  className="flex items-center gap-3 rounded-lg border p-2"
                >
                  <FileText className="text-primary h-6 w-6 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0"
                    disabled={isUploading}
                    onClick={() => handleRemoveFile(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {validationError && (
            <div className="text-destructive bg-destructive/10 border-destructive rounded-md border p-3 text-sm">
              {validationError}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            disabled={isUploading}
            onClick={() => handleOpenChange(false)}
          >
            Batal
          </Button>
          <Button onClick={handleUpload} disabled={isUploading || files.length === 0}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
