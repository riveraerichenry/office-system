
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CreditCard,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import AddAccountModal from "./AddAccountModal";

type BankRecord = {
  id: string;
  bank_code: string;
  bank_name: string;
  seq_no: number | null;
  remarks: string | null;
  is_active: boolean;
  account_count?: number;
};

type BankAccountRecord = {
  id: string;
  sequence_code: string;
  bank_id: string;
  account_number: string;
  account_code: string | null;
  account_name: string;
  remarks: string | null;
  account_status: string | null;
  deposit_label: string | null;
  fund_source_id: string | null;
  fund_code?: string | null;
  fund_name?: string | null;
  fund_acronym?: string | null;
  is_active: boolean;
  created_at?: string;
};

type Props = {
  selectedBank: BankRecord | null;
  refreshKey: number;
};

export default function BankAccounts({
  selectedBank,
  refreshKey,
}: Props) {
  const [accounts, setAccounts] = useState<BankAccountRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] =
    useState<BankAccountRecord | null>(null);

  const loadAccounts = useCallback(async () => {
    if (!selectedBank?.id) {
      setAccounts([]);
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        bank_id: selectedBank.id,
        search,
      });

      const response = await fetch(
        `/api/bank_accounts?${params.toString()}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load bank accounts."
        );
      }

      // Normalize nullable fields from the API.
      // fund_source_id must always be string | null.
      const normalizedAccounts: BankAccountRecord[] = (
        result.accounts ?? []
      ).map(
        (
          account: Partial<BankAccountRecord> &
            Pick<
              BankAccountRecord,
              | "id"
              | "sequence_code"
              | "bank_id"
              | "account_number"
              | "account_name"
              | "is_active"
            >
        ) => ({
          ...account,
          account_code: account.account_code ?? null,
          remarks: account.remarks ?? null,
          account_status: account.account_status ?? null,
          deposit_label: account.deposit_label ?? null,
          fund_source_id: account.fund_source_id ?? null,
          fund_code: account.fund_code ?? null,
          fund_name: account.fund_name ?? null,
          fund_acronym: account.fund_acronym ?? null,
        })
      );

      setAccounts(normalizedAccounts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load bank accounts."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedBank, search, refreshKey]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  function openAddModal() {
    setEditingAccount(null);
    setModalOpen(true);
  }

  function openEditModal(account: BankAccountRecord) {
    setEditingAccount(account);
    setModalOpen(true);
  }

  async function handleSaved() {
    setModalOpen(false);
    setEditingAccount(null);
    await loadAccounts();
  }

  async function handleDeleted(accountId: string) {
    setAccounts((current) =>
      current.filter((account) => account.id !== accountId)
    );

    setModalOpen(false);
    setEditingAccount(null);

    await loadAccounts();
  }

  async function toggleAccount(account: BankAccountRecord) {
    const nextActive = !account.is_active;
    const action = nextActive ? "activate" : "deactivate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} account "${account.account_name}"?`
      )
    ) {
      return;
    }

    setError("");

    try {
      const response = await fetch(
        `/api/bank_accounts/${account.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            is_active: nextActive,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || `Failed to ${action} account.`
        );
      }

      await loadAccounts();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `Failed to ${action} account.`
      );
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-700">
              <CreditCard size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-gray-900">
                Bank Accounts
              </h2>

              <p className="truncate text-sm text-gray-500">
                {selectedBank?.id
                  ? selectedBank.bank_name
                  : "Select a bank to view accounts"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            disabled={!selectedBank?.id}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={17} />
            <span className="hidden sm:inline">Add Account</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>

        {/* Search */}
        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={!selectedBank?.id}
              placeholder="Search account number, code, or name..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Account list */}
        <div className="max-h-[620px] min-h-64 overflow-auto">
          {!selectedBank?.id ? (
            <div className="flex min-h-52 items-center justify-center px-4 text-center text-sm text-gray-500">
              Select a bank from the left to view its accounts.
            </div>
          ) : loading ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-gray-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading bank accounts...
            </div>
          ) : accounts.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <CreditCard size={36} className="mb-3 text-gray-300" />

              <p className="font-medium text-gray-700">
                No accounts found
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Add an account or change your search.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {accounts.map((account) => (
                <div
                  key={account.id}
                  className="flex min-w-[850px] items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50"
                >
                  {/* Icon */}
                  <div className="shrink-0 rounded-lg bg-gray-100 p-2 text-gray-600">
                    <CreditCard size={18} />
                  </div>

                  {/* Account name and status */}
                  <div className="flex w-[260px] shrink-0 items-center gap-2">
                    <span
                      className="truncate font-semibold text-gray-900"
                      title={account.account_name}
                    >
                      {account.account_name}
                    </span>

                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
                        account.is_active
                          ? "bg-green-100 text-green-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {account.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  {/* Account number */}
                  <div className="w-[190px] shrink-0">
                    <p
                      className="truncate text-sm text-gray-600"
                      title={account.account_number}
                    >
                      {account.account_number}
                    </p>

                    <p className="text-xs text-gray-400">
                      Account Number
                    </p>
                  </div>

                  {/* Sequence and account code */}
                  <div className="w-[160px] shrink-0">
                    <p
                      className="truncate text-sm text-gray-600"
                      title={account.account_code ?? ""}
                    >
                      {account.account_code || "—"}
                    </p>

                    <p className="truncate text-xs text-gray-400">
                      Seq: {account.sequence_code}
                    </p>
                  </div>

                  {/* Fund source */}
                  <div className="min-w-[180px] flex-1">
                    <p
                      className="truncate text-sm text-gray-600"
                      title={account.fund_name ?? ""}
                    >
                      {account.fund_name ||
                        account.fund_code ||
                        account.fund_acronym ||
                        "—"}
                    </p>

                    <p className="text-xs text-gray-400">
                      Fund Source
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      title="Edit account"
                      aria-label={`Edit ${account.account_name}`}
                      onClick={() => openEditModal(account)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      title={
                        account.is_active
                          ? "Deactivate account"
                          : "Activate account"
                      }
                      aria-label={
                        account.is_active
                          ? `Deactivate ${account.account_name}`
                          : `Activate ${account.account_name}`
                      }
                      onClick={() => void toggleAccount(account)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-blue-50 hover:text-blue-700"
                    >
                      {account.is_active ? (
                        <ToggleRight size={19} />
                      ) : (
                        <ToggleLeft size={19} />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Add / Edit Account Modal */}
      {modalOpen && selectedBank?.id && (
        <AddAccountModal
          bank={selectedBank}
          account={editingAccount}
          onClose={() => setModalOpen(false)}
          onSaved={() => void handleSaved()}
          onDeleted={(accountId) => void handleDeleted(accountId)}
        />
      )}
    </>
  );
}
