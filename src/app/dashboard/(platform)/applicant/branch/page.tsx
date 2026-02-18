export const dynamic = "force-dynamic";

import { getBranches } from "./_actions/action.branch";
import { BranchForm } from "./_components/comp.branch-form";
import { BranchTable } from "./_components/comp.branch-table";

export default async function BranchPage() {
  const branches = await getBranches();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Branch</h1>
          <p className="text-sm text-muted-foreground">
            Kelola cabang perusahaan
          </p>
        </div>
        <BranchForm />
      </div>
      <BranchTable data={branches} />
    </div>
  );
}