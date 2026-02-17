"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updateProfile } from "../_actions/action.personal";
import { toast } from "sonner";

type Props = {
  nama: string;
  email: string;
};

export function ProfileForm({ nama, email }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      toast.success("Profil berhasil diperbarui", { position: "top-right" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informasi Profil</CardTitle>
        <CardDescription>Perbarui nama tampilan Anda</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              value={email}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Email tidak dapat diubah</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="nama">Nama</Label>
            <Input
              id="nama"
              name="nama"
              defaultValue={nama}
              placeholder="Nama lengkap"
              required
              disabled={loading}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end">
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
      </CardContent>
    </Card>
  );
}