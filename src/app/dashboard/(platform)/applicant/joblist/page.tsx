export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { getJobs } from "./_actions/action.job";
import { JobTable } from "./_components/comp.job-table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default async function JobListPage() {
  const { jobs, stages } = await getJobs();

  if (!jobs || !stages) {
    return <div>Error loading data</div>;
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
            <BreadcrumbPage>Job List</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job List</h1>
          <p className="text-muted-foreground text-sm">
            Kelola lowongan pekerjaan
          </p>
        </div>
        <Link href="/dashboard/applicant/joblist/create">
          <Button>
            <Plus className="mr-2 size-4" />
            Buat Lowongan
          </Button>
        </Link>
      </div>

      <JobTable data={jobs} stages={stages} />
    </div>
  );
}
