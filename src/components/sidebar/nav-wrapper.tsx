import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NavMain } from "./nav-main";

export async function NavWrapper() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const profile = user
    ? await prisma.profile.findUnique({ where: { id: user.id } })
    : null;
  const isAdmin = profile?.role === "ADMIN";

  const navMain = [
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
        { title: "Stages", url: "/dashboard/applicant/stages", icon: "Layers" },
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
        { title: "Divisi", url: "/dashboard/applicant/divisi", icon: "Users" },
        { title: "Level", url: "/dashboard/applicant/level", icon: "BarChart" },
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

  const navSettings = [
    {
      title: "User",
      url: "#",
      icon: "Settings2",
      items: [
        ...(isAdmin
          ? [{ title: "Users", url: "/dashboard/user/users", icon: "UserCog" }]
          : []),
        { title: "Personal", url: "/dashboard/user/personal", icon: "User" },
      ],
    },
  ];

  return (
    <>
      <NavMain items={navMain} label="Platform" />
      <NavMain items={navSettings} label="Settings" />
    </>
  );
}
