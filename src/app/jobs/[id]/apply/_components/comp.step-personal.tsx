"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";

type Province = { id: string; name: string };
type City = { id: string; name: string };
type District = { id: string; name: string };
type Village = { id: string; name: string };

type Props = {
  initialData: any;
  onNext: (data: any) => void;
};

export function StepPersonal({ initialData, onNext }: Props) {
  const [fullName, setFullName] = useState(initialData.fullName || "");
  const [email, setEmail] = useState(initialData.email || "");
  const [phone, setPhone] = useState(initialData.phone || "");
  const [birthPlace, setBirthPlace] = useState(initialData.birthPlace || "");
  const [birthDate, setBirthDate] = useState<Date | undefined>(
    initialData.birthDate ? new Date(initialData.birthDate) : undefined,
  );
  const [isOpen, setIsOpen] = useState(false);
  const [religion, setReligion] = useState(initialData.religion || "");
  const [ktpAddress, setKtpAddress] = useState(initialData.ktpAddress || "");
  const [domicileAddress, setDomicileAddress] = useState(
    initialData.domicileAddress || "",
  );
  const [sameAsKtp, setSameAsKtp] = useState(initialData.sameAsKtp || false);

  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);

  const [selectedProvince, setSelectedProvince] = useState(
    initialData.province || "",
  );
  const [selectedCity, setSelectedCity] = useState(initialData.city || "");
  const [selectedDistrict, setSelectedDistrict] = useState(
    initialData.district || "",
  );
  const [selectedVillage, setSelectedVillage] = useState(
    initialData.subdistrict || "",
  );

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-fill domicile address when sameAsKtp is true
  useEffect(() => {
    if (sameAsKtp) {
      setDomicileAddress(ktpAddress);
    }
  }, [sameAsKtp, ktpAddress]);

  // Load provinces
  useEffect(() => {
    async function fetchProvinces() {
      setLoadingProvinces(true);
      try {
        const res = await fetch("/api/regions/provinces");
        const data = await res.json();
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
      setDistricts([]);
      setVillages([]);
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedVillage("");
      return;
    }

    async function fetchCities() {
      setLoadingCities(true);
      setSelectedCity("");
      setSelectedDistrict("");
      setSelectedVillage("");
      try {
        const province = provinces.find((p) => p.name === selectedProvince);
        if (province) {
          const res = await fetch(`/api/regions/cities/${province.id}`);
          const data = await res.json();
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

  // Load districts when city changes
  useEffect(() => {
    if (!selectedCity) {
      setDistricts([]);
      setVillages([]);
      setSelectedDistrict("");
      setSelectedVillage("");
      return;
    }

    async function fetchDistricts() {
      setLoadingDistricts(true);
      setSelectedDistrict("");
      setSelectedVillage("");
      try {
        const city = cities.find((c) => c.name === selectedCity);
        if (city) {
          const res = await fetch(`/api/regions/districts/${city.id}`);
          const data = await res.json();
          setDistricts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch districts", error);
        setDistricts([]);
      }
      setLoadingDistricts(false);
    }
    fetchDistricts();
  }, [selectedCity, cities]);

  // Load villages when district changes
  useEffect(() => {
    if (!selectedDistrict) {
      setVillages([]);
      setSelectedVillage("");
      return;
    }

    async function fetchVillages() {
      setLoadingVillages(true);
      setSelectedVillage("");
      try {
        const district = districts.find((d) => d.name === selectedDistrict);
        if (district) {
          const res = await fetch(`/api/regions/villages/${district.id}`);
          const data = await res.json();
          setVillages(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch villages", error);
        setVillages([]);
      }
      setLoadingVillages(false);
    }
    fetchVillages();
  }, [selectedDistrict, districts]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setValidationError(null);

    if (
      !fullName ||
      !email ||
      !phone ||
      !birthPlace ||
      !birthDate ||
      !religion ||
      !ktpAddress ||
      !domicileAddress ||
      !selectedProvince ||
      !selectedCity ||
      !selectedDistrict ||
      !selectedVillage
    ) {
      setValidationError("Semua field wajib diisi");
      return;
    }

    onNext({
      fullName,
      email,
      phone,
      birthPlace,
      birthDate: birthDate.toISOString(),
      religion,
      ktpAddress,
      domicileAddress,
      sameAsKtp,
      province: selectedProvince,
      city: selectedCity,
      district: selectedDistrict,
      subdistrict: selectedVillage,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {/* Nama Lengkap */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="fullName">Nama Lengkap *</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Nama lengkap sesuai KTP"
            required
          />
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@example.com"
            required
          />
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">No. Handphone *</Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="08xxxxxxxxxx"
            required
          />
        </div>

        {/* Birth Place */}
        <div className="space-y-2">
          <Label htmlFor="birthPlace">Tempat Lahir *</Label>
          <Input
            id="birthPlace"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Kota kelahiran"
            required
          />
        </div>

        {/* Birth Date */}
        <div className="space-y-2">
          <Label htmlFor="birthDate">Tanggal Lahir *</Label>
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start",
                  !birthDate && "text-muted-foreground",
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {birthDate ? (
                  format(birthDate, "PPP", { locale: idLocale })
                ) : (
                  <span>Pilih tanggal lahir anda</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-100" align="start">
              <Calendar
                mode="single"
                selected={birthDate}
                onSelect={(date) => {
                  setBirthDate(date);
                  setIsOpen(false); // Menutup kalender otomatis
                }}
                captionLayout="dropdown" // Menggunakan dropdown bulan & tahun
                fromYear={1960}
                toYear={new Date().getFullYear()}
                disabled={(date) =>
                  date > new Date() || date < new Date("1900-01-01")
                }
                initialFocus
                className="p-4"
                classNames={{
                  caption_label: "hidden", // Menghilangkan teks statis agar tidak menumpuk
                  caption_dropdowns: "flex justify-center gap-2 w-full mb-2", // Memberi jarak pada dropdown
                  dropdown:
                    "p-2 cursor-pointer bg-white border border-slate-200 rounded-md text-sm hover:bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none",
                  dropdown_month: "flex-1",
                  dropdown_year: "w-[100px]",
                  vhidden: "hidden",
                  head_cell:
                    "text-slate-400 rounded-md w-9 font-normal text-[0.8rem]",
                  cell: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                  day: cn(
                    "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50 hover:text-blue-600 transition-colors rounded-md",
                  ),
                  day_selected:
                    "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600",
                  day_today: "bg-slate-100 text-slate-900",
                }}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Religion */}
        <div className="col-span-2 space-y-2">
          <Label>Agama *</Label>
          <Select value={religion} onValueChange={setReligion}>
            <SelectTrigger>
              <SelectValue placeholder="Pilih agama..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ISLAM">Islam</SelectItem>
              <SelectItem value="KRISTEN">Kristen</SelectItem>
              <SelectItem value="KATOLIK">Katolik</SelectItem>
              <SelectItem value="HINDU">Hindu</SelectItem>
              <SelectItem value="BUDDHA">Buddha</SelectItem>
              <SelectItem value="KONGHUCU">Konghucu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* KTP Address */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="ktpAddress">Alamat KTP *</Label>
          <Textarea
            id="ktpAddress"
            value={ktpAddress}
            onChange={(e) => setKtpAddress(e.target.value)}
            placeholder="Alamat lengkap sesuai KTP"
            rows={3}
            required
          />
        </div>

        {/* Same as KTP Toggle */}
        <div className="col-span-2 flex items-center gap-2">
          <Switch
            id="sameAsKtp"
            checked={sameAsKtp}
            onCheckedChange={setSameAsKtp}
          />
          <Label htmlFor="sameAsKtp" className="cursor-pointer">
            Alamat domisili sama dengan KTP
          </Label>
        </div>

        {/* Domicile Address */}
        <div className="col-span-2 space-y-2">
          <Label htmlFor="domicileAddress">Alamat Domisili *</Label>
          <Textarea
            id="domicileAddress"
            value={domicileAddress}
            onChange={(e) => setDomicileAddress(e.target.value)}
            placeholder="Alamat domisili saat ini"
            rows={3}
            required
            disabled={sameAsKtp}
            className={sameAsKtp ? "bg-muted" : ""}
          />
        </div>

        {/* Province */}
        <div className="space-y-2">
          <Label>Provinsi *</Label>
          <Select
            value={selectedProvince}
            onValueChange={setSelectedProvince}
            disabled={loadingProvinces}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingProvinces ? "Loading..." : "Pilih provinsi..."
                }
              />
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

        {/* City */}
        <div className="space-y-2">
          <Label>Kota *</Label>
          <Select
            value={selectedCity}
            onValueChange={setSelectedCity}
            disabled={!selectedProvince || loadingCities}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={loadingCities ? "Loading..." : "Pilih kota..."}
              />
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

        {/* District */}
        <div className="space-y-2">
          <Label>Kecamatan *</Label>
          <Select
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
            disabled={!selectedCity || loadingDistricts}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingDistricts ? "Loading..." : "Pilih kecamatan..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.name}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Village */}
        <div className="space-y-2">
          <Label>Kelurahan *</Label>
          <Select
            value={selectedVillage}
            onValueChange={setSelectedVillage}
            disabled={!selectedDistrict || loadingVillages}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loadingVillages ? "Loading..." : "Pilih kelurahan..."
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-72">
              {villages.map((village) => (
                <SelectItem key={village.id} value={village.name}>
                  {village.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {validationError && (
        <div className="text-destructive bg-destructive/10 border-destructive rounded-md border p-3 text-sm">
          {validationError}
        </div>
      )}

      <div className="flex justify-end">
        <Button type="submit">Selanjutnya</Button>
      </div>
    </form>
  );
}
