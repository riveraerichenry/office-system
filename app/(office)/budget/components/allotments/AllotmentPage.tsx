"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";

import AllotmentFormModal from "./AllotmentFormModal";
import type {
  Allotment,
  AppropriationOption,
} from "./allotment-types";

const money = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

type OfficeOption = { id: string; office_name: string };
type SubOfficeOption = { id: string; office_id: string; sub_office_name: string };
type CategoryOption = {
  category_id: string;
  category_name: string;
  office_id: string;
  sub_office_id: string | null;
};

export default function AllotmentsPage() {
  const currentYear = new Date().getFullYear();

  const [fiscalYear, setFiscalYear] = useState(String(currentYear));
  const [quarter, setQuarter] = useState("1");
  const [fundSourceId, setFundSourceId] = useState("");
  const [search, setSearch] = useState("");

  // Appropriation Monitoring filters only
  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [appropriations, setAppropriations] = useState<
    AppropriationOption[]
  >([]);

  const [allotments, setAllotments] = useState<Allotment[]>([]);
  const [fundSources, setFundSources] = useState<
    { id: string; label: string }[]
  >([]);
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [subOffices, setSubOffices] = useState<SubOfficeOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Independent pagination for both tables
  const [appropriationPage, setAppropriationPage] = useState(1);
  const [appropriationPageSize, setAppropriationPageSize] = useState(10);
  const [transactionPage, setTransactionPage] = useState(1);
  const [transactionPageSize, setTransactionPageSize] = useState(10);

  const loadFunds = useCallback(async () => {
    try {
      const response = await fetch("/budget/api/fund_sources");
      const result = await response.json();

      if (response.ok && result.success) {
        setFundSources(
          (result.data || []).map(
            (fund: { id: string; fund_code: string; fund_name: string }) => ({
              id: fund.id,
              label: `${fund.fund_code} — ${fund.fund_name}`,
            })
          )
        );
      }
    } catch (err) {
      console.error("LOAD FUND SOURCES:", err);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams({
        fiscal_year: fiscalYear,
        quarter,
      });

      if (fundSourceId) params.set("fund_source_id", fundSourceId);
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(
        `/budget/api/allotments?${params.toString()}`
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load allotments.");
      }

      setAppropriations(result.appropriations || []);
      setAllotments(result.allotments || []);
      setOffices(result.offices || []);
      setSubOffices(result.subOffices || []);
      setCategories(result.categories || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load allotments."
      );
    } finally {
      setLoading(false);
    }
  }, [fiscalYear, quarter, fundSourceId, search]);

  useEffect(() => {
    loadFunds();
  }, [loadFunds]);

  useEffect(() => {
    const timer = setTimeout(loadData, 250);
    return () => clearTimeout(timer);
  }, [loadData]);

  // Filter options come from the master tables, not the appropriation rows.
  // This ensures every registered office remains selectable.
  const officeOptions = useMemo(
    () => offices.map((office) => ({ id: office.id, name: office.office_name })),
    [offices]
  );

  const subOfficeOptions = useMemo(
    () =>
      subOffices
        .filter((item) => !officeId || item.office_id === officeId)
        .map((item) => ({ id: item.id, name: item.sub_office_name })),
    [subOffices, officeId]
  );

  const hasNoSubOffice = categories.some(
    (item) => item.office_id === officeId && item.sub_office_id === null
  );

  // Category is an independent filter; it is not dependent on office/sub-office.
  const categoryOptions = useMemo(
    () =>
      categories
        .map((item) => ({
          id: item.category_id,
          name: item.category_name,
        }))
        .filter((item, index, list) =>
          list.findIndex((candidate) => candidate.id === item.id) === index
        )
        .sort((a, b) => a.name.localeCompare(b.name)),
    [categories]
  );

  const filteredAppropriations = useMemo(
    () =>
      appropriations.filter((item) => {
        if (officeId && item.office_id !== officeId) return false;
        if (subOfficeId === "__none__" && item.sub_office_id !== null) return false;
        if (
          subOfficeId &&
          subOfficeId !== "__none__" &&
          item.sub_office_id !== subOfficeId
        )
          return false;
        if (categoryId && item.category_id !== categoryId) return false;
        return true;
      }),
    [appropriations, officeId, subOfficeId, categoryId]
  );

  const totals = useMemo(
    () =>
      filteredAppropriations.reduce(
        (sum, item) => {
          sum.appropriation += Number(item.appropriated_amount || 0);
          sum.previous += Number(item.previous_allotment || 0);
          sum.current += Number(item.current_allotment || 0);
          sum.special += Number(item.special_release || 0);
          sum.release += Number(item.total_release || 0);
          sum.balance += Number(item.remaining_appropriation || 0);
          return sum;
        },
        {
          appropriation: 0,
          previous: 0,
          current: 0,
          special: 0,
          release: 0,
          balance: 0,
        }
      ),
    [filteredAppropriations]
  );

  function resetFilters() {
    setFiscalYear(String(currentYear));
    setQuarter("1");
    setFundSourceId("");
    setSearch("");
    setOfficeId("");
    setSubOfficeId("");
    setCategoryId("");
  }

  // Reset both tables to their first page whenever the filters change.
  useEffect(() => {
    setAppropriationPage(1);
    setTransactionPage(1);
  }, [
    fiscalYear,
    quarter,
    fundSourceId,
    search,
    officeId,
    subOfficeId,
    categoryId,
  ]);

  const appropriationTotalPages = Math.max(
    1,
    Math.ceil(filteredAppropriations.length / appropriationPageSize)
  );

  const safeAppropriationPage = Math.min(
    appropriationPage,
    appropriationTotalPages
  );

  const paginatedAppropriations = useMemo(() => {
    const start = (safeAppropriationPage - 1) * appropriationPageSize;
    return filteredAppropriations.slice(
      start,
      start + appropriationPageSize
    );
  }, [
    filteredAppropriations,
    safeAppropriationPage,
    appropriationPageSize,
  ]);

  const transactionTotalPages = Math.max(
    1,
    Math.ceil(allotments.length / transactionPageSize)
  );

  const safeTransactionPage = Math.min(
    transactionPage,
    transactionTotalPages
  );

  const paginatedTransactions = useMemo(() => {
    const start = (safeTransactionPage - 1) * transactionPageSize;
    return allotments.slice(start, start + transactionPageSize);
  }, [allotments, safeTransactionPage, transactionPageSize]);

  function Pagination({
    totalRecords,
    page,
    totalPages,
    pageSize,
    onPageChange,
    onPageSizeChange,
  }: {
    totalRecords: number;
    page: number;
    totalPages: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
  }) {
    const firstRecord =
      totalRecords === 0 ? 0 : (page - 1) * pageSize + 1;
    const lastRecord = Math.min(page * pageSize, totalRecords);

    return (
      <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span>Rows per page:</span>

          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#6689A5]"
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
            of <strong className="text-slate-700">{totalRecords}</strong>{" "}
            records
          </span>
        </div>

        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            First
          </button>

          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="Previous page"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="min-w-[90px] text-center text-xs text-slate-600">
            Page <strong className="text-slate-800">{page}</strong> of{" "}
            <strong className="text-slate-800">{totalPages}</strong>
          </span>

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            title="Next page"
          >
            <ChevronRight size={16} />
          </button>

          <button
            type="button"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Last
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">
            Budget Management / Allotments
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Allotments and Special Releases
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor quarterly regular allotments and special releases.
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-md bg-[#6689A5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#557992]"
        >
          <Plus size={17} />
          New Release
        </button>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ["Appropriation", totals.appropriation],
          ["Previous Allotment", totals.previous],
          ["Current Allotment", totals.current],
          ["Special Release", totals.special],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-lg border border-[#DCE3E9] bg-white p-4"
          >
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-2 text-lg font-semibold text-slate-800">
              {money(Number(value))}
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              Appropriation Monitoring
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Previous releases include earlier regular and special releases.
            </p>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-xs text-slate-600"
          >
            <RefreshCw size={14} />
            Reset
          </button>
        </div>

        <div className="grid gap-3 border-b border-slate-100 bg-[#FAFBFC] p-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="relative">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search account or office"
              className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none"
            />
          </div>

          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            {Array.from({ length: 8 }, (_, i) => currentYear - i).map(
              (year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              )
            )}
          </select>

          <select
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="1">First Quarter</option>
            <option value="2">Second Quarter</option>
            <option value="3">Third Quarter</option>
            <option value="4">Fourth Quarter</option>
          </select>

          <select
            value={fundSourceId}
            onChange={(e) => setFundSourceId(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Fund Sources</option>
            {fundSources.map((fund) => (
              <option key={fund.id} value={fund.id}>
                {fund.label}
              </option>
            ))}
          </select>

          <select
            value={officeId}
            onChange={(e) => {
              setOfficeId(e.target.value);
              setSubOfficeId("");
            }}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Offices</option>
            {officeOptions.map((office) => (
              <option key={office.id} value={office.id}>
                {office.name}
              </option>
            ))}
          </select>

          <select
            value={subOfficeId}
            onChange={(e) => {
              setSubOfficeId(e.target.value);
            }}
            disabled={!officeId}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="">All Sub-offices</option>
            {hasNoSubOffice && (
              <option value="__none__">No Sub-office</option>
            )}
            {subOfficeOptions.map((subOffice) => (
              <option key={subOffice.id} value={subOffice.id}>
                {subOffice.name}
              </option>
            ))}
          </select>

          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
          >
            <option value="">All Expense Account Categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <div className="m-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1350px] text-sm">
            <thead className="bg-[#F4F7F9] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Office / Account</th>
                <th className="px-4 py-3 text-right">Appropriation</th>
                <th className="px-4 py-3 text-right">Previous Allotment</th>
                <th className="px-4 py-3 text-right">Current Allotment</th>
                <th className="px-4 py-3 text-right">Special Release</th>
                <th className="px-4 py-3 text-right">Total Release</th>
                <th className="px-4 py-3 text-right">Balance</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    Loading records...
                  </td>
                </tr>
              ) : filteredAppropriations.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-slate-400"
                  >
                    No appropriation records found.
                  </td>
                </tr>
              ) : (
                paginatedAppropriations.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-left">
                      <p className="font-semibold text-slate-800">
                        {item.account_code} — {item.account_name}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.office_name}
                        {item.sub_office_name
                          ? ` / ${item.sub_office_name}`
                          : ""}
                      </p>

                      <p className="text-xs text-slate-400">
                        {item.fund_code} — {item.fund_name}
                      </p>
                    </td>

                    <td className="px-4 py-3 text-right">
                      {money(Number(item.appropriated_amount))}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {money(Number(item.previous_allotment))}
                    </td>

                    <td className="px-4 py-3 text-right">
                      {money(Number(item.current_allotment))}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-amber-700">
                      {money(Number(item.special_release))}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-[#557992]">
                      {money(Number(item.total_release))}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {money(Number(item.remaining_appropriation))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>

            {!loading && filteredAppropriations.length > 0 && (
              <tfoot className="border-t-2 border-slate-200 bg-[#F8FAFC] font-semibold">
                <tr>
                  <td className="px-4 py-3">TOTAL</td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.appropriation)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.previous)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.current)}
                  </td>
                  <td className="px-4 py-3 text-right text-amber-700">
                    {money(totals.special)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.release)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {money(totals.balance)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        <Pagination
          totalRecords={filteredAppropriations.length}
          page={safeAppropriationPage}
          totalPages={appropriationTotalPages}
          pageSize={appropriationPageSize}
          onPageChange={setAppropriationPage}
          onPageSizeChange={(size) => {
            setAppropriationPageSize(size);
            setAppropriationPage(1);
          }}
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
        <div className="border-b border-slate-200 p-4">
          <h2 className="font-semibold text-slate-800">
            Release Transactions
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Documents recorded during the selected quarter.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-[#F4F7F9] text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 text-left">Document Number</th>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Type</th>
                <th className="px-4 py-3 text-left">Office</th>
                <th className="px-4 py-3 text-left">Account</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {allotments.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    No release transactions found.
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((item) => (
                  <tr key={item.item_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium">
                      {item.allotment_no}
                    </td>

                    <td className="px-4 py-3">
                      {new Date(item.allotment_date).toLocaleDateString(
                        "en-PH"
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          item.release_type === "special"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-blue-50 text-blue-700"
                        }`}
                      >
                        {item.release_type === "special"
                          ? "Special Release"
                          : "Regular"}
                      </span>
                    </td>

                    <td className="px-4 py-3">{item.office_name}</td>

                    <td className="px-4 py-3">
                      {item.account_code} — {item.account_name}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold">
                      {money(Number(item.amount))}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          totalRecords={allotments.length}
          page={safeTransactionPage}
          totalPages={transactionTotalPages}
          pageSize={transactionPageSize}
          onPageChange={setTransactionPage}
          onPageSizeChange={(size) => {
            setTransactionPageSize(size);
            setTransactionPage(1);
          }}
        />
      </div>

      {showForm && (
        <AllotmentFormModal
          fiscalYear={Number(fiscalYear)}
          quarter={Number(quarter)}
          onQuarterChange={(value) => setQuarter(String(value))}
          onClose={() => setShowForm(false)}
          onSaved={loadData}
        />
      )}
    </div>
  );
}