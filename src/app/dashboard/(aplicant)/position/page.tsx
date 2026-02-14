export const dynamic = "force-dynamic";

import { getPositions, getDivisiOptions } from "./_actions/action.position";
import { PositionForm } from "./_components/comp.position-form";
import { PositionTable } from "./_components/comp.position-table";

export default async function PositionPage() {
  const [positions, divisiOptions] = await Promise.all([
    getPositions(),
    getDivisiOptions(),
  ]);

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Posisi</h1>
        </div>
        <PositionForm divisiOptions={divisiOptions} />
      </div>
      <PositionTable data={positions} divisiOptions={divisiOptions} />
    </div>
  );
}