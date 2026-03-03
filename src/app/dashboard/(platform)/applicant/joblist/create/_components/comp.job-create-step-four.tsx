"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { QuestionItem } from "./comp.question-item";
import { QuestionFormDialog } from "./comp.question-form-dialog";
import {
  jobStepFourSchema,
  type CustomQuestionValues,
} from "@/lib/validations/job";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { toast } from "sonner";

type Props = {
  initialData: any;
  onSubmit: (data: any) => Promise<boolean>;
  onBack: () => void;
  isEdit?: boolean; // ← tambah
  lockedQuestionIds?: string[]; // ← tambah
};

export function StepFour({
  initialData,
  onSubmit,
  onBack,
  isEdit = false,
  lockedQuestionIds = [],
}: Props) {
  const [questions, setQuestions] = useState<
    (CustomQuestionValues & { id?: string })[]
  >(initialData.questions || []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<
    (CustomQuestionValues & { id?: string }) | null
  >(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  function handleAddQuestion(question: CustomQuestionValues) {
    if (editingIndex !== null) {
      // Edit existing
      const updated = [...questions];
      const existingId = questions[editingIndex].id;
      updated[editingIndex] = existingId
        ? { ...question, id: existingId }
        : question;
      setQuestions(updated);
      setEditingIndex(null);
    } else {
      // Add new
      setQuestions([...questions, question]);
    }
    setEditingQuestion(null);
    setDialogOpen(false);
  }

  function handleEditQuestion(index: number) {
    setEditingQuestion(questions[index]);
    setEditingIndex(index);
    setDialogOpen(true);
  }

  function handleDeleteQuestion(index: number) {
    const question = questions[index];

    console.log("Deleting question at index:", index);
    console.log("Question to delete:", question);

    // Check if question is locked (has answers)
    if (isEdit && question.id && lockedQuestionIds.includes(question.id)) {
      toast.error(
        "Pertanyaan ini tidak dapat dihapus karena sudah ada pelamar yang menjawab",
        {
          position: "top-right",
        },
      );
      return;
    }

    const newQuestions = questions.filter((_, i) => i !== index);
    console.log(
      "Questions after delete:",
      newQuestions.map((q) => ({ id: q.id, question: q.question })),
    );

    setQuestions(newQuestions);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = questions.findIndex((_, i) => i.toString() === active.id);
    const newIndex = questions.findIndex((_, i) => i.toString() === over.id);

    setQuestions(arrayMove(questions, oldIndex, newIndex));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);
    console.log("=== FRONTEND DEBUG ===");
    console.log("Current questions state:", questions);
    console.log(
      "Questions with IDs:",
      questions
        .filter((q) => q.id)
        .map((q) => ({ id: q.id, question: q.question })),
    );
    console.log(
      "Questions without IDs:",
      questions.filter((q) => !q.id).map((q) => q.question),
    );

    const formData = {
      questions,
    };

    console.log("Question being submited", questions);

    // Validasi dengan Zod
    const result = jobStepFourSchema.safeParse(formData);

    if (!result.success) {
      const firstError = result.error.issues[0];
      setValidationError(firstError.message);
      return;
    }
    console.log("After Validation", result.data);

    setLoading(true);
    const success = await onSubmit(result.data);

    if (!success) {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Custom Questions</h3>
            <p className="text-muted-foreground text-sm">
              Tambahkan pertanyaan khusus untuk pelamar (opsional)
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setEditingQuestion(null);
              setEditingIndex(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="mr-2 size-4" />
            Tambah Pertanyaan
          </Button>
        </div>

        {questions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground text-sm">
              Belum ada pertanyaan. Klik "Tambah Pertanyaan" untuk mulai.
            </p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={questions.map((_, i) => i.toString())}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-3">
                {questions.map((question, index) => (
                  <QuestionItem
                    key={index}
                    id={index.toString()}
                    question={question}
                    index={index}
                    onEdit={() => handleEditQuestion(index)}
                    onDelete={() => handleDeleteQuestion(index)}
                    canDelete={
                      !isEdit ||
                      !question.id ||
                      !lockedQuestionIds.includes(question.id)
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <QuestionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        initialData={editingQuestion}
        onSave={handleAddQuestion}
      />

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
          {loading ? "Menyimpan..." : "Simpan Lowongan"}
        </Button>
      </div>
    </form>
  );
}
