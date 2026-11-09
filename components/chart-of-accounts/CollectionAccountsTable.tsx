
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Plus,
} from "lucide-react";

import CollectionAccountModal, {
  Account,
} from "./CollectionAccountModal";

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: Account[] | Account;
};

export default function CollectionAccountsTable() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [openingAccount, setOpeningAccount] = useState(false);

  // ==========================================
  // LOAD ALL ACCOUNTS
  // GET /api/accounts
  // ==========================================

  const loadAccounts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/accounts", {
        method: "GET",
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load accounts.");
      }

      setAccounts(Array.isArray(result.data) ? result.data : []);
    } catch (error) {
      console.error("Load Collection Accounts:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to load collection accounts."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts]);

  // ==========================================
  // ADD ACCOUNT
  // ==========================================

  const handleAdd = () => {
    setSelectedAccount(null);
    setModalOpen(true);
  };

  // ==========================================
  // OPEN EDIT MODAL
  // GET /api/accounts/[id]
  // ==========================================

  const handleRowClick = async (account: Account) => {
    if (openingAccount) return;

    setOpeningAccount(true);

    try {
      const response = await fetch(`/api/accounts/${account.id}`, {
        method: "GET",
        cache: "no-store",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to load account details.");
      }

      if (!result.data || Array.isArray(result.data)) {
        throw new Error("Invalid account details response.");
      }

      setSelectedAccount(result.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Get Account Details:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to open account details."
      );
    } finally {
      setOpeningAccount(false);
    }
  };

  // ==========================================
  // CREATE / UPDATE
  // POST /api/accounts
  // PUT /api/accounts/[id]
  // ==========================================

  const handleSave = async (data: Record<string, unknown>) => {
    setSaving(true);

    try {
      const isEditing = Boolean(selectedAccount);

      const url = isEditing
        ? `/api/accounts/${selectedAccount!.id}`
        : "/api/accounts";

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to save account.");
      }

      setModalOpen(false);
      setSelectedAccount(null);

      await loadAccounts();

      alert(
        isEditing
          ? "Account updated successfully."
          : "Account added successfully."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================================
  // DEACTIVATE ACCOUNT
  // DELETE /api/accounts/[id]
  // ==========================================

  const handleDelete = async (id: string) => {
    setDeleting(true);

    try {
      const response = await fetch(`/api/accounts/${id}`, {
        method: "DELETE",
      });

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to deactivate account.");
      }

      setModalOpen(false);
      setSelectedAccount(null);

      await loadAccounts();

      alert(result.message || "Account deactivated successfully.");
    } finally {
      setDeleting(false);
    }
  };

  // ==========================================
  // SEARCH
  // ==========================================

  const filteredAccounts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return accounts;

    return accounts.filter((account) => {
      const searchableValues = [
        account.account_code,
        account.account_name,
        account.class_name,
        account.title_name,
        account.type_name,
        account.parent_code,
        account.parent_name,
      ];

      return searchableValues.some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      );
    });
  }, [accounts, search]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / pageSize)
  );

  const paginatedAccounts = filteredAccounts.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  const firstRecord =
    filteredAccounts.length === 0 ? 0 : (page - 1) * pageSize + 1;

  const lastRecord = Math.min(
    page * pageSize,
    filteredAccounts.length
  );

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

        {/* HEADER */}
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2 text-blue-700">
              <BookOpen size={20} />
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-800">
                Collection Accounts
              </h2>

              <p className="text-xs text-slate-500">
                Manage the existing chart of accounts used for collection transactions.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search account code, name, class..."
                className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            {/* REFRESH */}
            <button
              type="button"
              onClick={loadAccounts}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            {/* ADD */}
            <button
              type="button"
              onClick={handleAdd}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800"
            >
              <Plus size={15} />
              Add Account
            </button>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-2">
          <div className="text-xs text-slate-600">
            Total accounts:{" "}
            <span className="font-bold text-slate-800">
              {accounts.length}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <label htmlFor="collection-page-size">
              Rows per page
            </label>

            <select
              id="collection-page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] border-collapse text-left text-xs">
            <thead className="bg-slate-50 text-[10px] uppercase tracking-wide text-slate-600">
              <tr>
                <th className="whitespace-nowrap px-4 py-2 font-bold">
                  Account Code
                </th>
                <th className="px-4 py-2 font-bold">
                  Account Name
                </th>
                <th className="px-4 py-2 font-bold">
                  Parent Account
                </th>
                <th className="px-4 py-2 font-bold">Class</th>
                <th className="px-4 py-2 font-bold">Title</th>
                <th className="px-4 py-2 font-bold">Type</th>
                <th className="px-4 py-2 font-bold">Postable</th>
                <th className="px-4 py-2 font-bold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-xs text-slate-500"
                  >
                    <RefreshCw
                      size={17}
                      className="mx-auto mb-2 animate-spin"
                    />
                    Loading collection accounts...
                  </td>
                </tr>
              ) : paginatedAccounts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-xs text-slate-500"
                  >
                    {search
                      ? "No matching collection accounts found."
                      : "No collection accounts available."}
                  </td>
                </tr>
              ) : (
                paginatedAccounts.map((account) => (
                  <tr
                    key={account.id}
                    onClick={() => handleRowClick(account)}
                    title="Click to edit account"
                    className="cursor-pointer transition hover:bg-blue-50/60"
                  >
                    <td className="whitespace-nowrap px-4 py-1.5 text-xs font-semibold text-slate-800">
                      {account.account_code || "—"}
                    </td>

                    <td className="px-4 py-1.5 text-xs text-slate-700">
                      <div
                        className="flex items-center gap-1.5"
                        style={{
                          paddingLeft: Math.min(
                            Number(account.account_level ?? 0) * 12,
                            48
                          ),
                        }}
                      >
                        {account.parent_id && (
                          <span className="text-slate-400">↳</span>
                        )}
                        <span>{account.account_name}</span>
                      </div>
                    </td>

                    <td className="px-4 py-1.5 text-xs text-slate-600">
                      {account.parent_code
                        ? `${account.parent_code} - ${account.parent_name ?? ""}`
                        : "—"}
                    </td>

                    <td className="px-4 py-1.5 text-xs text-slate-600">
                      {account.class_name || "—"}
                    </td>

                    <td className="px-4 py-1.5 text-xs text-slate-600">
                      {account.title_name || "—"}
                    </td>

                    <td className="px-4 py-1.5 text-xs text-slate-600">
                      {account.type_name || "—"}
                    </td>

                    <td className="px-4 py-1.5">
                      {account.is_postable ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Yes
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                          No
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-1.5">
                      {account.is_active === false ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-semibold text-red-700">
                          Inactive
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {firstRecord}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-slate-700">
              {lastRecord}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-slate-700">
              {filteredAccounts.length}
            </span>{" "}
            accounts
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              disabled={page <= 1}
              className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={15} />
            </button>

            <span className="px-2 text-xs text-slate-600">
              Page <strong>{page}</strong> of{" "}
              <strong>{totalPages}</strong>
            </span>

            <button
              type="button"
              onClick={() =>
                setPage((current) =>
                  Math.min(totalPages, current + 1)
                )
              }
              disabled={page >= totalPages}
              className="rounded-md border border-slate-300 p-1.5 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </section>

      {/* ADD / EDIT MODAL */}
      <CollectionAccountModal
        open={modalOpen}
        account={selectedAccount}
        accounts={accounts}
        saving={saving}
        deleting={deleting}
        onClose={() => {
          setModalOpen(false);
          setSelectedAccount(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />

      {/* LOADING ACCOUNT DETAILS */}
      {openingAccount && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/20">
          <div className="flex items-center gap-3 rounded-lg bg-white px-5 py-4 text-sm font-medium text-slate-700 shadow-xl">
            <RefreshCw size={18} className="animate-spin text-blue-700" />
            Loading account details...
          </div>
        </div>
      )}
    </>
  );
}
