import { cn } from "@/lib/utils";

type Stage = {
  id: string;
  name: string;
  order: number;
  count: number;
};

type Props = {
  stages: Stage[];
  selectedStageId: string | null;
  onStageClick: (stageId: string | null) => void;
};

export function StagesHeader({ stages, selectedStageId, onStageClick }: Props) {
  // Helper to check if stage is reject
  const isRejectStage = (stageName: string) => {
    return stageName.toLowerCase().includes("reject");
  };

  return (
    <div className="w-full overflow-x-auto pb-2">
      <div className="flex min-w-max items-center gap-4 px-1 py-1">
        {/* All Candidates Button */}
        <button
          onClick={() => onStageClick(null)}
          className={cn(
            "flex min-w-32 cursor-pointer flex-col items-center rounded-xl border-2 p-4 transition-all",
            selectedStageId === null
              ? "bg-primary/10 border-primary shadow-sm"
              : "hover:bg-muted hover:border-border border-transparent",
          )}
        >
          <div className="relative">
            <div
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                selectedStageId === null
                  ? "bg-primary text-primary-foreground"
                  : "bg-primary/10",
              )}
            >
              <span
                className={cn(
                  "text-xl font-bold",
                  selectedStageId === null
                    ? "text-primary-foreground"
                    : "text-primary",
                )}
              >
                {stages.reduce((sum, stage) => sum + stage.count, 0)}
              </span>
            </div>
          </div>
          <p
            className={cn(
              "mt-2 text-center text-xs font-medium tracking-wide uppercase",
              selectedStageId === null
                ? "text-primary"
                : "text-muted-foreground",
            )}
          >
            All Candidates
          </p>
        </button>

        <div className="bg-border h-8 w-px" />

        {/* Stage Buttons */}
        {stages.map((stage, idx) => {
          const isRejected = isRejectStage(stage.name);
          const isSelected = selectedStageId === stage.id;

          return (
            <div key={stage.id} className="flex items-center gap-4">
              <button
                onClick={() => onStageClick(stage.id)}
                className={cn(
                  "flex min-w-32 cursor-pointer flex-col items-center rounded-xl border-2 p-4 transition-all",
                  isSelected
                    ? isRejected
                      ? "bg-destructive/10 border-destructive shadow-sm" // ← Reject selected
                      : "bg-primary/10 border-primary shadow-sm" // ← Normal selected
                    : "hover:bg-muted hover:border-border border-transparent",
                )}
              >
                <div className="relative">
                  <div
                    className={cn(
                      "flex h-12 w-12 items-center justify-center rounded-full transition-colors",
                      isSelected
                        ? isRejected
                          ? "bg-destructive text-primary-foreground" // ← Reject selected
                          : "bg-primary text-primary-foreground" // ← Normal selected
                        : isRejected
                          ? "bg-destructive/10" // ← Reject not selected
                          : "bg-primary/10", // ← Normal not selected
                    )}
                  >
                    <span
                      className={cn(
                        "text-xl font-bold",
                        isSelected
                          ? isRejected
                            ? "text-destructive-foreground"
                            : "text-primary-foreground"
                          : isRejected
                            ? "text-destructive"
                            : "text-primary",
                      )}
                    >
                      {stage.count}
                    </span>
                  </div>
                </div>
                <p
                  className={cn(
                    "mt-2 text-center text-xs font-medium tracking-wide uppercase",
                    isSelected
                      ? isRejected
                        ? "text-destructive"
                        : "text-primary"
                      : isRejected
                        ? "text-destructive"
                        : "text-muted-foreground",
                  )}
                >
                  {stage.name}
                </p>
              </button>

              {idx < stages.length - 1 && (
                <div className="bg-border h-0.5 w-8" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
