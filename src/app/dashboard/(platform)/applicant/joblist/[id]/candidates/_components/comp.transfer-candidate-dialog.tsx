"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  transferCandidate,
  getActiveJobs,
} from "../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Job = {
  id: string;
  position: {
    nama: string;
    divisi: { nama: string };
    level: { nama: string };
  };
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidateId: string;
  candidateName: string;
  currentJobId: string;
  currentJobTitle: string;
  currentStage: string;
};

export function TransferCandidateDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  currentJobId,
  currentJobTitle,
  currentStage,
}: Props) {
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingJobs, setIsFetchingJobs] = useState(false);

  // Fetch active jobs when dialog opens
  useEffect(() => {
    if (open) {
      setIsFetchingJobs(true);
      getActiveJobs().then((data) => {
        // Filter out current job
        const filteredJobs = data.filter((job) => job.id !== currentJobId);
        setJobs(filteredJobs);
        setIsFetchingJobs(false);
      });
    }
  }, [open, currentJobId]);

  async function handleTransfer() {
    if (!selectedJobId) {
      toast.error("Please select a job", { position: "top-right" });
      return;
    }

    setIsLoading(true);

    const result = await transferCandidate(
      candidateId,
      currentJobId,
      selectedJobId,
    );

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Candidate transferred successfully", {
        position: "top-right",
      });
      router.refresh();
      onOpenChange(false);
    }

    setIsLoading(false);
  }

  const selectedJob = jobs.find((job) => job.id === selectedJobId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-125">
        <DialogHeader>
          <DialogTitle>Pindahkan Kandidat</DialogTitle>
          <DialogDescription>
            Pindahkan kandidat ke lowongan pekerjaan lain
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Info */}
          <div className="space-y-2 rounded-lg border p-4">
            <div>
              <p className="text-sm font-medium">Kandidat:</p>
              <p className="text-muted-foreground text-sm">{candidateName}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Lowongan Saat Ini:</p>
              <p className="text-muted-foreground text-sm">{currentJobTitle}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Stage Saat Ini:</p>
              <p className="text-muted-foreground text-sm">{currentStage}</p>
            </div>
          </div>

          {/* Target Job Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Pindahkan Ke:</label>
            <Select
              value={selectedJobId}
              onValueChange={setSelectedJobId}
              disabled={isFetchingJobs}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    isFetchingJobs ? "Loading jobs..." : "Pilih lowongan..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job) => (
                  <SelectItem key={job.id} value={job.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{job.position.nama}</span>
                    </div>
                  </SelectItem>
                ))}
                {jobs.length === 0 && !isFetchingJobs && (
                  <SelectItem value="none" disabled>
                    Tidak ada lowongan aktif lainnya
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Warning Alert */}
          <Alert variant="destructive">
            <AlertTriangle className="-mt-1.5 h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Peringatan:</strong>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>Jawaban custom questions akan dihapus</li>
                <li>Stage akan direset ke tahap awal</li>
                <li>Score & analisa AI akan direset.</li>
                <li className="text-green-600">
                  CV dan data pribadi tetap tersimpan
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          {/* Preview Target Job */}
          {selectedJob && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4 dark:bg-green-950">
              <p className="text-sm font-medium text-green-900 dark:text-green-100">
                Lowongan Tujuan:
              </p>
              <p className="text-sm text-green-700 dark:text-green-300">
                {selectedJob.position.nama}
              </p>
              <p className="text-xs text-green-600 dark:text-green-400">
                {selectedJob.position.divisi.nama} •{" "}
                {selectedJob.position.level.nama}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button
            onClick={handleTransfer}
            disabled={isLoading || !selectedJobId}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Memindahkan...
              </>
            ) : (
              "Pindahkan"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
