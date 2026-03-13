"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { StagesHeader } from "./comp.stages-header";
import { CandidatesFilter } from "./comp.candidates-filter";
import { CandidatesTable } from "./comp.candidates-table";

type Job = {
  id: string;
  position: {
    nama: string;
    divisi: { nama: string };
    level: { nama: string };
  };
};

type Candidate = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  birthDate: Date;
  totalScore: number;
  gender: string;
  religion: string;
  province: string;
  city: string;
  district: string;
  subdistrict: string;
  education: { name: string };
  institution: string;
  lastJobTitle: string | null;
  lastCompany: string | null;
  jobStartYear: number | null;
  jobEndYear: string | null;
  expectedSalary: number;
  currentStageId: string | null;
  currentStage: { id: string; name: string; order: number } | null;
  status: string;
  createdAt: Date;
  aiRecommendation: "RECOMMENDED" | "SUGGESTED" | "NOT_RECOMMENDED" | null;
};

type Stage = {
  id: string;
  name: string;
  order: number;
};

type Props = {
  job: Job;
  candidates: Candidate[];
  stages: Stage[];
};

export function CandidatesView({ job, candidates, stages }: Props) {
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null); // ← Add selected stage
  const [filters, setFilters] = useState({
    search: "",
    education: "",
    gender: "",
    minSalary: "",
    maxSalary: "",
    minAge: "",
    maxAge: "",
    location: "",
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

    // Filter by location
    if (
      filters.location &&
      !candidate.city.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Job Header */}
      <div>
        <h1 className="text-2xl font-semibold">{job.position.nama}</h1>
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
            />
          </Card>
        </div>
      </div>
    </div>
  );
}

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
