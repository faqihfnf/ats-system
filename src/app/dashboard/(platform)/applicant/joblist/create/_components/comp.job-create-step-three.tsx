"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { jobStepThreeSchema } from "@/lib/validations/job";

type Education = { id: string; name: string };
type Experience = { id: string; name: string; minYears: number };

type Props = {
  educations: Education[];
  experiences: Experience[];
  initialData: any;
onSubmit: (data: any) => Promise<boolean>;
  onBack: () => void;
};

export function StepThree({ educations, experiences, initialData, onSubmit, onBack }: Props) {
  const [selectedEducation, setSelectedEducation] = useState(initialData.minEducationId || "");
  const [selectedExperience, setSelectedExperience] = useState(initialData.minExperienceId || "");
  const [minAge, setMinAge] = useState(initialData.minAge || 18);
  const [maxAge, setMaxAge] = useState(initialData.maxAge || 40);
  const [showAge, setShowAge] = useState(initialData.showAge || false);
  const [gender, setGender] = useState(initialData.gender || "ANY");
  const [showGender, setShowGender] = useState(initialData.showGender || false);
  const [religion, setReligion] = useState(initialData.religion || "ANY");
  const [showReligion, setShowReligion] = useState(initialData.showReligion || false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setValidationError(null);

  const formData = {
    minEducationId: selectedEducation,
    minExperienceId: selectedExperience,
    minAge,
    maxAge,
    showAge,
    gender,
    showGender,
    religion,
    showReligion,
  };

  // Validasi dengan Zod
  const result = jobStepThreeSchema.safeParse(formData);

  if (!result.success) {
    const firstError = result.error.issues[0];
    setValidationError(firstError.message);
    return;
  }

  setLoading(true);
  const success = await onSubmit(result.data);
  
  // Only stop loading if submission failed
  if (!success) {
    setLoading(false);
  }
  // If success, loading will continue until redirect happens
}

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Pendidikan Minimal */}
        <div className="col-span-2 space-y-2">
          <Label>Pendidikan Minimal *</Label>
          <Select value={selectedEducation} onValueChange={setSelectedEducation}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih pendidikan minimal..." />
            </SelectTrigger>
            <SelectContent>
              {educations.map((edu) => (
                <SelectItem key={edu.id} value={edu.id}>
                  {edu.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pengalaman Minimal */}
        <div className="col-span-2 space-y-2">
          <Label>Pengalaman Minimal *</Label>
          <Select value={selectedExperience} onValueChange={setSelectedExperience}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih pengalaman minimal..." />
            </SelectTrigger>
            <SelectContent>
              {experiences.map((exp) => (
                <SelectItem key={exp.id} value={exp.id}>
                  {exp.name} ({exp.minYears} tahun)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Range Usia */}
        <div className="space-y-2">
          <Label htmlFor="minAge">Usia Minimal *</Label>
          <Input
            id="minAge"
            type="number"
            min={17}
            max={100}
            value={minAge}
            onChange={(e) => setMinAge(Number(e.target.value))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="maxAge">Usia Maksimal *</Label>
          <Input
            id="maxAge"
            type="number"
            min={17}
            max={100}
            value={maxAge}
            onChange={(e) => setMaxAge(Number(e.target.value))}
            required
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Switch id="showAge" checked={showAge} onCheckedChange={setShowAge} />
          <Label htmlFor="showAge" className="cursor-pointer">
            Tampilkan range usia ke publik
          </Label>
        </div>

        {/* Jenis Kelamin */}
        <div className="col-span-2 space-y-2">
          <Label>Jenis Kelamin *</Label>
          <Select value={gender} onValueChange={setGender}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih jenis kelamin..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANY">Semua</SelectItem>
              <SelectItem value="MALE">Laki-laki</SelectItem>
              <SelectItem value="FEMALE">Perempuan</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Switch id="showGender" checked={showGender} onCheckedChange={setShowGender} />
          <Label htmlFor="showGender" className="cursor-pointer">
            Tampilkan jenis kelamin ke publik
          </Label>
        </div>

        {/* Agama */}
        <div className="col-span-2 space-y-2">
          <Label>Agama *</Label>
          <Select value={religion} onValueChange={setReligion}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih agama..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ANY">Semua</SelectItem>
              <SelectItem value="ISLAM">Islam</SelectItem>
              <SelectItem value="KRISTEN">Kristen</SelectItem>
              <SelectItem value="KATOLIK">Katolik</SelectItem>
              <SelectItem value="HINDU">Hindu</SelectItem>
              <SelectItem value="BUDDHA">Buddha</SelectItem>
              <SelectItem value="KONGHUCU">Konghucu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Switch id="showReligion" checked={showReligion} onCheckedChange={setShowReligion} />
          <Label htmlFor="showReligion" className="cursor-pointer">
            Tampilkan agama ke publik
          </Label>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
          {validationError}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack} disabled={loading}>
          Kembali
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Lowongan"}
        </Button>
      </div>
    </form>
  );
}