"use client";

import { Card, CardContent } from "@/components/ui/card";
import { History, ArrowRight, CornerDownRight } from "lucide-react";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import type { StageHistoryEntry } from "@/types/types";

type Props = {
  history: StageHistoryEntry[];
};

const roleLabel: Record<string, string> = {
  ADMIN: "Admin",
  RECRUITER: "HR / Recruiter",
  USER: "User Divisi",
};

export function StageHistoryTimeline({ history }: Props) {
  if (history.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <History className="text-muted-foreground mb-4 h-12 w-12" />
          <p className="text-muted-foreground text-sm">
            Belum ada riwayat perpindahan stage.
          </p>
          <p className="text-muted-foreground text-xs">
            Riwayat akan muncul setiap kali stage kandidat dipindahkan.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="py-6">
        <ol>
          {history.map((entry, index) => {
            const isLatest = index === 0; // sorted desc, index 0 = terbaru
            const isLast = index === history.length - 1;
            const isInitial = entry.fromStage === null;

            return (
              <li key={entry.id} className="flex gap-4">
                {/* Kolom waktu (kiri) */}
                <div className="w-28 shrink-0 pt-0.5 text-right">
                  <p
                    className={`text-xs ${
                      isLatest
                        ? "font-semibold text-foreground"
                        : "font-medium text-muted-foreground"
                    }`}
                  >
                    {format(new Date(entry.createdAt), "d MMM yyyy", {
                      locale: idLocale,
                    })}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(entry.createdAt), "HH:mm", {
                      locale: idLocale,
                    })}
                  </p>
                </div>

                {/* Kolom garis + bullet (tengah) */}
                <div className="flex flex-col items-center">
                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full border-2 ${
                      isLatest
                        ? "border-primary bg-primary"
                        : "border-muted-foreground/40 bg-background"
                    }`}
                    aria-hidden
                  />
                  {!isLast && (
                    <span className="w-px flex-1 bg-border" aria-hidden />
                  )}
                </div>

                {/* Kolom stage + user (kanan) */}
                <div className={`flex-1 ${isLast ? "pb-1" : "pb-8"}`}>
                  <p className="flex flex-wrap items-center gap-1 text-sm">
                    {isInitial ? (
                      <>
                        <CornerDownRight className="h-3.5 w-3.5 text-primary" />
                        <span className="text-muted-foreground">Melamar</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">
                        {entry.fromStage?.name}
                      </span>
                    )}
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    <span
                      className={`font-medium ${isLatest ? "text-primary" : ""}`}
                    >
                      {entry.toStage.name}
                    </span>
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {entry.changedBy.nama} (
                    {roleLabel[entry.changedBy.role] ?? entry.changedBy.role})
                  </p>
                  {entry.note && (
                    <p className="mt-1 text-xs text-muted-foreground italic">
                      {entry.note}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}