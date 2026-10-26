
"use client";

import { useEffect, useState, type FormEvent } from "react";
import { LoaderCircle, Trash2, X } from "lucide-react";

type BankRecord = {
  id: string;
  bank_code: string;
  bank_name: string;
  seq_no: number | null;
  remarks: string | null;
  is_active: boolean;
  account_count?: number;
};

type FundSource = {
  id: string;
  fund_code: string;
  fund_name: string;
  acronym: string | null;
  seq_no: string | null;
  remarks: string | null;
  is_active: boolean;
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

type AccountForm = {
  sequence_code: string;
  account_number: string;
  account_code: string;
  account_name: string;
  account_status: string;
  deposit_label: string;
  remarks: string;
  fund_source_id: string;
};

type Props = {
  bank: BankRecord;
  account: BankAccountRecord | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: (accountId: string) => void;
};

const emptyForm: AccountForm = {
  sequence_code: "",
  account_number: "",
  account_code: "",
  account_name: "",
  account_status: "ACTIVE",
  deposit_label: "",
  remarks: "",
  fund_source_id: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-1.5 block text-sm font-medium text-gray-700";

export default function AddAccountModal({
  bank,
  account,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);
  const [loadingFunds, setLoadingFunds] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  // Populate the form when adding or editing an account.
  useEffect(() => {
    setForm(
      account
        ? {
            sequence_code: account.sequence_code ?? "",
            account_number: account.account_number ?? "",
            account_code: account.account_code ?? "",
            account_name: account.account_name ?? "",
            account_status: account.account_status ?? "ACTIVE",
            deposit_label: account.deposit_label ?? "",
            remarks: account.remarks ?? "",
            fund_source_id: account.fund_source_id ?? "",
          }
        : { ...emptyForm }
    );

    setError("");
  }, [account, bank.id]);

  // Load active fund sources from PostgreSQL API.
  useEffect(() => {
    let cancelled = false;

    async function loadFundSources() {
      setLoadingFunds(true);

      try {
        const response = await fetch("/api/fund-sources", {
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message ||
              result.error ||
              "Failed to load fund sources."
          );
        }

        // Your API returns { success: true, data: [...] }.
        const rows: FundSource[] = Array.isArray(result.data)
          ? result.data
          : [];

        if (!cancelled) {
          setFundSources(rows);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to load fund sources."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingFunds(false);
        }
      }
    }

    void loadFundSources();

    return () => {
      cancelled = true;
    };
  }, []);

  function updateForm<K extends keyof AccountForm>(
    key: K,
    value: AccountForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  // Create or update account.
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const url = account
        ? `/api/bank_accounts/${account.id}`
        : "/api/bank_accounts";

      const response = await fetch(url, {
        method: account ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sequence_code: form.sequence_code.trim(),
          bank_id: bank.id,
          account_number: form.account_number.trim(),
          account_code: form.account_code.trim() || null,
          account_name: form.account_name.trim(),
          account_status: form.account_status,
          deposit_label: form.deposit_label.trim() || null,
          remarks: form.remarks.trim() || null,
          fund_source_id: form.fund_source_id || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to save bank account."
        );
      }

      onSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save bank account."
      );
    } finally {
      setSaving(false);
    }
  }

  // Delete account.
  async function handleDelete() {
    if (!account) return;

    const confirmed = window.confirm(
      `Permanently delete account "${account.account_name}" (${account.account_number})? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(
        `/api/bank_accounts/${account.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message ||
            result.error ||
            "Failed to delete bank account."
        );
      }

      onDeleted(account.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete bank account."
      );
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="my-auto w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {account ? "Edit Bank Account" : "Add Bank Account"}
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              Bank:{" "}
              <span className="font-medium text-gray-700">
                {bank.bank_name}
              </span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close modal"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-5"
        >
          {/* Error message */}
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Sequence and account number */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Sequence Code *
              </label>

              <input
                required
                maxLength={50}
                value={form.sequence_code}
                onChange={(e) =>
                  updateForm("sequence_code", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Account Number *
              </label>

              <input
                required
                maxLength={255}
                value={form.account_number}
                onChange={(e) =>
                  updateForm("account_number", e.target.value)
                }
                className={inputClass}
              />
            </div>
          </div>

          {/* Account name */}
          <div>
            <label className={labelClass}>
              Account Name *
            </label>

            <input
              required
              maxLength={255}
              value={form.account_name}
              onChange={(e) =>
                updateForm("account_name", e.target.value)
              }
              className={inputClass}
            />
          </div>

          {/* Account code and status */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>
                Account Code
              </label>

              <input
                maxLength={255}
                value={form.account_code}
                onChange={(e) =>
                  updateForm("account_code", e.target.value)
                }
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>
                Account Status
              </label>

              <select
                value={form.account_status}
                onChange={(e) =>
                  updateForm("account_status", e.target.value)
                }
                className={inputClass}
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            </div>
          </div>

          {/* Fund source */}
          <div>
            <label className={labelClass}>
              Fund Source
            </label>

            <select
              value={form.fund_source_id}
              onChange={(e) =>
                updateForm("fund_source_id", e.target.value)
              }
              disabled={loadingFunds || busy}
              className={inputClass}
            >
              <option value="">
                No fund source assigned
              </option>

              {fundSources.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.fund_code} - {fund.fund_name}
                  {fund.acronym ? ` (${fund.acronym})` : ""}
                </option>
              ))}
            </select>

            <p className="mt-1 text-xs text-gray-500">
              {loadingFunds
                ? "Loading available fund sources..."
                : `${fundSources.length} active fund source(s) available.`}
            </p>
          </div>

          {/* Deposit label */}
          <div>
            <label className={labelClass}>
              Deposit Label
            </label>

            <input
              maxLength={255}
              value={form.deposit_label}
              onChange={(e) =>
                updateForm("deposit_label", e.target.value)
              }
              className={inputClass}
            />
          </div>

          {/* Remarks */}
          <div>
            <label className={labelClass}>
              Remarks
            </label>

            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) =>
                updateForm("remarks", e.target.value)
              }
              className={`${inputClass} resize-y`}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              {account && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? (
                    <LoaderCircle
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Trash2 size={16} />
                  )}

                  {deleting
                    ? "Deleting..."
                    : "Delete Account"}
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={busy}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={busy || loadingFunds}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Saving..."
                  : account
                    ? "Save Changes"
                    : "Save Account"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
