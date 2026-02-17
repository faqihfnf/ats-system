export const dynamic = "force-dynamic";

import { getCurrentUser } from "./_actions/action.personal";
import { ProfileForm } from "./_components/comp.profile-form";
import { PasswordForm } from "./_components/comp.password-form";
import { redirect } from "next/navigation";

export default async function PersonalPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="p-6 space-y-6 w-full">
      <div>
        <h1 className="text-2xl font-semibold">Personal</h1>
      </div>

      <ProfileForm nama={user.nama ?? ""} email={user.email ?? ""} />
      <PasswordForm />
    </div>
  );
}