
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

type BankFormData = {
  bank_code: string;
  bank_name: string;
  seq_no: string;
  remarks: string;
};

type Props = {
  bank: BankRecord | null;
  onClose: () => void;
  onSaved: (bank?: BankRecord) => void;
  onDeleted: (bankId: string) => void;
};

const emptyForm: BankFormData = {
  bank_code: "",
  bank_name: "",
  seq_no: "0",
  remarks: "",
};

export default function AddBankModal({
  bank,
  onClose,
  onSaved,
  onDeleted,
}: Props) {
  const [form, setForm] = useState<BankFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setForm(
      bank
        ? {
            bank_code: bank.bank_code,
            bank_name: bank.bank_name,
            seq_no: String(bank.seq_no ?? 0),
            remarks: bank.remarks ?? "",
          }
        : emptyForm
    );
    setError("");
  }, [bank]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const seqNo = Number(form.seq_no || 0);

    if (!Number.isInteger(seqNo)) {
      setError("Sequence number must be a whole number.");
      setSaving(false);
      return;
    }

    if (!form.bank_code.trim() || !form.bank_name.trim()) {
      setError("Bank code and bank name are required.");
      setSaving(false);
      return;
    }

    try {
      const response = await fetch(
        bank ? `/api/banks/${bank.id}` : "/api/banks",
        {
          method: bank ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            bank_code: form.bank_code.trim(),
            bank_name: form.bank_name.trim(),
            seq_no: seqNo,
            remarks: form.remarks.trim() || null,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save bank.");
      }

      onSaved(result.bank);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save bank.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!bank) return;

    const confirmed = window.confirm(
      `Permanently delete "${bank.bank_name}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setDeleting(true);
    setError("");

    try {
      const response = await fetch(`/api/banks/${bank.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete bank.");
      }

      onDeleted(bank.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete bank.");
    } finally {
      setDeleting(false);
    }
  }

  const busy = saving || deleting;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">
              {bank ? "Edit Bank" : "Add Bank"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Enter the bank information below.
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

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bank Code *
            </label>
            <input
              required
              maxLength={50}
              value={form.bank_code}
              onChange={(event) =>
                setForm({ ...form, bank_code: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Bank Name *
            </label>
            <input
              required
              maxLength={255}
              value={form.bank_name}
              onChange={(event) =>
                setForm({ ...form, bank_name: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Sequence Number
            </label>
            <input
              type="number"
              step="1"
              value={form.seq_no}
              onChange={(event) =>
                setForm({ ...form, seq_no: event.target.value })
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Remarks
            </label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(event) =>
                setForm({ ...form, remarks: event.target.value })
              }
              className="w-full resize-y rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
            <div>
              {bank && (
                <button
                  type="button"
                  onClick={() => void handleDelete()}
                  disabled={busy}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {deleting ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                  {deleting ? "Deleting..." : "Delete Bank"}
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
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60"
              >
                {saving && (
                  <LoaderCircle size={17} className="animate-spin" />
                )}
                {saving
                  ? "Saving..."
                  : bank
                    ? "Save Changes"
                    : "Save Bank"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
