"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BranchForm } from "./comp.branch-form";
import { DeleteButton } from "./comp.delete-button";

type Branch = {
  id: string;
  name: string;
  address: string | null;
};

export function BranchTable({ data }: { data: Branch[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada branch. Tambahkan branch pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Branch</TableHead>
            <TableHead>Alamat</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {item.address || "-"}
              </TableCell>
              <TableCell className="text-center">
                <BranchForm branch={item} />
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