"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { updateCandidateStage } from "../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Candidate = {
  id: string;
  fullName: string;
  email: string;
  birthDate: Date;
  city: string;
  expectedSalary: number;
  lastJobTitle: string | null;
  lastCompany: string | null;
  jobStartYear: number | null;
  jobEndYear: string | null;
  currentStageId: string | null;
  currentStage: { id: string; name: string } | null;
};

type Stage = {
  id: string;
  name: string;
  order: number;
};

type Props = {
  candidates: Candidate[];
  stages: Stage[];
};

export function CandidatesTable({ candidates, stages }: Props) {
  const router = useRouter();

  async function handleStageChange(candidateId: string, stageId: string) {
    const result = await updateCandidateStage(candidateId, stageId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Stage updated successfully", { position: "top-right" });
      router.refresh();
    }
  }

  if (candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <p className="text-muted-foreground text-sm">No candidates found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-62.5">Full Name</TableHead>
            <TableHead className="w-20 text-center">Age</TableHead>
            <TableHead className="w-37.5">Location</TableHead>
            <TableHead className="w-32.5 text-right">Min. Salary</TableHead>
            <TableHead className="w-37.5">Past Role</TableHead>
            <TableHead className="w-37.5">Past Company</TableHead>
            <TableHead className="w-20 text-center">YoE</TableHead>
            <TableHead className="w-45">Stage</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => {
            const age = calculateAge(candidate.birthDate);
            const yoe = calculateYoE(
              candidate.jobStartYear,
              candidate.jobEndYear,
            );
            const initials = candidate.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <TableRow key={candidate.id}>
                {/* Full Name */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">
                        {candidate.fullName}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {candidate.email}
                      </p>
                    </div>
                  </div>
                </TableCell>

                {/* Age */}
                <TableCell className="text-center">
                  <span className="text-sm">{age}</span>
                </TableCell>

                {/* Location */}
                <TableCell>
                  <span className="text-sm">{candidate.city}</span>
                </TableCell>

                {/* Expected Salary */}
                <TableCell className="text-right">
                  <span className="text-sm font-medium">
                    Rp {candidate.expectedSalary.toLocaleString("id-ID")}
                  </span>
                </TableCell>

                {/* Past Role */}
                <TableCell>
                  <span className="text-sm">
                    {candidate.lastJobTitle || "-"}
                  </span>
                </TableCell>

                {/* Past Company */}
                <TableCell>
                  <span className="text-sm">
                    {candidate.lastCompany || "-"}
                  </span>
                </TableCell>

                {/* Years of Experience */}
                <TableCell className="text-center">
                  <span className="text-sm">{yoe}</span>
                </TableCell>

                {/* Stage Selector */}
                <TableCell>
                  <Select
                    value={candidate.currentStageId || ""}
                    onValueChange={(value) =>
                      handleStageChange(candidate.id, value)
                    }
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Select stage..." />
                    </SelectTrigger>
                    <SelectContent>
                      {stages.map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

// Helper: Calculate age from birth date
function calculateAge(birthDate: Date): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }

  return age;
}

// Helper: Calculate Years of Experience
function calculateYoE(
  startYear: number | null,
  endYear: string | null,
): string {
  if (!startYear) return "Fresh Graduate";

  const currentYear = new Date().getFullYear();
  const end = endYear === "present" ? currentYear : parseInt(endYear || "0");

  if (!end || end < startYear) return "Fresh Graduate";

  const years = end - startYear;

  if (years === 0) return "< 1 year";
  if (years === 1) return "1 year";
  return `${years} years`;
}
