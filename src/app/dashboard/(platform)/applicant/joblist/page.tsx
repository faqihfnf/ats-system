export const dynamic = "force-dynamic";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";

export default async function JobListPage() {
  return (
    <div className="space-y-6 max-w-7xl w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Job List</h1>
        </div>
        <Link href="/dashboard/applicant/joblist/create">
          <Button>
            <Plus className="size-4 mr-2" />
            Buat Lowongan
          </Button>
        </Link>
      </div>

      {/* Placeholder untuk table */}
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada lowongan. Buat lowongan pertama Anda.
        </p>
      </div>
    </div>
  );
}