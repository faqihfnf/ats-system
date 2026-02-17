export const dynamic = "force-dynamic";

import { getLevel } from "./_actions/action.level";
import { LevelForm } from "./_components/comp.level-form";
import { LevelTable } from "./_components/comp.level-table";

export default async function LevelPage() {
  const level = await getLevel();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Level</h1>
        </div>
        <LevelForm />
      </div>
      <LevelTable data={level} />
    </div>
  );
}