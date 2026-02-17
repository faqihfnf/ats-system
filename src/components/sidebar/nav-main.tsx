"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, FileUser, Brain, BookOpen, Settings2, type LucideIcon } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem } from "@/components/ui/sidebar";

// Map string → icon component
const iconMap: Record<string, LucideIcon> = {
  FileUser,
  Brain,
  BookOpen,
  Settings2,
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
    items?: { title: string; url: string }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label ?? "Platform"}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon ? iconMap[item.icon] : null;  // ← resolve icon
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
                  <SidebarMenuButton suppressHydrationWarning>
                    {Icon && <Icon />}  {/* ← render icon */}
                    <span>{item.title}</span>
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent suppressHydrationWarning>
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={pathname === subItem.url}
                        >
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
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