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
import { ChevronDown, Columns3, TableProperties } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
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

  return (
    <div className="space-y-4 p-2">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        {/* Column Visibility Popover */}
        <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
          <PopoverTrigger asChild>
            <Columns3 className="ml-auto h-5 w-5 cursor-pointer" />
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
                variant="ghost"
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

      {/* Selected Row Count */}
      {table.getFilteredSelectedRowModel().rows.length > 0 && (
        <div className="bg-muted flex items-center gap-2 rounded-md border px-4 py-2">
          <p className="text-muted-foreground text-sm">
            {table.getFilteredSelectedRowModel().rows.length} of{" "}
            {table.getFilteredRowModel().rows.length} row(s) selected
          </p>
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
