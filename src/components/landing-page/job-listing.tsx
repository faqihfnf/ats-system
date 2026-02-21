export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Clock,
  ChevronRight,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import {
  getDivisions,
  getPublicJobs,
} from "@/app/(public)/_actions/action.public";
import { FilterDivisi } from "@/app/(public)/_components/comp.filter-divisi";

export default async function JobListingsSection({
  searchParams,
}: {
  searchParams: { divisi?: string };
}) {
  const divisiId = searchParams.divisi;
  const [jobs, divisions] = await Promise.all([
    getPublicJobs(divisiId),
    getDivisions(),
  ]);

  const toProperCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <section className="py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-16 text-center">
          <p className="text-primary mb-3 text-sm font-semibold tracking-widest uppercase">
            Lowongan
          </p>
          <h2 className="text-foreground text-3xl font-bold tracking-tight md:text-4xl">
            Pilih Karir Impian Anda
          </h2>
          <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg leading-relaxed">
            Temukan posisi yang sesuai dengan keahlian dan passion Anda. Kami
            selalu mencari talenta terbaik untuk bergabung.
          </p>
        </div>
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Lowongan Tersedia ({jobs.length})
          </h2>
          <FilterDivisi divisions={divisions} currentDivisi={divisiId} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {jobs.length === 0 ? (
            <Card className="text-muted-foreground p-8 text-center">
              Tidak ada lowongan untuk divisi ini.
            </Card>
          ) : (
            jobs.map((job) => (
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
                          <p className="text-primary mb-5">
                            {job.position.divisi.nama}
                          </p>
                        </div>

                        {/* Info Lokasi, Status & Tanggal  */}
                        <div className="mt-5 grid gap-3 text-slate-500">
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
