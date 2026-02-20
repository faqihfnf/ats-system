"use client";

import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateJobStatus } from "../_actions/action.job";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  status: string;
  jobId: string;
};

export function StatusDropdown({ status, jobId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const statusConfig = {
    DRAFT: { label: "Draft" },
    OPEN: { label: "Active" },
    CLOSED: { label: "Closed" },
  };

  const currentLabel = statusConfig[status as keyof typeof statusConfig]?.label || "Draft";

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
    <Select value={status} onValueChange={handleStatusChange} disabled={loading}>
      <SelectTrigger className="w-28">
        <SelectValue>
          <div className="flex items-center gap-2">
            <div className={`size-2 rounded-full ${
              status === 'OPEN' ? 'bg-green-600' : 
              status === 'CLOSED' ? 'bg-red-600' : 
              'bg-gray-400'
            }`} />
            <span>{currentLabel}</span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="DRAFT">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-gray-400" />
            Draft
          </div>
        </SelectItem>
        <SelectItem value="OPEN">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-green-600" />
            Active
          </div>
        </SelectItem>
        <SelectItem value="CLOSED">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-red-600" />
            Closed
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
}