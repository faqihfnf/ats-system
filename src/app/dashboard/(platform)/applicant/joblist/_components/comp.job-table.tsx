"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { DeleteButton } from "./comp.delete-button";
import { StatusDropdown } from "./comp.status-dropdown";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  applications: Array<{
    currentStageId: string | null;
  }>;
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
  // Helper function to count candidates per stage for a job
  function getStageCount(job: Job, stageId: string): number {
    return job.applications.filter((app) => app.currentStageId === stageId)
      .length;
  }

  // Helper to check if stage is reject
  function isRejectStage(stageName: string): boolean {
    return stageName.toLowerCase().includes("reject");
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground text-sm">
          Belum ada lowongan. Buat lowongan pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border shadow-sm">
      <div className="w-full">
        <Table className="w-full table-fixed border-collapse">
          <TableHeader>
            <TableRow className="border-b">
              <TableHead className="w-80 p-4 text-left text-sm font-semibold">
                Job Title
              </TableHead>
              <TableHead className="p-4 text-center text-sm font-semibold">
                Stages
              </TableHead>
              <TableHead className="w-32 p-4 text-center text-sm font-semibold">
                Status
              </TableHead>
              <TableHead className="w-12 p-4 text-center text-sm font-semibold">
                Edit
              </TableHead>
              <TableHead className="w-20 p-4 text-center text-sm font-semibold">
                Hapus
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((job) => (
              <TableRow
                key={job.id}
                className="border-b transition-colors last:border-0"
              >
                {/* Role */}
                <TableCell className="p-4 align-middle">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/applicant/joblist/${job.id}/candidates`}
                      className="text-primary text-[15px] font-bold hover:underline"
                    >
                      {job.position.nama}
                    </Link>
                    <p className="text-muted-foreground text-xs font-medium">
                      {job.creator.nama} •{" "}
                      {format(new Date(job.createdAt), "d MMM yyyy", {
                        locale: idLocale,
                      })}
                    </p>
                  </div>
                </TableCell>

                {/* Stages */}
                <TableCell className="p-4 align-middle">
                  <div className="w-full overflow-hidden">
                    <div className="custom-scrollbar cursor-grab overflow-x-auto pb-2 active:cursor-grabbing">
                      <div className="flex min-w-max items-center gap-6 px-2">
                        {stages.map((stage) => {
                          const count = getStageCount(job, stage.id);
                          const isRejected = isRejectStage(stage.name);

                          return (
                            <div
                              key={stage.id}
                              className="flex min-w-24 shrink-0 flex-col items-center"
                            >
                              <span
                                className={cn(
                                  "text-xl font-bold",
                                  isRejected
                                    ? "text-destructive dark:text-destructive"
                                    : "text-slate-800 dark:text-slate-200",
                                )}
                              >
                                {count}
                              </span>
                              <span
                                className={cn(
                                  "text-center text-[10px] leading-tight font-bold tracking-tight whitespace-nowrap uppercase",
                                  isRejected
                                    ? "text-destructive/70 dark:text-destructive/70"
                                    : "text-slate-400 dark:text-slate-500",
                                )}
                              >
                                {stage.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* Status */}
                <TableCell className="p-4 text-center align-middle">
                  <StatusDropdown status={job.status} jobId={job.id} />
                </TableCell>

                {/* Action */}
                <TableCell className="p-4 text-center align-middle">
                  <Link href={`/dashboard/applicant/joblist/${job.id}/edit`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 rounded-full hover:bg-slate-100"
                    >
                      <Pencil className="size-4" />
                    </Button>
                  </Link>
                </TableCell>
                <TableCell className="p-4 text-center align-middle">
                  <DeleteButton id={job.id} name={job.position.nama} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
