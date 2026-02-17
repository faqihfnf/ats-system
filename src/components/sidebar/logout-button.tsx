"use client";

import { LogOut } from "lucide-react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { logout } from "@/app/actions/auth";

export function LogoutButton() {
  return (
    <SidebarMenuButton
      className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
      onClick={() => logout()}
    >
      <LogOut />
      <span>Logout</span>
    </SidebarMenuButton>
  );
}