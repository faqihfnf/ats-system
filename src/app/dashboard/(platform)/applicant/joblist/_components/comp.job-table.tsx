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
    <div className="rounded-xl border  shadow-sm overflow-hidden">
      <div className="w-full">
        <Table className="w-full table-fixed border-collapse">
          <TableHeader>
            <TableRow className="border-b ">
              <TableHead className="p-4 text-left text-sm font-semibold  w-80">
                Job Title
              </TableHead>
              <TableHead className="p-4 text-center text-sm font-semibold ">
                Stages
              </TableHead>
              <TableHead className="p-4 text-center text-sm font-semibold  w-32">
                Status
              </TableHead>
              <TableHead className="p-4 text-center text-sm font-semibold  w-12">
                Edit
              </TableHead>
              <TableHead className="p-4 text-center text-sm font-semibold  w-20">
                Hapus
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((job) => (
              <TableRow
                key={job.id}
                className="border-b last:border-0 transition-colors"
              >
                {/* Role */}
                <TableCell className="p-4 align-middle">
                  <div className="flex flex-col">
                    <Link
                      href={`/dashboard/applicant/joblist/${job.id}`}
                      className="font-bold text-primary hover:underline text-[15px]"
                    >
                      {job.position.nama}
                    </Link>
                    <p className="text-xs text-muted-foreground font-medium">
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
                    <div className="overflow-x-auto pb-2 custom-scrollbar cursor-grab active:cursor-grabbing">
                      <div className="flex items-center gap-6 min-w-max px-2">
                        {stages.map((stage) => (
                          <div
                            key={stage.id}
                            className="flex flex-col items-center shrink-0 min-w-24"
                          >
                            <span className="text-xl font-bold text-slate-800 dark:text-slate-200">
                              0
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-tight text-slate-400 dark:text-slate-500 text-center leading-tight whitespace-nowrap">
                              {stage.name}
                            </span>
                          </div>
                        ))}
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
                      <Pencil className="size-4 " />
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