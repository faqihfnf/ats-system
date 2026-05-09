"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StagesHeader } from "./comp.stages-header";
import { CandidatesFilter } from "./comp.candidates-filter";
import { CandidatesTable } from "./comp.candidates-table";
import { Candidate, CandidateFilters, Job, Stage } from "@/types/types";
import { calculateAge } from "@/lib/helpers/candidate-helper";

type Props = {
  job: Job;
  candidates: Candidate[];
  stages: Stage[];
  canManageCandidateActions: boolean;
};

export function CandidatesView({
  job,
  candidates,
  stages,
  canManageCandidateActions,
}: Props) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null); // ← Add selected stage
  const [filters, setFilters] = useState<CandidateFilters>({
    search: "",
    education: "",
    gender: "",
    religion: "",
    minSalary: "",
    maxSalary: "",
    minAge: "",
    maxAge: "",
    location: "",
    yoe: "",
  });

  // Calculate candidate counts per stage
  const stageCounts = stages.map((stage) => ({
    ...stage,
    count: candidates.filter((c) => c.currentStageId === stage.id).length,
  }));

  // Filter candidates
  const filteredCandidates = candidates.filter((candidate) => {
    // Filter by selected stage (NEW)
    if (selectedStageId && candidate.currentStageId !== selectedStageId) {
      return false;
    }

    // Search by name
    if (
      filters.search &&
      !candidate.fullName.toLowerCase().includes(filters.search.toLowerCase())
    ) {
      return false;
    }

    // Filter by education
    if (filters.education && candidate.education.name !== filters.education) {
      return false;
    }

    // Filter by gender
    if (filters.gender && candidate.gender !== filters.gender) {
      return false;
    }

    // Filter by religion
    if (filters.religion && candidate.religion !== filters.religion) {
      return false;
    }

    // Filter by salary range
    if (
      filters.minSalary &&
      candidate.expectedSalary < parseInt(filters.minSalary)
    ) {
      return false;
    }
    if (
      filters.maxSalary &&
      candidate.expectedSalary > parseInt(filters.maxSalary)
    ) {
      return false;
    }

    // Filter by age range
    const age = calculateAge(candidate.birthDate);
    if (filters.minAge && age < parseInt(filters.minAge)) {
      return false;
    }
    if (filters.maxAge && age > parseInt(filters.maxAge)) {
      return false;
    }

    // Filter by location (City OR District) - NEW
    if (filters.location) {
      const searchTerm = filters.location.toLowerCase();
      const cityMatch = candidate.city.toLowerCase().includes(searchTerm);
      const districtMatch = candidate.district
        .toLowerCase()
        .includes(searchTerm);

      if (!cityMatch && !districtMatch) {
        return false;
      }
    }

    // Filter by Years of Experience
    if (filters.yoe) {
      const currentYear = new Date().getFullYear();
      const startYear = candidate.jobStartYear;
      const endYear =
        candidate.jobEndYear === "present"
          ? currentYear
          : parseInt(candidate.jobEndYear || "0");

      let yearsOfExp = 0;
      if (startYear && endYear && endYear >= startYear) {
        yearsOfExp = endYear - startYear;
      }

      switch (filters.yoe) {
        case "fresh":
          if (yearsOfExp > 0) return false; // Exactly 0 years
          break;
        case "1-2":
          if (yearsOfExp < 1 || yearsOfExp > 2) return false;
          break;
        case "3-5":
          if (yearsOfExp < 3 || yearsOfExp > 5) return false;
          break;
        case "5+":
          if (yearsOfExp < 5) return false;
          break;
      }
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <div>
        <h1 className="mb-1 text-3xl font-semibold">{job.position.nama}</h1>
        <p className="text-muted-foreground text-sm">
          {job.position.divisi.nama} • {job.position.level.nama}
        </p>
      </div>

      {/* Stages Header */}
      <StagesHeader
        stages={stageCounts}
        selectedStageId={selectedStageId}
        onStageClick={setSelectedStageId}
      />

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-6">
        {/* Filter Sidebar */}
        <div className="col-span-3">
          <CandidatesFilter
            filters={filters}
            onFiltersChange={setFilters}
            candidates={candidates}
          />
        </div>

        {/* Candidates Table */}
        <div className="col-span-9">
          <Card>
            <CandidatesTable
              candidates={filteredCandidates}
              stages={stages}
              jobId={job.id}
              canManageCandidateActions={canManageCandidateActions}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

// function calculateAge(birthDate: Date): number {
//   const today = new Date();
//   const birth = new Date(birthDate);
//   let age = today.getFullYear() - birth.getFullYear();
//   const monthDiff = today.getMonth() - birth.getMonth();

//   if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
//     age--;
//   }

//   return age;
// }
