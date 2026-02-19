"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Pencil, Plus } from "lucide-react";
import { createStatus, updateStatus } from "../_actions/action.status";
import { toast } from "sonner";

type Props = {
  status?: { id: string; name: string };
};

export function StatusForm({ status }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!status;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateStatus(status.id, formData)
      : await createStatus(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
      setTimeout(() => {
        toast.success(
          isEdit ? "Status berhasil diubah" : "Status berhasil ditambahkan",
          { position: "top-right" }
        );
      }, 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (loading) return;
      setOpen(val);
      if (!val) setError(null);
    }}>
      <DialogTrigger asChild suppressHydrationWarning>
        {isEdit ? (
          <Button variant="ghost" size="icon" suppressHydrationWarning>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button suppressHydrationWarning>
            <Plus className="size-4 mr-2" />
            Tambah Status
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Status" : "Tambah Status"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Status</Label>
            <Input
              id="name"
              name="name"
              defaultValue={status?.name}
              placeholder="contoh: Kontrak, Harian, Tetap"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : "Simpan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}