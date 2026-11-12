"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
  Search,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import PurchaseFormModal from "./PurchaseFormModal";
import PurchaseRequestDetailsModal from "./PurchaseRequestDetailsModal";

import type {
  PurchaseRequest,
  OfficeOption,
  SubOfficeOption,
  ExpenseAccountCategoryOption,
  ExpenseAccountOption,
  PurchaseRequestFormData,
} from "./purchase-requests-types";

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

const dateFormat = (value: string) => {
  if (!value) return "—";

  const date = new Date(`${value.slice(0, 10)}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const statusStyle = (status: string) => {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700";
    case "submitted":
    case "for_review":
      return "bg-amber-50 text-amber-700";
    case "rejected":
    case "cancelled":
      return "bg-red-50 text-red-700";
    case "partially_converted_to_obr":
      return "bg-indigo-50 text-indigo-700";
    case "converted_to_obr":
      return "bg-blue-50 text-blue-700";
    case "no_obr":
      return "bg-slate-100 text-slate-500";
    default:
      return "bg-slate-100 text-slate-600";
  }
};

const statusLabel = (status: string) =>
  (status || "draft")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

export default function PurchaseRequestsPage() {
  const currentYear = new Date().getFullYear();

  const [records, setRecords] = useState<PurchaseRequest[]>([]);
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [subOffices, setSubOffices] = useState<SubOfficeOption[]>([]);
  const [categories, setCategories] = useState<ExpenseAccountCategoryOption[]>([]);
  const [accounts, setAccounts] = useState<ExpenseAccountOption[]>([]);

  const [search, setSearch] = useState("");
  const [fiscalYear, setFiscalYear] = useState(String(currentYear));
  const [officeId, setOfficeId] = useState("");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [selectedRecord, setSelectedRecord] =
    useState<PurchaseRequest | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadFormOptions = useCallback(async () => {
    try {
      const [categoryResponse, accountResponse] = await Promise.all([
        fetch("/budget/api/expense_account_categories", { cache: "no-store" }),
        fetch("/budget/api/expense_accounts", { cache: "no-store" }),
      ]);

      const [categoryResult, accountResult] = await Promise.all([
        categoryResponse.json(),
        accountResponse.json(),
      ]);

      if (!categoryResponse.ok || !categoryResult.success) {
        throw new Error(categoryResult.message || "Unable to load expense categories.");
      }
      if (!accountResponse.ok || !accountResult.success) {
        throw new Error(accountResult.message || "Unable to load expense accounts.");
      }

      setCategories(categoryResult.data || []);
      setAccounts(accountResult.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load purchase request form options.");
    }
  }, []);

  useEffect(() => {
    loadFormOptions();
  }, [loadFormOptions]);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (search.trim()) params.set("search", search.trim());
      if (fiscalYear) params.set("year", fiscalYear);
      if (officeId) params.set("office_id", officeId);
      if (status) params.set("status", status);

      const response = await fetch(
        `/budget/api/purchase_requests?${params.toString()}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load purchase requests."
        );
      }

      // The list endpoint may return flattened rows or a nested
      // purchase_request object. Normalize both shapes here.
      const normalizedRecords: PurchaseRequest[] = (result.data || []).map(
        (row: any) => {
          const source = row?.purchase_request ?? row;
          const id =
            row?.id ??
            source?.id ??
            row?.purchase_request_id ??
            row?.pr_id ??
            null;

          return {
            ...source,
            ...row,
            id,
            pr_number:
              row?.pr_number ??
              source?.pr_number ??
              row?.rp_number ??
              source?.rp_number ??
              "",
          } as PurchaseRequest;
        }
      );

      // DEBUG: Check whether the API is returning OBR counts.
      console.log(
        "PURCHASE REQUEST API DATA:",
        (result.data || []).map((row: any) => ({
          id: row?.id ?? row?.purchase_request?.id ?? row?.purchase_request_id ?? row?.pr_id,
          pr_number: row?.pr_number ?? row?.purchase_request?.pr_number,
          status: row?.status ?? row?.purchase_request?.status,
          obr_count: row?.obr_count ?? row?.purchase_request?.obr_count,
          obr_total: row?.obr_total ?? row?.purchase_request?.obr_total,
        }))
      );

      // DEBUG: Check the normalized records that will be rendered.
      console.log(
        "NORMALIZED RECORDS:",
        normalizedRecords.map((record: any) => ({
          id: record.id,
          pr_number: record.pr_number,
          status: record.status,
          obr_count: record.obr_count,
          obr_total: record.obr_total,
          display_status:
            Number(record.obr_count ?? 0) > 0
              ? record.status
              : "no_obr",
        }))
      );

      setRecords(normalizedRecords);
      setOffices(result.offices || []);
      setSubOffices(result.subOffices || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load purchase requests."
      );
    } finally {
      setLoading(false);
    }
  }, [search, fiscalYear, officeId, status]);

  useEffect(() => {
    const timer = window.setTimeout(loadData, 250);
    return () => window.clearTimeout(timer);
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search, fiscalYear, officeId, status]);

  const totals = useMemo(
    () =>
      records.reduce(
        (result, item) => {
          result.amount += Number(item.total_amount || 0);
          result.items += Number(item.item_count || 0);

          if (item.status === "draft") result.draft += 1;

          if (
            item.status === "submitted" ||
            item.status === "for_review"
          ) {
            result.pending += 1;
          }

          if (item.status === "approved") result.approved += 1;

          return result;
        },
        {
          amount: 0,
          items: 0,
          draft: 0,
          pending: 0,
          approved: 0,
        }
      ),
    [records]
  );

  const totalPages = Math.max(
    1,
    Math.ceil(records.length / pageSize)
  );

  const safePage = Math.min(page, totalPages);

  const paginatedRecords = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return records.slice(start, start + pageSize);
  }, [records, safePage, pageSize]);

  const firstRecord =
    records.length === 0 ? 0 : (safePage - 1) * pageSize + 1;

  const lastRecord = Math.min(
    safePage * pageSize,
    records.length
  );

  function resetFilters() {
    setSearch("");
    setFiscalYear(String(currentYear));
    setOfficeId("");
    setStatus("");
  }

  async function handleSave(data: PurchaseRequestFormData) {
    setSaving(true);

    try {
      const response = await fetch(
        "/budget/api/purchase_requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save purchase request."
        );
      }

      setShowForm(false);
      await loadData();
    } finally {
      setSaving(false);
    }
  }

  function openDetails(record: PurchaseRequest) {
    const id =
      (record as any)?.id ??
      (record as any)?.purchase_request_id ??
      (record as any)?.pr_id;

    if (typeof id !== "string" || !id.trim()) {
      console.error("Purchase request row has no ID:", record);
      setError(
        "The purchase request list did not return a record ID. Check the GET /budget/api/purchase_requests response."
      );
      return;
    }

    setError("");
    setSelectedRecord({
      ...record,
      id,
      pr_number:
        (record as any).pr_number ||
        (record as any).rp_number ||
        "",
    } as PurchaseRequest);
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">

      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">
            Budget Management / Purchase Requests
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Purchase Requests
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor purchase requests submitted by offices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-[#6689A5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#557992]"
        >
          <Plus size={17} />
          New Purchase Request
        </button>
      </div>

      {/* SUMMARY */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Total Requests", records.length],
          ["Draft Requests", totals.draft],
          ["Pending Review", totals.pending],
          ["Approved Requests", totals.approved],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-[#DCE3E9] bg-white p-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-xl font-semibold text-slate-800">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* TABLE CONTAINER */}
      <div className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Purchase Request Records
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              View, search, and monitor purchase requests.
            </p>
          </div>

          <button
            type="button"
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            <RefreshCw size={14} />
            Reset Filters
          </button>
        </div>

        {/* FILTERS */}
        <div className="grid gap-3 border-b border-slate-100 bg-[#FAFBFC] p-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search PR number, purpose, or office"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#6689A5]"
            />
          </div>

          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Years</option>
            {Array.from(
              { length: 8 },
              (_, index) => currentYear - index
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <select
            value={officeId}
            onChange={(e) => setOfficeId(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Offices</option>
            {offices.map((office) => (
              <option key={office.id} value={office.id}>
                {office.office_name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="submitted">Submitted</option>
            <option value="for_review">For Review</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
            <option value="partially_converted_to_obr">
              Partially Converted to OBR
            </option>
            <option value="converted_to_obr">
              Converted to OBR
            </option>
          </select>
        </div>

        {error && (
          <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-[#F4F7F9] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">PR Number</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Office</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-left">Purpose</th>
                <th className="px-4 py-3 text-center">Items</th>
                <th className="px-4 py-3 text-right">Estimated Amount</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    Loading purchase requests...
                  </td>
                </tr>
              ) : paginatedRecords.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-10 text-center text-slate-400">
                    No purchase requests found.
                  </td>
                </tr>
              ) : (
                paginatedRecords.map((record) => {
                  // Display No OBR when this purchase request has no linked OBR.
                  // This does not change the actual workflow status stored in the database.
                  const hasObr = Number((record as any).obr_count ?? 0) > 0;
                  const displayStatus = hasObr ? record.status : "no_obr";


                  console.log("PR STATUS DEBUG:", {
  pr_number: record.pr_number,
  database_status: record.status,
  obr_count: (record as any).obr_count,
  display_status: displayStatus,
});

                  return (
                  <tr
                    key={record.id || `${(record as any).pr_number || (record as any).rp_number || "missing-id"}-${record.pr_date}`}
                    className="transition-colors hover:bg-[#F8FAFC]"
                  >
                    <td className="px-4 py-3">
                      <span className="font-semibold text-[#557992]">
                        {record.pr_number}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {dateFormat(record.pr_date)}
                    </td>

                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-700">
                        {record.office_name}
                      </p>
                      {record.sub_office_name && (
                        <p className="mt-0.5 text-xs text-slate-400">
                          {record.sub_office_name}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {record.category_code || "—"}
                      {record.category_name && (
                        <p className="mt-0.5 text-slate-400">
                          {record.category_name}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {record.account_code || "—"}
                      {record.account_name && (
                        <p className="mt-0.5 text-slate-400">
                          {record.account_name}
                        </p>
                      )}
                    </td>

                    <td className="max-w-[240px] px-4 py-3 text-slate-600">
                      <p className="line-clamp-2">{record.purpose}</p>
                    </td>

                    <td className="px-4 py-3 text-center text-slate-600">
                      {record.item_count}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-slate-700">
                      {money(Number(record.total_amount))}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusStyle(
                          displayStatus
                        )}`}
                      >
                        {displayStatus === "no_obr"
                          ? "No OBR"
                          : statusLabel(displayStatus)}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => openDetails(record)}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-[#557992] hover:bg-[#F1F6F9]"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>

            {!loading && records.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 bg-[#F8FAFC]">
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-3 text-xs font-semibold uppercase text-slate-600"
                  >
                    Total Estimated Amount
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-800">
                    {money(totals.amount)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </select>

            <span className="ml-2">
              Showing{" "}
              <strong className="text-slate-700">
                {firstRecord}-{lastRecord}
              </strong>{" "}
              of{" "}
              <strong className="text-slate-700">
                {records.length}
              </strong>{" "}
              records
            </span>
          </div>

          <div className="flex items-center justify-end gap-1">
            <button
              type="button"
              onClick={() => setPage(1)}
              disabled={safePage <= 1}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-40"
            >
              First
            </button>

            <button
              type="button"
              onClick={() =>
                setPage((value) => Math.max(1, value - 1))
              }
              disabled={safePage <= 1}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="min-w-[90px] text-center text-xs text-slate-600">
              Page <strong>{safePage}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((value) =>
                  Math.min(totalPages, value + 1)
                )
              }
              disabled={safePage >= totalPages}
              className="rounded-md border border-slate-200 p-1.5 text-slate-600 disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              onClick={() => setPage(totalPages)}
              disabled={safePage >= totalPages}
              className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 disabled:opacity-40"
            >
              Last
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <PurchaseFormModal
          offices={offices}
          subOffices={subOffices}
          categories={categories}
          accounts={accounts}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {selectedRecord && (
        <PurchaseRequestDetailsModal
          record={selectedRecord}
          offices={offices}
          subOffices={subOffices}
          categories={categories}
          accounts={accounts}
          onClose={() => setSelectedRecord(null)}
          onSaved={loadData}
        />
      )}

      {saving && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/20">
          <div className="flex items-center gap-3 rounded-md bg-white px-5 py-4 shadow-lg">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#6689A5] border-t-transparent" />
            <span className="text-sm text-slate-600">
              Saving purchase request...
            </span>
          </div>
        </div>
      )}
    </div>
  );
}