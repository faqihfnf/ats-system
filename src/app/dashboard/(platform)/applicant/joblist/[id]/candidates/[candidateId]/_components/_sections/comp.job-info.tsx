import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  MapPin,
  Briefcase,
  GraduationCap,
  DollarSign,
  CalendarDays,
  MoonStar,
  UserRound,
  Users,
  ClipboardList,
} from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { CandidateWithRelations } from "@/types/types";

type Props = {
  job: CandidateWithRelations["job"];
};

export function JobInfo({ job }: Props) {
  const toProperCase = (str: string) => {
    return str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
  };

  const genderLabel = (gender: string) => {
    switch (gender) {
      case "MALE":
        return "Pria";
      case "FEMALE":
        return "Wanita";
      case "ANY":
        return "Semua";
      default:
        return gender;
    }
  };

  return (
    <div className="space-y-6">
      {/* Informasi Umum */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Umum</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex items-center gap-3">
              <Briefcase className="text-muted-foreground size-5" />
              <div>
                <p className="text-muted-foreground text-sm">Posisi</p>
                <p className="font-medium">{job.position.nama}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Building2 className="text-muted-foreground size-5" />
              <div>
                <p className="text-muted-foreground text-sm">Cabang</p>
                <p className="font-medium">{job.branch.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="text-muted-foreground size-5" />
              <div>
                <p className="text-muted-foreground text-sm">Lokasi</p>
                <p className="font-medium">
                  {toProperCase(job.city)}, {toProperCase(job.province)}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="text-muted-foreground size-5" />
              <div>
                <p className="text-muted-foreground text-sm">Status Kerja</p>
                <p className="font-medium">{job.employmentStatus.name}</p>
              </div>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <p className="text-muted-foreground text-sm">Divisi</p>
              <Badge variant="outline" className="mt-1">
                {job.position.divisi.nama}
              </Badge>
            </div>
            <div>
              <p className="text-muted-foreground text-sm">Level</p>
              <Badge variant="outline" className="mt-1">
                {job.position.level.nama}
              </Badge>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <DollarSign className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Rentang Gaji</p>
              <p className="font-medium">
                Rp {job.minSalary.toLocaleString("id-ID")} - Rp{" "}
                {job.maxSalary.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CalendarDays className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Tanggal Dibuat</p>
              <p className="font-medium">
                {format(new Date(job.createdAt), "d MMMM yyyy", {
                  locale: idLocale,
                })}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informasi Pekerjaan */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Informasi Pekerjaan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <p className="mb-2 font-medium">Deskripsi Pekerjaan</p>
            {job.description ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Tidak ada deskripsi
              </p>
            )}
          </div>
          <Separator />
          <div>
            <p className="mb-2 font-medium">Persyaratan</p>
            {job.requirements ? (
              <div
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: job.requirements }}
              />
            ) : (
              <p className="text-muted-foreground text-sm italic">
                Tidak ada persyaratan
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Kualifikasi */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kualifikasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Pendidikan Minimal</p>
              <p className="font-medium">{job.minEducation.name}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Briefcase className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Pengalaman Minimal</p>
              <p className="font-medium">
                {job.minExperience.name} ({job.minExperience.minYears} tahun)
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <UserRound className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Rentang Usia</p>
              <p className="font-medium">
                {job.minAge} - {job.maxAge} tahun
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <DollarSign className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Rentang Gaji</p>
              <p className="font-medium">
                Rp {job.minSalary.toLocaleString("id-ID")} - Rp{" "}
                {job.maxSalary.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <Users className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Jenis Kelamin</p>
              <p className="font-medium">{genderLabel(job.gender)}</p>
            </div>
          </div>
          <Separator />
          <div className="flex items-center gap-3">
            <MoonStar className="text-muted-foreground size-5" />
            <div>
              <p className="text-muted-foreground text-sm">Agama</p>
              <p className="font-medium">
                {job.religion === "ANY"
                  ? "Semua"
                  : toProperCase(job.religion)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Custom Questions */}
      {job.customQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ClipboardList className="size-5" />
              Custom Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {job.customQuestions.map((q, index) => (
                <div key={q.id} className="flex gap-3">
                  <span className="text-muted-foreground text-sm font-medium">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-sm font-medium">{q.question}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {q.type.replace(/_/g, " ")}
                      </Badge>
                      {q.required && (
                        <Badge
                          variant="destructive"
                          className="text-xs"
                        >
                          Wajib
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
