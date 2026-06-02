export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDiscProfile } from "@/lib/disc/profiles";

type Props = {
  params: { token: string };
};

export default async function DiscResultPage({ params }: Props) {
  const { token } = await params;

  const invitation = await prisma.discInvitation.findUnique({
    where: { token },
    include: {
      application: {
        select: { fullName: true },
      },
      result: true,
    },
  });

  if (!invitation || !invitation.result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Hasil Tidak Tersedia</h1>
          <p className="mt-2 text-slate-600">
            Hasil tes belum tersedia atau link tidak valid.
          </p>
        </div>
      </div>
    );
  }

  const profile = getDiscProfile(invitation.result.dominantType);

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-2xl px-4">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Hasil Tes DISC</CardTitle>
            <p className="text-slate-500">{invitation.application.fullName}</p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Dominant Type */}
            <div className="text-center">
              <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                <span className="text-3xl font-bold text-primary">
                  {invitation.result.dominantType}
                </span>
              </div>
              <h2 className="text-xl font-bold">{profile.label}</h2>
              <p className="text-sm text-slate-500">{profile.title}</p>
            </div>

            {/* Description */}
            <div>
              <p className="text-sm leading-relaxed text-slate-600">
                {profile.description}
              </p>
            </div>

            {/* Strengths */}
            <div>
              <h3 className="mb-2 font-semibold text-green-700">Kekuatan</h3>
              <ul className="space-y-1">
                {profile.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-green-500" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>

            {/* Work Style */}
            <div>
              <h3 className="mb-2 font-semibold">Gaya Kerja</h3>
              <p className="text-sm text-slate-600">{profile.workStyle}</p>
            </div>

            {/* Note */}
            <div className="rounded-lg bg-slate-100 p-4 text-center text-sm text-slate-500">
              Hasil lengkap dan skor detail akan disampaikan oleh tim HR.
              Terima kasih telah menyelesaikan tes DISC.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
