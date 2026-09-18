"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Download, FileText, Loader2, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { formatFileSize } from "@/lib/helpers/file-helper";
import { deleteCandidateDocument } from "../../_actions/action.documents";

type CandidateDocument = {
  id: string;
  label: string | null;
  originalFileName: string;
  url: string;
  fileSize: number;
  createdAt: Date;
  uploadedBy: {
    id: string;
    nama: string;
    email: string;
    role: string;
  };
};

type Props = {
  applicationId: string;
  documents: CandidateDocument[];
  currentUserId: string;
  currentUserRole: string;
};

export function CandidateDocuments({
  applicationId,
  documents,
  currentUserId,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    documents[0]?.id ?? null,
  );
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const selected =
    documents.find((doc) => doc.id === selectedId) ?? documents[0] ?? null;

  function canDelete(doc: CandidateDocument) {
    return doc.uploadedBy.id === currentUserId || currentUserRole === "ADMIN";
  }

  function docTitle(doc: CandidateDocument) {
    return doc.label || doc.originalFileName;
  }

  async function handleDelete(documentId: string) {
    setDeletingId(documentId);
    const result = await deleteCandidateDocument(documentId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Dokumen berhasil dihapus", { position: "top-right" });
      if (selectedId === documentId) setSelectedId(null);
      router.refresh();
    }
    setDeletingId(null);
  }

  if (documents.length === 0) {
    return (
      <Card className="flex h-full flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Additional Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex h-96 items-center justify-center rounded-lg border">
            <div className="text-center">
              <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
              <p className="text-muted-foreground">
                Belum ada dokumen pendukung
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                Gunakan tombol &quot;Upload Dokumen&quot; di atas untuk
                menambahkan.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5" />
          Additional Data ({documents.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 gap-4">
        {/* Daftar dokumen */}
        <div className="w-72 shrink-0 space-y-2 overflow-y-auto">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className={cn(
                "rounded-lg border transition-colors",
                selected?.id === doc.id
                  ? "border-primary bg-muted/50"
                  : "hover:bg-muted/50",
              )}
            >
              <button
                type="button"
                onClick={() => setSelectedId(doc.id)}
                className="w-full p-3 text-left"
              >
                <div className="flex items-start gap-2">
                  <FileText className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {docTitle(doc)}
                    </p>
                    {doc.label && (
                      <p className="text-muted-foreground truncate text-xs">
                        {doc.originalFileName}
                      </p>
                    )}
                    <p className="text-muted-foreground mt-1 text-xs">
                      {doc.uploadedBy.nama} &middot;{" "}
                      {format(new Date(doc.createdAt), "d MMM yyyy", {
                        locale: idLocale,
                      })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {formatFileSize(doc.fileSize)}
                    </p>
                  </div>
                </div>
              </button>

              {/* Actions */}
              <div className="flex items-center justify-end gap-1 px-3 pb-2">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                >
                  <Link
                    href={`/api/applications/${applicationId}/documents/${doc.id}`}
                    target="_blank"
                    download
                  >
                    <Download className="h-4 w-4" />
                  </Link>
                </Button>

                {canDelete(doc) && (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                        disabled={deletingId === doc.id}
                      >
                        {deletingId === doc.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Dokumen &quot;{docTitle(doc)}&quot; akan dihapus
                          permanen dan tidak bisa dikembalikan.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(doc.id)}
                          className="bg-destructive hover:bg-destructive/80 text-white"
                        >
                          Hapus
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div className="min-w-0 flex-1">
          {selected && (
            <iframe
              key={selected.id}
              src={selected.url}
              className="min-h-[calc(180vh-500px)] w-full rounded border"
              title={`Preview ${docTitle(selected)}`}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
