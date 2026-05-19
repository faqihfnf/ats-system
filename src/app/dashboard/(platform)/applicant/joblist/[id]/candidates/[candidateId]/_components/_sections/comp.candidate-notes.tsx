"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { MessageSquarePlus, Trash2, Loader2, Pencil, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { RichTextEditor } from "@/app/dashboard/(platform)/applicant/joblist/create/_components/rich-text-editor";
import {
  createCandidateNote,
  deleteCandidateNote,
  updateCandidateNote,
} from "../../_actions/action.notes";

type Note = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    nama: string;
    email: string;
    role: string;
  };
};

type Props = {
  applicationId: string;
  notes: Note[];
  currentUserId: string;
  currentUserRole: string;
};

export function CandidateNotes({
  applicationId,
  notes,
  currentUserId,
  currentUserRole,
}: Props) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [editorKey, setEditorKey] = useState(0);
  const [isSubmitting, startSubmit] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editKey, setEditKey] = useState(0);
  const [isUpdating, startUpdate] = useTransition();

  function handleSubmit() {
    if (!content || content.trim() === "" || content === "<p></p>") {
      toast.error("Note tidak boleh kosong", { position: "top-right" });
      return;
    }

    startSubmit(async () => {
      const result = await createCandidateNote(applicationId, content);

      if (result?.error) {
        toast.error(result.error, { position: "top-right" });
      } else {
        toast.success("Note berhasil ditambahkan", { position: "top-right" });
        setContent("");
        setEditorKey((prev) => prev + 1);
        router.refresh();
      }
    });
  }

  async function handleDelete(noteId: string) {
    setDeletingId(noteId);
    const result = await deleteCandidateNote(noteId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Note berhasil dihapus", { position: "top-right" });
      router.refresh();
    }
    setDeletingId(null);
  }

  function startEdit(note: Note) {
    setEditingId(note.id);
    setEditContent(note.content);
    setEditKey((prev) => prev + 1);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditContent("");
  }

  function handleUpdate(noteId: string) {
    if (!editContent || editContent.trim() === "" || editContent === "<p></p>") {
      toast.error("Note tidak boleh kosong", { position: "top-right" });
      return;
    }

    startUpdate(async () => {
      const result = await updateCandidateNote(noteId, editContent);

      if (result?.error) {
        toast.error(result.error, { position: "top-right" });
      } else {
        toast.success("Note berhasil diupdate", { position: "top-right" });
        setEditingId(null);
        setEditContent("");
        router.refresh();
      }
    });
  }

  function canEdit(note: Note) {
    return note.author.id === currentUserId;
  }

  function canDelete(note: Note) {
    return note.author.id === currentUserId || currentUserRole === "ADMIN";
  }

  return (
    <div className="space-y-6">
      {/* Add Note */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MessageSquarePlus className="h-5 w-5" />
            Tambah Note
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RichTextEditor
            key={editorKey}
            content={content}
            onChange={setContent}
            placeholder="Tulis catatan tentang kandidat ini..."
          />
          <div className="flex justify-end">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              size="sm"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Simpan Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notes List */}
      {notes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MessageSquarePlus className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Belum ada catatan untuk kandidat ini.
            </p>
            <p className="text-muted-foreground text-xs">
              Tambahkan catatan pertama di atas.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => {
            const initials = note.author.nama
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={note.id}>
                <CardContent className="pt-4">
                  {/* Note Header */}
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">
                          {note.author.nama}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {format(
                            new Date(note.updatedAt),
                            "d MMM yyyy, HH:mm",
                            { locale: idLocale },
                          )}
                          {new Date(note.updatedAt).getTime() - new Date(note.createdAt).getTime() > 1000 && (
                            <span className="ml-1 italic">(diedit)</span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-1">
                      {/* Edit Button */}
                      {canEdit(note) && editingId !== note.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-primary h-8 w-8 p-0"
                          onClick={() => startEdit(note)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Cancel Edit Button */}
                      {editingId === note.id && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                          onClick={cancelEdit}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Delete Button */}
                      {canDelete(note) && editingId !== note.id && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
                              disabled={deletingId === note.id}
                            >
                              {deletingId === note.id ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Hapus Note?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Note ini akan dihapus permanen dan tidak bisa
                                dikembalikan.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Batal</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(note.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Hapus
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>

                  {/* Note Content or Edit Mode */}
                  {editingId === note.id ? (
                    <div className="space-y-3">
                      <RichTextEditor
                        key={`edit-${editKey}`}
                        content={editContent}
                        onChange={setEditContent}
                        placeholder="Edit catatan..."
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          Batal
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleUpdate(note.id)}
                          disabled={isUpdating}
                        >
                          {isUpdating && (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          )}
                          Simpan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: note.content }}
                    />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
