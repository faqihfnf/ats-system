"use server";

import { prisma } from "@/lib/prisma";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { updateProfileSchema, updatePasswordSchema } from "@/lib/validations/personal";
import { revalidatePath } from "next/cache";

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const profile = await prisma.profile.findUnique({
    where: { id: user.id },
  });

  return { ...profile, email: user.email };
}

export async function updateProfile(formData: FormData) {
  const parsed = updateProfileSchema.safeParse({
    nama: formData.get("nama"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  await prisma.profile.update({
    where: { id: user.id },
    data: { nama: parsed.data.nama },
  });

  revalidatePath("/dashboard/user/personal");
  return { success: true };
}

export async function updatePassword(formData: FormData) {
  const parsed = updatePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { error: parsed.error.message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Tidak terautentikasi" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: parsed.data.currentPassword,
  });

  if (signInError) {
    return { error: "Password saat ini tidak cocok" };
  }

  const adminClient = createAdminClient();
  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    user.id,
    { password: parsed.data.newPassword }
  );

  if (updateError) {
    return { error: "Gagal mengupdate password" };
  }

  return { success: true };
}