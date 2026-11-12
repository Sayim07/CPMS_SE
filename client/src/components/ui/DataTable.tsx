import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { EmptyState } from "./EmptyState";
import { cn } from "../../lib/utils";

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  page?: number;
  pageSize?: number;
  total?: number;
  onPageChange?: (newPage: number) => void;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  page = 1,
  pageSize = 20,
  total,
  onPageChange,
  isLoading = false,
  emptyTitle = "No records found",
  emptyDescription = "There is no data matching your current selection.",
  className,
}: DataTableProps<T>) {
  const totalPages = total ? Math.ceil(total / pageSize) : 1;

  return (
    <div className={cn("bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-neo shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] overflow-hidden", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm divide-y-2 divide-black dark:divide-white">
          <thead className="bg-[#FFE600] text-black border-b-2 border-black dark:border-white sticky top-0 z-10 select-none">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={cn(
                    "py-3 px-4 text-xs font-black uppercase tracking-wider text-black font-mono",
                    col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                    col.className
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black dark:divide-white bg-white dark:bg-zinc-900 text-black dark:text-white">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-black/60 dark:text-white/60 text-sm font-bold">
                  Loading records...
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="p-6">
                  <EmptyState title={emptyTitle} description={emptyDescription} className="border-0 bg-transparent py-4" />
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={keyExtractor(row)} className="hover:bg-yellow-50 dark:hover:bg-zinc-800 transition-colors">
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "py-3 px-4 text-black dark:text-white whitespace-nowrap text-xs font-medium",
                        col.align === "center" ? "text-center" : col.align === "right" ? "text-right" : "text-left",
                        col.className
                      )}
                    >
                      {col.render ? col.render(row) : (row as Record<string, unknown>)[col.key] as React.ReactNode}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {total !== undefined && onPageChange && total > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t-2 border-black dark:border-white bg-[#f7f2e7] dark:bg-zinc-800 text-xs text-black dark:text-white font-bold">
          <div>
            Showing <span className="font-black">{(page - 1) * pageSize + 1}</span> to{" "}
            <span className="font-black">{Math.min(page * pageSize, total)}</span> of{" "}
            <span className="font-black">{total}</span> entries
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="secondary"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
              className="h-7 px-2"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
            <span className="px-2 font-mono font-bold">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
              className="h-7 px-2"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
