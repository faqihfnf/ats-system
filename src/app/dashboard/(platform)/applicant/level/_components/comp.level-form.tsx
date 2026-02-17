"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Pencil, Plus } from "lucide-react";
import { createLevel, updateLevel } from "../_actions/action.level";
import { toast } from "sonner";

type Props = {
  level?: { id: string; nama: string };
};

export function LevelForm({ level }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!level;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    const result = isEdit
      ? await updateLevel(level.id, formData)
      : await createLevel(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      setTimeout(() => {
        toast.success(
          isEdit ? "Level berhasil diubah" : "Level berhasil ditambahkan",
          { position: "top-right" }
        );
      }, 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (loading) return; // ← cegah dialog ditutup saat loading
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
            Tambah Level
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Level" : "Tambah Level"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={async (e) => {e.preventDefault();
      const formData = new FormData(e.currentTarget);
        await handleSubmit(formData);}}className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Level</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={level?.nama}
              placeholder="contoh: Staff, Manager, Supervisor"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="size-4 mr-2 animate-spin" />
                  Menyimpan...
                </>
              ) : (
                "Simpan"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}