export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Building2, MapPin, Calendar, Briefcase, GraduationCap, Clock, Users, DollarSign, ChevronLeft } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-linear-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto py-12 px-4">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ChevronLeft className="size-4 mr-2" />
            Kembali ke Lowongan
          </Button>
        </Link>

        {/* Job Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{job.position.divisi.nama}</Badge>
                  <Badge variant="outline">{job.position.level.nama}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{job.position.nama}</h1>
                <p className="text-muted-foreground">{job.employmentStatus.name}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="size-4 text-muted-foreground" />
                <span>{job.branch.name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="size-4 text-muted-foreground" />
                <span>{job.city}, {job.province}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="size-4 text-muted-foreground" />
                <span>{format(new Date(job.createdAt), "d MMM yyyy", { locale: idLocale })}</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Job Description */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Deskripsi Pekerjaan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {job.description || "Tidak ada deskripsi"}
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Persyaratan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none">
              {job.requirements || "Tidak ada persyaratan"}
            </div>
          </CardContent>
        </Card>

        {/* Qualifications */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Kualifikasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <GraduationCap className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Pendidikan Minimal</p>
                <p className="text-sm text-muted-foreground">{job.minEducation.name}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Briefcase className="size-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Pengalaman Minimal</p>
                <p className="text-sm text-muted-foreground">{job.minExperience.name} ({job.minExperience.minYears} tahun)</p>
              </div>
            </div>
            {job.showAge && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <Users className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Rentang Usia</p>
                    <p className="text-sm text-muted-foreground">{job.minAge} - {job.maxAge} tahun</p>
                  </div>
                </div>
              </>
            )}
            {job.showSalary && (
              <>
                <Separator />
                <div className="flex items-center gap-3">
                  <DollarSign className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Rentang Gaji</p>
                    <p className="text-sm text-muted-foreground">
                      Rp {job.minSalary.toLocaleString("id-ID")} - Rp {job.maxSalary.toLocaleString("id-ID")}
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
              Lamar Lowongan Ini
            </Button>
            <p className="text-sm text-muted-foreground text-center mt-4">
              Pastikan Anda memenuhi semua kualifikasi sebelum melamar
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}