"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { createUser, updateUser } from "../_actions/action.user";
import { toast } from "sonner";

type Props = {
  divisions: { id: string; nama: string }[];
  user?: {
    id: string;
    nama: string;
    role: "ADMIN" | "RECRUITER" | "USER";
    divisiIds: string[];
  };
};

export function UserForm({ user, divisions }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user?.role ?? "");
  const [selectedDivisiIds, setSelectedDivisiIds] = useState<string[]>(
    user?.divisiIds ?? [],
  );
  const isEdit = !!user;

  function toggleDivisi(divisiId: string) {
    setSelectedDivisiIds((prev) =>
      prev.includes(divisiId)
        ? prev.filter((id) => id !== divisiId)
        : [...prev, divisiId],
    );
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);

    formData.set("role", selectedRole);
    formData.set(
      "divisiIds",
      selectedRole === "USER" ? JSON.stringify(selectedDivisiIds) : "[]",
    );

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
      setSelectedDivisiIds([]);
      setTimeout(() => {
        toast.success(
          isEdit ? "User berhasil diubah" : "User berhasil ditambahkan",
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
        if (!val) {
          setError(null);
          setSelectedRole(user?.role ?? "");
          setSelectedDivisiIds(user?.divisiIds ?? []);
        }
      }}
    >
      <DialogTrigger asChild suppressHydrationWarning>
        {isEdit ? (
          <Button variant="ghost" size="icon" suppressHydrationWarning>
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button suppressHydrationWarning>
            <Plus className="mr-2 size-4" />
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
            <Input
              id="nama"
              name="nama"
              defaultValue={user?.nama}
              placeholder="Nama lengkap"
              required
              disabled={loading}
            />
          </div>

          {!isEdit && (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="nama@email.com"
                  required
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 karakter"
                  required
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
              disabled={loading}
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue placeholder="Pilih role..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem className="cursor-pointer" value="ADMIN">
                  Admin
                </SelectItem>
                <SelectItem className="cursor-pointer" value="RECRUITER">
                  Recruiter
                </SelectItem>
                <SelectItem className="cursor-pointer" value="USER">
                  User
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {selectedRole === "USER" && (
            <div className="space-y-2">
              <Label>Divisi</Label>
              {divisions.length === 0 ? (
                <p className="text-muted-foreground text-xs">
                  Belum ada data divisi.
                </p>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto rounded-md border p-3">
                  {divisions.map((divisi) => (
                    <label
                      key={divisi.id}
                      className="flex cursor-pointer items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={selectedDivisiIds.includes(divisi.id)}
                        onCheckedChange={() => toggleDivisi(divisi.id)}
                      />
                      {divisi.nama}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {error && <p className="text-destructive text-sm">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={
                loading ||
                !selectedRole ||
                (selectedRole === "USER" && selectedDivisiIds.length === 0)
              }
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
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
