"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { CustomQuestionValues } from "@/lib/validations/job";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: CustomQuestionValues | null;
  onSave: (question: CustomQuestionValues) => void;
};

const questionTypes = [
  { value: "SHORT_TEXT", label: "Text Pendek" },
  { value: "LONG_TEXT", label: "Text Panjang" },
  { value: "NUMBER", label: "Angka" },
  { value: "DATE", label: "Tanggal" },
  { value: "MULTIPLE_CHOICE", label: "Pilihan Ganda" },
  { value: "CHECKBOX", label: "Checkbox" },
  { value: "DROPDOWN", label: "Dropdown" },
  { value: "YES_NO", label: "Ya/Tidak" },
];

export function QuestionFormDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
}: Props) {
  const [question, setQuestion] = useState("");
  const [type, setType] = useState<string>("SHORT_TEXT");
  const [required, setRequired] = useState(false);
  const [options, setOptions] = useState<string[]>([""]);
  const [error, setError] = useState<string | null>(null);

  // Reset form when dialog opens/closes or initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        setQuestion(initialData.question);
        setType(initialData.type);
        setRequired(initialData.required);
        setOptions(initialData.options || [""]);
      } else {
        setQuestion("");
        setType("SHORT_TEXT");
        setRequired(false);
        setOptions([""]);
      }
      setError(null);
    }
  }, [open, initialData]);

  const needsOptions = ["MULTIPLE_CHOICE", "CHECKBOX", "DROPDOWN"].includes(
    type,
  );

  function handleAddOption() {
    setOptions([...options, ""]);
  }

  function handleRemoveOption(index: number) {
    setOptions(options.filter((_, i) => i !== index));
  }

  function handleOptionChange(index: number, value: string) {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  }

  function handleSave() {
    setError(null);

    if (!question.trim()) {
      setError("Pertanyaan tidak boleh kosong");
      return;
    }

    if (needsOptions) {
      const filledOptions = options.filter((opt) => opt.trim() !== "");
      if (filledOptions.length < 2) {
        setError("Minimal 2 opsi jawaban diperlukan");
        return;
      }
      onSave({
        question: question.trim(),
        type: type as any,
        required,
        options: filledOptions,
      });
    } else {
      onSave({
        question: question.trim(),
        type: type as any,
        required,
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {initialData ? "Edit Pertanyaan" : "Tambah Pertanyaan"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Question */}
          <div className="space-y-2">
            <Label htmlFor="question">Pertanyaan *</Label>
            <Textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Contoh: Ceritakan pengalaman terbaik Anda..."
              rows={3}
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label>Tipe Jawaban *</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {questionTypes.map((qt) => (
                  <SelectItem key={qt.value} value={qt.value}>
                    {qt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Options (if needed) */}
          {needsOptions && (
            <div className="space-y-2">
              <Label>Opsi Jawaban *</Label>
              <div className="space-y-2">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`Opsi ${index + 1}`}
                    />
                    {options.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="size-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddOption}
                >
                  Tambah Opsi
                </Button>
              </div>
            </div>
          )}

          {/* Required */}
          <div className="flex items-center gap-2">
            <Switch
              id="required"
              checked={required}
              onCheckedChange={setRequired}
            />
            <Label htmlFor="required" className="cursor-pointer">
              Wajib diisi
            </Label>
          </div>

          {error && (
            <div className="text-destructive bg-destructive/10 border-destructive rounded-md border p-3 text-sm">
              {error}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button onClick={handleSave}>Simpan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
