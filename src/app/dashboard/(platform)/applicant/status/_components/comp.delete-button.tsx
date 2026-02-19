"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2 } from "lucide-react";
import { deleteStatus } from "../_actions/action.status";
import { toast } from "sonner";

type Props = { id: string; name: string };

export function DeleteButton({ id, name }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    const result = await deleteStatus(id);
    setLoading(false);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      setOpen(false);
      router.refresh();
      setTimeout(() => {
        toast.success("Status berhasil dihapus", { position: "top-right" });
      }, 150);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild suppressHydrationWarning>
        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" suppressHydrationWarning>
          <Trash2 className="size-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Status</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus status <strong>{name}</strong>? Tindakan ini tidak dapat dibatalkan.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <Button onClick={handleDelete} disabled={loading} className="bg-destructive hover:bg-destructive/90 text-white">
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" />
                Menghapus...
              </>
            ) : "Hapus"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}