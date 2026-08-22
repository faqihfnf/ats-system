"use client";

import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { toggleApplicantSourceActive } from "../_actions/action.applicant-source";
import type { ApplicantSourceItem } from "../_actions/action.applicant-source";
import { SourceForm } from "./comp.source-form";
import { SourceDeleteButton } from "./comp.source-delete-button";

const categoryLabel: Record<string, string> = {
  CAREER_SITE: "Career Site",
  JOB_PORTAL: "Job Portal",
  SOCIAL_MEDIA: "Social Media",
  REFERRAL: "Referral",
  OTHER: "Lainnya",
};

const categoryBadgeClass: Record<string, string> = {
  CAREER_SITE: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  JOB_PORTAL:
    "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300",
  SOCIAL_MEDIA:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REFERRAL:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  OTHER: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function SourceTable({ data }: { data: ApplicantSourceItem[] }) {
  const router = useRouter();

  async function handleToggleActive(id: string, isActive: boolean) {
    const result = await toggleApplicantSourceActive(id, isActive);
    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success(
        isActive ? "Source diaktifkan" : "Source dinonaktifkan",
        { position: "top-right" },
      );
      router.refresh();
    }
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Belum ada source. Tambahkan source pertama.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Header */}
      <div className="grid grid-cols-[1fr_1fr_10rem_8rem_7rem_6rem] bg-muted/50 border-b">
        <div className="p-4 text-sm font-medium text-muted-foreground">
          Kode
        </div>
        <div className="p-4 text-sm font-medium text-muted-foreground">
          Nama
        </div>
        <div className="p-4 text-sm font-medium text-muted-foreground">
          Kategori
        </div>
        <div className="p-4 text-sm font-medium text-muted-foreground text-center">
          Dipakai
        </div>
        <div className="p-4 text-sm font-medium text-muted-foreground text-center">
          Aktif
        </div>
        <div className="p-4 text-sm font-medium text-muted-foreground text-center">
          Aksi
        </div>
      </div>

      {/* Rows */}
      {data.map((item) => {
        const inUse = item._count.applications > 0;
        return (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_1fr_10rem_8rem_7rem_6rem] border-b transition-colors hover:bg-muted/50 items-center last:border-0"
          >
            <div className="p-4 font-mono text-sm">{item.code}</div>
            <div className="p-4 font-medium">{item.name}</div>
            <div className="p-4">
              <Badge
                variant="secondary"
                className={categoryBadgeClass[item.category] ?? ""}
              >
                {categoryLabel[item.category] ?? item.category}
              </Badge>
            </div>
            <div className="p-4 text-center text-sm">
              {inUse ? (
                <span className="font-medium">
                  {item._count.applications} applicant
                </span>
              ) : (
                <span className="text-muted-foreground">-</span>
              )}
            </div>
            <div className="p-4 flex justify-center">
              <Switch
                checked={item.isActive}
                onCheckedChange={(v) => handleToggleActive(item.id, v)}
                aria-label="Toggle aktif"
              />
            </div>
            <div className="p-4 flex justify-center gap-1">
              <SourceForm
                source={{
                  id: item.id,
                  code: item.code,
                  name: item.name,
                  category: item.category,
                }}
              />
              <SourceDeleteButton
                id={item.id}
                name={item.name}
                disabled={inUse}
                usageCount={item._count.applications}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}