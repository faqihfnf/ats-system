export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
  DollarSign,
  ChevronLeft,
  CalendarDays,
  MoonStar,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { getPublicJobDetail } from "@/app/(public)/_actions/action.public";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Props = {
  params: { id: string };
};

export default async function JobDetailPage({ params }: Props) {
  const { id } = await params;

  const job = await getPublicJobDetail(id);
  if (!job) {
    notFound();
  }

  const toProperCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="mx-auto max-w-4xl px-4 py-12">
        {/* Back Button */}
        <Link href="/">
          <Button
            variant="ghost"
            className="hover:text-primary mb-6 hover:bg-transparent"
          >
            <ChevronLeft className="mr-2 size-4" />
            Kembali ke Lowongan
          </Button>
        </Link>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="mb-4 flex items-start justify-between">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">{job.position.nama}</h1>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="text-primary border-primary"
                  >
                    {job.position.divisi.nama}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="text-primary border-primary"
                  >
                    {job.position.level.nama}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-10">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="text-muted-foreground size-4" />
                <span>{job.branch.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="text-muted-foreground size-4" />
                <span>
                  {toProperCase(job.city)},
                  <br />
                  {toProperCase(job.province)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm md:justify-center">
                <Briefcase className="text-muted-foreground size-4" />
                <span>{job.employmentStatus.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm md:justify-center">
                <CalendarDays className="text-muted-foreground size-4" />
                <span>
                  {format(new Date(job.createdAt), "d MMM yyyy", {
                    locale: idLocale,
                  })}
                </span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Deskripsi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: job.description || "Tidak ada deskripsi",
              }}
            />
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader className="text-lg">
            <CardTitle>Persyaratan</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className="prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{
                __html: job.requirements || "Tidak ada persyaratan",
              }}
            />
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Kualifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="text-muted-foreground size-5" />
              <div>
                <p className="font-medium">Pendidikan Minimal</p>
                <p className="text-muted-foreground text-sm">
                  {job.minEducation.name}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Briefcase className="text-muted-foreground size-5" />
              <div>
                <p className="font-medium">Pengalaman Minimal</p>
                <p className="text-muted-foreground text-sm">
                  {job.minExperience.name} ({job.minExperience.minYears} tahun)
                </p>
              </div>
            </div>
            {job.showAge && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <UserRound className="text-muted-foreground size-5" />
                  <div>
                    <p className="font-medium">Rentang Usia</p>
                    <p className="text-muted-foreground text-sm">
                      {job.minAge} - {job.maxAge} tahun
                    </p>
                  </div>
                </div>
              </>
            )}
            {job.showSalary && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <DollarSign className="text-muted-foreground size-5" />
                  <div>
                    <p className="font-medium">Rentang Gaji</p>
                    <p className="text-muted-foreground text-sm">
                      Rp {job.minSalary.toLocaleString("id-ID")} - Rp{" "}
                      {job.maxSalary.toLocaleString("id-ID")}
                    </p>
                  </div>
                </div>
              </>
            )}
            {job.showGender && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Users className="text-muted-foreground size-5" />
                  <div>
                    <p className="font-medium">Jenis Kelamin</p>
                    <p className="text-muted-foreground text-sm">
                      {job.gender === "MALE"
                        ? "Pria"
                        : job.gender === "FEMALE"
                          ? "Wanita"
                          : "Semua"}
                    </p>
                  </div>
                </div>
              </>
            )}
            {job.showReligion && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <MoonStar className="text-muted-foreground size-5" />
                  <div>
                    <p className="font-medium">Agama</p>
                    <p className="text-muted-foreground text-sm">
                      {toProperCase(job.religion)}
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Apply Button */}
        <Card>
          <CardContent className="pt-6">
            <Button size="lg" className="w-full">
              Lamar Sekarang
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
