
"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { X, Search } from "lucide-react";
import EditBookletModal from "./EditBookletModal";

type Props = {
  open: boolean;
  form: any;
  onClose: () => void;
};

export default function InventoryDetailsModal({
  open,
  form,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [booklets, setBooklets] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const [editBooklet, setEditBooklet] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    if (!open || !form?.id) return;

    setBooklets([]);
    setSelected(null);
    setSearch("");
    setCurrentPage(1);
    setOpenEdit(false);
    setEditBooklet(null);

    loadBooklets();
  }, [open, form?.id]);

  async function loadBooklets() {
    try {
      setLoading(true);

      const res = await axios.get(`/api/smi/inventory/${form.id}`);
      const data = res.data?.data ?? [];

      setBooklets(data);

      if (data.length > 0) {
        setSelected(data[0]);
      }
    } catch (err) {
      console.error("Failed to load booklets:", err);
      setBooklets([]);
    } finally {
      setLoading(false);
    }
  }

  // Search by booklet number, control number, series, or status.
  const filtered = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return booklets;

    return booklets.filter((booklet) => {
      return [
        booklet.booklet_number,
        booklet.control_no,
        booklet.series,
        booklet.status,
        booklet.beginning_or,
        booklet.ending_or,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [booklets, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filtered.length / rowsPerPage)
  );

  // Keep the current page valid when results change.
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedBooklets = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;

    return filtered.slice(startIndex, startIndex + rowsPerPage);
  }, [filtered, currentPage, rowsPerPage]);

  const startRow =
    filtered.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;

  const endRow = Math.min(
    currentPage * rowsPerPage,
    filtered.length
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 sm:p-6">
      <div className="flex h-[85vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              {form?.form_code}
            </h2>

            <p className="text-sm text-slate-500">
              {form?.form_name}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Close inventory details"
          >
            <X size={20} />
          </button>
        </div>

        {/* Booklet Table */}
        <div className="flex-1 overflow-auto p-4 sm:p-5">
          <div className="overflow-hidden rounded-xl border">
            
            {/* Search and Table Controls */}
            <div className="border-b bg-slate-50 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-semibold text-slate-800">
                Registered Booklets
                </h3>

                <span className="rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                {filtered.length} Booklets
                </span>
            </div>

            {/* Search */}
            <div className="relative mt-4">
                <Search
                size={18}
                className="absolute left-3 top-3 text-slate-400"
                />

                <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search booklet number, control no., series, or status..."
                className="w-full rounded-lg border bg-white py-2 pl-10 pr-3 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
            </div>

            {/* Pagination Controls at the Top */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                <label
                    htmlFor="booklet-page-size"
                    className="text-sm text-slate-600"
                >
                    Show
                </label>

                <select
                    id="booklet-page-size"
                    value={rowsPerPage}
                    onChange={(e) => setRowsPerPage(Number(e.target.value))}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                    {[10, 20, 50, 100].map((size) => (
                    <option key={size} value={size}>
                        {size}
                    </option>
                    ))}
                </select>

                <span className="text-sm text-slate-600">entries</span>
                </div>

                <p className="text-sm text-slate-500">
                Showing {startRow}–{endRow} of {filtered.length} records
                </p>
            </div>
            </div>


            {/* Table */}
            {loading ? (
              <div className="p-12 text-center text-slate-500">
                Loading booklets...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                No registered booklets found.
              </div>
            ) : (
              <div className="max-h-[620px] overflow-auto">
                <table className="w-full min-w-[950px]">
                  <thead className="sticky top-0 z-10 bg-slate-100">
                    <tr className="text-left text-sm font-semibold text-slate-600">
                      <th className="w-16 px-4 py-3 text-center">
                        No.
                      </th>

                      <th className="px-4 py-3">Control No.</th>
                      <th className="px-4 py-3">Series</th>
                      <th className="px-4 py-3">No. of Receipts</th>
                      <th className="px-4 py-3">Beginning</th>
                      <th className="px-4 py-3">Ending</th>
                      <th className="px-4 py-3">Date Registered</th>
                      <th className="px-4 py-3 text-center">Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {paginatedBooklets.map((booklet, index) => (
                      <tr
                        key={booklet.id}
                        onClick={() => {
                          setSelected(booklet);
                          setEditBooklet(booklet);
                          setOpenEdit(true);
                        }}
                        className={`cursor-pointer border-b transition ${
                          selected?.id === booklet.id
                            ? "bg-blue-50"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {/* Continuous row number across pages */}
                        <td className="px-4 py-3 text-center text-slate-500">
                          {(currentPage - 1) * rowsPerPage + index + 1}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {booklet.control_no ?? "-"}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {booklet.series ?? "-"}
                        </td>

                        <td className="px-4 py-3 font-medium">
                          {booklet.receipt_count ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          {booklet.beginning_or ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          {booklet.ending_or ?? "-"}
                        </td>

                        <td className="px-4 py-3">
                          {booklet.created_at
                            ? new Date(
                                booklet.created_at
                              ).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "-"}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${
                              booklet.status === "AVAILABLE"
                                ? "bg-green-100 text-green-700"
                                : booklet.status === "ISSUED"
                                  ? "bg-orange-100 text-orange-700"
                                  : booklet.status === "CANCELLED"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {booklet.status ?? "UNKNOWN"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Footer */}
            {!loading && filtered.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-white px-4 py-3">
                <p className="text-sm text-slate-500">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) => Math.max(1, page - 1))
                    }
                    disabled={currentPage <= 1}
                    className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentPage((page) =>
                        Math.min(totalPages, page + 1)
                      )
                    }
                    disabled={currentPage >= totalPages}
                    className="rounded-lg border px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Booklet Modal */}
        <EditBookletModal
          open={openEdit}
          booklet={editBooklet}
          onClose={() => {
            setOpenEdit(false);
            setEditBooklet(null);
          }}
          onSuccess={async () => {
            await loadBooklets();
            setOpenEdit(false);
            setEditBooklet(null);
          }}
        />
      </div>
    </div>
  );
}
