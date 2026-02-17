"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { updatePassword } from "../_actions/action.personal";
import { toast } from "sonner";

export function PasswordForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const result = await updatePassword(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setLoading(false);
      // Reset form
      (e.target as HTMLFormElement).reset();
      toast.success("Password berhasil diperbarui", { position: "top-right" });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ubah Password</CardTitle>
        <CardDescription>
          Pastikan akun Anda menggunakan password yang kuat
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Password Saat Ini</Label>
            <Input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Password Baru</Label>
            <Input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Min. 8 karakter"
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Ulangi password baru"
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
                  Memperbarui...
                </>
              ) : "Ubah Password"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}