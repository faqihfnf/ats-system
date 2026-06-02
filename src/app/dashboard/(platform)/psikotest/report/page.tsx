export const dynamic = "force-dynamic";

import { getDiscInvitations } from "./_actions/action.disc-report";
import { DiscReportTable } from "./_components/comp.disc-report-table";

export default async function DiscReportPage() {
  const invitations = await getDiscInvitations();

  return (
    <div className="w-full space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Psikotest DISC</h1>
        <p className="text-muted-foreground">
          Daftar undangan dan hasil tes DISC kandidat.
        </p>
      </div>

      <DiscReportTable invitations={invitations} />
    </div>
  );
}
