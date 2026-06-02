export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { getDiscResultDetail } from "../../report/_actions/action.disc-report";
import { DiscResultView } from "./_components/comp.disc-result-view";

type Props = {
  params: { invitationId: string };
};

export default async function DiscResultDetailPage({ params }: Props) {
  const { invitationId } = await params;

  const invitation = await getDiscResultDetail(invitationId);

  if (!invitation || !invitation.result) {
    notFound();
  }

  // TypeScript narrowing: at this point result is guaranteed non-null
  const data = {
    ...invitation,
    result: invitation.result,
  };

  return (
    <div className="w-full space-y-6">
      <DiscResultView invitation={data} />
    </div>
  );
}
