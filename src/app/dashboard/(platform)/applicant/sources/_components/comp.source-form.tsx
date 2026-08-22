"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Pencil, Plus } from "lucide-react";
import {
  createApplicantSource,
  updateApplicantSource,
} from "../_actions/action.applicant-source";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type SourceItem = {
  id: string;
  code: string;
  name: string;
  category: string;
};

const CATEGORIES = [
  { value: "CAREER_SITE", label: "Career Site" },
  { value: "JOB_PORTAL", label: "Job Portal" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "REFERRAL", label: "Referral" },
  { value: "OTHER", label: "Lainnya" },
];

type Props = {
  source?: SourceItem;
};

export function SourceForm({ source }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState(source?.category ?? "JOB_PORTAL");
  const isEdit = !!source;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    formData.set("category", category);
    const result = isEdit
      ? await updateApplicantSource(source.id, formData)
      : await createApplicantSource(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
      setTimeout(() => {
        toast.success(
          isEdit ? "Source berhasil diubah" : "Source berhasil ditambahkan",
          { position: "top-right" },
        );
      }, 150);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (loading) return;
        setOpen(val);
        if (!val) setError(null);
      }}
    >
      <DialogTrigger asChild suppressHydrationWarning>
        {isEdit ? (
          <Button variant="ghost" size="icon" suppressHydrationWarning>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button suppressHydrationWarning>
            <Plus className="size-4 mr-2" />
            Tambah Source
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit Source" : "Tambah Source"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Kode Source</Label>
            <Input
              id="code"
              name="code"
              defaultValue={source?.code}
              placeholder="contoh: LINKEDIN"
              className="uppercase"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Huruf besar, angka, dan underscore. Dipakai di kolom source_code
              pada template import.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Nama Source</Label>
            <Input
              id="name"
              name="name"
              defaultValue={source?.name}
              placeholder="contoh: LinkedIn"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label>Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
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