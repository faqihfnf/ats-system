export const dynamic = "force-dynamic";

import { notFound, redirect } from "next/navigation";
import {
  getCandidateDetail,
  getCandidateNavigation,
} from "../_actions/action.candidates";
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
import { CandidateDetailHeader } from "./_components/_sections/comp.candidate-detail-header";
import { getStages } from "../../../../stages/_actions/action.stage";

type Props = {
  params: Promise<{ id: string; candidateId: string }>;
};

export default async function CandidateDetailPage({ params }: Props) {
  const { id, candidateId } = await params;

  const [candidate, stages] = await Promise.all([
    getCandidateDetail(candidateId),
    getStages(),
  ]);

  if (!candidate || !stages) {
    notFound();
  }

  // ✅ DETECT MISMATCH: If URL jobId doesn't match candidate's actual jobId, redirect
  if (candidate.jobId !== id) {
    redirect(
      `/dashboard/applicant/joblist/${candidate.jobId}/candidates/${candidateId}`,
    );
  }

  // Now get navigation with correct jobId
  const navigation = await getCandidateNavigation(candidateId, candidate.jobId);

  return (
    <div className="w-full space-y-6 px-4 py-8">
      {/* Breadcrumb + Navigation */}
      <div className="flex items-center justify-between">
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
                {/* ✅ Use candidate.jobId instead of URL param */}
                <Link
                  href={`/dashboard/applicant/joblist/${candidate.jobId}/candidates`}
                >
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

        {/* Prev/Next Navigation */}
        <CandidateDetailHeader
          jobId={candidate.jobId} // ✅ Use candidate.jobId
          prevCandidate={navigation.prev}
          nextCandidate={navigation.next}
          current={navigation.current}
          total={navigation.total}
        />
      </div>

      {/* Detail View */}
      <CandidateDetailView
        candidate={candidate}
        jobId={candidate.jobId} // ✅ Use candidate.jobId
        stages={stages}
      />
    </div>
  );
}
