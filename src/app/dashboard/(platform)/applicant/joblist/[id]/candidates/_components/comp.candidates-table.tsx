"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DataTable } from "./comp.data-table";
import { columns, CandidateColumn } from "./comp.columns";
import {
  scoreAndAnalyzeCandidate,
  updateCandidateStage,
  bulkUpdateStage,
  getModelsForScoring,
} from "../_actions/action.candidates";
import type { Candidate, Stage } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRightLeft } from "lucide-react";

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
  const [bulkStageId, setBulkStageId] = useState<string>("");
  const [isBulkUpdating, setIsBulkUpdating] = useState(false);

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

  async function handleBulkStageChange(selectedCandidates: CandidateColumn[]) {
    if (!bulkStageId) {
      toast.error("Pilih stage terlebih dahulu", { position: "top-right" });
      return;
    }

    setIsBulkUpdating(true);

    const ids = selectedCandidates.map((c) => c.id);
    const result = await bulkUpdateStage(ids, bulkStageId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success(
        `${result.count} kandidat berhasil dipindahkan stage`,
        { position: "top-right" },
      );
      setBulkStageId("");
      router.refresh();
    }

    setIsBulkUpdating(false);
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

  return (
    <DataTable
      columns={columns}
      data={data}
      bulkActions={
        canManageCandidateActions
          ? (selectedRows) => (
              <div className="flex items-center gap-2">
                <Select value={bulkStageId} onValueChange={setBulkStageId}>
                  <SelectTrigger className="h-8 w-40 bg-white text-xs">
                    <SelectValue placeholder="Pilih stage..." />
                  </SelectTrigger>
                  <SelectContent>
                    {stages.map((stage) => (
                      <SelectItem key={stage.id} value={stage.id}>
                        {stage.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="default"
                  className="h-8"
                  disabled={!bulkStageId || isBulkUpdating}
                  onClick={() => handleBulkStageChange(selectedRows as CandidateColumn[])}
                >
                  <ArrowRightLeft className="mr-1 h-3 w-3" />
                  {isBulkUpdating ? "Memproses..." : "Pindah Stage"}
                </Button>
              </div>
            )
          : undefined
      }
    />
  );
}
