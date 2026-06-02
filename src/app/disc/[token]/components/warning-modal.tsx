"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  count: number;
};

const WARNINGS = [
  {
    title: "Peringatan",
    message:
      "Anda terdeteksi meninggalkan halaman tes. Mohon tetap fokus pada halaman ini selama mengerjakan tes.",
  },
  {
    title: "Peringatan Kedua",
    message:
      "Anda kembali terdeteksi meninggalkan halaman. Aktivitas ini dicatat dan akan dilaporkan ke tim HR.",
  },
  {
    title: "Peringatan Terakhir",
    message:
      "Ini adalah peringatan terakhir. Setiap perpindahan tab akan tercatat dalam laporan hasil tes Anda dan dapat mempengaruhi penilaian.",
  },
];

export function WarningModal({ open, onClose, count }: Props) {
  const warningIndex = Math.min(count - 1, WARNINGS.length - 1);
  const warning = WARNINGS[warningIndex >= 0 ? warningIndex : 0];

  if (!open || count === 0) return null;

  return (
    <AlertDialog open={open}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
            <AlertTriangle className="h-6 w-6 text-yellow-600" />
          </div>
          <AlertDialogTitle className="text-center">
            {warning.title} ({count}x)
          </AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            {warning.message}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={onClose}>
            Saya Mengerti, Lanjutkan Tes
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
