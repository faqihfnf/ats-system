import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { canAccessDivision, getSessionProfile } from "@/lib/auth/session-profile";
import { sanitizeFilePart } from "@/lib/helpers/file-helper";

type Props = {
  params: Promise<{ id: string; documentId: string }>;
};

export async function GET(_request: Request, { params }: Props) {
  const { id, documentId } = await params;
  const profile = await getSessionProfile();

  if (!profile) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  const document = await prisma.applicationDocument.findUnique({
    where: { id: documentId },
    select: {
      applicationId: true,
      label: true,
      originalFileName: true,
      url: true,
      application: {
        select: {
          fullName: true,
          job: {
            select: {
              position: { select: { divisiId: true } },
            },
          },
        },
      },
    },
  });

  if (!document || document.applicationId !== id) {
    return NextResponse.json({ error: "Dokumen tidak ditemukan" }, { status: 404 });
  }

  if (!canAccessDivision(profile, document.application.job.position.divisiId)) {
    return NextResponse.json({ error: "Tidak memiliki akses" }, { status: 403 });
  }

  const response = await fetch(document.url);
  if (!response.ok || !response.body) {
    return NextResponse.json({ error: "Gagal mengambil dokumen" }, { status: 502 });
  }

  const docName = document.label ?? document.originalFileName.replace(/\.pdf$/i, "");
  const filename = `${sanitizeFilePart(document.application.fullName)}-${sanitizeFilePart(docName)}.pdf`;

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
