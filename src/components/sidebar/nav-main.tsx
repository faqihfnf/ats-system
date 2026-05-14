"use client";

import { usePathname } from "next/navigation";
// Import semua icon yang akan dipakai di sub-menu
import {
  ChevronRight,
  FileUser,
  Brain,
  BookOpen,
  Settings2,
  Briefcase, // Job List
  Layers, // Stages
  GitBranch, // Branch
  Target, // Position
  Users, // Divisi
  BarChart, // Level
  Activity, // Status
  GraduationCap, // Education
  History, // Experience
  Sparkles, // Models
  LayoutDashboard, // Dashboard Psikotest
  Compass, // Explorer
  MessageSquare, // Introduction
  UserCog, // Users Settings
  User, // Personal
  type LucideIcon,
} from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

// 1. Tambahkan icon baru ke mapping ini
const iconMap: Record<string, LucideIcon> = {
  FileUser,
  Brain,
  BookOpen,
  Settings2,
  Briefcase,
  Layers,
  GitBranch,
  Target,
  Users,
  BarChart,
  Activity,
  GraduationCap,
  History,
  LayoutDashboard,
  Compass,
  MessageSquare,
  UserCog,
  User,
  Sparkles,
};

export function NavMain({
  items,
  label,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    icon?: string;
    isActive?: boolean;
    // 2. Update type definition agar items (sub-menu) juga bisa punya icon
    items?: {
      title: string;
      url: string;
      icon?: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="font-bold">
        {label ?? "Platform"}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : null;
          const isActive = item.items?.some((sub) => pathname === sub.url);

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={isActive}
              className="group/collapsible"
              suppressHydrationWarning
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild suppressHydrationWarning>
                  <SidebarMenuButton
                    className="cursor-pointer"
                    suppressHydrationWarning
                    tooltip={item.title}
                  >
                    {Icon && <Icon />}
                    <span className="font-medium">{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent suppressHydrationWarning>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => {
                      // 3. Resolve icon untuk sub-item
                      const SubIcon = subItem.icon
                        ? iconMap[subItem.icon]
                        : null;

                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={pathname === subItem.url}
                          >
                            <a
                              href={subItem.url}
                              className="flex items-center gap-2"
                            >
                              {/* 4. Render icon sub-item di sini */}
                              {SubIcon && <SubIcon className="size-4" />}
                              <span>{subItem.title}</span>
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
