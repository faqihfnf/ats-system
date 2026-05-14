import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export type SessionProfile = {
  id: string;
  nama: string;
  email: string;
  role: "ADMIN" | "RECRUITER" | "USER";
  divisiIds: string[];
};

export const getSessionProfile = cache(async (): Promise<SessionProfile | null> => {
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
      divisions: {
        select: {
          divisiId: true,
        },
      },
    },
  });

  if (!profile) {
    return null;
  }

  return {
    id: profile.id,
    nama: profile.nama,
    email: profile.email,
    role: profile.role,
    divisiIds: profile.divisions.map((d) => d.divisiId),
  };
});

export function canAccessDivision(
  profile: SessionProfile | null,
  divisiId: string | null | undefined,
) {
  if (!profile) return false;
  if (profile.role !== "USER") return true;
  if (!divisiId) return false;
  return profile.divisiIds.includes(divisiId);
}
