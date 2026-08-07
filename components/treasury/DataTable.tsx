"use client";

import { ChevronUp, ChevronDown } from "lucide-react";
import { ReactNode, useMemo, useState } from "react";
import EmptyState from "./EmptyState";
import LoadingTable from "./LoadingTable";

export type Column<T> = {
  key: keyof T | string;
  header: string;
  width?: string;
  align?: "left" | "center" | "right";
  sortable?: boolean;
  render?: (row: T) => ReactNode;
};

type Props<T> = {
  data: T[];
  columns: Column<T>[];

  loading?: boolean;

  selectedRow?: T | null;

  rowKey: (row: T) => string;

  onRowClick?: (row: T) => void;

  emptyTitle?: string;
  emptyDescription?: string;

  pageSize?: number;
};

export default function DataTable<T>({
  data,
  columns,
  loading = false,
  selectedRow,

  rowKey,

  onRowClick,

  emptyTitle = "No Records",
  emptyDescription = "There is nothing to display.",

  pageSize = 15,
}: Props<T>) {
  const [sortField, setSortField] =
    useState<string>("");

  const [direction, setDirection] =
    useState<"asc" | "desc">("asc");

  const [page, setPage] =
    useState(1);

  const sorted = useMemo(() => {
    if (!sortField) return data;

    return [...data].sort(
      (a: any, b: any) => {
        const av =
          a[sortField];

        const bv =
          b[sortField];

        if (av == null)
          return 1;

        if (bv == null)
          return -1;

        if (av < bv)
          return direction ===
            "asc"
            ? -1
            : 1;

        if (av > bv)
          return direction ===
            "asc"
            ? 1
            : -1;

        return 0;
      }
    );
  }, [
    data,
    sortField,
    direction,
  ]);

  const pages = Math.max(
    1,
    Math.ceil(
      sorted.length /
        pageSize
    )
  );

  const rows = sorted.slice(
    (page - 1) *
      pageSize,
    page * pageSize
  );

  function sort(
    key: string
  ) {
    if (
      sortField === key
    ) {
      setDirection(
        direction ===
          "asc"
          ? "desc"
          : "asc"
      );
    } else {
      setSortField(key);
      setDirection("asc");
    }
  }

  if (loading) {
    return <LoadingTable />;
  }

  if (rows.length === 0) {
    return (
      <EmptyState
        title={
          emptyTitle
        }
        description={
          emptyDescription
        }
      />
    );
  }

  return (
    <div>

      <div className="overflow-auto">

        <table className="w-full">

          <thead className="sticky top-0 bg-slate-100">

            <tr>

              {columns.map(
                (column) => (

                  <th
                    key={String(
                      column.key
                    )}
                    style={{
                      width:
                        column.width,
                    }}
                    className={`border-b px-4 py-3 text-sm font-semibold ${
                      column.align ===
                      "center"
                        ? "text-center"
                        : column.align ===
                          "right"
                        ? "text-right"
                        : "text-left"
                    }`}
                  >

                    {column.sortable ? (

                      <button
                        onClick={() =>
                          sort(
                            String(
                              column.key
                            )
                          )
                        }
                        className="flex items-center gap-1"
                      >

                        {
                          column.header
                        }

                        {sortField ===
                        column.key ? (
                          direction ===
                          "asc" ? (
                            <ChevronUp size={15} />
                          ) : (
                            <ChevronDown size={15} />
                          )
                        ) : null}

                      </button>

                    ) : (
                      column.header
                    )}

                  </th>

                )
              )}

            </tr>

          </thead>

          <tbody>

            {rows.map(
              (row) => (

                <tr
                  key={rowKey(
                    row
                  )}
                  onClick={() =>
                    onRowClick?.(
                      row
                    )
                  }
                  className={`cursor-pointer border-b hover:bg-blue-50 ${
                    selectedRow &&
                    rowKey(
                      selectedRow
                    ) ===
                      rowKey(
                        row
                      )
                      ? "bg-blue-50"
                      : ""
                  }`}
                >

                  {columns.map(
                    (
                      column
                    ) => (

                      <td
                        key={String(
                          column.key
                        )}
                        className={`px-4 py-3 ${
                          column.align ===
                          "center"
                            ? "text-center"
                            : column.align ===
                              "right"
                            ? "text-right"
                            : ""
                        }`}
                      >

                        {column.render
                          ? column.render(
                              row
                            )
                          : (
                              row as any
                            )[
                              column.key as string
                            ]}

                      </td>

                    )
                  )}

                </tr>

              )
            )}

          </tbody>

        </table>

      </div>

      {/* Pagination */}

      <div className="flex items-center justify-between border-t bg-slate-50 px-4 py-3">

        <p className="text-sm text-slate-500">

          Showing{" "}
          {rows.length} of{" "}
          {sorted.length}

        </p>

        <div className="flex gap-2">

          <button
            disabled={
              page === 1
            }
            onClick={() =>
              setPage(
                page - 1
              )
            }
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Previous
          </button>

          <span className="px-2 py-1 text-sm">

            {page} / {pages}

          </span>

          <button
            disabled={
              page ===
              pages
            }
            onClick={() =>
              setPage(
                page + 1
              )
            }
            className="rounded border px-3 py-1 disabled:opacity-40"
          >
            Next
          </button>

        </div>

      </div>

    </div>
  );
}