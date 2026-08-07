"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
} from "lucide-react";

type Column = {
  key: string;
  label: string;
};

type Row = {
  [key: string]: any;
};

type Props = {
  title?: string;
  columns: Column[];
  rows: Row[];
  onAdd?: () => void;
  onEdit?: (row: Row) => void;
  onDelete?: (row: Row) => void;
};

export default function DataGrid({
  title = "Records",
  columns,
  rows = [],
  onAdd,
  onEdit,
  onDelete,
}: Props) {
  const [search, setSearch] =
    useState("");

  const filteredRows = useMemo(() => {
    if (!search) return rows;

    return rows.filter((row) =>
      Object.values(row).some((value) =>
        String(value)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  }, [rows, search]);

  function renderCell(
    row: Row,
    column: Column
  ) {
    const value = row[column.key];

    if (
      column.key === "status" ||
      column.key === "is_active"
    ) {
      const active =
        value === true ||
        String(value)
          .toLowerCase()
          .includes("active");

      return (
        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
            active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {active
            ? "Active"
            : "Inactive"}
        </span>
      );
    }

    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    return String(value);
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div
        className="
          flex items-center justify-between
          rounded-t-2xl
          border border-slate-200
          border-b-0
          bg-white
          px-5 py-3
        "
      >
        {/* Search LEFT */}
        <div
          className="
            flex items-center gap-2
            rounded-lg
            border border-slate-200
            px-3 py-2
            w-[300px]
          "
        >
          <Search
            size={16}
            className="text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search..."
            className="w-full text-sm outline-none"
          />
        </div>

        {/* Title + Add RIGHT */}
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-slate-800">
            {title}
          </h2>

          {onAdd && (
            <button
              onClick={onAdd}
              className="
                flex h-8 w-8 items-center justify-center
                rounded-lg
                bg-[#2563EB]
                text-white
                hover:bg-blue-700
                transition
              "
            >
              <Plus size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-b-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                {columns.map(
                  (column) => (
                    <th
                      key={column.key}
                      className="
                        px-6 py-4
                        text-left
                        text-sm
                        font-semibold
                        text-slate-500
                      "
                    >
                      {column.label}
                    </th>
                  )
                )}

                {(onEdit ||
                  onDelete) && (
                  <th className="px-6 py-4 text-right text-sm font-semibold text-slate-500">
                    Actions
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {filteredRows.length ===
              0 ? (
                <tr>
                  <td
                    colSpan={
                      columns.length +
                      (onEdit ||
                      onDelete
                        ? 1
                        : 0)
                    }
                    className="py-16 text-center text-slate-400"
                  >
                    No records found
                  </td>
                </tr>
              ) : (
                filteredRows.map(
                  (
                    row,
                    index
                  ) => (
                    <tr
                      key={
                        row.id ||
                        index
                      }
                      className="
                        border-t border-slate-100
                        hover:bg-slate-50
                        transition
                      "
                    >
                      {columns.map(
                        (
                          column
                        ) => (
                          <td
                            key={
                              column.key
                            }
                            className="
                              px-6 py-4
                              text-[15px]
                              text-slate-700
                            "
                          >
                            {renderCell(
                              row,
                              column
                            )}
                          </td>
                        )
                      )}

                      {(onEdit ||
                        onDelete) && (
                        <td className="px-6 py-4">
                          <div className="flex justify-end gap-2">
                            {onEdit && (
                              <button
                                onClick={() =>
                                  onEdit(
                                    row
                                  )
                                }
                                className="
                                  rounded-lg p-2
                                  hover:bg-blue-50
                                "
                              >
                                <Pencil
                                  size={
                                    18
                                  }
                                  className="text-blue-600"
                                />
                              </button>
                            )}

                            {onDelete && (
                              <button
                                onClick={() =>
                                  onDelete(
                                    row
                                  )
                                }
                                className="
                                  rounded-lg p-2
                                  hover:bg-red-50
                                "
                              >
                                <Trash2
                                  size={
                                    18
                                  }
                                  className="text-red-600"
                                />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}