"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Briefcase, CalendarDays, ChevronRight } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { FilterDivisiClient } from "./filter-divisi-client";
import { FilterLevelClient } from "./filter-level-client";

type Job = {
  id: string;
  city: string;
  province: string;
  createdAt: Date;
  position: {
    nama: string;
    divisi: { id: string; nama: string };
    level: { id: string; nama: string };
  };
  employmentStatus: { name: string };
};

type Props = {
  jobs: Job[];
  divisions: { id: string; nama: string }[];
  levels: { id: string; nama: string }[];
};

export default function JobListingsSection({ jobs, divisions, levels }: Props) {
  const [selectedDivisi, setSelectedDivisi] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const toProperCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const filteredJobs = jobs.filter((job) => {
    if (selectedDivisi && job.position.divisi.id !== selectedDivisi)
      return false;
    if (selectedLevel && job.position.level.id !== selectedLevel) return false;
    return true;
  });

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            Pilih Karir Impian Anda
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
            Temukan posisi yang sesuai dengan keahlian dan passion Anda.
            <br />
            Kami mencari talenta terbaik untuk bergabung.
          </p>
        </div>
        <div className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row md:items-center">
          <h2 className="items-center justify-center text-center text-2xl font-bold text-slate-900">
            Lowongan Tersedia ({filteredJobs.length})
          </h2>
          <div className="grid w-full grid-cols-1 gap-3 md:flex md:w-auto">
            <FilterDivisiClient
              divisions={divisions}
              selectedDivisi={selectedDivisi}
              onDivisiChange={setSelectedDivisi}
            />
            <FilterLevelClient
              levels={levels}
              selectedLevel={selectedLevel}
              onLevelChange={setSelectedLevel}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {filteredJobs.length === 0 ? (
            <Card className="text-muted-foreground p-8 text-center">
              Tidak ada lowongan untuk divisi ini.
            </Card>
          ) : (
            filteredJobs.map((job) => (
              <Link
                key={job.id}
                href={`/jobs/${job.id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Card className="group hover:border-primary/70 hover:shadow-primary/20 cursor-pointer overflow-hidden transition-shadow duration-200 hover:shadow-lg">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-4">
                        {/* Judul Pekerjaan */}
                        <div className="h-14">
                          <h3 className="text-[16px] font-semibold">
                            {job.position.nama}
                          </h3>
                          <p className="text-primary">
                            {job.position.divisi.nama} •{" "}
                            {job.position.level.nama}
                          </p>
                        </div>

                        {/* Info Lokasi, Status & Tanggal  */}
                        <div className="mt-3 grid gap-3 text-slate-500">
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="size-4 text-slate-600" />
                            <span className="capitalize">
                              {toProperCase(job.city)},{" "}
                              {toProperCase(job.province)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Briefcase className="text-muted-foreground size-4" />
                            <span className="mr-8">
                              {job.employmentStatus.name}
                            </span>
                            <CalendarDays className="text-muted-foreground size-4" />
                            <span>
                              {format(new Date(job.createdAt), "dd MMM yyyy")}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Icon Panah di Kanan */}
                      <ChevronRight className="group-hover:text-primary size-6 text-slate-300 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
