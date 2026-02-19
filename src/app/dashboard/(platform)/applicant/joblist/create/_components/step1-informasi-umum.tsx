"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

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

export function Step1InformasiUmum({ positions, branches, statuses, initialData, onNext }: Props) {
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

// Load provinces on mount
useEffect(() => {
  async function fetchProvinces() {
    setLoadingProvinces(true);
    try {
      const res = await fetch("/api/regions/provinces");
      const data: Province[] = await res.json();
      console.log("Provinces:", data); // ← debug log
      setProvinces(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch provinces", error);
    }
    setLoadingProvinces(false);
  }
  fetchProvinces();
}, []);

  // Load cities when province changes
useEffect(() => {
  if (!selectedProvince) {
    setCities([]);
    setSelectedCity("");
    return;
  }

  async function fetchCities() {
    setLoadingCities(true);
    setSelectedCity(""); // reset city saat province berubah
    try {
      // Cari province by name untuk dapat ID
      const province = provinces.find((p) => p.name === selectedProvince);
      if (province) {
        const res = await fetch(`/api/regions/cities/${province.id}`);
        const data: City[] = await res.json();
        console.log("Cities:", data); // ← debug log
        setCities(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch cities", error);
      setCities([]);
    }
    setLoadingCities(false);
  }
  fetchCities();
}, [selectedProvince, provinces]);


  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    onNext({
      positionId: selectedPosition?.id,
      branchId: selectedBranch,
      employmentStatusId: selectedStatus,
      province: selectedProvince,
      city: selectedCity,
      minSalary: Number(formData.get("minSalary")),
      maxSalary: Number(formData.get("maxSalary")),
      showSalary,
    });
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
            <SelectContent>
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
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.name}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Min Salary */}
        <div className="space-y-2">
          <Label htmlFor="minSalary">Minimal Salary (Rp) *</Label>
          <Input
            id="minSalary"
            name="minSalary"
            type="number"
            min={0}
            defaultValue={initialData.minSalary || 0}
            required
          />
        </div>

        {/* Max Salary */}
        <div className="space-y-2">
          <Label htmlFor="maxSalary">Maksimal Salary (Rp) *</Label>
          <Input
            id="maxSalary"
            name="maxSalary"
            type="number"
            min={0}
            defaultValue={initialData.maxSalary || 0}
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

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={
            !selectedPosition ||
            !selectedBranch ||
            !selectedStatus ||
            !selectedProvince ||
            !selectedCity
          }
        >
          Selanjutnya
        </Button>
      </div>
    </form>
  );
}