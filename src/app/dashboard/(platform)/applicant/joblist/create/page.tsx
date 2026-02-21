export const dynamic = "force-dynamic";

import { getPositions } from "../../position/_actions/action.position";
import { getBranches } from "../../branch/_actions/action.branch";
import { getStatuses } from "../../status/_actions/action.status";
import { getEducations } from "../../education/_actions/action.education";
import { getExperiences } from "../../experience/_actions/action.experience";
import { JobCreateForm } from "./_components/comp.job-create-form";
import { getAvailablePositions } from "../_actions/action.job";

export default async function JobCreatePage() {
  const [positions, branches, statuses, educations, experiences] = await Promise.all([
    getAvailablePositions(),
    getBranches(),
    getStatuses(),
    getEducations(),
    getExperiences(),
  ]);

  return (
    <div className="w-full py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold">Buat Lowongan Baru</h1>
          <p className="text-sm text-muted-foreground">
            Lengkapi informasi lowongan pekerjaan
          </p>
        </div>
        <JobCreateForm
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