"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EducationForm } from "./comp.education-form";
import { DeleteButton } from "./comp.delete-button";
import { Badge } from "@/components/ui/badge";

type Education = {
  id: string;
  name: string;
  category: "SCHOOL" | "UNIVERSITY";
};

export function EducationTable({ data }: { data: Education[] }) {
  const getCategoryLabel = (category: Education["category"]) =>
    category === "SCHOOL" ? "School" : "University";

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada data pendidikan. Tambahkan pendidikan pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Pendidikan</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <Badge variant="secondary">{getCategoryLabel(item.category)}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <EducationForm education={item} />
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
