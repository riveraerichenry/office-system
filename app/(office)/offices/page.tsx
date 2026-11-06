
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Building2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface Office {
  id: number;
  office_code: string;
  office_name: string;
  office_description: string | null;
  is_active: boolean;
  created_at: string;
}

const API_URL = "/api/offices";

const EMPTY_FORM = {
  office_code: "",
  office_name: "",
  office_description: "",
};

export default function OfficesPage() {
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingOffice, setEditingOffice] = useState<Office | null>(null);

  const [form, setForm] = useState(EMPTY_FORM);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");

  // PAGINATION STATES
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // FETCH OFFICES
  const fetchOffices = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to fetch offices.");
      }

      setOffices(result.data || []);
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch offices."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOffices();
  }, [fetchOffices]);

  // FILTER OFFICES
  const filteredOffices = offices.filter((office) => {
    const value = search.toLowerCase().trim();

    return (
      office.office_code.toLowerCase().includes(value) ||
      office.office_name.toLowerCase().includes(value) ||
      (office.office_description || "").toLowerCase().includes(value)
    );
  });

  // RESET PAGE WHEN SEARCH OR ROW LIMIT CHANGES
  useEffect(() => {
    setCurrentPage(1);
  }, [search, rowsPerPage]);

  // PAGINATION COMPUTATION
  const totalRecords = filteredOffices.length;

  const totalPages = Math.ceil(totalRecords / rowsPerPage);

  const startIndex = (currentPage - 1) * rowsPerPage;

  const endIndex = Math.min(
    startIndex + rowsPerPage,
    totalRecords
  );

  const paginatedOffices = filteredOffices.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // KEEP CURRENT PAGE VALID AFTER DELETION OR SEARCH
  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }

    if (totalPages === 0 && currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // OPEN ADD MODAL
  const openAddModal = () => {
    setEditingOffice(null);
    setForm(EMPTY_FORM);
    setIsActive(true);
    setError("");
    setShowModal(true);
  };

  // OPEN EDIT MODAL
  const openEditModal = (office: Office) => {
    setEditingOffice(office);

    setForm({
      office_code: office.office_code,
      office_name: office.office_name,
      office_description: office.office_description || "",
    });

    setIsActive(office.is_active);
    setError("");
    setShowModal(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingOffice(null);
    setForm(EMPTY_FORM);
    setError("");
  };

  // SAVE OFFICE
  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setError("");

    if (
      !form.office_code.trim() ||
      !form.office_name.trim()
    ) {
      setError("Office code and office name are required.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(API_URL, {
        method: editingOffice ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          editingOffice
            ? {
                id: editingOffice.id,
                ...form,
                is_active: isActive,
              }
            : form
        ),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to save office."
        );
      }

      setShowModal(false);
      setEditingOffice(null);
      setForm(EMPTY_FORM);
      setError("");

      // RETURN TO FIRST PAGE AFTER ADDING
      if (!editingOffice) {
        setCurrentPage(1);
      }

      await fetchOffices();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save office."
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE OFFICE
  const handleDelete = async (office: Office) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete ${office.office_name}?`
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_URL}?id=${office.id}`,
        { method: "DELETE" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to delete office."
        );
      }

      await fetchOffices();
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete office."
      );
    }
  };

  // PAGE NUMBERS WITH ELLIPSIS
  const getPageNumbers = (): (number | string)[] => {
    const pages: (number | string)[] = [];

    for (let page = 1; page <= totalPages; page++) {
      if (
        page === 1 ||
        page === totalPages ||
        Math.abs(page - currentPage) <= 1
      ) {
        pages.push(page);
      } else if (
        pages[pages.length - 1] !== "..."
      ) {
        pages.push("...");
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="text-xs font-medium text-slate-500">
            Maintenance / Offices
          </div>

          <h1 className="mt-2 text-2xl font-bold text-slate-800">
            Offices Management
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage municipal offices and departments.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={fetchOffices}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Plus size={17} />
            Add Office
          </button>
        </div>
      </div>

      

      {/* ERROR MESSAGE */}
      {error && !showModal && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={18} />

          {error}

          <button
            type="button"
            onClick={() => setError("")}
            className="ml-auto"
          >
            <X size={17} />
          </button>
        </div>
      )}

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* TABLE SEARCH */}
        <div className="border-b border-slate-200 p-4">
          <div className="relative max-w-md">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search office code or name..."
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">

            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-5 py-4 font-semibold">
                  Office Code
                </th>

                <th className="px-5 py-4 font-semibold">
                  Office Name
                </th>

                <th className="px-5 py-4 font-semibold">
                  Description
                </th>

                <th className="px-5 py-4 font-semibold">
                  Status
                </th>

                <th className="px-5 py-4 text-center font-semibold">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">

              {/* LOADING */}
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center"
                  >
                    <Loader2
                      className="mx-auto animate-spin text-blue-700"
                      size={28}
                    />

                    <p className="mt-2 text-slate-500">
                      Loading offices...
                    </p>
                  </td>
                </tr>

              ) : paginatedOffices.length === 0 ? (

                /* EMPTY */
                <tr>
                  <td
                    colSpan={5}
                    className="py-12 text-center"
                  >
                    <Building2
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-2 font-medium text-slate-600">
                      No offices found
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Try changing your search or add a new office.
                    </p>
                  </td>
                </tr>

              ) : (

                /* OFFICE RECORDS */
                paginatedOffices.map((office) => (
                  <tr
                    key={office.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4 font-semibold text-slate-800">
                      {office.office_code}
                    </td>

                    <td className="px-5 py-4 font-medium text-slate-700">
                      {office.office_name}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {office.office_description || "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          office.is_active
                            ? "bg-green-50 text-green-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {office.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-center gap-2">

                        {/* EDIT */}
                        <button
                          type="button"
                          onClick={() => openEditModal(office)}
                          title="Edit Office"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* DELETE */}
                        <button
                          type="button"
                          onClick={() => handleDelete(office)}
                          title="Delete Office"
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                        >
                          <Trash2 size={15} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))
              )}

            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="flex flex-col gap-4 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

          {/* ROWS PER PAGE */}
          <div className="flex flex-wrap items-center gap-3">

            <span className="text-sm text-slate-500">
              Rows per page:
            </span>

            <select
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>

            <span className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {totalRecords === 0 ? 0 : startIndex + 1}
              </span>
              {" "}to{" "}
              <span className="font-semibold text-slate-700">
                {endIndex}
              </span>
              {" "}of{" "}
              <span className="font-semibold text-slate-700">
                {totalRecords}
              </span>
              {" "}records
            </span>

          </div>

          {/* PAGE NAVIGATION */}
          <div className="flex flex-wrap items-center gap-1">

            {/* PREVIOUS */}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) => Math.max(1, prev - 1))
              }
              disabled={currentPage === 1 || totalPages === 0}
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
              <span className="hidden sm:inline">
                Previous
              </span>
            </button>

            {/* PAGE NUMBERS */}
            {getPageNumbers().map((page, index) => (
              page === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 text-sm text-slate-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(Number(page))}
                  className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                    currentPage === page
                      ? "bg-blue-700 text-white shadow-sm"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              )
            ))}

            {/* NEXT */}
            <button
              type="button"
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(totalPages, prev + 1)
                )
              }
              disabled={
                currentPage >= totalPages || totalPages === 0
              }
              className="flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">
                Next
              </span>
              <ChevronRight size={16} />
            </button>

          </div>
        </div>
      </div>

      {/* ADD / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4">

          <div className="my-auto w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-700">
                  <Building2 size={22} />
                </div>

                <div>
                  <h2 className="font-bold text-slate-800">
                    {editingOffice ? "Edit Office" : "Add Office"}
                  </h2>

                  <p className="text-xs text-slate-500">
                    Office information
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}
            <form onSubmit={handleSubmit}>

              <div className="space-y-4 p-6">

                {/* FORM ERROR */}
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle size={17} />
                    {error}
                  </div>
                )}

                {/* OFFICE CODE */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Office Code <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.office_code}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        office_code: e.target.value,
                      })
                    }
                    placeholder="e.g. MTO"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* OFFICE NAME */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Office Name <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={form.office_name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        office_name: e.target.value,
                      })
                    }
                    placeholder="e.g. Municipal Treasurer's Office"
                    required
                    className="w-full rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* DESCRIPTION */}
                <div>
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Description
                  </label>

                  <textarea
                    value={form.office_description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        office_description: e.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Enter office description..."
                    className="w-full resize-none rounded-lg border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* ACTIVE STATUS */}
                {editingOffice && (
                  <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">

                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) =>
                        setIsActive(e.target.checked)
                      }
                      className="h-4 w-4 rounded text-blue-700 focus:ring-blue-500"
                    />

                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        Active Office
                      </p>

                      <p className="text-xs text-slate-500">
                        Enable or disable this office.
                      </p>
                    </div>

                  </label>
                )}

              </div>

              {/* MODAL FOOTER */}
              <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end">

                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <CheckCircle2 size={17} />
                  )}

                  {saving
                    ? "Saving..."
                    : editingOffice
                      ? "Update Office"
                      : "Save Office"}
                </button>

              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
