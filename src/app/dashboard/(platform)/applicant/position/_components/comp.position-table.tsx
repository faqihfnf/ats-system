"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PositionForm } from "./comp.position-form";
import { DeleteButton } from "./comp.delete-button";

type Position = {
  id: string;
  nama: string;
  divisi: { id: string; nama: string };
  level: { id: string; nama: string };
};

type Option = { id: string; nama: string };

type Props = {
  data: Position[];
  divisiOptions: Option[];
  levelOptions: Option[];
};

export function PositionTable({ data, divisiOptions, levelOptions }: Props) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada posisi. Tambahkan posisi pertama Anda.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Posisi</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Divisi</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.nama}</TableCell>
              <TableCell>{item.level.nama}</TableCell>
              <TableCell>{item.divisi.nama}</TableCell>
              <TableCell className="text-center">
                <PositionForm
                  divisiOptions={divisiOptions}
                  levelOptions={levelOptions}
                  position={{
                    id: item.id,
                    nama: item.nama,
                    levelId: item.level.id,
                    divisiId: item.divisi.id,
                  }}
                />
              </TableCell>
              <TableCell className="text-center">
                <DeleteButton id={item.id} nama={item.nama} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}