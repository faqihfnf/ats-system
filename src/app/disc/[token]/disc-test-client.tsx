"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { QuestionCard } from "./components/question-card";
import { TopBar } from "./components/top-bar";
import { Watermark } from "./components/watermark";
import { WarningModal } from "./components/warning-modal";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

type Word = {
  dimension: "D" | "I" | "S" | "C";
  word: string;
};

type Question = {
  id: string;
  groupNo: number;
  words: Word[];
};

type Answer = {
  questionId: string;
  answerMost: "D" | "I" | "S" | "C";
  answerLeast: "D" | "I" | "S" | "C";
};

type Props = {
  token: string;
  candidateName: string;
};

export function DiscTestClient({ token, candidateName }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionDeadline, setSessionDeadline] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [resultType, setResultType] = useState<string | null>(null);
  const [resultLabel, setResultLabel] = useState<string | null>(null);

  // Anti-cheat: tab switch
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [showWarning, setShowWarning] = useState(false);

  // Load session
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/disc/session/${token}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Gagal memuat tes");
          setLoading(false);
          return;
        }

        setQuestions(data.questions);
        setSessionDeadline(new Date(data.sessionDeadline));

        // Restore existing answers if any
        if (data.existingAnswers) {
          const restored = new Map<string, Answer>();
          for (const a of data.existingAnswers) {
            restored.set(a.questionId, {
              questionId: a.questionId,
              answerMost: a.answerMost,
              answerLeast: a.answerLeast,
            });
          }
          setAnswers(restored);
        }

        setLoading(false);
      } catch {
        setError("Terjadi kesalahan saat memuat tes");
        setLoading(false);
      }
    }

    loadSession();
  }, [token]);

  // Anti-cheat: tab visibility detection
  useEffect(() => {
    function handleVisibilityChange() {
      if (document.hidden) {
        // Tab switched away — log it
        fetch("/api/disc/log-tab-switch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        setTabSwitchCount((prev) => prev + 1);
      } else {
        // Came back — show warning
        setShowWarning(true);
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [token]);

  // Anti-cheat: disable right click
  useEffect(() => {
    function handleContextMenu(e: MouseEvent) {
      e.preventDefault();
    }
    document.addEventListener("contextmenu", handleContextMenu);
    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);

  // Auto-submit when timer expires
  const handleTimeUp = useCallback(() => {
    if (!submitting && !completed) {
      handleSubmit();
    }
  }, [submitting, completed]);

  function handleAnswer(questionId: string, most: "D" | "I" | "S" | "C", least: "D" | "I" | "S" | "C") {
    setAnswers((prev) => {
      const next = new Map(prev);
      next.set(questionId, { questionId, answerMost: most, answerLeast: least });
      return next;
    });
  }

  function goNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }

  function goPrev() {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);

    const allAnswers = Array.from(answers.values());

    try {
      const res = await fetch("/api/disc/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, answers: allAnswers }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Gagal mengirim jawaban");
        setSubmitting(false);
        return;
      }

      setCompleted(true);
      setResultType(data.result.dominantType);
      setResultLabel(data.result.profileLabel);
    } catch {
      setError("Terjadi kesalahan saat mengirim jawaban");
      setSubmitting(false);
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-slate-600">Memuat tes...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="mt-2 text-slate-600">{error}</p>
        </div>
      </div>
    );
  }

  // Completed state
  if (completed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <span className="text-2xl">✓</span>
            </div>
            <h1 className="text-2xl font-bold">Tes Selesai!</h1>
            <p className="mt-4 text-sm text-slate-600">
              Terima kasih telah menyelesaikan tes DISC. Hasil akan diproses oleh tim HR kami.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Anda dapat menutup halaman ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers.get(currentQuestion?.id);
  const isCurrentAnswered = !!currentAnswer;
  const isLastQuestion = currentIndex === questions.length - 1;
  const allAnswered = answers.size === questions.length;

  return (
    <div className="relative min-h-screen select-none bg-slate-50">
      {/* Watermark */}
      <Watermark name={candidateName} token={token} />

      {/* Warning Modal */}
      <WarningModal
        open={showWarning}
        onClose={() => setShowWarning(false)}
        count={tabSwitchCount}
      />

      {/* Top Bar */}
      <TopBar
        deadline={sessionDeadline}
        currentQuestion={currentIndex + 1}
        totalQuestions={questions.length}
        onTimeUp={handleTimeUp}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-2xl px-4 pb-8 pt-24">
        {/* Progress */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
            <span>
              Soal {currentIndex + 1} dari {questions.length}
            </span>
            <span>{answers.size} dijawab</span>
          </div>
          <Progress
            value={(answers.size / questions.length) * 100}
            className="h-2"
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <QuestionCard
            question={currentQuestion}
            answer={currentAnswer || null}
            onAnswer={handleAnswer}
          />
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentIndex === 0}
          >
            Sebelumnya
          </Button>

          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!allAnswered || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengirim...
                </>
              ) : (
                `Submit (${answers.size}/${questions.length})`
              )}
            </Button>
          ) : (
            <Button onClick={goNext} disabled={!isCurrentAnswered}>
              Selanjutnya
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
