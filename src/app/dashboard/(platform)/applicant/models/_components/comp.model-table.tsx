"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ModelForm } from "./comp.model-form";
import { DeleteButton } from "./comp.delete-button";

type AiModel = {
  id: string;
  name: string;
  modelId: string;
};

export function ModelTable({ data }: { data: AiModel[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada model AI. Tambahkan model pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama Model</TableHead>
            <TableHead>Model ID</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm">{item.modelId}</TableCell>
              <TableCell className="text-center">
                <ModelForm model={item} />
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
