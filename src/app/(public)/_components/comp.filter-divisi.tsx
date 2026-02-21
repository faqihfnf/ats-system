"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Divisi = {
  id: string;
  nama: string;
};

type Props = {
  divisions: Divisi[];
  currentDivisi?: string;
};

export function FilterDivisi({ divisions, currentDivisi }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    
    if (value === "all") {
      params.delete("divisi");
    } else {
      params.set("divisi", value);
    }

    router.push(`/?${params.toString()}`, { scroll: false });
  }

  return (
    <Select value={currentDivisi || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-52">
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