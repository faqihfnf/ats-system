import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessDivision, getSessionProfile } from "@/lib/auth/session-profile";

type Props = {
  params: Promise<{ id: string }>;
};

function sanitizeFilePart(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function GET(_request: Request, { params }: Props) {
  const { id } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const candidate = await prisma.application.findUnique({
    where: { id },
    select: {
      fullName: true,
      cvUrl: true,
      job: {
        select: {
          position: { select: { nama: true, divisiId: true } },
        },
      },
    },
  });

  if (!candidate) {
    return NextResponse.json({ error: "Kandidat tidak ditemukan" }, { status: 404 });
  }

  if (!canAccessDivision(profile, candidate.job.position.divisiId)) {
    return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
  }

  if (!candidate.cvUrl) {
    return NextResponse.json({ error: "CV tidak tersedia" }, { status: 404 });
  }

  const response = await fetch(candidate.cvUrl);
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "Gagal mengambil CV" }, { status: 502 });
  }

  const filename = `${sanitizeFilePart(candidate.fullName)}-${sanitizeFilePart(candidate.job.position.nama)}-KarirPPD.pdf`;

  return new NextResponse(response.body, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      ...(response.headers.get("content-length")
        ? { "Content-Length": response.headers.get("content-length")! }
        : {}),
    },
  });
}