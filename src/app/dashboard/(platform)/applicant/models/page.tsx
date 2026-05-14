export const dynamic = "force-dynamic";

import { getModels } from "./_actions/action.models";
import { ModelForm } from "./_components/comp.model-form";
import { ModelTable } from "./_components/comp.model-table";

export default async function ModelsPage() {
  const models = await getModels();

  return (
    <div className="w-full space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">AI Models</h1>
        </div>
        <ModelForm />
      </div>
      <ModelTable data={models} />
    </div>
  );
}
