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

type Candidate = {
  education: { name: string };
};

type Props = {
  filters: any;
  onFiltersChange: (filters: any) => void;
  candidates: Candidate[];
};

export function CandidatesFilter({
  filters,
  onFiltersChange,
  candidates,
}: Props) {
  // Get unique education values
  const educations = Array.from(
    new Set(candidates.map((c) => c.education.name)),
  );

  function handleReset() {
    onFiltersChange({
      search: "",
      education: "",
      gender: "",
      minSalary: "",
      maxSalary: "",
      minAge: "",
      maxAge: "",
      location: "",
    });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Filter & Sort</CardTitle>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          Reset
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search */}
        <div className="space-y-2">
          <Label>Search Name</Label>
          <Input
            placeholder="Search..."
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
              onFiltersChange({ ...filters, education: value })
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

        {/* Salary Range */}
        <div className="space-y-2">
          <Label>Expected Salary (Rp)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.minSalary}
              onChange={(e) =>
                onFiltersChange({ ...filters, minSalary: e.target.value })
              }
            />
            <Input
              type="number"
              placeholder="Max"
              value={filters.maxSalary}
              onChange={(e) =>
                onFiltersChange({ ...filters, maxSalary: e.target.value })
              }
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
            placeholder="City name..."
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
