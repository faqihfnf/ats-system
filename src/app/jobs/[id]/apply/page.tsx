export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { getJobForApplication } from "./_actions/action.application";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronLeft,
  MapPin,
} from "lucide-react";
import { getEducations } from "@/app/dashboard/(platform)/applicant/education/_actions/action.education";
import { ApplicationForm } from "./_components/comp.application-form";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type Props = {
  params: { id: string };
};

export default async function JobApplyPage({ params }: Props) {
  const { id } = await params;

  const [job, educations] = await Promise.all([
    getJobForApplication(id),
    getEducations(),
  ]);

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
        <Link href={`/jobs/${job.id}`}>
          <Button
            variant="ghost"
            className="hover:text-primary mb-6 hover:bg-transparent"
          >
            <ChevronLeft className="mr-2 size-4" />
            Kembali ke Lowongan
          </Button>
        </Link>
        {/* Job Info Header */}
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

            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-10">
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

        {/* Application Form */}
        <ApplicationForm job={job} educations={educations} />
      </div>
    </div>
  );
}
