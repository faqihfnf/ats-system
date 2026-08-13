"use client";

import * as React from "react";
import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { logout } from "@/app/actions/auth";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function LogoutButton() {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <SidebarMenuButton className="text-destructive hover:bg-destructive/80 cursor-pointer bg-transparent font-semibold hover:text-white">
        <LogOut />
        <span>Logout</span>
      </SidebarMenuButton>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <SidebarMenuButton className="text-destructive hover:bg-destructive/80 cursor-pointer bg-transparent font-semibold hover:text-white">
          <LogOut />
          <span>Logout</span>
        </SidebarMenuButton>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin keluar? Anda harus login kembali untuk
            mengakses akun Anda.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Batal</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => logout()}
            className="bg-destructive hover:bg-destructive/90 text-white"
          >
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
