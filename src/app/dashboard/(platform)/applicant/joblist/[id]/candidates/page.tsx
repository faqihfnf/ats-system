export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getCandidates } from "./_actions/action.candidates";
import { CandidatesView } from "./_components/comp.candidates-view";
import { getStages } from "../../../stages/_actions/action.stage";

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
    <div className="w-full px-4 py-8">
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
