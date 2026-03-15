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
import { Trash2, MessageCircle, ArrowRightLeft, Ellipsis } from "lucide-react";
import { useState } from "react";
import { deleteCandidate } from "../_actions/action.candidates";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { TransferCandidateDialog } from "./comp.transfer-candidate-dialog";

type Props = {
  candidateId: string;
  candidateName: string;
  phone: string;
  jobId: string;
  jobTitle: string;
  currentStage: string;
};

export function CandidateActions({
  candidateId,
  candidateName,
  phone,
  jobId,
  jobTitle,
  currentStage,
}: Props) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  function formatWhatsAppNumber(phoneNumber: string): string {
    let cleaned = phoneNumber.replace(/\D/g, "");

    if (cleaned.startsWith("0")) {
      cleaned = "62" + cleaned.substring(1);
    }

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
      toast.success("", {
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
        <DropdownMenuTrigger asChild className="ml-auto cursor-pointer">
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

          {/* Transfer to Another Job */}
          <DropdownMenuItem onClick={() => setShowTransferDialog(true)}>
            <ArrowRightLeft className="mr-2 h-4 w-4 text-blue-600" />
            <span>Pindah Kandidat</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

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

      {/* Transfer Dialog */}
      <TransferCandidateDialog
        open={showTransferDialog}
        onOpenChange={setShowTransferDialog}
        candidateId={candidateId}
        candidateName={candidateName}
        currentJobId={jobId}
        currentJobTitle={jobTitle}
        currentStage={currentStage}
      />
    </>
  );
}
