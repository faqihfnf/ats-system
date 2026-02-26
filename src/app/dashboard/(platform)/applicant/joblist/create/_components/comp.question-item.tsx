"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GripVertical, Pencil, Trash2 } from "lucide-react";
import type { CustomQuestionValues } from "@/lib/validations/job";

type Props = {
  id: string;
  question: CustomQuestionValues & { id?: string };
  index: number;
  onEdit: () => void;
  onDelete: () => void;
  canDelete?: boolean; // ← tambah prop
};

const questionTypeLabels = {
  SHORT_TEXT: "Text Pendek",
  LONG_TEXT: "Text Panjang",
  NUMBER: "Angka",
  DATE: "Tanggal",
  MULTIPLE_CHOICE: "Pilihan Ganda",
  CHECKBOX: "Checkbox",
  DROPDOWN: "Dropdown",
  YES_NO: "Ya/Tidak",
};

export function QuestionItem({
  id,
  question,
  index,
  onEdit,
  onDelete,
  canDelete = true,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-background flex items-start gap-3 rounded-lg border p-4"
    >
      <button
        {...attributes}
        {...listeners}
        type="button"
        suppressHydrationWarning
        className="text-muted-foreground hover:text-foreground mt-1 cursor-grab active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <p className="font-medium">
              {index + 1}. {question.question}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {questionTypeLabels[question.type]}
              </Badge>
              {question.required && (
                <Badge variant="destructive" className="text-xs">
                  Wajib
                </Badge>
              )}
              {!canDelete && (
                <Badge
                  variant="outline"
                  className="border-amber-600 text-xs text-amber-600"
                >
                  🔒 Terjawab
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onEdit}
              suppressHydrationWarning
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={onDelete}
              suppressHydrationWarning
              className="text-destructive hover:text-destructive"
              disabled={!canDelete}
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        </div>

        {question.options && question.options.length > 0 && (
          <div className="text-muted-foreground text-sm">
            Opsi: {question.options.join(", ")}
          </div>
        )}
      </div>
    </div>
  );
}
