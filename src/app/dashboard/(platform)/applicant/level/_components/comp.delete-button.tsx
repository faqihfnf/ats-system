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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Trash2 } from "lucide-react";
import { deleteLevel } from "../_actions/action.level";
import { toast } from "sonner";

type Props = {
  id: string;
  nama: string;
  disabled: boolean;
};

export function DeleteButton({ id, nama, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
  setLoading(true);
  const result = await deleteLevel(id);
  setLoading(false);

  if (result?.error) {
    toast.error(result.error, { position: "top-right" });
  } else {
    setOpen(false);
    setTimeout(() => {
      toast.success("Level berhasil dihapus", { position: "top-right" });
    }, 150); // ← tunggu dialog selesai animasi close
  }
}

  if (disabled) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button variant="ghost" size="icon" disabled>
              <Trash2 className="size-4" />
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>
          Tidak dapat dihapus!
        </TooltipContent>
      </Tooltip>
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
          <AlertDialogTitle>Hapus Level</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus level <strong>{nama}</strong>?
            Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <Button
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive hover:bg-destructive/90 text-white"
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