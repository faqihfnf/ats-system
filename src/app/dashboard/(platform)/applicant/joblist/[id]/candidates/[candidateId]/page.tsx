export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getCandidateDetail } from "../_actions/action.candidates";
import { CandidateDetailView } from "./_components/comp.candidate-detail-view";

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
    <div className="w-full px-4 py-8">
      <CandidateDetailView candidate={candidate} jobId={id} />
    </div>
  );
}
