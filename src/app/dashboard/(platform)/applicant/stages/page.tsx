export const dynamic = "force-dynamic";

import { getStages } from "./_actions/action.stage";
import { StageForm } from "./_components/comp.stage-form";
import { StageTable } from "./_components/comp.stage-table";

export default async function StagePage() {
  const stages = await getStages();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Stages</h1>
        </div>
        <StageForm />
      </div>
      <StageTable data={stages} />
    </div>
  );
}