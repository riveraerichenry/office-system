
"use client";

import { useMemo, useState } from "react";
import {
  Plus,
  Trash2,
  X,
  Save,
  Loader2,
} from "lucide-react";

type FundSource = {
  id: string;
  fundCode: string;
  fundName: string;
  acronym: string | null;
};

type ManualRCDItem = {
  id: string;
  or_number: string;
  receipt_date: string;
  payor: string;
  payment_mode: string;
  amount: string;
};

type Props = {
  open: boolean;
  fundSources: FundSource[];
  onClose: () => void;
  onCreated: () => void;
};

const today = () => {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
};

const createItem = (): ManualRCDItem => ({
  id: crypto.randomUUID(),
  or_number: "",
  receipt_date: today(),
  payor: "",
  payment_mode: "CASH",
  amount: "",
});

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);

export default function ManualRCDModal({
  open,
  fundSources,
  onClose,
  onCreated,
}: Props) {
  const [reportDate, setReportDate] = useState(today());
  const [fundSourceId, setFundSourceId] = useState("");
  const [dateFrom, setDateFrom] = useState(today());
  const [dateTo, setDateTo] = useState(today());

  const [items, setItems] = useState<ManualRCDItem[]>([
    createItem(),
  ]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.amount) || 0),
        0
      ),
    [items]
  );

  const updateItem = (
    id: string,
    field: keyof ManualRCDItem,
    value: string
  ) => {
    setItems((previous) =>
      previous.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const addItem = () => {
    setItems((previous) => [...previous, createItem()]);
  };

  const removeItem = (id: string) => {
    setItems((previous) =>
      previous.length > 1
        ? previous.filter((item) => item.id !== id)
        : previous
    );
  };

  const resetForm = () => {
    setReportDate(today());
    setFundSourceId("");
    setDateFrom(today());
    setDateTo(today());
    setItems([createItem()]);
    setError("");
  };

  const handleClose = () => {
    if (saving) return;
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    setError("");

    if (!fundSourceId) {
      setError("Please select a fund source.");
      return;
    }

    if (!reportDate || !dateFrom || !dateTo) {
      setError("Please complete the report and coverage dates.");
      return;
    }

    if (dateFrom > dateTo) {
      setError("Date From cannot be later than Date To.");
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one collection item.");
      return;
    }

    for (let index = 0; index < items.length; index++) {
      const item = items[index];

      if (!item.or_number.trim()) {
        setError(`OR Number is required on item ${index + 1}.`);
        return;
      }

      if (!item.receipt_date) {
        setError(`Receipt date is required on item ${index + 1}.`);
        return;
      }

      if (!item.payment_mode) {
        setError(`Payment mode is required on item ${index + 1}.`);
        return;
      }

      if (
        !Number.isFinite(Number(item.amount)) ||
        Number(item.amount) <= 0
      ) {
        setError(`Enter a valid amount on item ${index + 1}.`);
        return;
      }
    }

    const confirmed = window.confirm(
      `Create this Manual RCD?\n\n` +
        `Number of collection items: ${items.length}\n` +
        `Total collections: ${formatCurrency(total)}`
    );

    if (!confirmed) return;

    try {
      setSaving(true);

      const response = await fetch(
        "/api/remittance/manual-rcd",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            // Support both snake_case and camelCase API fields
            report_date: reportDate,
            reportDate: reportDate,

            fund_source_id: fundSourceId,

            date_from: dateFrom,
            dateFrom: dateFrom,

            date_to: dateTo,
            dateTo: dateTo,

            items: items.map((item) => ({
                or_number: item.or_number.trim(),
                receipt_date: item.receipt_date,
                payor: item.payor.trim(),
                payment_mode: item.payment_mode,
                amount: Number(item.amount),
            })),
            }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to create Manual RCD."
        );
      }

      window.alert(
        `Manual RCD successfully created!\n\n` +
          `RCD Number: ${result.rcd.report_no}\n` +
          `Total Collections: ${formatCurrency(
            Number(result.rcd.total_collections)
          )}`
      );

      resetForm();
      onClose();
      onCreated();
    } catch (error) {
      console.error("MANUAL RCD ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create Manual RCD."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-2 sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}

        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Manual RCD Entry
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Encode collections that were not recorded in the TMS.
            </p>
          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        {/* BODY */}

        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">

          {/* HEADER INFORMATION */}

          <section>
            <h3 className="mb-3 text-sm font-bold text-slate-800">
              RCD Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Report Date *
                </label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={(e) => setReportDate(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Fund Source *
                </label>
                <select
                  value={fundSourceId}
                  onChange={(e) => setFundSourceId(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                >
                  <option value="">Select Fund Source</option>
                  {fundSources.map((fund) => (
                    <option key={fund.id} value={fund.id}>
                      {fund.fundCode} - {fund.fundName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Date From *
                </label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-600">
                  Date To *
                </label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  disabled={saving}
                  className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

            </div>
          </section>

          {/* COLLECTION ITEMS */}

          <section>
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Collection Details
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Add each official receipt as a separate item.
                </p>
              </div>

              <button
                type="button"
                onClick={addItem}
                disabled={saving}
                className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
              >
                <Plus size={15} />
                Add Collection
              </button>
            </div>

            <div className="space-y-3">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">
                      Collection #{index + 1}
                    </span>

                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      disabled={saving || items.length === 1}
                      title="Remove item"
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        OR Number *
                      </label>
                      <input
                        value={item.or_number}
                        onChange={(e) =>
                          updateItem(item.id, "or_number", e.target.value)
                        }
                        disabled={saving}
                        placeholder="OR Number"
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Receipt Date *
                      </label>
                      <input
                        type="date"
                        value={item.receipt_date}
                        onChange={(e) =>
                          updateItem(item.id, "receipt_date", e.target.value)
                        }
                        disabled={saving}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Payor
                      </label>
                      <input
                        value={item.payor}
                        onChange={(e) =>
                          updateItem(item.id, "payor", e.target.value)
                        }
                        disabled={saving}
                        placeholder="Payor name"
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Payment Mode *
                      </label>
                      <select
                        value={item.payment_mode}
                        onChange={(e) =>
                          updateItem(item.id, "payment_mode", e.target.value)
                        }
                        disabled={saving}
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-blue-500"
                      >
                        <option value="CASH">Cash</option>
                        <option value="CHECK">Check</option>
                        <option value="BANK TRANSFER">Bank Transfer</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-xs font-medium text-slate-600">
                        Amount *
                      </label>
                      <input
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) =>
                          updateItem(item.id, "amount", e.target.value)
                        }
                        disabled={saving}
                        placeholder="0.00"
                        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-right text-sm font-semibold outline-none focus:border-blue-500"
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* TOTAL */}

          <div className="flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Total Collection Items
              </p>
              <p className="text-lg font-bold text-slate-800">
                {items.length}
              </p>
            </div>

            <div className="sm:text-right">
              <p className="text-xs font-semibold text-slate-500">
                Total Collections
              </p>
              <p className="text-2xl font-bold tabular-nums text-blue-700">
                {formatCurrency(total)}
              </p>
            </div>
          </div>

          {/* ERROR */}

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        {/* FOOTER */}

        <div className="flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
          <button
            type="button"
            onClick={handleClose}
            disabled={saving}
            className="h-10 rounded-lg border border-slate-300 px-5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving || total <= 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Manual RCD
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
