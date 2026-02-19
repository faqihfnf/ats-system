export const dynamic = "force-dynamic";

import { getPositions } from "../../position/_actions/action.position";
import { getBranches } from "../../branch/_actions/action.branch";
import { getStatuses } from "../../status/_actions/action.status";
import { JobCreateForm } from "./_components/job-create-form";

export default async function JobCreatePage() {
  const [positions, branches, statuses] = await Promise.all([
    getPositions(),
    getBranches(),
    getStatuses(),
  ]);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold">Buat Lowongan Baru</h1>
        <p className="text-sm text-muted-foreground">
          Lengkapi informasi lowongan pekerjaan
        </p>
      </div>
      <JobCreateForm
        positions={positions}
        branches={branches}
        statuses={statuses}
      />
    </div>
  );
}