import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/common/toggle-mode";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex flex-col flex-1 min-h-screen ml-52">
        <header className="flex h-16 shrink-0 items-center justify-end border-b px-6">
          <div className="flex gap-3">
          <ModeToggle />
          <Separator orientation="vertical" className="h-10" />
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-6 overflow-auto">{children}</main>
      </div>
    </SidebarProvider>
  );
}