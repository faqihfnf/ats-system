export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getCandidates } from "./_actions/action.candidates";
import { CandidatesView } from "./_components/comp.candidates-view";
import { getStages } from "../../../stages/_actions/action.stage";
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
  params: { id: string };
};

export default async function CandidatesPage({ params }: Props) {
  const { id } = await params;

  const [candidatesData, stages] = await Promise.all([
    getCandidates(id),
    getStages(),
  ]);

  if (!candidatesData) {
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
            <BreadcrumbPage>{candidatesData.job.position.nama}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <CandidatesView
        job={candidatesData.job}
        candidates={candidatesData.candidates.map((candidate) => ({
          ...candidate,
          totalScore: candidate.totalScore ?? 0,
        }))}
        stages={stages}
      />
    </div>
  );
}
