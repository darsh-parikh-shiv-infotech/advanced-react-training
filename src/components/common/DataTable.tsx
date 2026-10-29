import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader,
  Search,
} from "lucide-react";
import type { DataTableProps } from "../../utils/dataTableUtil";

export function DataTable<T>({
  data,
  columns,
  getRowId,
  loading,
  error,
  total,
  page,
  pageSize,
  search,
  sortBy,
  sortOrder,
  pageSizeOptions = [10, 20, 50],
  emptyMessage = "No records found.",
  onSearchChange,
  onSortChange,
  onPageChange,
  onPageSizeChange,
}: DataTableProps<T>) {
  const totalPages = Math.ceil(total / pageSize);
  const firstRow = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const lastRow = Math.min(page * pageSize, total);

  return (
    <section className="w-full space-y-4">
      {/* Search*/}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          />

          <input
            type="search"
            aria-label="Search records"
            placeholder="Search records..."
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            Rows
            <select
              aria-label="Rows per page"
              value={pageSize}
              onChange={(event) => onPageSizeChange(Number(event.target.value))}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {/* API error */}
      {error && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <span>{error}</span>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
        <table className="w-full min-w-[650px] border-collapse text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              {columns.map((column) => {
                const isSorted = sortBy === column.id;

                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={
                      isSorted ? (sortOrder === "asc" ? "ascending" : "descending") : "none"
                    }
                    className={`whitespace-nowrap border-b border-gray-200 px-4 py-3 font-semibold ${column.className ?? ""}`}
                  >
                    {column.sortable === false ? (
                      column.header
                    ) : (
                      <button
                        type="button"
                        onClick={() => onSortChange(column.id)}
                        className="inline-flex items-center gap-2 rounded hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-blue-500"
                      >
                        {column.header}

                        {isSorted ? (
                          sortOrder === "asc" ? (
                            <ArrowUp className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDown className="h-3.5 w-3.5" />
                          )
                        ) : (
                          <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />
                        )}
                      </button>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-14 flex justify-center items-center text-gray-500"
                  role="status"
                >
                  <Loader />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row) => (
                <tr key={getRowId(row)} className="transition hover:bg-gray-50">
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={`whitespace-nowrap px-4 py-3.5 text-gray-700 ${column.className ?? ""}`}
                    >
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-500" aria-live="polite">
          Showing {firstRow}–{lastRow} of {total} records
        </p>

        <nav aria-label="Table pagination" className="flex items-center gap-1">
          <button
            type="button"
            aria-label="First page"
            disabled={loading || page <= 1 || totalPages === 0}
            onClick={() => onPageChange(1)}
            className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsLeft className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Previous page"
            disabled={loading || page <= 1}
            onClick={() => onPageChange(page - 1)}
            className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="px-3 text-sm text-gray-600">
            Page {page} of {Math.max(totalPages, 1)}
          </span>

          <button
            type="button"
            aria-label="Next page"
            disabled={loading || page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            type="button"
            aria-label="Last page"
            disabled={loading || page >= totalPages || totalPages === 0}
            onClick={() => onPageChange(totalPages)}
            className="rounded-lg border p-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronsRight className="h-4 w-4" />
          </button>
        </nav>
      </div>
    </section>
  );
}
