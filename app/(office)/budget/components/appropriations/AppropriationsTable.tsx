
"use client";

import { useMemo, useState } from "react";
import type {
  Appropriation,
  AccountOption,
} from "./appropriation-types";

type Props = {
  data: Appropriation[];
  accounts: AccountOption[];
  loading: boolean;
  selectedYear: number;
  onRefresh: () => void;
  onAdjustment: (item: Appropriation) => void;
  totals: {
    original: number;
    increases: number;
    decreases: number;
    realignmentIn: number;
    realignmentOut: number;
    adjusted: number;
  };
};

type FilterOption = {
  id: string;
  label: string;
};

const peso = (value: string | number) =>
  Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const filterClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#6689A5] focus:ring-1 focus:ring-[#6689A5]";

const labelClass =
  "mb-1 block text-[11px] font-semibold text-slate-500";

function MoneyCell({ value }: { value: string | number }) {
  return (
    <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">
      {peso(value)}
    </td>
  );
}

function getOptions(
  items: AccountOption[],
  idKey: keyof AccountOption,
  codeKey: keyof AccountOption,
  nameKey: keyof AccountOption
): FilterOption[] {
  const map = new Map<string, FilterOption>();

  items.forEach((item) => {
    const id = item[idKey];

    if (id === null || id === undefined || String(id) === "") {
      return;
    }

    const key = String(id);

    if (!map.has(key)) {
      const code = item[codeKey];
      const name = item[nameKey];

      map.set(key, {
        id: key,
        label: [code, name].filter(Boolean).join(" - ") || key,
      });
    }
  });

  return Array.from(map.values()).sort((a, b) =>
    a.label.localeCompare(b.label)
  );
}

