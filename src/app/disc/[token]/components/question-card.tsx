"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

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
  question: Question;
  answer: Answer | null;
  onAnswer: (questionId: string, most: "D" | "I" | "S" | "C", least: "D" | "I" | "S" | "C") => void;
};

/**
 * Fisher-Yates shuffle — randomize word order per render
 */
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function QuestionCard({ question, answer, onAnswer }: Props) {
  const [shuffledWords, setShuffledWords] = useState<Word[]>([]);
  const [selectedMost, setSelectedMost] = useState<"D" | "I" | "S" | "C" | null>(
    answer?.answerMost || null,
  );
  const [selectedLeast, setSelectedLeast] = useState<"D" | "I" | "S" | "C" | null>(
    answer?.answerLeast || null,
  );

  // Shuffle words once per question (not on re-render)
  useEffect(() => {
    setShuffledWords(shuffleArray(question.words));
    setSelectedMost(answer?.answerMost || null);
    setSelectedLeast(answer?.answerLeast || null);
  }, [question.id]);

  function handleClick(dimension: "D" | "I" | "S" | "C") {
    let newMost = selectedMost;
    let newLeast = selectedLeast;

    if (selectedMost === dimension) {
      // Deselect most
      newMost = null;
    } else if (selectedLeast === dimension) {
      // Deselect least
      newLeast = null;
    } else if (!selectedMost) {
      // First click → MOST
      newMost = dimension;
    } else if (!selectedLeast) {
      // Second click → LEAST
      newLeast = dimension;
    } else {
      // Both selected, replace LEAST
      newLeast = dimension;
    }

    setSelectedMost(newMost);
    setSelectedLeast(newLeast);

    // Notify parent if both selected
    if (newMost && newLeast) {
      onAnswer(question.id, newMost, newLeast);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-lg">
          Kelompok {question.groupNo}
        </CardTitle>
        <p className="text-center text-sm text-slate-500">
          Pilih 1 kata yang <span className="font-semibold text-green-600">PALING</span>{" "}
          menggambarkan Anda, dan 1 kata yang{" "}
          <span className="font-semibold text-red-600">PALING TIDAK</span> menggambarkan
          Anda.
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          {shuffledWords.map((word) => {
            const isMost = selectedMost === word.dimension;
            const isLeast = selectedLeast === word.dimension;

            return (
              <button
                key={word.dimension}
                onClick={() => handleClick(word.dimension)}
                className={cn(
                  "relative rounded-lg border-2 px-4 py-4 text-center text-sm font-medium transition-all",
                  "hover:border-primary/50 hover:shadow-sm",
                  "cursor-pointer select-none",
                  isMost && "border-green-500 bg-green-50 text-green-700",
                  isLeast && "border-red-500 bg-red-50 text-red-700",
                  !isMost && !isLeast && "border-slate-200 bg-white text-slate-700",
                )}
              >
                {word.word}
                {isMost && (
                  <span className="absolute top-1 right-2 text-[10px] font-bold uppercase text-green-600">
                    MOST
                  </span>
                )}
                {isLeast && (
                  <span className="absolute top-1 right-2 text-[10px] font-bold uppercase text-red-600">
                    LEAST
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border-2 border-green-500 bg-green-50" />
            <span>Paling menggambarkan (MOST)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border-2 border-red-500 bg-red-50" />
            <span>Paling tidak menggambarkan (LEAST)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
