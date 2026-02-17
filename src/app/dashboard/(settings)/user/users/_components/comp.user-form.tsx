"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Pencil, Plus } from "lucide-react";
import { createUser, updateUser } from "../_actions/action.user";
import { toast } from "sonner";

type Props = {
  user?: { id: string; nama: string; role: "ADMIN" | "RECRUITER" };
};

export function UserForm({ user }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role ?? "");
  const isEdit = !!user;

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("role", selectedRole);

    const result = isEdit
      ? await updateUser(user.id, formData)
      : await createUser(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    } else {
      setOpen(false);
      setLoading(false);
      setSelectedRole("");
      setTimeout(() => {
        toast.success(
          isEdit ? "User berhasil diubah" : "User berhasil ditambahkan",
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
        setSelectedRole(user?.role ?? "");
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
            Tambah User
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit User" : "Tambah User"}</DialogTitle>
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
            <Label htmlFor="nama">Nama</Label>
            <Input id="nama" name="nama" defaultValue={user?.nama} placeholder="Nama lengkap" required disabled={loading} />
          </div>

          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" placeholder="nama@email.com" required disabled={loading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" name="password" type="password" placeholder="Min. 8 karakter" required disabled={loading} />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Role</Label>
            <Select value={selectedRole} onValueChange={setSelectedRole} disabled={loading}>
              <SelectTrigger className="cursor-pointer">
                <SelectValue  placeholder="Pilih role..." />
              </SelectTrigger>
              <SelectContent >
                <SelectItem className="cursor-pointer" value="ADMIN">Admin</SelectItem>
                <SelectItem className="cursor-pointer" value="RECRUITER">Recruiter</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={loading}>
              Batal
            </Button>
            <Button type="submit" disabled={loading || !selectedRole}>
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