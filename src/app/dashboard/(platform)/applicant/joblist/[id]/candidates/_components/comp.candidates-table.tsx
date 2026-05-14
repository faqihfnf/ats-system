"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "./comp.data-table";
import { columns, CandidateColumn } from "./comp.columns";
import {
  scoreAndAnalyzeCandidate,
  updateCandidateStage,
  getModelsForScoring,
} from "../_actions/action.candidates";
import type { Candidate, Stage } from "@/types/types";

type AiModel = {
  id: string;
  name: string;
  modelId: string;
};

type Props = {
  candidates: Candidate[];
  stages: Stage[];
  jobId: string;
  canManageCandidateActions: boolean;
};

export function CandidatesTable({
  candidates,
  stages,
  jobId,
  canManageCandidateActions,
}: Props) {
  const router = useRouter();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [models, setModels] = useState<AiModel[]>([]);

  useEffect(() => {
    getModelsForScoring().then(setModels);
  }, []);

  async function handleAnalyze(candidateId: string, modelId: string) {
    if (!canManageCandidateActions) return;

    setAnalyzingId(candidateId);

    const result = await scoreAndAnalyzeCandidate(candidateId, modelId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Candidate analyzed successfully!", {
        position: "top-right",
      });
      router.refresh();
    }

    setAnalyzingId(null);
  }

  async function handleStageChange(candidateId: string, stageId: string) {
    const result = await updateCandidateStage(candidateId, stageId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Stage updated successfully", { position: "top-right" });
      router.refresh();
    }
  }

  // Transform data to include necessary props for columns
  const data: CandidateColumn[] = candidates.map((candidate) => ({
    ...candidate,
    jobId,
    stages,
    canManageCandidateActions,
    onStageChange: handleStageChange,
    onAnalyze: handleAnalyze,
    analyzingId,
    models,
  }));

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground text-sm">No candidates found</p>
      </div>
    );
  }

  return <DataTable columns={columns} data={data} />;
}
