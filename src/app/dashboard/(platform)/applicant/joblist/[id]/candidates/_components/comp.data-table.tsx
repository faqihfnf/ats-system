"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChevronDown, Columns3, Download } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  bulkActions?: (selectedRows: TData[]) => React.ReactNode;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  bulkActions,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      // Default visible columns
      select: true,
      fullName: true,
      aiScore: true,
      age: true,
      city: true,
      education: true,
      expectedSalary: true,
      pastRole: true,
      yoe: true,
      actions: true,
      stage: true,
      // Hidden by default
      phone: false,
      district: false,
      institution: false,
      pastCompany: false,
      gender: false,
      religion: false,
    });
  const [rowSelection, setRowSelection] = React.useState({});

  // Temporary state for column visibility (before Apply)
  const [tempColumnVisibility, setTempColumnVisibility] =
    React.useState(columnVisibility);
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

  // Export state
  const [exportPopoverOpen, setExportPopoverOpen] = React.useState(false);
  const [selectedExportColumns, setSelectedExportColumns] = React.useState<
    Record<string, boolean>
  >({
    fullName: true,
    aiScore: true,
    age: true,
    city: true,
    education: true,
    expectedSalary: true,
    pastRole: true,
    yoe: true,
    stage: true,
    phone: false,
    district: false,
    institution: false,
    pastCompany: false,
    gender: false,
    religion: false,
  });

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  // Map column ID to display name
  const getDisplayName = (id: string): string => {
    const names: Record<string, string> = {
      fullName: "Full Name",
      aiScore: "AI Score",
      age: "Age",
      city: "City",
      education: "Education",
      expectedSalary: "Expected Salary",
      pastRole: "Past Role",
      yoe: "Years of Experience",
      phone: "Phone",
      district: "District",
      institution: "Institution",
      pastCompany: "Past Company",
      gender: "Gender",
      religion: "Religion",
      stage: "Stage",
    };
    return names[id] || id;
  };

  // Check if all columns are selected
  const areAllColumnsSelected = React.useMemo(() => {
    const hideableColumns = table
      .getAllColumns()
      .filter((column) => column.getCanHide());
    return hideableColumns.every(
      (column) => tempColumnVisibility[column.id] !== false,
    );
  }, [tempColumnVisibility, table]);

  // Handle Select All / Deselect All (Toggle)
  const handleToggleAll = () => {
    const hideableColumns = table
      .getAllColumns()
      .filter((column) => column.getCanHide());

    if (areAllColumnsSelected) {
      // Deselect all
      const allHidden: VisibilityState = {};
      hideableColumns.forEach((column) => {
        allHidden[column.id] = false;
      });
      setTempColumnVisibility(allHidden);
    } else {
      // Select all
      const allVisible: VisibilityState = {};
      hideableColumns.forEach((column) => {
        allVisible[column.id] = true;
      });
      setTempColumnVisibility(allVisible);
    }
  };

  // Handle Apply button
  const handleApply = () => {
    setColumnVisibility(tempColumnVisibility);
    setIsPopoverOpen(false);
  };

  // Handle Cancel/Close - reset to current state
  const handleCancel = () => {
    setTempColumnVisibility(columnVisibility);
    setIsPopoverOpen(false);
  };

  // When popover opens, sync temp state with current state
  React.useEffect(() => {
    if (isPopoverOpen) {
      setTempColumnVisibility(columnVisibility);
    }
  }, [isPopoverOpen, columnVisibility]);

  // Export handlers
  const areAllExportColumnsSelected = React.useMemo(() => {
    const exportableColumns = table
      .getAllColumns()
      .filter((col) => col.id !== "select" && col.id !== "actions");
    return exportableColumns.every(
      (column) => selectedExportColumns[column.id] !== false,
    );
  }, [selectedExportColumns, table]);

  const handleToggleExportAll = () => {
    const exportableColumns = table
      .getAllColumns()
      .filter((col) => col.id !== "select" && col.id !== "actions");

    if (areAllExportColumnsSelected) {
      // Deselect all
      const allHidden: Record<string, boolean> = {};
      exportableColumns.forEach((column) => {
        allHidden[column.id] = false;
      });
      setSelectedExportColumns(allHidden);
    } else {
      // Select all
      const allVisible: Record<string, boolean> = {};
      exportableColumns.forEach((column) => {
        allVisible[column.id] = true;
      });
      setSelectedExportColumns(allVisible);
    }
  };

  const handleExportCancel = () => {
    setExportPopoverOpen(false);
  };

  const handleExportToExcel = async () => {
    // Get filtered rows
    const filteredRows = table.getFilteredRowModel().rows;

    // Get selected column IDs
    const selectedColumnIds = Object.keys(selectedExportColumns).filter(
      (key) => selectedExportColumns[key],
    );

    if (selectedColumnIds.length === 0) {
      alert("Please select at least one column to export");
      return;
    }

    // Map column ID to display name
    const columnData = selectedColumnIds.map((colId) => ({
      id: colId,
      header: getDisplayName(colId),
    }));

    // Build export data
    const exportData = filteredRows.map((row) => {
      const rowData: Record<string, any> = {};
      const candidate = row.original as any;

      columnData.forEach((col) => {
        let value: any;

        switch (col.id) {
          case "fullName":
            value = candidate.fullName;
            break;
          case "aiScore":
            value = candidate.aiMatchPercentage ?? "-";
            break;
          case "age":
            const birthDate = new Date(candidate.birthDate);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            value = age;
            break;
          case "city":
            value = candidate.city ?? "-";
            break;
          case "education":
            value = candidate.education?.name ?? "-";
            break;
          case "expectedSalary":
            value = candidate.expectedSalary
              ? `Rp ${candidate.expectedSalary.toLocaleString("id-ID")}`
              : "-";
            break;
          case "pastRole":
            value = candidate.lastJobTitle ?? "-";
            break;
          case "yoe":
            const startYear = candidate.jobStartYear;
            const endYear =
              candidate.jobEndYear === "present"
                ? new Date().getFullYear()
                : parseInt(candidate.jobEndYear || "0");
            const yoe =
              startYear && endYear && endYear >= startYear
                ? endYear - startYear
                : 0;
            value = yoe;
            break;
          case "stage":
            value = candidate.currentStage?.name ?? "-";
            break;
          case "phone":
            value = candidate.phone ?? "-";
            break;
          case "district":
            value = candidate.district ?? "-";
            break;
          case "institution":
            value = candidate.institution ?? "-";
            break;
          case "pastCompany":
            value = candidate.lastCompany ?? "-";
            break;
          case "gender":
            value = candidate.gender ?? "-";
            break;
          case "religion":
            value = candidate.religion ?? "-";
            break;
          default:
            value = "-";
        }

        rowData[col.header] = value;
      });

      return rowData;
    });

    // Dynamic import XLSX only when exporting
    const XLSX = await import("xlsx");

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Candidates");

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(workbook, `candidates_export_${timestamp}.xlsx`);

    // Close popover
    setExportPopoverOpen(false);
  };

  return (
    <div className="space-y-4 p-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="ml-auto flex items-center gap-5">
          {/* Export Popover */}
          <Popover open={exportPopoverOpen} onOpenChange={setExportPopoverOpen}>
            <PopoverTrigger asChild>
              <Download className="hover:text-primary h-5 w-5 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-65 p-2">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-3">
                <h4 className="text-sm font-semibold">Export to Excel</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto p-0 text-xs hover:bg-transparent"
                  onClick={handleToggleExportAll}
                >
                  {areAllExportColumnsSelected ? "Clear all" : "Select all"}
                </Button>
              </div>

              {/* Column List */}
              <div className="max-h-75 overflow-y-auto p-2">
                {table
                  .getAllColumns()
                  .filter((col) => col.id !== "select" && col.id !== "actions")
                  .map((column) => {
                    return (
                      <div
                        key={column.id}
                        className="hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5"
                      >
                        <Checkbox
                          checked={selectedExportColumns[column.id] !== false}
                          onCheckedChange={(value) => {
                            setSelectedExportColumns((prev) => ({
                              ...prev,
                              [column.id]: !!value,
                            }));
                          }}
                          id={`export-${column.id}`}
                        />
                        <label
                          htmlFor={`export-${column.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {getDisplayName(column.id)}
                        </label>
                      </div>
                    );
                  })}
              </div>

              <Separator />

              {/* Footer with Cancel/Download buttons */}
              <div className="flex items-center justify-between gap-2 p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleExportToExcel}
                  className="flex-1"
                >
                  Download
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Column Visibility Popover */}
          <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
            <PopoverTrigger asChild>
              <Columns3 className="hover:text-primary h-5 w-5 cursor-pointer" />
            </PopoverTrigger>
            <PopoverContent align="end" className="w-65 p-2">
              {/* Header */}
              <div className="flex items-center justify-between border-b p-3">
                <h4 className="text-sm font-semibold">Manage Columns</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary h-auto p-0 text-xs hover:bg-transparent"
                  onClick={handleToggleAll}
                >
                  {areAllColumnsSelected ? "Clear all" : "Select all"}
                </Button>
              </div>

              {/* Column List */}
              <div className="max-h-75 overflow-y-auto p-2">
                {table
                  .getAllColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => {
                    return (
                      <div
                        key={column.id}
                        className="hover:bg-accent flex items-center space-x-2 rounded-sm px-2 py-1.5"
                      >
                        <Checkbox
                          checked={tempColumnVisibility[column.id] !== false}
                          onCheckedChange={(value) => {
                            setTempColumnVisibility((prev) => ({
                              ...prev,
                              [column.id]: !!value,
                            }));
                          }}
                          id={`column-${column.id}`}
                        />
                        <label
                          htmlFor={`column-${column.id}`}
                          className="flex-1 cursor-pointer text-sm"
                        >
                          {getDisplayName(column.id)}
                        </label>
                      </div>
                    );
                  })}
              </div>

              <Separator />

              {/* Footer with Apply/Cancel buttons */}
              <div className="flex items-center justify-between gap-2 p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancel}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button size="sm" onClick={handleApply} className="flex-1">
                  Apply
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Selected Row Count + Bulk Actions */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="bg-muted flex items-center justify-between gap-2 rounded-md border px-4 py-2">
          <p className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </p>
          {bulkActions && (
            <div className="flex items-center gap-2">
              {bulkActions(
                table.getFilteredSelectedRowModel().rows.map((row) => row.original)
              )}
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2">
        {/* <div className="text-muted-foreground flex-1 text-sm">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div> */}
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
