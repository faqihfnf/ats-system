"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Loader2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  calculateAge,
  calculateYearsOfExperience,
  getAIRecommendationBadgeClass,
  getAIRecommendationIcon,
  getAIRecommendationShort,
  toProperCase,
} from "@/lib/helpers/candidate-helper";
import type { Candidate, Stage } from "@/types/types";
import { CandidateActions } from "./comp.candidate-actions";

export type CandidateColumn = Candidate & {
  jobId: string;
  stages: Stage[];
  canManageCandidateActions: boolean;
  onStageChange: (candidateId: string, stageId: string) => Promise<void>;
  onAnalyze: (candidateId: string, modelId: string) => Promise<void>;
  analyzingId: string | null;
  models: { id: string; name: string; modelId: string }[];
};

export const columns: ColumnDef<CandidateColumn>[] = [
  // Checkbox Column
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },

  // Full Name
  {
    id: "fullName",
    accessorKey: "fullName",
    header: "Full Name",
    meta: {
      label: "Full Name",
    },
    cell: ({ row }) => {
      const candidate = row.original;
      const initials = candidate.fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

      return (
        <Link
          href={`/dashboard/applicant/joblist/${candidate.jobId}/candidates/${candidate.id}`}
          className="flex items-center gap-3 transition-opacity hover:opacity-80"
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium hover:underline">
              {candidate.fullName}
            </p>
            <p className="text-muted-foreground text-xs">{candidate.email}</p>
            {candidate.aiRecommendation && (
              <div
                className={cn(
                  "mt-1 inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium",
                  getAIRecommendationBadgeClass(candidate.aiRecommendation),
                )}
              >
                {(() => {
                  const Icon = getAIRecommendationIcon(
                    candidate.aiRecommendation,
                  );
                  return <Icon className="h-3 w-3" />;
                })()}
                {getAIRecommendationShort(candidate.aiRecommendation)}
              </div>
            )}
          </div>
        </Link>
      );
    },
  },

  // AI Score
  {
    id: "aiScore",
    accessorKey: "aiMatchPercentage",
    header: "AI Score",
    meta: {
      label: "AI Score",
    },
    cell: ({ row }) => {
      const candidate = row.original;
      const hasAIScore = candidate.aiMatchPercentage !== null;
      const isAnalyzing = candidate.analyzingId === candidate.id;
      const [popoverOpen, setPopoverOpen] = useState(false);

      // Has score — show score circle (clickable for re-analyze)
      if (hasAIScore) {
        return (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                className={cn(
                  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-sm font-medium transition-opacity hover:opacity-80",
                  getAIRecommendationBadgeClass(candidate.aiRecommendation),
                )}
              >
                {isAnalyzing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  `${candidate.aiMatchPercentage}%`
                )}
              </div>
            </PopoverTrigger>
            <PopoverContent align="center" className="w-56 p-2">
              <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Re-analyze — Pilih Model
              </p>
              {candidate.models.length === 0 ? (
                <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                  Belum ada model. Tambahkan di menu Model.
                </p>
              ) : (
                <div className="max-h-60 overflow-y-auto">
                  {candidate.models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        candidate.onAnalyze(candidate.id, model.modelId);
                        setPopoverOpen(false);
                      }}
                      className="flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                    >
                      <span className="font-medium">{model.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {model.modelId}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </PopoverContent>
          </Popover>
        );
      }

      // No score — show model picker or loading
      if (!candidate.canManageCandidateActions) {
        return <span className="text-muted-foreground text-xs">-</span>;
      }

      if (isAnalyzing) {
        return (
          <div className="flex items-center justify-center">
            <Loader2 className="h-3 w-3 animate-spin text-primary" />
          </div>
        );
      }

      // Model picker popover
      return (
        <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="hover:text-primary hover:bg-transparent"
            >
              <Sparkles className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="center" className="w-56 p-2">
            <p className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Pilih Model AI
            </p>
            {candidate.models.length === 0 ? (
              <p className="px-2 py-3 text-center text-xs text-muted-foreground">
                Belum ada model. Tambahkan di menu Model.
              </p>
            ) : (
              <div className="max-h-60 overflow-y-auto">
                {candidate.models.map((model) => (
                  <button
                    key={model.id}
                    onClick={() => {
                      candidate.onAnalyze(candidate.id, model.modelId);
                      setPopoverOpen(false);
                    }}
                    className="flex w-full flex-col rounded-sm px-2 py-1.5 text-left text-sm hover:bg-accent"
                  >
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {model.modelId}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </PopoverContent>
        </Popover>
      );
    },
  },

  // Age
  {
    id: "age",
    header: "Age",
    meta: {
      label: "Age",
    },
    cell: ({ row }) => {
      const age = calculateAge(row.original.birthDate);
      return <span className="text-sm">{age}</span>;
    },
  },

  // City
  {
    id: "city",
    accessorKey: "city",
    header: "City",
    meta: {
      label: "City",
    },
    cell: ({ row }) => (
      <span className="text-sm">{toProperCase(row.original.city)}</span>
    ),
  },

  // Education
  {
    id: "education",
    header: "Education",
    meta: {
      label: "Education",
    },
    cell: ({ row }) => (
      <span className="text-sm">{row.original.education.name}</span>
    ),
  },

  // Expected Salary
  {
    id: "expectedSalary",
    accessorKey: "expectedSalary",
    header: "Exp. Salary",
    meta: {
      label: "Exp. Salary",
    },
    cell: ({ row }) => (
      <span className="text-sm font-medium">
        Rp {row.original.expectedSalary.toLocaleString("id-ID")}
      </span>
    ),
  },

  // Past Role
  {
    id: "pastRole",
    accessorKey: "lastJobTitle",
    header: "Past Role",
    meta: {
      label: "Past Role",
    },
    cell: ({ row }) => (
      <span className="text-sm">{row.original.lastJobTitle || "-"}</span>
    ),
  },

  // Years of Experience
  {
    id: "yoe",
    header: "YoE",
    meta: {
      label: "Years of Experience",
    },
    cell: ({ row }) => {
      const yoe = calculateYearsOfExperience(
        row.original.jobStartYear,
        row.original.jobEndYear,
      );
      return <span className="text-sm">{yoe}</span>;
    },
  },

  // === HIDDEN BY DEFAULT COLUMNS ===

  // Phone
  {
    id: "phone",
    accessorKey: "phone",
    header: "Phone",
    meta: {
      label: "Phone",
    },
    cell: ({ row }) => <span className="text-sm">{row.original.phone}</span>,
  },

  // District
  {
    id: "district",
    accessorKey: "district",
    header: "District",
    meta: {
      label: "District",
    },
    cell: ({ row }) => (
      <span className="text-sm">{toProperCase(row.original.district)}</span>
    ),
  },

  // Institution
  {
    id: "institution",
    accessorKey: "institution",
    header: "Institution",
    meta: {
      label: "Institution",
    },
    cell: ({ row }) => (
      <span className="text-sm">{row.original.institution}</span>
    ),
  },

  // Past Company
  {
    id: "pastCompany",
    accessorKey: "lastCompany",
    header: "Past Company",
    meta: {
      label: "Past Company",
    },
    cell: ({ row }) => (
      <span className="text-sm">{row.original.lastCompany || "-"}</span>
    ),
  },

  // Gender
  {
    id: "gender",
    accessorKey: "gender",
    header: "Gender",
    meta: {
      label: "Gender",
    },
    cell: ({ row }) => (
      <span className="text-xs">{toProperCase(row.original.gender)}</span>
    ),
  },

  // Religion
  {
    id: "religion",
    accessorKey: "religion",
    header: "Religion",
    meta: {
      label: "Religion",
    },
    cell: ({ row }) => (
      <span className="text-xs">{toProperCase(row.original.religion)}</span>
    ),
  },

  // Stage
  {
    id: "stage",
    header: "Stage",
    meta: {
      label: "Stage",
    },
    cell: ({ row }) => {
      const candidate = row.original;
      return (
        <Select
          value={candidate.currentStageId || ""}
          onValueChange={(value) =>
            candidate.onStageChange(candidate.id, value)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder="Select stage..." />
          </SelectTrigger>
          <SelectContent>
            {candidate.stages.map((stage) => (
              <SelectItem key={stage.id} value={stage.id}>
                {stage.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    },
  },

  // Actions
  {
    id: "actions",
    header: "Actions",
    meta: {
      label: "Actions",
    },
    cell: ({ row }) => {
      const candidate = row.original;
      if (!candidate.canManageCandidateActions) {
        return <span className="text-muted-foreground text-xs">-</span>;
      }

      return (
        <CandidateActions
          candidateId={candidate.id}
          candidateName={candidate.fullName}
          phone={candidate.phone}
          jobId={candidate.jobId}
          jobTitle={candidate.job?.position?.nama || "Unknown Job"}
          currentStage={candidate.currentStage?.name || "Not Set"}
        />
      );
    },
    enableHiding: false,
  },
];
