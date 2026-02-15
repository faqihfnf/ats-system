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
import { deletePosition } from "../_actions/action.position";
import { toast } from "sonner";

type Props = {
  id: string;
  nama: string;
};

export function DeleteButton({ id, nama }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deletePosition(id);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      setOpen(false);
      setTimeout(() => {
        toast.success("Posisi berhasil dihapus", { position: "top-right" });
      }, 150);
    }
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
          <AlertDialogTitle>Hapus Posisi</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus posisi <strong>{nama}</strong>? Tindakan ini tidak dapat dibatalkan.
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