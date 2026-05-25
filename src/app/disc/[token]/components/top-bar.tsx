"use client";

import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

type Props = {
  deadline: Date | null;
  currentQuestion: number;
  totalQuestions: number;
  onTimeUp: () => void;
};

export function TopBar({ deadline, currentQuestion, totalQuestions, onTimeUp }: Props) {
  const [timeLeft, setTimeLeft] = useState<string>("--:--");
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    if (!deadline) return;

    function updateTimer() {
      const now = new Date();
      const diff = deadline!.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("00:00");
        onTimeUp();
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);

      setTimeLeft(
        `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
      );
      setIsUrgent(minutes < 10);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [deadline, onTimeUp]);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 border-b bg-white shadow-sm">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold">DISC Personality Test</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-slate-500">
            {currentQuestion} / {totalQuestions}
          </span>

          <div
            className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-mono font-medium ${
              isUrgent
                ? "bg-red-100 text-red-700 animate-pulse"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            <Clock className="h-4 w-4" />
            {timeLeft}
          </div>
        </div>
      </div>
    </div>
  );
}
