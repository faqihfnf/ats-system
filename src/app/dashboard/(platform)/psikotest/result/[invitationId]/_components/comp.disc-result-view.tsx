"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, AlertTriangle, User, Briefcase } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { getDiscProfile } from "@/lib/disc/profiles";
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Cell,
} from "recharts";

type Props = {
  invitation: {
    id: string;
    status: string;
    tabSwitchCount: number;
    createdAt: Date;
    openedAt: Date | null;
    completedAt: Date | null;
    application: {
      id: string;
      fullName: string;
      email: string;
      phone: string;
      job: {
        position: {
          nama: string;
          divisi: { nama: string };
          level: { nama: string };
        };
      };
    };
    result: {
      id: string;
      scoreD: number;
      scoreI: number;
      scoreS: number;
      scoreC: number;
      dominantType: string;
      profileLabel: string;
      completedAt: Date;
    };
    sentBy: { nama: string };
  };
};

const COLORS: Record<string, string> = {
  D: "#ef4444",
  I: "#eab308",
  S: "#3b82f6",
  C: "#22c55e",
};

export function DiscResultView({ invitation }: Props) {
  const { result, application } = invitation;
  const profile = getDiscProfile(result.dominantType);

  const chartData = [
    { name: "D (Dominance)", score: result.scoreD, dimension: "D" },
    { name: "I (Influence)", score: result.scoreI, dimension: "I" },
    { name: "S (Steadiness)", score: result.scoreS, dimension: "S" },
    { name: "C (Conscientiousness)", score: result.scoreC, dimension: "C" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link href="/dashboard/psikotest/report">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke Report
          </Button>
        </Link>
      </div>

      {/* Candidate Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{application.fullName}</h2>
                <p className="text-sm text-muted-foreground">{application.email}</p>
                <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="h-3.5 w-3.5" />
                  <span>
                    {application.job.position.nama} • {application.job.position.divisi.nama}
                  </span>
                </div>
              </div>
            </div>

            {/* Tab Switch Warning */}
            {invitation.tabSwitchCount >= 3 && (
              <Badge variant="destructive" className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                Tab Switch: {invitation.tabSwitchCount}x
              </Badge>
            )}
            {invitation.tabSwitchCount > 0 && invitation.tabSwitchCount < 3 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Tab Switch: {invitation.tabSwitchCount}x
              </Badge>
            )}
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Dikirim oleh</p>
              <p className="font-medium">{invitation.sentBy.nama}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tanggal Kirim</p>
              <p className="font-medium">
                {format(new Date(invitation.createdAt), "d MMM yyyy, HH:mm", {
                  locale: idLocale,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Selesai</p>
              <p className="font-medium">
                {result.completedAt
                  ? format(new Date(result.completedAt), "d MMM yyyy, HH:mm", {
                      locale: idLocale,
                    })
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Score Chart + Dominant Type */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Skor DISC</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis type="category" dataKey="name" width={160} tick={{ fontSize: 13 }} />
                <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.dimension} fill={COLORS[entry.dimension]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dominant Type */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tipe Dominan</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
              style={{ backgroundColor: `${COLORS[result.dominantType]}20` }}
            >
              <span
                className="text-2xl font-bold"
                style={{ color: COLORS[result.dominantType] }}
              >
                {result.dominantType}
              </span>
            </div>
            <h3 className="text-lg font-bold">{profile.label}</h3>
            <p className="text-sm text-muted-foreground">{profile.title}</p>

            <div className="mt-4 grid grid-cols-4 gap-2 text-center text-xs">
              <div>
                <p className="font-bold text-red-600">{result.scoreD}</p>
                <p className="text-muted-foreground">D</p>
              </div>
              <div>
                <p className="font-bold text-yellow-600">{result.scoreI}</p>
                <p className="text-muted-foreground">I</p>
              </div>
              <div>
                <p className="font-bold text-blue-600">{result.scoreS}</p>
                <p className="text-muted-foreground">S</p>
              </div>
              <div>
                <p className="font-bold text-green-600">{result.scoreC}</p>
                <p className="text-muted-foreground">C</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Profile Description */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profil Kepribadian</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-sm leading-relaxed text-muted-foreground">
            {profile.description}
          </p>

          <div className="grid grid-cols-2 gap-6">
            {/* Strengths */}
            <div>
              <h4 className="mb-2 font-semibold text-green-700">Kekuatan</h4>
              <ul className="space-y-1.5">
                {profile.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div>
              <h4 className="mb-2 font-semibold text-red-700">Area Pengembangan</h4>
              <ul className="space-y-1.5">
                {profile.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-6">
            {/* Work Style */}
            <div>
              <h4 className="mb-2 font-semibold">Gaya Kerja</h4>
              <p className="text-sm text-muted-foreground">{profile.workStyle}</p>
            </div>

            {/* Communication */}
            <div>
              <h4 className="mb-2 font-semibold">Komunikasi</h4>
              <p className="text-sm text-muted-foreground">{profile.communication}</p>
            </div>
          </div>

          <Separator />

          {/* Suitable Roles */}
          <div>
            <h4 className="mb-2 font-semibold">Cocok Untuk Posisi</h4>
            <div className="flex flex-wrap gap-2">
              {profile.suitableRoles.map((role, i) => (
                <Badge key={i} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
