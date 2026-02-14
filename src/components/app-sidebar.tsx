"use client";

import * as React from "react";
import { usePathname } from "next/navigation"; // ← tambahkan ini
import { BookOpen, Brain, FileUser, GalleryVerticalEnd, Settings2, LogOut, LayoutDashboard } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarGroup } from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Applicant",
    url: "#",
    icon: FileUser,
    items: [
      { title: "Job List", url: "/dashboard/joblist" },
      { title: "Job Post", url: "/dashboard/jobpost" },
      { title: "Candidates", url: "/dashboard/candidates" },
      { title: "Divisi", url: "/dashboard/divisi" },
      { title: "Position", url: "/dashboard/position" },
    ],
  },
  {
    title: "Psikotest",
    url: "#",
    icon: Brain,
    items: [
      { title: "Dashboard", url: "/dashboard/psikotest" },
      { title: "Explorer", url: "/dashboard/psikotest/explorer" },
    ],
  },
  {
    title: "AI Interview",
    url: "#",
    icon: BookOpen,
    items: [{ title: "Introduction", url: "/dashboard/ai-interview" }],
  },
];

const navSettings = [
  {
    title: "Settings",
    url: "#",
    icon: Settings2,
    items: [
      { title: "User", url: "/dashboard/settings/user" },
      { title: "Personal", url: "/dashboard/settings/personal" },
    ],
  },
];

const company = {
  name: "Papandayan Cargo",
  logo: GalleryVerticalEnd,
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname(); // ← deteksi URL aktif

  // Set isActive true jika salah satu child URL cocok dengan pathname
  const withActive = (items: typeof navMain) =>
    items.map((item) => ({
      ...item,
      isActive: item.items?.some((sub) => pathname.startsWith(sub.url)),
    }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <company.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{company.name}</span>
                <span className="truncate text-xs">Recruitment System</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                <a href="/dashboard">
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <NavMain items={withActive(navMain)} label="Platform" />
        <NavMain items={withActive(navSettings)} label="Settings" />
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => console.log("Logging out...")}>
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
