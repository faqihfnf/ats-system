"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type Props = {
  jobId: string;
  prevCandidate: { id: string; fullName: string } | null;
  nextCandidate: { id: string; fullName: string } | null;
  current: number;
  total: number;
};

export function CandidateDetailHeader({
  jobId,
  prevCandidate,
  nextCandidate,
  current,
  total,
}: Props) {
  return (
    <div className="flex items-center gap-2">
      {/* Prev Button */}
      <Link
        href={
          prevCandidate
            ? `/dashboard/applicant/joblist/${jobId}/candidates/${prevCandidate.id}`
            : "#"
        }
      >
        <Button
          variant="outline"
          size="sm"
          disabled={!prevCandidate}
          title={
            prevCandidate
              ? `Previous: ${prevCandidate.fullName}`
              : "No previous candidate"
          }
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
      </Link>
      {/* Counter */}
      <span className="text-muted-foreground text-sm">
        {current} of {total}
      </span>
      {/* Next Button */}
      <Link
        href={
          nextCandidate
            ? `/dashboard/applicant/joblist/${jobId}/candidates/${nextCandidate.id}`
            : "#"
        }
      >
        <Button
          variant="outline"
          size="sm"
          disabled={!nextCandidate}
          title={
            nextCandidate
              ? `Next: ${nextCandidate.fullName}`
              : "No next candidate"
          }
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}
