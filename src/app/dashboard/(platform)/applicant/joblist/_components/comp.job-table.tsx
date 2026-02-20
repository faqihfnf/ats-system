"use client";

import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "./comp.delete-button";
import { StatusDropdown } from "./comp.status-dropdown";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";

type Job = {
  id: string;
  status: string;
  createdAt: Date;
  position: {
    nama: string;
    divisi: { nama: string };
    level: { nama: string };
  };
  creator: {
    nama: string;
  };
};

type Stage = {
  id: string;
  name: string;
  order: number;
};

type Props = {
  data: Job[];
  stages: Stage[];
};

export function JobTable({ data, stages }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada lowongan. Buat lowongan pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="p-4 text-left text-sm font-medium text-muted-foreground w-full">Role</th>
            <th className="p-4 text-center text-sm font-medium text-muted-foreground">Stages</th>
            <th className="p-4 text-center text-sm font-medium text-muted-foreground w-16">Status</th>
            <th className="p-4 text-center text-sm font-medium text-muted-foreground w-10">Edit</th>
            <th className="p-4 text-center text-sm font-medium text-muted-foreground w-10">Hapus</th>
          </tr>
        </thead>
        <tbody>
          {data.map((job) => (
            <tr key={job.id} className="border-b hover:bg-muted/50">
              {/* Role Column */}
              <td className="p-4">
                <div className="space-y-1">
                  <Link 
                    href={`/dashboard/applicant/joblist/${job.id}`}
                    className="font-medium text-primary hover:underline"
                  >
                    {job.position.nama}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {job.creator.nama} • {format(new Date(job.createdAt), "d MMM yyyy", { locale: idLocale })}
                  </p>
                </div>
              </td>

              {/* Stages Column */}
              <td className="p-4">
                <div className="flex items-center gap-6">
                  {stages.map((stage) => (
                    <div key={stage.id} className="flex flex-col items-center min-w-16">
                      <p className="text-2xl font-semibold">0</p>
                      <p className="text-xs text-muted-foreground text-center">{stage.name}</p>
                    </div>
                  ))}
                </div>
              </td>

              {/* Status Column */}
              <td className="p-4 text-center">
                <StatusDropdown status={job.status} jobId={job.id} />
              </td>

              {/* Edit Column */}
              <td className="p-4 text-center">
                <Link href={`/dashboard/applicant/joblist/${job.id}/edit`}>
                  <Button variant="ghost" size="icon" suppressHydrationWarning>
                    <Pencil className="size-4" />
                  </Button>
                </Link>
              </td>

              {/* Delete Column */}
              <td className="p-4 text-center">
                <DeleteButton id={job.id} name={job.position.nama} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}