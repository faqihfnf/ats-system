"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LevelForm } from "./comp.level-form";
import { DeleteButton } from "./comp.delete-button";

type LevelWithCount = {
  id: string;
  nama: string;
  _count: { positions: number };
};

export function LevelTable({ data }: { data: LevelWithCount[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada level. Tambahkan level pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Level</TableHead>
            <TableHead>Jumlah Posisi</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nama}</TableCell>
              <TableCell>
                <Badge variant={item._count.positions > 0 ? "default" : "secondary"}>
                  {item._count.positions} posisi
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <LevelForm level={{ id: item.id, nama: item.nama }} />
              </TableCell>
              <TableCell className="text-center">
                <DeleteButton
                  id={item.id}
                  nama={item.nama}
                  disabled={item._count.positions > 0}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}