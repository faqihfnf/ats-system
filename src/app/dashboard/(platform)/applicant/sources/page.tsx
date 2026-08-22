export const dynamic = "force-dynamic";

import { getApplicantSources } from "./_actions/action.applicant-source";
import { SourceForm } from "./_components/comp.source-form";
import { SourceTable } from "./_components/comp.source-table";

export default async function ApplicantSourcePage() {
  const sources = await getApplicantSources();

  return (
    <div className="p-6 space-y-6 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Applicant Sources</h1>
          <p className="text-sm text-muted-foreground">
            Sumber kandidat untuk form apply dan import applicant
          </p>
        </div>
        <SourceForm />
      </div>
      <SourceTable data={sources} />
    </div>
  );
}