export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getJobForEdit, getAllPositions } from "../../_actions/action.job";
import { getBranches } from "../../../branch/_actions/action.branch";
import { getStatuses } from "../../../status/_actions/action.status";
import { getEducations } from "../../../education/_actions/action.education";
import { getExperiences } from "../../../experience/_actions/action.experience";
import { JobEditForm } from "./_components/comp.job-edit-form";

type Props = {
  params: { id: string };
};

export default async function JobEditPage({ params }: Props) {
  const { id } = await params;

  const [job, positions, branches, statuses, educations, experiences] =
    await Promise.all([
      getJobForEdit(id),
      getAllPositions(),
      getBranches(),
      getStatuses(),
      getEducations(),
      getExperiences(),
    ]);

  if (!job) {
    notFound();
  }

  return (
    <div className="w-full px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Edit Lowongan</h1>
          <p className="text-muted-foreground text-sm">
            Update informasi lowongan pekerjaan
          </p>
        </div>
        <JobEditForm
          job={job}
          positions={positions}
          branches={branches}
          statuses={statuses}
          educations={educations}
          experiences={experiences}
        />
      </div>
    </div>
  );
}
