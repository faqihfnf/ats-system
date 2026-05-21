"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Pencil, Plus } from "lucide-react";
import { createEducation, updateEducation } from "../_actions/action.education";
import { toast } from "sonner";

type EducationCategory = "SCHOOL" | "UNIVERSITY";

type Props = {
  education?: { id: string; name: string; category: EducationCategory };
};

export function EducationForm({ education }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<EducationCategory | "">(
    education?.category || "",
  );
  const isEdit = !!education;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!category) {
      setError("Kategori pendidikan wajib dipilih");
      setLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    const result = isEdit
      ? await updateEducation(education.id, formData)
      : await createEducation(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
      setTimeout(() => {
        toast.success(
          isEdit ? "Pendidikan berhasil diubah" : "Pendidikan berhasil ditambahkan",
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
        setCategory(education?.category || "");
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
            Tambah Pendidikan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pendidikan" : "Tambah Pendidikan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Pendidikan</Label>
            <Input
              id="name"
              name="name"
              defaultValue={education?.name}
              placeholder="contoh: SD, SMP, SMA, D3, S1, S2"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori Pendidikan</Label>
            <Select
              value={category}
              onValueChange={(value) =>
                setCategory(value as EducationCategory | "")
              }
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori pendidikan..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SCHOOL">School</SelectItem>
                <SelectItem value="UNIVERSITY">University</SelectItem>
              </SelectContent>
            </Select>
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
