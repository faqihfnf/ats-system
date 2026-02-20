"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { updateJobStatus } from "../_actions/action.job";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  status: string;
  jobId: string;
};

export function StatusBadge({ status, jobId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const statusConfig = {
    DRAFT: { label: "Draft", variant: "secondary" as const, color: "text-muted-foreground" },
    OPEN: { label: "Active", variant: "default" as const, color: "text-green-600" },
    CLOSED: { label: "Closed", variant: "outline" as const, color: "text-red-600" },
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

  async function handleStatusChange(newStatus: string) {
    setLoading(true);
    const result = await updateJobStatus(jobId, newStatus);
    
    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Status berhasil diubah", { position: "top-right" });
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild disabled={loading}>
        <button className="inline-flex items-center gap-1 outline-none">
          <div className={`size-2 rounded-full ${status === 'OPEN' ? 'bg-green-600' : status === 'CLOSED' ? 'bg-red-600' : 'bg-gray-400'}`} />
          <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
          <ChevronDown className="size-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleStatusChange("DRAFT")}>
          <div className="size-2 rounded-full bg-gray-400 mr-2" />
          Draft
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("OPEN")}>
          <div className="size-2 rounded-full bg-green-600 mr-2" />
          Active
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange("CLOSED")}>
          <div className="size-2 rounded-full bg-red-600 mr-2" />
          Closed
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}