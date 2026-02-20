"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { jobStepOneSchema } from "@/lib/validations/job";

type Position = { id: string; nama: string; divisi: { nama: string }; level: { nama: string } };
type Branch = { id: string; name: string };
type Status = { id: string; name: string };
type Province = { id: string; name: string };
type City = { id: string; name: string };

type Props = {
  positions: Position[];
  branches: Branch[];
  statuses: Status[];
  initialData: any;
  onNext: (data: any) => void;
};

export function StepOne({ positions, branches, statuses, initialData, onNext }: Props) {
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [selectedBranch, setSelectedBranch] = useState(initialData.branchId || "");
  const [selectedStatus, setSelectedStatus] = useState(initialData.employmentStatusId || "");
  const [showSalary, setShowSalary] = useState(initialData.showSalary || false);
  
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedProvince, setSelectedProvince] = useState(initialData.province || "");
  const [selectedCity, setSelectedCity] = useState(initialData.city || "");
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);

  // Salary state dengan format
  const [minSalary, setMinSalary] = useState(initialData.minSalary || 0);
  const [maxSalary, setMaxSalary] = useState(initialData.maxSalary || 0);
  const [minSalaryDisplay, setMinSalaryDisplay] = useState(
    initialData.minSalary ? formatRupiah(initialData.minSalary) : ""
  );
  const [maxSalaryDisplay, setMaxSalaryDisplay] = useState(
    initialData.maxSalary ? formatRupiah(initialData.maxSalary) : ""
  );

  // Validation error state
  const [validationError, setValidationError] = useState<string | null>(null);

  // Format number ke Rupiah
  function formatRupiah(value: number | string): string {
    const numValue = typeof value === "string" ? parseInt(value.replace(/\D/g, "")) : value;
    if (isNaN(numValue) || numValue === 0) return "";
    return numValue.toLocaleString("id-ID");
  }

  // Handle min salary change
  function handleMinSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(value) || 0;
    setMinSalary(numValue);
    setMinSalaryDisplay(formatRupiah(numValue));
  }

  // Handle max salary change
  function handleMaxSalaryChange(e: React.ChangeEvent<HTMLInputElement>) {
    const value = e.target.value.replace(/\D/g, "");
    const numValue = parseInt(value) || 0;
    setMaxSalary(numValue);
    setMaxSalaryDisplay(formatRupiah(numValue));
  }

  // Restore selected position dari initialData
  useEffect(() => {
    if (initialData.positionId && positions.length > 0 && !selectedPosition) {
      const pos = positions.find((p) => p.id === initialData.positionId);
      if (pos) {
        setSelectedPosition(pos);
      }
    }
  }, [initialData.positionId, positions, selectedPosition]);

  // Load provinces on mount
  useEffect(() => {
    async function fetchProvinces() {
      setLoadingProvinces(true);
      try {
        const res = await fetch("/api/regions/provinces");
        const data: Province[] = await res.json();
        setProvinces(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch provinces", error);
      }
      setLoadingProvinces(false);
    }
    fetchProvinces();
  }, []);

  // Load cities saat mount jika province sudah ada di initialData
  useEffect(() => {
    if (initialData.province && provinces.length > 0 && cities.length === 0) {
      const province = provinces.find((p) => p.name === initialData.province);
      if (province) {
        fetchCitiesForProvince(province.id);
      }
    }
  }, [initialData.province, provinces]);

  // Load cities when province changes
  useEffect(() => {
    if (!selectedProvince) {
      setCities([]);
      setSelectedCity("");
      return;
    }

    // Skip jika province tidak berubah dan cities sudah ada
    if (selectedProvince === initialData.province && cities.length > 0) {
      return;
    }

    async function fetchCities() {
      setLoadingCities(true);
      // Jangan reset city kalau ini restore dari initialData
      if (selectedProvince !== initialData.province) {
        setSelectedCity("");
      }
      try {
        const province = provinces.find((p) => p.name === selectedProvince);
        if (province) {
          await fetchCitiesForProvince(province.id);
        }
      } catch (error) {
        console.error("Failed to fetch cities", error);
        setCities([]);
      }
      setLoadingCities(false);
    }
    fetchCities();
  }, [selectedProvince, provinces]);

  // Helper function untuk fetch cities
  async function fetchCitiesForProvince(provinceId: string) {
    setLoadingCities(true);
    try {
      const res = await fetch(`/api/regions/cities/${provinceId}`);
      const data: City[] = await res.json();
      setCities(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch cities", error);
      setCities([]);
    }
    setLoadingCities(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError(null);
    
    const formData = {
      positionId: selectedPosition?.id || "",
      branchId: selectedBranch,
      employmentStatusId: selectedStatus,
      province: selectedProvince,
      city: selectedCity,
      minSalary,
      maxSalary,
      showSalary,
    };

    // Validasi dengan Zod
    const result = jobStepOneSchema.safeParse(formData);

    if (!result.success) {
      // Ambil error pertama
      setValidationError(result.error.issues[0].message);
      return;
    }

    onNext(result.data);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Posisi */}
        <div className="col-span-2 space-y-2">
          <Label>Posisi *</Label>
          <Select
            value={selectedPosition?.id || ""}
            onValueChange={(val) => {
              const pos = positions.find((p) => p.id === val);
              setSelectedPosition(pos || null);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih posisi..." />
            </SelectTrigger>
            <SelectContent>
              {positions.map((pos) => (
                <SelectItem key={pos.id} value={pos.id}>
                  {pos.nama}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Divisi (read-only) */}
        <div className="space-y-2">
          <Label>Divisi</Label>
          <Input
            value={selectedPosition?.divisi.nama || "-"}
            disabled
            className="bg-muted"
          />
        </div>

        {/* Level (read-only) */}
        <div className="space-y-2">
          <Label>Level</Label>
          <Input
            value={selectedPosition?.level.nama || "-"}
            disabled
            className="bg-muted"
          />
        </div>

        {/* Branch */}
        <div className="space-y-2">
          <Label>Branch *</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih branch..." />
            </SelectTrigger>
            <SelectContent>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status Kepegawaian *</Label>
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih status..." />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status.id} value={status.id}>
                  {status.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Provinsi */}
        <div className="space-y-2">
          <Label>Provinsi *</Label>
          <Select
            value={selectedProvince}
            onValueChange={setSelectedProvince}
            disabled={loadingProvinces}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingProvinces ? "Loading..." : "Pilih provinsi..."} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {provinces.map((prov) => (
                <SelectItem key={prov.id} value={prov.name}>
                  {prov.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Kota */}
        <div className="space-y-2">
          <Label>Kota *</Label>
          <Select
            value={selectedCity}
            onValueChange={setSelectedCity}
            disabled={!selectedProvince || loadingCities}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingCities ? "Loading..." : "Pilih kota..."} />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Salary dengan format Rupiah */}
        <div className="space-y-2">
          <Label htmlFor="minSalary">Minimal Salary (Rp) *</Label>
          <Input
            id="minSalary"
            value={minSalaryDisplay}
            onChange={handleMinSalaryChange}
            placeholder="0"
            required
          />
        </div>

        {/* Max Salary dengan format Rupiah */}
        <div className="space-y-2">
          <Label htmlFor="maxSalary">Maksimal Salary (Rp) *</Label>
          <Input
            id="maxSalary"
            value={maxSalaryDisplay}
            onChange={handleMaxSalaryChange}
            placeholder="0"
            required
          />
        </div>

        {/* Show Salary Toggle */}
        <div className="col-span-2 flex items-center gap-2">
          <Switch
            id="showSalary"
            checked={showSalary}
            onCheckedChange={setShowSalary}
          />
          <Label htmlFor="showSalary" className="cursor-pointer">
            Tampilkan salary ke publik
          </Label>
        </div>
      </div>

      {/* Validation Error dari Zod */}
      {validationError && (
        <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive rounded-md">
          {validationError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">
          Selanjutnya
        </Button>
      </div>
    </form>
  );
}