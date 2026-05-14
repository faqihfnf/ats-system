"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Level = {
  id: string;
  nama: string;
};

type Props = {
  levels: Level[];
  selectedLevel: string | null;
  onLevelChange: (levelId: string | null) => void;
};

export function FilterLevelClient({
  levels,
  selectedLevel,
  onLevelChange,
}: Props) {
  function handleChange(value: string) {
    if (value === "all") {
      onLevelChange(null);
    } else {
      onLevelChange(value);
    }
  }

  return (
    <Select value={selectedLevel || "all"} onValueChange={handleChange}>
      <SelectTrigger className="w-full sm:w-40">
        <SelectValue placeholder="Filter Level" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Level</SelectItem>
        {levels.map((level) => (
          <SelectItem key={level.id} value={level.id}>
            {level.nama}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
