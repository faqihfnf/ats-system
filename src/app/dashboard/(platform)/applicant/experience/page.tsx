export const dynamic = "force-dynamic";

import { getExperiences } from "./_actions/action.experience";
import { ExperienceForm } from "./_components/comp.experience-form";
import { ExperienceTable } from "./_components/comp.experience-table";

export default async function ExperiencePage() {
  const experiences = await getExperiences();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pengalaman</h1>
        </div>
        <ExperienceForm />
      </div>
      <ExperienceTable data={experiences} />
    </div>
  );
}