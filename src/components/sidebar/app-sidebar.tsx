"use client";

import * as React from "react";
import { GalleryVerticalEnd, LayoutDashboard } from "lucide-react";
import { NavMain } from "./nav-main";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { LogoutButton } from "./logout-button";
import { Separator } from "../ui/separator";

const company = {
  name: "Papandayan Cargo",
  logo: GalleryVerticalEnd,
};

type Props = React.ComponentProps<typeof Sidebar> & {
  role: "ADMIN" | "RECRUITER" | "USER";
};

export function AppSidebar({ role, ...props }: Props) {
  const isAdmin = role === "ADMIN";
  const isUser = role === "USER";

  const navMain = isUser
    ? [
        {
          title: "Applicant",
          url: "#",
          icon: "FileUser",
          items: [
            {
              title: "Job List",
              url: "/dashboard/applicant/joblist",
              icon: "Briefcase",
            },
          ],
        },
      ]
    : [
        {
          title: "Applicant",
          url: "#",
          icon: "FileUser",
          items: [
            {
              title: "Job List",
              url: "/dashboard/applicant/joblist",
              icon: "Briefcase",
            },
            {
              title: "Stages",
              url: "/dashboard/applicant/stages",
              icon: "Layers",
            },
            {
              title: "Branch",
              url: "/dashboard/applicant/branch",
              icon: "GitBranch",
            },
            {
              title: "Position",
              url: "/dashboard/applicant/position",
              icon: "Target",
            },
            {
              title: "Divisi",
              url: "/dashboard/applicant/divisi",
              icon: "Users",
            },
            {
              title: "Level",
              url: "/dashboard/applicant/level",
              icon: "BarChart",
            },
            {
              title: "Status",
              url: "/dashboard/applicant/status",
              icon: "Activity",
            },
            {
              title: "Education",
              url: "/dashboard/applicant/education",
              icon: "GraduationCap",
            },
            {
              title: "Experience",
              url: "/dashboard/applicant/experience",
              icon: "History",
            },
          ],
        },
        {
          title: "Psikotest",
          url: "#",
          icon: "Brain",
          items: [
            {
              title: "Dashboard",
              url: "/dashboard/psikotest",
              icon: "LayoutDashboard",
            },
            {
              title: "Explorer",
              url: "/dashboard/psikotest/explorer",
              icon: "Compass",
            },
          ],
        },
        {
          title: "AI Interview",
          url: "#",
          icon: "BookOpen",
          items: [
            {
              title: "Introduction",
              url: "/dashboard/ai-interview",
              icon: "MessageSquare",
            },
          ],
        },
      ];

  const navSettings = isUser
    ? []
    : [
        {
          title: "User",
          url: "#",
          icon: "Settings2",
          items: [
            ...(isAdmin
              ? [
                  {
                    title: "Users",
                    url: "/dashboard/user/users",
                    icon: "UserCog",
                  },
                ]
              : []),
            { title: "Personal", url: "/dashboard/user/personal", icon: "User" },
          ],
        },
      ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none">
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
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
              <SidebarMenuButton asChild>
                <a href="/dashboard">
                  <LayoutDashboard />
                  <span className="font-semibold">Dashboard</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        {/* Nav items dengan data dari props */}
        <NavMain items={navMain} label="Platform" />
        {navSettings.length > 0 && <NavMain items={navSettings} label="Settings" />}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Separator className="bg-sidebar-accent my-2" />
            <LogoutButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
