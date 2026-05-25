"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

type Invitation = {
  id: string;
  token: string;
  status: string;
  tabSwitchCount: number;
  createdAt: Date;
  openedAt: Date | null;
  completedAt: Date | null;
  expiresAt: Date;
  application: {
    id: string;
    fullName: string;
    email: string;
    job: {
      id: string;
      position: {
        nama: string;
        divisi: { nama: string };
      };
    };
  };
  result: {
    scoreD: number;
    scoreI: number;
    scoreS: number;
    scoreC: number;
    dominantType: string;
    profileLabel: string;
    completedAt: Date;
  } | null;
  sentBy: { nama: string };
};

type Props = {
  invitations: Invitation[];
};

function StatusBadge({ status, expiresAt }: { status: string; expiresAt: Date }) {
  // Kalau masih PENDING/IN_PROGRESS tapi sudah lewat expiresAt → tampilkan Expired
  const isActuallyExpired =
    (status === "PENDING" || status === "IN_PROGRESS") &&
    new Date(expiresAt) < new Date();

  const displayStatus = isActuallyExpired ? "EXPIRED" : status;

  switch (displayStatus) {
    case "PENDING":
      return <Badge variant="secondary">Belum Dibuka</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Sedang Dikerjakan</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Selesai</Badge>;
    case "EXPIRED":
      return <Badge variant="destructive">Expired</Badge>;
    default:
      return <Badge variant="outline">{displayStatus}</Badge>;
  }
}

function DominantTypeBadge({ type, label }: { type: string; label: string }) {
  const colors: Record<string, string> = {
    D: "bg-red-100 text-red-800",
    I: "bg-yellow-100 text-yellow-800",
    S: "bg-blue-100 text-blue-800",
    C: "bg-green-100 text-green-800",
  };

  return (
    <Badge className={`${colors[type] || "bg-slate-100 text-slate-800"} hover:opacity-90`}>
      {type} — {label}
    </Badge>
  );
}

export function DiscReportTable({ invitations }: Props) {
  if (invitations.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-muted-foreground">
            Belum ada undangan DISC yang dikirim.
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Kirim undangan DISC dari halaman detail kandidat.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Kandidat</TableHead>
              <TableHead>Posisi</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hasil</TableHead>
              <TableHead>Tab Switch</TableHead>
              <TableHead>Dikirim</TableHead>
              <TableHead>Oleh</TableHead>
              <TableHead className="text-right">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => (
              <TableRow key={inv.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-sm">{inv.application.fullName}</p>
                    <p className="text-xs text-muted-foreground">{inv.application.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm">{inv.application.job.position.nama}</p>
                    <p className="text-xs text-muted-foreground">
                      {inv.application.job.position.divisi.nama}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <StatusBadge status={inv.status} expiresAt={inv.expiresAt} />
                </TableCell>
                <TableCell>
                  {inv.result ? (
                    <DominantTypeBadge
                      type={inv.result.dominantType}
                      label={inv.result.profileLabel}
                    />
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <span className="text-sm">{inv.tabSwitchCount}</span>
                    {inv.tabSwitchCount >= 3 && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm">
                    {format(new Date(inv.createdAt), "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </span>
                </TableCell>
                <TableCell>
                  <span className="text-sm">{inv.sentBy.nama}</span>
                </TableCell>
                <TableCell className="text-right">
                  {inv.result ? (
                    <Link href={`/dashboard/psikotest/result/${inv.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
