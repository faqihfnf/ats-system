"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Download,
  FileSpreadsheet,
  FileArchive,
  CheckCircle2,
  XCircle,
  Loader2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  downloadImportTemplate,
  validateImport,
  importApplicants,
} from "../_actions/action.import-applicant";
import type { ImportValidationResult } from "../_lib/import-types";

type Props = {
  jobId: string;
  jobTitle: string;
};

export function ImportApplicantForm({ jobId, jobTitle }: Props) {
  const router = useRouter();
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [isDownloading, startDownload] = useTransition();
  const [isValidating, startValidate] = useTransition();
  const [isImporting, startImport] = useTransition();
  const [validationResult, setValidationResult] =
    useState<ImportValidationResult | null>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);

  // Reset hasil validasi saat file berubah
  function resetValidation() {
    setValidationResult(null);
  }

  function handleExcelChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setExcelFile(f);
    resetValidation();
  }

  function handleZipChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setZipFile(f);
    resetValidation();
  }

  function handleDownloadTemplate() {
    startDownload(async () => {
      const result = await downloadImportTemplate(jobId);
      if (result.error) {
        toast.error(result.error, { position: "top-right" });
        return;
      }
      // Trigger download
      const buf = new Uint8Array(result.buffer!);
      const blob = new Blob([buf], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename!;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  function handleValidate() {
    if (!excelFile || !zipFile) {
      toast.error("Pilih file Excel dan ZIP terlebih dahulu", {
        position: "top-right",
      });
      return;
    }
    startValidate(async () => {
      const result = await validateImport(jobId, excelFile, zipFile);
      setValidationResult(result);
      if (result.status === "VALID") {
        toast.success("Semua data valid. Siap di-import.", {
          position: "top-right",
        });
      } else {
        toast.error(
          `Validasi gagal: ${result.errorCount} error ditemukan`,
          { position: "top-right" },
        );
      }
    });
  }

  function handleImport() {
    if (!excelFile || !zipFile) return;
    startImport(async () => {
      const result = await importApplicants(jobId, excelFile, zipFile);
      if (result.success) {
        toast.success(
          `${result.totalApplicants} kandidat berhasil di-import`,
          { position: "top-right" },
        );
        router.push(`/dashboard/applicant/joblist/${jobId}/candidates`);
      } else {
        toast.error(result.error ?? "Import gagal", {
          position: "top-right",
        });
      }
    });
  }

  const canImport =
    validationResult?.status === "VALID" &&
    validationResult.errorCount === 0 &&
    validationResult.matchedCvCount === validationResult.totalRows;

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm">
              1
            </span>
            Download Template
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4 text-sm">
            Template Excel khusus untuk lowongan <strong>{jobTitle}</strong>.
            Berisi field yang sama dengan form pelamar + sheet master untuk
            referensi.
          </p>
          <Button
            onClick={handleDownloadTemplate}
            disabled={isDownloading}
            variant="outline"
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download Template Excel
          </Button>
        </CardContent>
      </Card>

      {/* Step 2 & 3: Upload Excel + ZIP */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm">
              2
            </span>
            Upload File
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/* Excel */}
          <div
            onClick={() => excelInputRef.current?.click()}
            className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
          >
            <input
              ref={excelInputRef}
              type="file"
              accept=".xlsx"
              className="hidden"
              onChange={handleExcelChange}
            />
            <FileSpreadsheet className="text-muted-foreground mb-3 h-10 w-10" />
            {excelFile ? (
              <div>
                <p className="text-sm font-medium">{excelFile.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(excelFile.size / 1024).toFixed(1)} KB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">Data Pelamar (Excel)</p>
                <p className="text-muted-foreground text-xs">
                  Klik untuk pilih file .xlsx
                </p>
              </div>
            )}
          </div>

          {/* ZIP */}
          <div
            onClick={() => zipInputRef.current?.click()}
            className="hover:bg-muted/50 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center"
          >
            <input
              ref={zipInputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={handleZipChange}
            />
            <FileArchive className="text-muted-foreground mb-3 h-10 w-10" />
            {zipFile ? (
              <div>
                <p className="text-sm font-medium">{zipFile.name}</p>
                <p className="text-muted-foreground text-xs">
                  {(zipFile.size / 1024 / 1024).toFixed(1)} MB
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium">CV Pelamar (ZIP)</p>
                <p className="text-muted-foreground text-xs">
                  Klik untuk pilih file .zip berisi PDF
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Validasi */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <span className="bg-primary text-primary-foreground flex h-7 w-7 items-center justify-center rounded-full text-sm">
              3
            </span>
            Validasi & Import
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Button
              onClick={handleValidate}
              disabled={!excelFile || !zipFile || isValidating || isImporting}
              variant="outline"
            >
              {isValidating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="mr-2 h-4 w-4" />
              )}
              Validasi Data
            </Button>

            <Button
              onClick={handleImport}
              disabled={!canImport || isImporting}
            >
              {isImporting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              {isImporting
                ? "Mengimpor..."
                : `Import ${validationResult?.totalRows ?? 0} Pelamar`}
            </Button>
          </div>

          {/* Hasil Validasi */}
          {validationResult && (
            <div className="space-y-4">
              {validationResult.status === "VALID" ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Semua data valid</AlertTitle>
                  <AlertDescription>
                    {validationResult.totalRows} kandidat siap di-import,{" "}
                    {validationResult.matchedCvCount} CV cocok. Klik tombol
                    Import untuk melanjutkan.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Validasi gagal</AlertTitle>
                  <AlertDescription>
                    {validationResult.errorCount} error ditemukan. Perbaiki
                    file dan upload ulang. Import diblokir hingga semua data
                    valid.
                  </AlertDescription>
                </Alert>
              )}

              {/* Summary */}
              <div className="bg-muted/50 grid grid-cols-2 gap-4 rounded-lg p-4 sm:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-xs">Total</p>
                  <p className="text-xl font-bold">
                    {validationResult.totalRows}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Valid</p>
                  <p className="text-xl font-bold text-green-600">
                    {validationResult.validRows}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Error</p>
                  <p className="text-xl font-bold text-red-600">
                    {validationResult.errorCount}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">CV Cocok</p>
                  <p className="text-xl font-bold">
                    {validationResult.matchedCvCount}
                  </p>
                </div>
              </div>

              {/* Tabel Error */}
              {validationResult.errors.length > 0 && (
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-sm">
                    <thead className="bg-muted">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">
                          Baris
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Field
                        </th>
                        <th className="px-3 py-2 text-left font-medium">
                          Error
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {validationResult.errors.slice(0, 50).map((err, i) => (
                        <tr key={i} className="border-t">
                          <td className="px-3 py-2">
                            {err.row === 0 ? "-" : err.row}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs">
                            {err.field}
                          </td>
                          <td className="text-muted-foreground px-3 py-2">
                            {err.message}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {validationResult.errors.length > 50 && (
                    <p className="text-muted-foreground border-t px-3 py-2 text-xs">
                      Menampilkan 50 dari {validationResult.errors.length}{" "}
                      error. Perbaiki yang ditampilkan lalu validasi ulang.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}