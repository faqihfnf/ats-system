export const dynamic = "force-dynamic";

import { getEducations } from "./_actions/action.education";
import { EducationForm } from "./_components/comp.education-form";
import { EducationTable } from "./_components/comp.education-table";

export default async function EducationPage() {
  const educations = await getEducations();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Pendidikan</h1>
          <p className="text-sm text-muted-foreground">
            Kelola tingkat pendidikan
          </p>
        </div>
        <EducationForm />
      </div>
      <EducationTable data={educations} />
    </div>
  );
}