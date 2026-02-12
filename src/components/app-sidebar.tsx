"use client";

import * as React from "react";
import { BookOpen, Brain, FileUser, GalleryVerticalEnd, Settings2, LogOut } from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar";

const data = {
  company: {
    name: "Papandayan Cargo",
    logo: GalleryVerticalEnd,
  },
  navMain: [
    {
      title: "Applicant",
      url: "#",
      icon: FileUser,
      isActive: true,
      items: [
        { title: "Job List", url: "/dashboard/joblist" },
        { title: "Candidates", url: "#" },
        { title: "Divisi", url: "#" },
        { title: "Position", url: "#" },
        { title: "Form", url: "#" },
      ],
    },
    {
      title: "Psikotest",
      url: "#",
      icon: Brain,
      items: [
        { title: "Dashboard", url: "#" },
        { title: "Explorer", url: "#" },
      ],
    },
    {
      title: "AI Interview",
      url: "#",
      icon: BookOpen,
      items: [{ title: "Introduction", url: "#" }],
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings2,
      items: [{ title: "General", url: "#" }],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      {/* HEADER: Nama Perusahaan & Logo saja */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <data.company.logo className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{data.company.name}</span>
                <span className="truncate text-xs">Recruitment System</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>

      {/* FOOTER: Logout saja */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout" className="text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer" onClick={() => console.log("Logging out...")}>
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
