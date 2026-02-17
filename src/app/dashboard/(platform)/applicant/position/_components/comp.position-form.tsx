"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Plus } from "lucide-react";
import { createPosition, updatePosition } from "../_actions/action.position";
import { toast } from "sonner";

type Option = { id: string; nama: string };

type Props = {
  divisiOptions: Option[];
  levelOptions: Option[];
  position?: { id: string; nama: string; divisiId: string; levelId: string };
};

export function PositionForm({ divisiOptions, levelOptions, position }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDivisi, setSelectedDivisi] = useState(position?.divisiId ?? "");
  const [selectedLevel, setSelectedLevel] = useState(position?.levelId ?? "");
  const isEdit = !!position;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("divisiId", selectedDivisi);
    formData.set("levelId", selectedLevel);

    const result = isEdit
      ? await updatePosition(position.id, formData)
      : await createPosition(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      setSelectedDivisi("");
      setSelectedLevel("");
      setTimeout(() => {
        toast.success(
          isEdit ? "Posisi berhasil diubah" : "Posisi berhasil ditambahkan",
          { position: "top-right" }
        );
      }, 150);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (loading) return;
      setOpen(val);
      if (!val) {
        setError(null);
        setSelectedDivisi(position?.divisiId ?? "");
        setSelectedLevel(position?.levelId ?? "");
      }
    }}>
      <DialogTrigger asChild suppressHydrationWarning>
        {isEdit ? (
          <Button variant="ghost" size="icon" suppressHydrationWarning>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button suppressHydrationWarning>
            <Plus className="size-4 mr-2" />
            Tambah Posisi
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Posisi" : "Tambah Posisi"}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            await handleSubmit(formData);
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Posisi</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={position?.nama}
              placeholder="contoh: Software Engineer"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Divisi</Label>
            <Select
              value={selectedDivisi}
              onValueChange={setSelectedDivisi}
              disabled={loading}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Pilih divisi..." />
              </SelectTrigger>
              <SelectContent>
                {divisiOptions.map((d) => (
                  <SelectItem className="cursor-pointer" key={d.id} value={d.id}>{d.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Level</Label>
            <Select
              value={selectedLevel}
              onValueChange={setSelectedLevel}
              disabled={loading}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Pilih level..." />
              </SelectTrigger>
              <SelectContent>
                {levelOptions.map((l) => (
                  <SelectItem className="cursor-pointer" key={l.id} value={l.id}>{l.nama}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={loading || !selectedDivisi || !selectedLevel}>
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