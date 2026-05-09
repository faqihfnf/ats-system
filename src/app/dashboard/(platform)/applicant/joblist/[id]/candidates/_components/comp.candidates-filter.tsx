"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toProperCase } from "@/lib/helpers/candidate-helper";
import { useState, useCallback } from "react";

function formatRupiahInput(value: string): string {
  if (!value) return "";
  const num = value.replace(/\D/g, "");
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function parseRupiahInput(value: string): string {
  return value.replace(/\D/g, "");
}
import { Candidate, CandidateFilters } from "@/types/types";

type Props = {
  filters: any;
  onFiltersChange: (filters: CandidateFilters) => void;
  candidates: Candidate[];
};

export function CandidatesFilter({
  filters,
  onFiltersChange,
  candidates,
}: Props) {
  const [resetKey, setResetKey] = useState(0);
  const [minSalaryDisplay, setMinSalaryDisplay] = useState(
    formatRupiahInput(filters.minSalary),
  );
  const [maxSalaryDisplay, setMaxSalaryDisplay] = useState(
    formatRupiahInput(filters.maxSalary),
  );

  // Get unique values
  const educations = Array.from(
    new Set(candidates.map((c) => c.education.name)),
  );
  const religions = Array.from(new Set(candidates.map((c) => c.religion)));

  function handleReset() {
    onFiltersChange({
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
    setMinSalaryDisplay("");
    setMaxSalaryDisplay("");
    setResetKey((prev) => prev + 1);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl">Filter & Sort</CardTitle>
        <Button variant="ghost" size="lg" onClick={handleReset}>
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4" key={resetKey}>
        {" "}
        {/* ← Add key here */}
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Name</Label>
          <Input
            placeholder="Cari Nama..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
          />
        </div>
        {/* Education */}
        <div className="space-y-2">
          <Label>Education</Label>
          <Select
            value={filters.education || undefined}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                education: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {educations.map((edu) => (
                <SelectItem key={edu} value={edu}>
                  {edu}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Years of Experience */}
        <div className="space-y-2">
          <Label>Years of Experience</Label>
          <Select
            value={filters.yoe || undefined}
            onValueChange={(value) =>
              onFiltersChange({
                ...filters,
                yoe: value === "all" ? "" : value,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="fresh">Fresh Graduate (0 years)</SelectItem>
              <SelectItem value="1-2">1 - 2 years</SelectItem>
              <SelectItem value="3-5">3 - 5 years</SelectItem>
              <SelectItem value="5+">5+ years</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Gender & Religion */}
        <div className="grid grid-cols-2 gap-2">
          {/* Gender */}
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={filters.gender || undefined}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  gender: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="MALE">Male</SelectItem>
                <SelectItem value="FEMALE">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Religion */}
          <div className="space-y-2">
            <Label>Religion</Label>
            <Select
              value={filters.religion || undefined}
              onValueChange={(value) =>
                onFiltersChange({
                  ...filters,
                  religion: value === "all" ? "" : value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {religions.map((religion: string) => (
                  <SelectItem key={religion} value={religion}>
                    {toProperCase(religion)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {/* Salary Range */}
        <div className="space-y-2">
          <Label>Expected Salary (Rp)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              inputMode="numeric"
              placeholder="Min"
              value={minSalaryDisplay}
              onChange={(e) => {
                const raw = parseRupiahInput(e.target.value);
                setMinSalaryDisplay(formatRupiahInput(raw));
                onFiltersChange({ ...filters, minSalary: raw });
              }}
            />
            <Input
              inputMode="numeric"
              placeholder="Max"
              value={maxSalaryDisplay}
              onChange={(e) => {
                const raw = parseRupiahInput(e.target.value);
                setMaxSalaryDisplay(formatRupiahInput(raw));
                onFiltersChange({ ...filters, maxSalary: raw });
              }}
            />
          </div>
        </div>
        {/* Age Range */}
        <div className="space-y-2">
          <Label>Age</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minAge}
              onChange={(e) =>
                onFiltersChange({ ...filters, minAge: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxAge}
              onChange={(e) =>
                onFiltersChange({ ...filters, maxAge: e.target.value })
              }
            />
          </div>
        </div>
        {/* Location */}
        <div className="space-y-2">
          <Label>Location</Label>
          <Input
            placeholder="Cari Kota atau Kecamatan..."
            value={filters.location}
            onChange={(e) =>
              onFiltersChange({ ...filters, location: e.target.value })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
