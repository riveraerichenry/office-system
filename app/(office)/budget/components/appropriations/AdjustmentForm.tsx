
"use client";

import { useState } from "react";
import { AdjustmentFormData, Appropriation } from "./appropriation-types";

type Props = {
  appropriation: Appropriation;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (data: AdjustmentFormData) => void;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

function formatAmount(value: string) {
  if (!value) return "";

  const parts = value.split(".");
  const whole = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.length > 1 ? `${whole}.${parts[1]}` : whole;
}

function cleanAmount(value: string) {
  let cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");

  const decimalIndex = cleaned.indexOf(".");

  if (decimalIndex !== -1) {
    cleaned =
      cleaned.slice(0, decimalIndex + 1) +
      cleaned.slice(decimalIndex + 1).replace(/\./g, "");
  }

  const parts = cleaned.split(".");

  if (parts.length > 1) {
    cleaned = `${parts[0]}.${parts[1].slice(0, 2)}`;
  }

  if (
    cleaned.length > 1 &&
    cleaned.startsWith("0") &&
    !cleaned.startsWith("0.")
  ) {
    cleaned = cleaned.replace(/^0+/, "") || "0";
  }

  return cleaned;
}

function formatCurrency(value: number) {
  return value.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AdjustmentForm({
  appropriation,
  saving,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<AdjustmentFormData>({
    appropriation_id: appropriation.id,
    adjustment_type: "increase",
    reference_no: "",
    reference_date: "",
    amount: "",
    justification: "",
  });

  const balance = Number(appropriation.adjusted_amount || 0);
  const amountValue = Number(form.amount || 0);
  const isDecrease = form.adjustment_type === "decrease";
  const exceedsBalance = isDecrease && amountValue > balance;

  function update<K extends keyof AdjustmentFormData>(
    key: K,
    value: AdjustmentFormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function handleAmountChange(value: string) {
    update("amount", cleanAmount(value));
  }

  function handleAmountBlur() {
    if (!form.amount) return;

    const amount = Number(form.amount);

    if (Number.isFinite(amount)) {
      update("amount", amount.toFixed(2));
    }
  }

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.amount || amountValue <= 0 || exceedsBalance) return;

    onSubmit({
      ...form,
      reference_no: form.reference_no.trim(),
      reference_date: form.reference_date || "",
      amount: String(amountValue),
    });
  }

  return (
    <form onSubmit={submit} className="space-y-6 p-5 sm:p-8">
      {/* APPROPRIATION INFORMATION */}
      <section>
        <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">
          Appropriation Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className={labelClass}>Expense Account</label>

            <p className="text-sm font-semibold text-slate-800">
              {appropriation.account_code} — {appropriation.account_name}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              {appropriation.office_name}
              {appropriation.sub_office_name
                ? ` / ${appropriation.sub_office_name}`
                : ""}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Fiscal Year</label>
              <p className="py-2 text-sm font-medium text-slate-700">
                {appropriation.fiscal_year}
              </p>
            </div>

            <div>
              <label className={labelClass}>
                Current Adjusted Appropriation
              </label>
              <p className="py-2 text-sm font-semibold text-[#557992]">
                ₱{formatCurrency(balance)}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ADJUSTMENT DETAILS */}
      <section>
        <h3 className="mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">
          Adjustment Details
        </h3>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* ADJUSTMENT TYPE */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Adjustment Type <span className="text-red-500">*</span>
            </label>

            <select
              required
              disabled={saving}
              value={form.adjustment_type}
              onChange={(e) =>
                update(
                  "adjustment_type",
                  e.target.value as "increase" | "decrease"
                )
              }
              className={inputClass}
            >
              <option value="increase">Increase</option>
              <option value="decrease">Decrease</option>
            </select>
          </div>

          {/* REFERENCE NUMBER - OPTIONAL */}
          <div>
            <label className={labelClass}>
              Reference Number
              <span className="ml-1 text-slate-400">(Optional)</span>
            </label>

            <input
              disabled={saving}
              value={form.reference_no}
              onChange={(e) => update("reference_no", e.target.value)}
              className={inputClass}
              placeholder="Enter reference number"
            />
          </div>

          {/* REFERENCE DATE - OPTIONAL */}
          <div>
            <label className={labelClass}>
              Reference Date
              <span className="ml-1 text-slate-400">(Optional)</span>
            </label>

            <input
              type="date"
              disabled={saving}
              value={form.reference_date}
              onChange={(e) => update("reference_date", e.target.value)}
              className={inputClass}
            />
          </div>

          {/* AMOUNT */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Adjustment Amount <span className="text-red-500">*</span>
            </label>

            <div className="flex items-center border-b border-slate-300 transition focus-within:border-[#6689A5]">
              <span className="mr-2 text-sm font-medium text-slate-500">
                ₱
              </span>

              <input
                required
                disabled={saving}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={formatAmount(form.amount)}
                onChange={(e) => handleAmountChange(e.target.value)}
                onBlur={handleAmountBlur}
                className="w-full border-0 bg-transparent px-0 py-2 text-right text-lg font-semibold tabular-nums text-slate-800 outline-none focus:ring-0 placeholder:text-slate-400"
                placeholder="0.00"
              />
            </div>

            {isDecrease && (
              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400">
                  Maximum allowable decrease
                </p>

                <p className="text-xs font-semibold text-slate-600">
                  ₱{formatCurrency(balance)}
                </p>
              </div>
            )}

            {exceedsBalance && (
              <p className="mt-2 text-xs text-red-600">
                Amount cannot exceed the current adjusted appropriation.
              </p>
            )}
          </div>

          {/* JUSTIFICATION */}
          <div className="sm:col-span-2">
            <label className={labelClass}>
              Justification <span className="text-red-500">*</span>
            </label>

            <textarea
              required
              disabled={saving}
              rows={3}
              value={form.justification}
              onChange={(e) => update("justification", e.target.value)}
              className="w-full resize-y rounded-sm border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#829FB5] focus:ring-1 focus:ring-[#829FB5]"
              placeholder="Enter the reason for this adjustment"
            />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </p>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-2 border-t border-slate-200 bg-white px-1 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            !form.amount ||
            amountValue <= 0 ||
            exceedsBalance
          }
          className="rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Adjustment"}
        </button>
      </div>
    </form>
  );
}
