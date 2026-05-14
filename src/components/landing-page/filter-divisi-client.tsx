"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Divisi = {
  id: string;
  nama: string;
};

type Props = {
  divisions: Divisi[];
  selectedDivisi: string | null;
  onDivisiChange: (divisiId: string | null) => void;
};

export function FilterDivisiClient({
  divisions,
  selectedDivisi,
  onDivisiChange,
}: Props) {
  function handleChange(value: string) {
    if (value === "all") {
      onDivisiChange(null);
    } else {
      onDivisiChange(value);
    }
  }

  return (
    <Select value={selectedDivisi || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-52">
        <SelectValue placeholder="Filter Divisi" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Divisi</SelectItem>
        {divisions.map((div) => (
          <SelectItem key={div.id} value={div.id}>
            {div.nama}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
