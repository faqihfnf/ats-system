export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DiscTestClient } from "./disc-test-client";

type Props = {
  params: { token: string };
};

export default async function DiscTestPage({ params }: Props) {
  const { token } = await params;

  // Validate token server-side
  const invitation = await prisma.discInvitation.findUnique({
    where: { token },
    include: {
      application: {
        select: { fullName: true },
      },
    },
  });

  if (!invitation) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Link Tidak Valid</h1>
          <p className="mt-2 text-slate-600">
            Link tes DISC ini tidak valid atau sudah tidak berlaku.
          </p>
        </div>
      </div>
    );
  }

  if (invitation.status === "COMPLETED") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-green-600">Tes Sudah Selesai</h1>
          <p className="mt-2 text-slate-600">
            Anda sudah menyelesaikan tes DISC ini. Terima kasih!
          </p>
        </div>
      </div>
    );
  }

  if (
    invitation.status === "EXPIRED" ||
    new Date() > invitation.expiresAt ||
    (invitation.sessionDeadline && new Date() > invitation.sessionDeadline)
  ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Waktu Habis</h1>
          <p className="mt-2 text-slate-600">
            Undangan tes DISC ini sudah kadaluarsa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <DiscTestClient
      token={token}
      candidateName={invitation.application.fullName}
    />
  );
}
