export const dynamic = "force-dynamic";

import { getStatuses } from "./_actions/action.status";
import { StatusForm } from "./_components/comp.status-form";
import { StatusTable } from "./_components/comp.status-table";

export default async function StatusPage() {
  const statuses = await getStatuses();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Employment Status</h1>
          
        </div>
        <StatusForm />
      </div>
      <StatusTable data={statuses} />
    </div>
  );
}