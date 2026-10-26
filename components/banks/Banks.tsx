
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import AddBankModal from "./AddBankModal";

type BankRecord = {
  id: string;
  bank_code: string;
  bank_name: string;
  seq_no: number | null;
  remarks: string | null;
  is_active: boolean;
  account_count?: number;
};

type BanksProps = {
  selectedBankId: string;
  onSelectBank: (bank: BankRecord) => void;
  onBanksUpdated: () => void;
};

export default function Banks({
  selectedBankId,
  onSelectBank,
  onBanksUpdated,
}: BanksProps) {
  const [banks, setBanks] = useState<BankRecord[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBank, setEditingBank] = useState<BankRecord | null>(null);

  const loadBanks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/banks?search=${encodeURIComponent(search)}`,
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load banks.");
      }

      const items: BankRecord[] = result.banks ?? [];
      setBanks(items);

      const selected = items.find((item) => item.id === selectedBankId);

      if (selected) {
        onSelectBank(selected);
      } else if (!selectedBankId && items.length > 0) {
        onSelectBank(items[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load banks.");
    } finally {
      setLoading(false);
    }
  }, [search, selectedBankId, onSelectBank]);

  useEffect(() => {
    void loadBanks();
  }, [loadBanks]);

  function openAddModal() {
    setEditingBank(null);
    setModalOpen(true);
  }

  function openEditModal(bank: BankRecord) {
    setEditingBank(bank);
    setModalOpen(true);
  }

  async function handleSaved(savedBank?: BankRecord) {
    setModalOpen(false);
    await loadBanks();
    onBanksUpdated();

    if (savedBank) {
      onSelectBank(savedBank);
    }
  }

  async function handleDeleted(bankId: string) {
    setModalOpen(false);

    const remainingBanks = banks.filter((item) => item.id !== bankId);

    if (selectedBankId === bankId) {
      if (remainingBanks.length > 0) {
        onSelectBank(remainingBanks[0]);
      } else {
        // Clear the selected bank when no banks remain.
        onSelectBank({
          id: "",
          bank_code: "",
          bank_name: "",
          seq_no: 0,
          remarks: null,
          is_active: false,
          account_count: 0,
        });
      }
    }

    await loadBanks();
    onBanksUpdated();
  }

  async function toggleBank(bank: BankRecord) {
    const action = bank.is_active ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${action} "${bank.bank_name}"?`
      )
    ) {
      return;
    }

    setError("");

    try {
      const response = await fetch(`/api/banks/${bank.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !bank.is_active }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || `Failed to ${action} bank.`);
      }

      await loadBanks();
      onBanksUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} bank.`);
    }
  }

  return (
    <>
      <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-50 p-2.5 text-blue-700">
              <Building2 size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">Banks</h2>
              <p className="text-sm text-gray-500">
                {banks.length} bank{banks.length === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-3 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
          >
            <Plus size={17} />
            Add Bank
          </button>
        </div>

        <div className="border-b border-gray-100 p-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search bank code or name..."
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        {error && (
          <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="max-h-[620px] min-h-64 space-y-2 overflow-y-auto p-3">
          {loading ? (
            <div className="flex min-h-52 items-center justify-center gap-2 text-sm text-gray-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading banks...
            </div>
          ) : banks.length === 0 ? (
            <div className="flex min-h-52 flex-col items-center justify-center text-center">
              <Building2 size={36} className="mb-3 text-gray-300" />
              <p className="font-medium text-gray-700">No banks found</p>
              <p className="mt-1 text-sm text-gray-500">
                Add a bank or change your search.
              </p>
            </div>
          ) : (
            banks.map((bank) => {
              const selected = bank.id === selectedBankId;

              return (
                <div
                  key={bank.id}
                  className={`flex items-center gap-3 rounded-xl border p-4 ${
                    selected
                      ? "border-blue-300 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectBank(bank)}
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <div
                      className={`rounded-lg p-2.5 ${
                        selected
                          ? "bg-blue-700 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      <Building2 size={20} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold text-gray-900">
                          {bank.bank_name}
                        </p>
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            bank.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {bank.is_active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        Code: {bank.bank_code}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {bank.account_count ?? 0} account(s)
                      </p>
                    </div>

                    {selected && (
                      <ChevronRight
                        size={19}
                        className="shrink-0 text-blue-700"
                      />
                    )}
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      title="Edit bank"
                      onClick={() => openEditModal(bank)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-blue-700"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      title={
                        bank.is_active ? "Deactivate bank" : "Activate bank"
                      }
                      onClick={() => void toggleBank(bank)}
                      className="rounded-lg p-2 text-gray-500 hover:bg-white hover:text-blue-700"
                    >
                      {bank.is_active ? (
                        <ToggleRight size={19} />
                      ) : (
                        <ToggleLeft size={19} />
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {modalOpen && (
        <AddBankModal
          bank={editingBank}
          onClose={() => setModalOpen(false)}
          onSaved={(savedBank) => void handleSaved(savedBank)}
          onDeleted={(bankId) => void handleDeleted(bankId)}
        />
      )}
    </>
  );
}
