"use client";

import * as React from "react";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Props = {
  /** Index halaman saat ini (0-based) */
  pageIndex: number;
  /** Total jumlah halaman */
  pageCount: number;
  /** Jumlah baris per halaman */
  pageSize: number;
  /** Total seluruh baris (setelah filter) */
  totalRows: number;
  /** Jumlah baris yang terpilih (opsional) */
  selectedRows?: number;
  /** Oilihan rows per page */
  pageSizeOptions?: number[];
  /** Dipanggil saat user pindah halaman (0-based index) */
  onPageChange: (pageIndex: number) => void;
  /** Dipanggil saat user ganti rows per page */
  onPageSizeChange: (pageSize: number) => void;
};

export function DataTablePagination({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  selectedRows = 0,
  pageSizeOptions = [10, 25, 50, 100],
  onPageChange,
  onPageSizeChange,
}: Props) {
  const currentPage = pageIndex + 1; // 1-based untuk tampilan
  const rangeStart = totalRows === 0 ? 0 : pageIndex * pageSize + 1;
  const rangeEnd = Math.min((pageIndex + 1) * pageSize, totalRows);

  const canPrevious = pageIndex > 0;
  const canNext = pageIndex < pageCount - 1;

  // Bangun daftar nomor halaman dengan ellipsis
  const pages = React.useMemo<(number | "ellipsis")[]>(() => {
    const items: (number | "ellipsis")[] = [];
    const maxVisible = 5;

    if (pageCount <= maxVisible) {
      for (let i = 1; i <= pageCount; i++) items.push(i);
      return items;
    }

    items.push(1);
    const left = Math.max(2, currentPage - 1);
    const right = Math.min(pageCount - 1, currentPage + 1);

    if (left > 2) items.push("ellipsis");
    for (let i = left; i <= right; i++) items.push(i);
    if (right < pageCount - 1) items.push("ellipsis");

    items.push(pageCount);
    return items;
  }, [currentPage, pageCount]);

  return (
    <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
      {/* Kiri: rows per page + info */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground whitespace-nowrap">
            Rows per page
          </span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => onPageSizeChange(Number(v))}
          >
            <SelectTrigger className="h-8 w-[70px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-muted-foreground whitespace-nowrap">
          {selectedRows > 0 && (
            <span className="text-foreground mr-2 font-medium">
              {selectedRows} of {totalRows} row(s) selected.
            </span>
          )}
          {totalRows > 0
            ? `Showing ${rangeStart}–${rangeEnd} of ${totalRows}`
            : "No rows"}
        </span>
      </div>

      {/* Kanan: pagination */}
      <Pagination className="mx-0 w-auto justify-end">
        <PaginationContent>
          {/* First */}
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to first page"
              onClick={(e) => {
                e.preventDefault();
                if (canPrevious) onPageChange(0);
              }}
              className={
                canPrevious
                  ? "cursor-pointer"
                  : "pointer-events-none opacity-50"
              }
            >
              <ChevronsLeft className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>

          {/* Previous */}
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canPrevious) onPageChange(pageIndex - 1);
              }}
              className={
                canPrevious
                  ? "cursor-pointer"
                  : "pointer-events-none opacity-50"
              }
            />
          </PaginationItem>

          {/* Page numbers */}
          {pages.map((p, i) =>
            p === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${i}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={p}>
                <PaginationLink
                  href="#"
                  isActive={p === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    onPageChange(p - 1);
                  }}
                  className="cursor-pointer"
                >
                  {p}
                </PaginationLink>
              </PaginationItem>
            ),
          )}

          {/* Next */}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (canNext) onPageChange(pageIndex + 1);
              }}
              className={
                canNext ? "cursor-pointer" : "pointer-events-none opacity-50"
              }
            />
          </PaginationItem>

          {/* Last */}
          <PaginationItem>
            <PaginationLink
              href="#"
              aria-label="Go to last page"
              onClick={(e) => {
                e.preventDefault();
                if (canNext) onPageChange(pageCount - 1);
              }}
              className={
                canNext ? "cursor-pointer" : "pointer-events-none opacity-50"
              }
            >
              <ChevronsRight className="h-4 w-4" />
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}