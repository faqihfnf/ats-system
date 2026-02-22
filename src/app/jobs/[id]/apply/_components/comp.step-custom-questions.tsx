"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Question = {
  id: string;
  question: string;
  type: string;
  required: boolean;
  options: string | null;
};

type Props = {
  questions: Question[];
  initialData: any;
  onSubmit: (data: any) => Promise<boolean>;
  onBack: () => void;
};

export function StepCustomQuestions({
  questions,
  initialData,
  onSubmit,
  onBack,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, any>>(
    initialData.answers || {},
  );
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAnswerChange(questionId: string, value: any) {
    setAnswers({ ...answers, [questionId]: value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    // Validate required questions
    const missingRequired = questions.filter(
      (q) => q.required && (!answers[q.id] || answers[q.id] === ""),
    );

    if (missingRequired.length > 0) {
      setValidationError("Mohon jawab semua pertanyaan yang wajib diisi");
      return;
    }

    // Format answers for submission
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      answer:
        typeof answers[q.id] === "object"
          ? JSON.stringify(answers[q.id])
          : String(answers[q.id] || ""),
    }));

    setLoading(true);
    const success = await onSubmit({ answers: formattedAnswers });

    if (!success) {
      setLoading(false);
    }
  }

  function renderQuestion(question: Question) {
    const options = question.options ? JSON.parse(question.options) : [];

    switch (question.type) {
      case "SHORT_TEXT":
        return (
          <Input
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Ketik jawaban Anda..."
            required={question.required}
          />
        );

      case "LONG_TEXT":
        return (
          <Textarea
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="Ketik jawaban Anda..."
            rows={4}
            required={question.required}
          />
        );

      case "NUMBER":
        return (
          <Input
            type="number"
            value={answers[question.id] || ""}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            placeholder="0"
            required={question.required}
          />
        );

      case "DATE":
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !answers[question.id] && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {answers[question.id] ? (
                  format(new Date(answers[question.id]), "PPP", {
                    locale: idLocale,
                  })
                ) : (
                  <span>Pilih tanggal</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={
                  answers[question.id]
                    ? new Date(answers[question.id])
                    : undefined
                }
                onSelect={(date) =>
                  handleAnswerChange(question.id, date?.toISOString())
                }
                initialFocus
              />
            </PopoverContent>
          </Popover>
        );

      case "MULTIPLE_CHOICE":
        return (
          <RadioGroup
            value={answers[question.id]}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            {options.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`${question.id}-${idx}`} />
                <Label
                  htmlFor={`${question.id}-${idx}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        );

      case "CHECKBOX":
        const selectedOptions = answers[question.id] || [];
        return (
          <div className="space-y-2">
            {options.map((option: string, idx: number) => (
              <div key={idx} className="flex items-center space-x-2">
                <Checkbox
                  id={`${question.id}-${idx}`}
                  checked={selectedOptions.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      handleAnswerChange(question.id, [
                        ...selectedOptions,
                        option,
                      ]);
                    } else {
                      handleAnswerChange(
                        question.id,
                        selectedOptions.filter((o: string) => o !== option),
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`${question.id}-${idx}`}
                  className="cursor-pointer"
                >
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );

      case "DROPDOWN":
        return (
          <Select
            value={answers[question.id]}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih jawaban..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((option: string, idx: number) => (
                <SelectItem key={idx} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case "YES_NO":
        return (
          <RadioGroup
            value={answers[question.id]}
            onValueChange={(value) => handleAnswerChange(question.id, value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="yes" id={`${question.id}-yes`} />
              <Label htmlFor={`${question.id}-yes`} className="cursor-pointer">
                Ya
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="no" id={`${question.id}-no`} />
              <Label htmlFor={`${question.id}-no`} className="cursor-pointer">
                Tidak
              </Label>
            </div>
          </RadioGroup>
        );

      default:
        return null;
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={question.id} className="space-y-2">
            <Label>
              {index + 1}. {question.question}
              {question.required && (
                <span className="text-destructive"> *</span>
              )}
            </Label>
            {renderQuestion(question)}
          </div>
        ))}
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
          disabled={loading}
        >
          Kembali
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Mengirim..." : "Kirim Lamaran"}
        </Button>
      </div>
    </form>
  );
}
