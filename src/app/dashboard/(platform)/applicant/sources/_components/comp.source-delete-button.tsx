"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { deleteApplicantSource } from "../_actions/action.applicant-source";
import { toast } from "sonner";

type Props = {
  id: string;
  name: string;
  /** Jika sudah dipakai applicant, tombol disable */
  disabled?: boolean;
  usageCount?: number;
};

export function SourceDeleteButton({
  id,
  name,
  disabled = false,
  usageCount = 0,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteApplicantSource(id);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
      setOpen(false);
    } else {
      setOpen(false);
      setTimeout(() => {
        toast.success("Source berhasil dihapus", { position: "top-right" });
      }, 150);
    }
  }

  if (disabled) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="text-muted-foreground opacity-40"
        disabled
        title={`Sudah dipakai oleh ${usageCount} applicant — tidak dapat dihapus`}
      >
        <Trash2 className="size-4" />
      </Button>
    );
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild suppressHydrationWarning>
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:text-destructive"
          suppressHydrationWarning
        >
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Source</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus source{" "}
            <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : (
              "Hapus"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}