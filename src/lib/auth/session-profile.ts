import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  nama: string;
  email: string;
  role: "ADMIN" | "RECRUITER" | "USER";
  divisiId: string | null;
};

export async function getSessionProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      nama: true,
      email: true,
      role: true,
      divisiId: true,
    },
  });

  if (!profile) {
    return null;
  }

  return profile as SessionProfile;
}

export function canAccessDivision(
  profile: SessionProfile | null,
  divisiId: string | null | undefined,
) {
  if (!profile) return false;
  if (profile.role !== "USER") return true;
  return !!profile.divisiId && !!divisiId && profile.divisiId === divisiId;
}
