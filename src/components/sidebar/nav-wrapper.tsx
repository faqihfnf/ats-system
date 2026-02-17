import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { NavMain } from "./nav-main";

export async function NavWrapper() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
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
        { title: "Job List", url: "/dashboard/applicant/joblist" },
        { title: "Candidates", url: "/dashboard/applicant/candidates" },
        { title: "Position", url: "/dashboard/applicant/position" },
        { title: "Divisi", url: "/dashboard/applicant/divisi" },
        { title: "Level", url: "/dashboard/applicant/level" },
      ],
    },
    {
      title: "Psikotest",
      url: "#",
      icon: "Brain",
      items: [
        { title: "Dashboard", url: "/dashboard/psikotest" },
        { title: "Explorer", url: "/dashboard/psikotest/explorer" },
      ],
    },
    {
      title: "AI Interview",
      url: "#",
      icon: "BookOpen",
      items: [{ title: "Introduction", url: "/dashboard/ai-interview" }],
    },
  ];

  const navSettings = [
    {
      title: "User",
      url: "#",
      icon: "Settings2",
      items: [
        ...(isAdmin ? [{ title: "Users", url: "/dashboard/user/users" }] : []),
        { title: "Personal", url: "/dashboard/user/personal" },
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