import { getDivisi } from "./_actions/action.divisi";
import { DivisiForm } from "./_components/comp.divisi-form";
import { DivisiTable } from "./_components/comp.divisi-table";


export default async function DivisiPage() {
  const divisi = await getDivisi();

   return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Divisi</h1>
        </div>
        <DivisiForm />
      </div>

      <DivisiTable data={divisi} />
    </div>
  );
}