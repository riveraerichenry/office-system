
"use client";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Pencil,
  Plus,
  Power,
  Search,
  Wallet,
} from "lucide-react";

import type {
  ExpenseAccount,
  ExpenseAccountCategory,
  OfficeOption,
  SubOfficeOption,
} from "./account-types";

type Props = {
  accounts: ExpenseAccount[];
  categories: ExpenseAccountCategory[];
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  loading: boolean;
  search: string;
  selectedCategory: string;
  selectedOffice: string;
  selectedSubOffice: string;
  page: number;
  pageSize: number;
  total: number;
  expanded: boolean;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onOfficeChange: (value: string) => void;
  onSubOfficeChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleExpanded: () => void;
  onAdd: () => void;
  onEdit: (item: ExpenseAccount) => void;
  onToggleStatus: (item: ExpenseAccount) => void;
  statusBadge: (active: boolean) => React.ReactNode;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function AccountsTable({
  accounts,
  categories,
  offices,
  subOffices,
  loading,
  search,
  selectedCategory,
  selectedOffice,
  selectedSubOffice,
  page,
  pageSize,
  total,
  expanded,
  onSearchChange,
  onCategoryChange,
  onOfficeChange,
  onSubOfficeChange,
  onPageChange,
  onPageSizeChange,
  onToggleExpanded,
  onAdd,
  onEdit,
  onToggleStatus,
  statusBadge,
}: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  const filteredSubOffices = subOffices.filter(
    (item) =>
      item.office_id === selectedOffice && item.is_active
  );

  return (
    <section className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3E9] p-4">
        <button
          type="button"
          onClick={onToggleExpanded}
          className="flex items-center gap-3 text-left"
        >
          <div className="rounded-md bg-[#EAF1F6] p-2 text-[#6689A5]">
            <Wallet size={19} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Expense Accounts
            </h2>
            <p className="text-[11px] text-slate-400">
              Individual accounts under each category
            </p>
          </div>

          {expanded ? (
            <ChevronUp size={16} />
          ) : (
            <ChevronDown size={16} />
          )}
        </button>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-2.5 text-slate-400"
            />
            <input
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search accounts..."
              className="rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#829FB5]"
            />
          </div>

          {/* OFFICE FILTER */}
          <select
            value={selectedOffice}
            onChange={(e) => onOfficeChange(e.target.value)}
            className="min-w-[160px] rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#829FB5]"
          >
            <option value="All">All Offices</option>

            {offices.map((item) => (
              <option key={item.id} value={item.id}>
                {item.office_code
                  ? `${item.office_code} — ${item.office_name}`
                  : item.office_name}
              </option>
            ))}
          </select>

          {/* SUB-OFFICE FILTER */}
          <select
            value={selectedSubOffice}
            onChange={(e) => onSubOfficeChange(e.target.value)}
            disabled={selectedOffice === "All"}
            className="min-w-[160px] rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#829FB5] disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
          >
            <option value="All">All Sub-offices</option>

            {filteredSubOffices.map((item) => (
              <option key={item.id} value={item.id}>
                {item.sub_office_code
                  ? `${item.sub_office_code} — ${item.sub_office_name}`
                  : item.sub_office_name}
              </option>
            ))}
          </select>

          {/* CATEGORY FILTER */}
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="min-w-[160px] rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-[#829FB5]"
          >
            <option value="All">All Categories</option>

            {categories.map((item) => (
              <option key={item.id} value={item.id}>
                {item.category_code} — {item.category_name}
              </option>
            ))}
          </select>

          <button
            type="button"
            disabled={!categories.some((item) => item.is_active)}
            onClick={onAdd}
            className="flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={15} />
            Add Account
          </button>
        </div>
      </div>

      {expanded && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-sm">
              <thead className="bg-[#F3F6F8] text-[10px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-2.5">
                    Account Code
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5">
                    Account Name
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5">
                    Category / Assignment
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-center">
                    Status
                  </th>
                  <th className="whitespace-nowrap px-4 py-2.5 text-center">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-slate-400"
                    >
                      Loading accounts...
                    </td>
                  </tr>
                ) : accounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-10 text-center text-sm text-slate-400"
                    >
                      No expense accounts found.
                    </td>
                  </tr>
                ) : (
                  accounts.map((item) => (
                    <tr
                      key={item.id}
                      className="h-10 transition hover:bg-[#F8FAFC]"
                    >
                      <td className="whitespace-nowrap px-4 py-2 text-xs font-semibold text-[#6689A5]">
                        {item.account_code}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2 text-xs font-medium text-slate-700">
                        {item.account_name}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2 text-xs">
                        <span className="font-semibold text-slate-700">
                          {item.category_code
                            ? `${item.category_code} — `
                            : ""}
                          {item.category_name || "—"}
                        </span>

                        {item.office_name && (
                          <span className="text-blue-700">
                            {" "}· Office: {item.office_name}
                          </span>
                        )}

                        {item.sub_office_name && (
                          <span className="text-violet-700">
                            {" "}· Sub-office: {item.sub_office_name}
                          </span>
                        )}

                        {!item.office_name && !item.sub_office_name && (
                          <span className="text-red-500">
                            {" "}· No assignment
                          </span>
                        )}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2 text-center">
                        {statusBadge(item.is_active)}
                      </td>

                      <td className="whitespace-nowrap px-4 py-2">
                        <div className="flex justify-center gap-1">
                          <button
                            type="button"
                            title="Edit account"
                            onClick={() => onEdit(item)}
                            className="rounded-md border border-slate-200 p-1.5 text-slate-500 hover:bg-[#EAF1F6] hover:text-[#557992]"
                          >
                            <Pencil size={13} />
                          </button>

                          <button
                            type="button"
                            title={
                              item.is_active
                                ? "Deactivate account"
                                : "Activate account"
                            }
                            onClick={() => onToggleStatus(item)}
                            className={`rounded-md border border-slate-200 p-1.5 ${
                              item.is_active
                                ? "text-amber-600 hover:bg-amber-50"
                                : "text-emerald-600 hover:bg-emerald-50"
                            }`}
                          >
                            <Power size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Rows per page
              </span>

              <select
                value={pageSize}
                onChange={(e) =>
                  onPageSizeChange(Number(e.target.value))
                }
                className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>

              <span className="text-[11px] text-slate-400">
                Showing {start}-{end} of {total}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
              >
                <ChevronLeft size={15} />
              </button>

              <span className="min-w-[90px] text-center text-[11px] text-slate-500">
                Page {page} of {totalPages}
              </span>

              <button
                type="button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"
              >
                <ChevronRight size={15} />
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
