
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Plus,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";
import Swal from "sweetalert2";

import DisbursementAccountModal, {
  DisbursementAccount,
  DisbursementAccountFormData,
} from "./DisbursementAccountModal";

const API_URL = "/api/chart-of-accounts/disbursement";
const PAGE_SIZE_OPTIONS = [10, 20, 50];

export default function DisbursementAccountsTable() {
  const [accounts, setAccounts] = useState<DisbursementAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingAccount, setOpeningAccount] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<DisbursementAccount | null>(null);

  const [lastSelectedOfficeId, setLastSelectedOfficeId] =
    useState("");

  // LOAD ACCOUNTS
  const loadAccounts = useCallback(async () => {
    const response = await fetch(API_URL, {
      method: "GET",
      cache: "no-store",
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(
        result.message || "Unable to load disbursement accounts."
      );
    }

    setAccounts(result.data || []);
  }, []);

  useEffect(() => {
    async function initialize() {
      try {
        setLoading(true);
        await loadAccounts();
      } catch (error) {
        console.error("Load Disbursement Accounts Error:", error);

        Swal.fire({
          icon: "error",
          title: "Unable to Load Accounts",
          text:
            error instanceof Error
              ? error.message
              : "Unable to load disbursement accounts.",
        });
      } finally {
        setLoading(false);
      }
    }

    initialize();
  }, [loadAccounts]);

  // SEARCH
  const filteredAccounts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return accounts;

    return accounts.filter((account) =>
      [
        account.account_code,
        account.account_name,
        account.nature_name,
        account.office_name,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(keyword)
      )
    );
  }, [accounts, search]);

  // PAGINATION
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAccounts.length / pageSize)
  );

  const currentPage = Math.min(page, totalPages);

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  // ADD
  function openAddModal() {
    setSelectedAccount(null);
    setModalOpen(true);
  }

  // EDIT
  async function openEditModal(account: DisbursementAccount) {
    try {
      setOpeningAccount(true);

      const response = await fetch(`${API_URL}/${account.id}`, {
        method: "GET",
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to retrieve account details."
        );
      }

      setSelectedAccount(result.data);
      setModalOpen(true);
    } catch (error) {
      console.error("Get Disbursement Account Error:", error);

      Swal.fire({
        icon: "error",
        title: "Unable to Open Account",
        text:
          error instanceof Error
            ? error.message
            : "Unable to retrieve account details.",
      });
    } finally {
      setOpeningAccount(false);
    }
  }

  // SAVE
  async function handleSave(data: DisbursementAccountFormData) {
    try {
      setSaving(true);

      const isEditing = Boolean(selectedAccount);

      const url = isEditing
        ? `${API_URL}/${selectedAccount!.id}`
        : API_URL;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account_code: data.account_code,
          account_name: data.account_name,
          nature_id: data.nature_id,
          office_id: data.office_id,
          class_name: data.class_name || null,
          title_name: data.title_name || null,
          type_name: data.type_name || null,
          is_postable: data.is_postable,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            `Unable to ${isEditing ? "update" : "create"} account.`
        );
      }

      setLastSelectedOfficeId(data.office_id);

      if (isEditing && result.data) {
        setSelectedAccount(result.data);
      }

      await loadAccounts();

      await Swal.fire({
        icon: "success",
        title: isEditing ? "Account Updated!" : "Account Saved!",
        text: isEditing
          ? "Disbursement account has been updated successfully."
          : "Disbursement account has been created successfully.",
        confirmButtonText: "Continue",
        confirmButtonColor: "#2563eb",
        allowOutsideClick: false,
      });
    } catch (error) {
      console.error("Save Disbursement Account Error:", error);

      throw new Error(
        error instanceof Error
          ? error.message
          : "Unable to save disbursement account."
      );
    } finally {
      setSaving(false);
    }
  }

  // DELETE
  async function handleDelete(id: string) {
    try {
      setDeleting(true);

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to delete disbursement account."
        );
      }

      await loadAccounts();

      setModalOpen(false);
      setSelectedAccount(null);

      await Swal.fire({
        icon: "success",
        title: "Account Deleted!",
        text: "Disbursement account has been deleted successfully.",
        confirmButtonColor: "#2563eb",
      });
    } catch (error) {
      console.error("Delete Disbursement Account Error:", error);

      throw new Error(
        error instanceof Error
          ? error.message
          : "Unable to delete disbursement account."
      );
    } finally {
      setDeleting(false);
    }
  }

  // REFRESH
  async function handleRefresh() {
    try {
      setLoading(true);
      await loadAccounts();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Refresh Failed",
        text:
          error instanceof Error
            ? error.message
            : "Unable to refresh accounts.",
      });
    } finally {
      setLoading(false);
    }
  }

  const startItem =
    filteredAccounts.length === 0
      ? 0
      : (currentPage - 1) * pageSize + 1;

  const endItem = Math.min(
    currentPage * pageSize,
    filteredAccounts.length
  );

  return (
    <div className="relative rounded-xl border border-slate-200 bg-white shadow-sm">

      {/* HEADER */}
      <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
            <Wallet size={20} />
          </div>

          <div>
            <h2 className="text-base font-bold text-slate-800">
              Disbursement Accounts
            </h2>
            <p className="text-xs text-slate-500">
              Manage disbursement chart of accounts
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRefresh}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            <Plus size={16} />
            Add Account
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search code, account, nature, or office..."
            className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-500">
            Show
          </label>

          <select
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm outline-none focus:border-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>

          <span className="text-xs text-slate-500">entries</span>
        </div>
      </div>

      {/* TABLE */}
      <div className="relative overflow-x-auto">
        <table className="w-full min-w-[850px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-y border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-600">
              <th className="px-4 py-2 font-bold">Account Code</th>
              <th className="px-4 py-2 font-bold">Account Name</th>
              <th className="px-4 py-2 font-bold">Nature</th>
              <th className="px-4 py-2 font-bold">Office</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
                    <Loader2 size={18} className="animate-spin" />
                    Loading disbursement accounts...
                  </div>
                </td>
              </tr>
            ) : paginatedAccounts.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  No disbursement accounts found.
                </td>
              </tr>
            ) : (
              paginatedAccounts.map((account) => (
                <tr
                  key={account.id}
                  onClick={() => openEditModal(account)}
                  className="cursor-pointer transition hover:bg-blue-50/50"
                >
                  <td className="whitespace-nowrap px-4 py-1.5 font-semibold text-blue-700">
                    {account.account_code || "—"}
                  </td>

                  <td className="px-4 py-1.5 font-medium text-slate-800">
                    {account.account_name || "—"}
                  </td>

                  <td className="px-4 py-1.5 text-slate-600">
                    {account.nature_name || "—"}
                  </td>

                  <td className="px-4 py-1.5 text-slate-600">
                    {account.office_name || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {openingAccount && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60">
            <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600 shadow-sm">
              <Loader2
                size={17}
                className="animate-spin text-blue-600"
              />
              Loading account details...
            </div>
          </div>
        )}
      </div>

      {/* PAGINATION */}
      <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {startItem}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-700">
            {endItem}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-slate-700">
            {filteredAccounts.length}
          </span>{" "}
          entries
        </p>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() =>
              setPage((prev) => Math.max(1, prev - 1))
            }
            disabled={currentPage <= 1}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft size={16} />
          </button>

          <span className="px-3 text-xs font-semibold text-slate-600">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() =>
              setPage((prev) => Math.min(totalPages, prev + 1))
            }
            disabled={currentPage >= totalPages}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* MODAL */}
      <DisbursementAccountModal
        open={modalOpen}
        account={selectedAccount}
        saving={saving}
        deleting={deleting}
        defaultOfficeId={lastSelectedOfficeId}
        onClose={() => {
          if (saving || deleting) return;

          setModalOpen(false);
          setSelectedAccount(null);
        }}
        onSave={handleSave}
        onDelete={handleDelete}
      />
    </div>
  );
}
