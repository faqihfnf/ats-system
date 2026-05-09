import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/common/toggle-mode";
import { Separator } from "@/components/ui/separator";
import { getSessionProfile } from "@/lib/auth/session-profile";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await getSessionProfile();

  return (
    <SidebarProvider>
      <AppSidebar role={profile?.role ?? "RECRUITER"} />
      <div className="ml-52 flex min-h-screen flex-1 flex-col">
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
        <main className="flex flex-1 flex-col overflow-auto p-6">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
