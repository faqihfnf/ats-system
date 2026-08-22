export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSessionProfile, canAccessDivision } from "@/lib/auth/session-profile";
import { ImportApplicantForm } from "./_components/comp.import-applicant-form";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ImportApplicantPage({ params }: Props) {
  const { id: jobId } = await params;

  const profile = await getSessionProfile();
  if (!profile) redirect("/login");

  const job = await prisma.job.findUnique({
    where: { id: jobId },
    select: { id: true, position: { select: { nama: true, divisiId: true } } },
  });

  if (!job || !canAccessDivision(profile, job.position.divisiId)) {
    notFound();
  }

  return (
    <div className="w-full space-y-6 px-4 py-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Dashboard</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/applicant/joblist">Job List</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/dashboard/applicant/joblist/${jobId}/candidates`}>
                {job.position.nama}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Import Applicant</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-2xl font-semibold">Import Applicant</h1>
        <p className="text-muted-foreground text-sm">
          Impor kandidat dari job portal lain ke lowongan {job.position.nama}
        </p>
      </div>

      <ImportApplicantForm jobId={jobId} jobTitle={job.position.nama} />
    </div>
  );
}