export default function AppropriationsTable({
  data,
  accounts,
  loading,
  selectedYear,
  onRefresh,
  onAdjustment,
}: Props) {
  // =====================================================
  // FILTER STATES
  // =====================================================

  const [officeFilter, setOfficeFilter] = useState("");
  const [subOfficeFilter, setSubOfficeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");

  // =====================================================
  // PAGINATION STATES
  // =====================================================

  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const safeData = Array.isArray(data) ? data : [];
  const safeAccounts = Array.isArray(accounts) ? accounts : [];

  // =====================================================
  // OFFICE OPTIONS
  // IMPORTANT: FROM REGISTERED ACCOUNTS, NOT DATA
  // =====================================================

  const offices = useMemo(
    () =>
      getOptions(
        safeAccounts,
        "office_id",
        "office_code",
        "office_name"
      ),
    [safeAccounts]
  );

  // =====================================================
  // ACCOUNTS UNDER SELECTED OFFICE
  // =====================================================

  const officeAccounts = useMemo(
    () =>
      officeFilter
        ? safeAccounts.filter(
            (item) => String(item.office_id) === officeFilter
          )
        : safeAccounts,
    [safeAccounts, officeFilter]
  );

  // =====================================================
  // SUB-OFFICE OPTIONS
  // =====================================================

  const subOffices = useMemo(() => {
    const options = getOptions(
      officeAccounts,
      "sub_office_id",
      "sub_office_code",
      "sub_office_name"
    );

    const hasNoSubOffice = officeAccounts.some(
      (item) => !item.sub_office_id
    );

    if (hasNoSubOffice) {
      options.unshift({
        id: "__none__",
        label: "No Sub-office",
      });
    }

    return options;
  }, [officeAccounts]);

  // =====================================================
  // ACCOUNTS UNDER SELECTED SUB-OFFICE
  // =====================================================

  const subOfficeAccounts = useMemo(
    () =>
      !subOfficeFilter
        ? officeAccounts
        : subOfficeFilter === "__none__"
          ? officeAccounts.filter((item) => !item.sub_office_id)
          : officeAccounts.filter(
              (item) =>
                String(item.sub_office_id) === subOfficeFilter
            ),
    [officeAccounts, subOfficeFilter]
  );

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categories = useMemo(
    () =>
      getOptions(
        subOfficeAccounts,
        "category_id",
        "category_code",
        "category_name"
      ),
    [subOfficeAccounts]
  );

  // =====================================================
  // ACCOUNTS UNDER SELECTED CATEGORY
  // =====================================================

  const categoryAccounts = useMemo(
    () =>
      categoryFilter
        ? subOfficeAccounts.filter(
            (item) => String(item.category_id) === categoryFilter
          )
        : subOfficeAccounts,
    [subOfficeAccounts, categoryFilter]
  );

  // =====================================================
  // EXPENSE ACCOUNT OPTIONS
  // =====================================================

  const expenseAccounts = useMemo(
    () =>
      getOptions(
        categoryAccounts,
        "account_id",
        "account_code",
        "account_name"
      ),
    [categoryAccounts]
  );

  // =====================================================
  // FILTER ACTUAL APPROPRIATION RECORDS
  // =====================================================

  const filteredData = useMemo(() => {
    return safeData.filter((item) => {
      const matchesOffice =
        !officeFilter ||
        String(item.office_id) === officeFilter;

      const matchesSubOffice =
        !subOfficeFilter ||
        (subOfficeFilter === "__none__"
          ? !item.sub_office_id
          : String(item.sub_office_id) === subOfficeFilter);

      const matchesCategory =
        !categoryFilter ||
        String(item.category_id) === categoryFilter;

      const matchesAccount =
        !accountFilter ||
        String(item.account_id) === accountFilter;

      return (
        matchesOffice &&
        matchesSubOffice &&
        matchesCategory &&
        matchesAccount
      );
    });
  }, [
    safeData,
    officeFilter,
    subOfficeFilter,
    categoryFilter,
    accountFilter,
  ]);

  // =====================================================
  // FILTERED TOTALS
  // =====================================================

  const filteredTotals = useMemo(() => {
    return filteredData.reduce(
      (result, item) => {
        result.original += Number(item.appropriated_amount || 0);
        result.increases += Number(item.adjustment_in || 0);
        result.decreases += Number(item.adjustment_out || 0);
        result.realignmentIn += Number(item.realignment_in || 0);
        result.realignmentOut += Number(item.realignment_out || 0);
        result.adjusted += Number(item.adjusted_amount || 0);

        return result;
      },
      {
        original: 0,
        increases: 0,
        decreases: 0,
        realignmentIn: 0,
        realignmentOut: 0,
        adjusted: 0,
      }
    );
  }, [filteredData]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredData.length / rowsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const startIndex = (safePage - 1) * rowsPerPage;

    return filteredData.slice(
      startIndex,
      startIndex + rowsPerPage
    );
  }, [filteredData, safePage, rowsPerPage]);

  const startRecord =
    filteredData.length === 0
      ? 0
      : (safePage - 1) * rowsPerPage + 1;

  const endRecord = Math.min(
    safePage * rowsPerPage,
    filteredData.length
  );

  // =====================================================
  // RESET FILTERS
  // =====================================================

  function resetFilters() {
    setOfficeFilter("");
    setSubOfficeFilter("");
    setCategoryFilter("");
    setAccountFilter("");
    setCurrentPage(1);
  }

  const hasFilters = Boolean(
    officeFilter ||
    subOfficeFilter ||
    categoryFilter ||
    accountFilter
  );

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* TABLE HEADER */}
      <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-bold text-slate-800">
            Appropriation Records
          </h2>

          <p className="text-xs text-slate-500">
            {filteredData.length} record(s) for fiscal year {selectedYear}
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {/* FILTERS */}
      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-bold text-slate-700">
            Filter Appropriations
          </p>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs font-semibold text-[#557992] hover:underline"
            >
              Clear Filters
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">

          {/* OFFICE */}
          <div>
            <label className={labelClass}>Office</label>

            <select
              value={officeFilter}
              onChange={(e) => {
                setOfficeFilter(e.target.value);
                setSubOfficeFilter("");
                setCategoryFilter("");
                setAccountFilter("");
                setCurrentPage(1);
              }}
              className={filterClass}
            >
              <option value="">All Offices</option>

              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.label}
                </option>
              ))}
            </select>
          </div>

          {/* SUB-OFFICE */}
          <div>
            <label className={labelClass}>Sub-office</label>

            <select
              value={subOfficeFilter}
              onChange={(e) => {
                setSubOfficeFilter(e.target.value);
                setCategoryFilter("");
                setAccountFilter("");
                setCurrentPage(1);
              }}
              disabled={!officeFilter}
              className={filterClass}
            >
              <option value="">All Sub-offices</option>

              {subOffices.map((subOffice) => (
                <option key={subOffice.id} value={subOffice.id}>
                  {subOffice.label}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className={labelClass}>
              Expense Account Category
            </label>

            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setAccountFilter("");
                setCurrentPage(1);
              }}
              disabled={!officeFilter}
              className={filterClass}
            >
              <option value="">All Categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>

          {/* EXPENSE ACCOUNT */}
          <div>
            <label className={labelClass}>Expense Account</label>

            <select
              value={accountFilter}
              onChange={(e) => {
                setAccountFilter(e.target.value);
                setCurrentPage(1);
              }}
              disabled={!categoryFilter}
              className={filterClass}
            >
              <option value="">All Accounts</option>

              {expenseAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1250px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Expense Account</th>
              <th className="px-4 py-3">Office / Sub-office</th>
              <th className="px-4 py-3">Fund Source</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Ordinance</th>
              <th className="px-4 py-3 text-right">Original</th>
              <th className="px-4 py-3 text-right">Adj. In</th>
              <th className="px-4 py-3 text-right">Adj. Out</th>
              <th className="px-4 py-3 text-right">Realignment In</th>
              <th className="px-4 py-3 text-right">Realignment Out</th>
              <th className="px-4 py-3 text-right">Adjusted</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                  Loading appropriations...
                </td>
              </tr>
            ) : filteredData.length === 0 ? (
              <tr>
                <td colSpan={12} className="px-4 py-12 text-center text-slate-500">
                  No appropriation records found.
                </td>
              </tr>
            ) : (
              paginatedData.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">
                      {item.account_code}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.account_name}
                    </p>

                    <p className="mt-1 text-[11px] text-slate-400">
                      {item.category_code} - {item.category_name}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">
                      {item.office_code} - {item.office_name}
                    </p>

                    {item.sub_office_name && (
                      <p className="text-xs text-slate-500">
                        {item.sub_office_code} - {item.sub_office_name}
                      </p>
                    )}
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">
                      {item.fund_code}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.fund_name}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        item.appropriation_type === "annual"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}
                    >
                      {item.appropriation_type === "annual"
                        ? "Annual"
                        : "Supplemental"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-700">
                      {item.ordinance_no || "-"}
                    </p>

                    <p className="text-xs text-slate-500">
                      {item.ordinance_date
                        ? new Date(item.ordinance_date).toLocaleDateString("en-PH")
                        : ""}
                    </p>
                  </td>

                  <MoneyCell value={item.appropriated_amount} />
                  <MoneyCell value={item.adjustment_in} />
                  <MoneyCell value={item.adjustment_out} />
                  <MoneyCell value={item.realignment_in} />
                  <MoneyCell value={item.realignment_out} />

                  <td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">
                    {peso(item.adjusted_amount)}
                  </td>

                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => onAdjustment(item)}
                      className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Adjustment
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>

          {!loading && filteredData.length > 0 && (
            <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-800">
              <tr>
                <td colSpan={5} className="px-4 py-3">
                  FILTERED TOTAL
                </td>

                <MoneyCell value={filteredTotals.original} />
                <MoneyCell value={filteredTotals.increases} />
                <MoneyCell value={filteredTotals.decreases} />
                <MoneyCell value={filteredTotals.realignmentIn} />
                <MoneyCell value={filteredTotals.realignmentOut} />

                <td className="px-4 py-3 text-right">
                  {peso(filteredTotals.adjusted)}
                </td>

                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && filteredData.length > 0 && (
        <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

          <div className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {startRecord}-{endRecord}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredData.length}
            </span>{" "}
            records
          </div>

          <div className="flex flex-wrap items-center gap-3">

            {/* ROWS PER PAGE */}
            <div className="flex items-center gap-2">
              <label
                htmlFor="appropriation-rows-per-page"
                className="text-xs text-slate-500"
              >
                Rows:
              </label>

              <select
                id="appropriation-rows-per-page"
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-[#6689A5]"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* PAGE NAVIGATION */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safePage === 1}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                title="First page"
              >
                «
              </button>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) => Math.max(1, page - 1))
                }
                disabled={safePage === 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Previous
              </button>

              <span className="px-2 text-xs tabular-nums text-slate-600">
                Page {safePage} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() =>
                  setCurrentPage((page) =>
                    Math.min(totalPages, page + 1)
                  )
                }
                disabled={safePage >= totalPages}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>

              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safePage >= totalPages}
                className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
