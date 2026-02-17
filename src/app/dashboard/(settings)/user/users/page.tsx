export const dynamic = "force-dynamic";

import { getUsers } from "./_actions/action.user";
import { UserForm } from "./_components/comp.user-form";
import { UserTable } from "./_components/comp.user-table";

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
        </div>
        <UserForm />
      </div>
      <UserTable data={users} />
    </div>
  );
}