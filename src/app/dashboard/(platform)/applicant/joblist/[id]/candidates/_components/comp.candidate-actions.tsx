"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";
import { MoreVertical, Trash2, MessageCircle, Ellipsis } from "lucide-react";
import { useState } from "react";
import { deleteCandidate } from "../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

type Props = {
  candidateId: string;
  candidateName: string;
  phone: string;
  jobId: string;
};

export function CandidateActions({
  candidateId,
  candidateName,
  phone,
  jobId,
}: Props) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Format phone number for WhatsApp (remove non-digits, add country code if needed)
  function formatWhatsAppNumber(phoneNumber: string): string {
    // Remove all non-digit characters
    let cleaned = phoneNumber.replace(/\D/g, "");

    // If starts with 0, replace with 62 (Indonesia country code)
    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    }

    // If doesn't start with country code, add 62
    if (!cleaned.startsWith("62")) {
      cleaned = "62" + cleaned;
    }

    return cleaned;
  }

  function handleInvite() {
    const formattedPhone = formatWhatsAppNumber(phone);
    const message = encodeURIComponent(
      `Halo ${candidateName}, terima kasih telah melamar di perusahaan kami. Kami ingin mengundang Anda untuk tahap selanjutnya.`,
    );
    const whatsappUrl = `https://wa.me/${formattedPhone}?text=${message}`;

    window.open(whatsappUrl, "_blank");
  }

  async function handleDelete() {
    setIsDeleting(true);

    const result = await deleteCandidate(candidateId);

    if (result?.error) {
      toast.error(result.error, { position: "top-right" });
    } else {
      toast.success("Candidate deleted successfully", {
        position: "top-right",
      });
      router.refresh();
    }

    setIsDeleting(false);
    setShowDeleteDialog(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Ellipsis className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuSeparator />

          {/* Invite via WhatsApp */}
          <DropdownMenuItem onClick={handleInvite}>
            <MessageCircle className="mr-2 h-4 w-4 text-green-600" />
            <span>Undang Kandidat</span>
          </DropdownMenuItem>

          {/* Delete */}
          <DropdownMenuItem
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Hapus Kandidat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{candidateName}</strong> from
              the system. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
