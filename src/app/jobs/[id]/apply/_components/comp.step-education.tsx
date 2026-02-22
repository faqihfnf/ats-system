"use client";

import { useState, useEffect } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

type Education = {
  id: string;
  name: string;
};

type University = {
  name: string;
};

type Props = {
  educations: Education[];
  initialData: any;
  onNext: (data: any) => void;
  onBack: () => void;
};

export function StepEducation({
  educations,
  initialData,
  onNext,
  onBack,
}: Props) {
  const [selectedEducation, setSelectedEducation] = useState(
    initialData.educationId || "",
  );
  const [institution, setInstitution] = useState(initialData.institution || "");
  const [startYear, setStartYear] = useState(
    initialData.startYear || new Date().getFullYear(),
  );
  const [endYear, setEndYear] = useState(initialData.endYear || "");
  const [notGraduated, setNotGraduated] = useState(
    initialData.endYear === "present",
  );
  const [currentSalary, setCurrentSalary] = useState(
    initialData.currentSalary || "",
  );
  const [expectedSalary, setExpectedSalary] = useState(
    initialData.expectedSalary || "",
  );

  const [universities, setUniversities] = useState<University[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-set endYear to "present" if not graduated
  useEffect(() => {
    if (notGraduated) {
      setEndYear("present");
    } else {
      setEndYear("");
    }
  }, [notGraduated]);

  // Fetch universities when search query changes
  // Di dalam useEffect pencarian pada StepEducation
  useEffect(() => {
    if (searchQuery.length < 3) {
      setUniversities([]);
      return;
    }

    const debounce = setTimeout(async () => {
      setLoadingUniversities(true);
      try {
        const res = await fetch(
          `/api/institutions?search=${encodeURIComponent(searchQuery)}`,
        );
        const data = await res.json();

        // API Route kita sudah meratakan datanya menjadi array
        setUniversities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch universities", error);
        setUniversities([]);
      } finally {
        setLoadingUniversities(false);
      }
    }, 500);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  // Format rupiah display
  function formatRupiah(value: string): string {
    const numValue = value.replace(/\D/g, "");
    if (!numValue) return "";
    return parseInt(numValue).toLocaleString("id-ID");
  }

  function handleCurrentSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    setCurrentSalary(value);
  }

  function handleExpectedSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    setExpectedSalary(value);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (
      !selectedEducation ||
      !institution ||
      !startYear ||
      !endYear ||
      !expectedSalary
    ) {
      setValidationError("Semua field wajib diisi kecuali Gaji Saat Ini");
      return;
    }

    if (!notGraduated && parseInt(endYear) < startYear) {
      setValidationError(
        "Tahun selesai tidak boleh lebih kecil dari tahun mulai",
      );
      return;
    }

    onNext({
      educationId: selectedEducation,
      institution,
      startYear: parseInt(startYear.toString()),
      endYear,
      currentSalary: currentSalary ? parseInt(currentSalary) : undefined,
      expectedSalary: parseInt(expectedSalary),
    });
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Pendidikan Terakhir */}
        <div className="col-span-2 space-y-2">
          <Label>Pendidikan Terakhir *</Label>
          <Select
            value={selectedEducation}
            onValueChange={setSelectedEducation}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih pendidikan terakhir..." />
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

        {/* Institution (Combobox with search) */}
        <div className="col-span-2 space-y-2">
          <Label>Institusi (Universitas/Sekolah) *</Label>
          <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openCombobox}
                className="w-full justify-between"
              >
                {institution || "Pilih atau ketik nama institusi..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command shouldFilter={false}>
                <CommandInput
                  placeholder="Cari institusi..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                />
                <CommandList>
                  {loadingUniversities && (
                    <CommandEmpty>Loading...</CommandEmpty>
                  )}
                  {!loadingUniversities && searchQuery.length < 3 && (
                    <CommandEmpty>
                      Ketik minimal 3 karakter untuk mencari
                    </CommandEmpty>
                  )}
                  {!loadingUniversities &&
                    searchQuery.length >= 3 &&
                    universities.length === 0 && (
                      <CommandEmpty>
                        Tidak ditemukan. Ketik manual di bawah.
                      </CommandEmpty>
                    )}
                  {universities.length > 0 && (
                    <CommandGroup>
                      {universities.map((uni, idx) => (
                        <CommandItem
                          key={idx}
                          value={uni.name}
                          onSelect={(currentValue) => {
                            setInstitution(currentValue);
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              institution === uni.name
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          {uni.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <p className="text-muted-foreground text-xs">
            Atau ketik manual di sini:
          </p>
          <Input
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Nama institusi"
          />
        </div>

        {/* Tahun Mulai */}
        <div className="space-y-2">
          <Label>Tahun Mulai *</Label>
          <Select
            value={startYear.toString()}
            onValueChange={(val) => setStartYear(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tahun..." />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tahun Selesai */}
        <div className="space-y-2">
          <Label>Tahun Selesai *</Label>
          <Select
            value={endYear}
            onValueChange={setEndYear}
            disabled={notGraduated}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={notGraduated ? "Present" : "Pilih tahun..."}
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Belum Lulus Checkbox */}
        <div className="col-span-2 flex items-center gap-2">
          <Checkbox
            id="notGraduated"
            checked={notGraduated}
            onCheckedChange={(checked) => setNotGraduated(checked as boolean)}
          />
          <Label htmlFor="notGraduated" className="cursor-pointer">
            Belum Lulus
          </Label>
        </div>

        {/* Gaji Saat Ini (Optional) */}
        <div className="space-y-2">
          <Label htmlFor="currentSalary">Gaji Saat Ini (Rp)</Label>
          <Input
            id="currentSalary"
            value={formatRupiah(currentSalary)}
            onChange={handleCurrentSalaryChange}
            placeholder="0"
          />
          <p className="text-muted-foreground text-xs">
            Opsional - kosongkan jika belum bekerja
          </p>
        </div>

        {/* Ekspektasi Gaji */}
        <div className="space-y-2">
          <Label htmlFor="expectedSalary">Ekspektasi Gaji (Rp) *</Label>
          <Input
            id="expectedSalary"
            value={formatRupiah(expectedSalary)}
            onChange={handleExpectedSalaryChange}
            placeholder="0"
            required
          />
        </div>
      </div>

      {validationError && (
        <div className="text-destructive bg-destructive/10 border-destructive rounded-md border p-3 text-sm">
          {validationError}
        </div>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Kembali
        </Button>
        <Button type="submit">Selanjutnya</Button>
      </div>
    </form>
  );
}
