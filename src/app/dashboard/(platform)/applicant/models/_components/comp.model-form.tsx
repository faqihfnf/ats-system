"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Pencil, Plus } from "lucide-react";
import { createModel, updateModel } from "../_actions/action.models";
import { toast } from "sonner";

type Props = {
  model?: { id: string; name: string; modelId: string };
};

export function ModelForm({ model }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const isEdit = !!model;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = isEdit
      ? await updateModel(model.id, formData)
      : await createModel(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      router.refresh();
      setTimeout(() => {
        toast.success(
          isEdit ? "Model berhasil diubah" : "Model berhasil ditambahkan",
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
            Tambah Model
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Model" : "Tambah Model"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama Model</Label>
            <Input
              id="name"
              name="name"
              defaultValue={model?.name}
              placeholder="contoh: DeepSeek V4 Flash"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="modelId">Model ID</Label>
            <Input
              id="modelId"
              name="modelId"
              defaultValue={model?.modelId}
              placeholder="contoh: deepseek/deepseek-v4-flash:free"
              required
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Salin dari OpenRouter (contoh: deepseek/deepseek-v4-flash:free)
            </p>
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
