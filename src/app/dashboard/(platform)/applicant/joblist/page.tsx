export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getJobs } from "./_actions/action.job";
import { JobTable } from "./_components/comp.job-table";

export default async function JobListPage() {
  const { jobs, stages } = await getJobs();

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job List</h1>
          <p className="text-sm text-muted-foreground">
            Kelola lowongan pekerjaan
          </p>
        </div>
        <Link href="/dashboard/applicant/joblist/create">
          <Button>
            <Plus className="size-4 mr-2" />
            Buat Lowongan
          </Button>
        </Link>
      </div>

      <JobTable data={jobs} stages={stages} />
    </div>
  );
}