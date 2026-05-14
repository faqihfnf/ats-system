"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sparkles,
  ThumbsUp,
  ThumbsDown,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  scoreAndAnalyzeCandidate,
  getModelsForScoring,
} from "../../../_actions/action.candidates";
import {
  getAIRecommendationBadgeClass,
  getAIRecommendationColor,
  getAIRecommendationIcon,
  getAIRecommendationLabel,
} from "@/lib/helpers/candidate-helper";
import { cn } from "@/lib/utils";

type AiModel = {
  id: string;
  name: string;
  modelId: string;
};

type Props = {
  candidateId: string;
  aiStrengths: string | null;
  aiWeaknesses: string | null;
  aiConclusion: string | null;
  aiRecommendation: string | null;
  aiMatchPercentage: number | null;
  analyzedAt: Date | null;
  canAnalyze: boolean;
};

export function AIAnalysis({
  candidateId,
  aiStrengths,
  aiWeaknesses,
  aiConclusion,
  aiRecommendation,
  aiMatchPercentage,
  analyzedAt,
  canAnalyze,
}: Props) {
  const router = useRouter();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [models, setModels] = useState<AiModel[]>([]);
  const [popoverOpen, setPopoverOpen] = useState(false);

  const hasAnalysis = aiStrengths !== null && aiWeaknesses !== null;

  useEffect(() => {
    getModelsForScoring().then(setModels);
  }, []);

  async function handleAnalyze(modelId: string) {
    if (!canAnalyze) return;

    setIsAnalyzing(true);
    setPopoverOpen(false);

    try {
      const result = await scoreAndAnalyzeCandidate(candidateId, modelId);

      if (result?.error) {
        toast.error(result.error, { position: "top-right" });
      } else {
        toast.success("Candidate analyzed successfully!", {
          position: "top-right",
        });
        router.refresh();
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setIsAnalyzing(false);
    }
  }

  const analyzeButton = isAnalyzing ? (
    <Button disabled size="lg">
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Analyzing CV...
    </Button>
  ) : (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button size="lg">
          <Sparkles className="mr-2 h-4 w-4" />
          Analyze with AI
        </Button>
      </PopoverTrigger>
      <PopoverContent align="center" className="w-64 p-2">
        <p className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
          Pilih Model AI
        </p>
        {models.length === 0 ? (
          <p className="text-muted-foreground px-2 py-3 text-center text-xs">
            Belum ada model. Tambahkan di menu Model.
          </p>
        ) : (
          <div className="max-h-60 overflow-y-auto">
            {models.map((model) => (
              <button
                key={model.id}
                onClick={() => handleAnalyze(model.modelId)}
                className="hover:bg-accent flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm"
              >
                <span className="font-medium">{model.name}</span>
                <span className="text-muted-foreground text-xs">
                  {model.modelId}
                </span>
              </button>
            ))}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );

  if (!hasAnalysis) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Sparkles className="h-5 w-5" />
            AI Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Sparkles className="text-muted-foreground mb-4 h-16 w-16" />
          <p className="text-muted-foreground mb-2 text-center font-medium">
            Analisis CV belum dilakukan
          </p>
          <p className="text-muted-foreground mb-6 max-w-md text-center text-sm">
            Pilih model AI dan klik untuk menganalisis CV kandidat
          </p>
          {canAnalyze ? (
            analyzeButton
          ) : (
            <p className="text-muted-foreground text-center text-sm">
              Role User tidak memiliki akses analisis AI.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5" />
          AI Analysis
        </CardTitle>
        {canAnalyze &&
          (isAnalyzing ? (
            <Button variant="outline" size="sm" disabled>
              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
              Re-analyzing...
            </Button>
          ) : (
            <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  Re-analyze
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-64 p-2">
                <p className="text-muted-foreground px-2 py-1.5 text-xs font-semibold">
                  Pilih Model AI
                </p>
                {models.length === 0 ? (
                  <p className="text-muted-foreground px-2 py-3 text-center text-xs">
                    Belum ada model. Tambahkan di menu Model.
                  </p>
                ) : (
                  <div className="max-h-60 overflow-y-auto">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => handleAnalyze(model.modelId)}
                        className="hover:bg-accent flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm"
                      >
                        <span className="font-medium">{model.name}</span>
                        <span className="text-muted-foreground text-xs">
                          {model.modelId}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </PopoverContent>
            </Popover>
          ))}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Disclaimer */}
        <Alert variant="warning" className="text-sm">
          <AlertCircle className="-mt-1 mr-2 h-5 w-5" />
          <AlertDescription className="mt-1">
            AI analysis can be inaccurate or misleading in some cases. Please
            double check the results!
          </AlertDescription>
        </Alert>

        {/* Main Layout: Score Circle + Kesimpulan */}
        <div className="grid grid-cols-3 gap-6">
          {/* Left: AI Match Score Circle */}
          <div className="col-span-1 flex flex-col items-center justify-center">
            <div className="relative h-40 w-40">
              <svg className="h-full w-full -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  className="text-muted"
                />
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={`${((aiMatchPercentage || 0) / 100) * 439.6} 439.6`}
                  className={getAIRecommendationColor(aiRecommendation)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold">{aiMatchPercentage}%</span>
                <span className="text-muted-foreground mt-1 text-xs">
                  Match Score
                </span>
              </div>
            </div>
            {/* Badge with icon */}
            <div
              className={cn(
                "mt-4 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium",
                getAIRecommendationBadgeClass(aiRecommendation),
              )}
            >
              {(() => {
                const Icon = getAIRecommendationIcon(aiRecommendation);
                return <Icon className="h-4 w-4" />;
              })()}
              {getAIRecommendationLabel(aiRecommendation)}
            </div>
            {analyzedAt && (
              <p className="text-muted-foreground mt-3 text-center text-xs">
                Analyzed on
                <br />
                {new Date(analyzedAt).toLocaleString("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </p>
            )}
          </div>

          {/* Right: Kesimpulan */}
          <div className="col-span-2">
            <div className="flex h-full flex-col space-y-2">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <h4 className="text-sm font-semibold">Kesimpulan</h4>
              </div>
              <div className="flex flex-1 items-center rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm leading-relaxed text-blue-900 dark:text-blue-100">
                  {aiConclusion}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Kelebihan & Kekurangan */}
        <div className="grid grid-cols-2 gap-6">
          {/* Kelebihan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsUp className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-semibold">Kelebihan</h4>
            </div>
            <div className="min-h-50 rounded-lg bg-green-50 p-4 dark:bg-green-950">
              <p className="text-sm whitespace-pre-line text-green-900 dark:text-green-100">
                {aiStrengths}
              </p>
            </div>
          </div>

          {/* Kekurangan */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ThumbsDown className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-semibold">Kekurangan</h4>
            </div>
            <div className="min-h-50 rounded-lg bg-red-50 p-4 dark:bg-red-950">
              <p className="text-sm whitespace-pre-line text-red-900 dark:text-red-100">
                {aiWeaknesses}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
