"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusForm } from "./comp.status-form";
import { DeleteButton } from "./comp.delete-button";

type Status = {
  id: string;
  name: string;
};

export function StatusTable({ data }: { data: Status[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada status. Tambahkan status kepegawaian pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Status</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-center">
                <StatusForm status={item} />
              </TableCell>
              <TableCell className="text-center">
                <DeleteButton id={item.id} name={item.name} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}