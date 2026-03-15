export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
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

  const [candidate, navigation, stages] = await Promise.all([
    getCandidateDetail(candidateId),
    getCandidateNavigation(candidateId, id),
    getStages(),
  ]);

  if (!candidate || !stages) {
    notFound();
  }

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

        {/* Prev/Next Navigation */}
        <CandidateDetailHeader
          jobId={id}
          prevCandidate={navigation.prev}
          nextCandidate={navigation.next}
          current={navigation.current}
          total={navigation.total}
        />
      </div>

      {/* Detail View */}
      <CandidateDetailView candidate={candidate} jobId={id} stages={stages} />
    </div>
  );
}
