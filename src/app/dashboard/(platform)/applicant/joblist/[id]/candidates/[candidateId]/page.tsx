export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getCandidateDetail } from "../_actions/action.candidates";
import { CandidateDetailView } from "./_components/comp.candidate-detail-view";
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
  params: { id: string; candidateId: string };
};

export default async function CandidateDetailPage({ params }: Props) {
  const { id, candidateId } = await params;

  const candidate = await getCandidateDetail(candidateId);

  if (!candidate) {
    notFound();
  }

  return (
    <div className="w-full space-y-6">
      {/* Breadcrumb */}
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
              <Link href={`/dashboard/applicant/joblist/${id}/candidates`}>
                {candidate.job.position.nama}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{candidate.fullName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CandidateDetailView candidate={candidate} jobId={id} />
    </div>
  );
}
