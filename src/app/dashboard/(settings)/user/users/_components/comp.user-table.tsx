"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserForm } from "./comp.user-form";
import { DeleteButton } from "./comp.delete-button";

type User = {
  id: string;
  nama: string;
  role: "ADMIN" | "RECRUITER";
    email: string;
};

export function UserTable({ data }: { data: User[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">Belum ada user. Tambahkan user pertama.</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nama</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead className="w-25 text-center">Edit</TableHead>
            <TableHead className="w-25 text-center">Hapus</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.nama}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                <UserForm user={{ id: user.id, nama: user.nama, role: user.role }} />
              </TableCell>
              <TableCell className="text-center">
                <DeleteButton id={user.id} nama={user.nama} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}