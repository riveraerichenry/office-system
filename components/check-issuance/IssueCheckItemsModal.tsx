
"use client";

import { useEffect, useState } from "react";
import { X, ClipboardPlus, Save } from "lucide-react";

import type { IssueCheckItem } from "./IssueCheckTypes";

type Props = {
  open: boolean;
  item: IssueCheckItem | null;
  onClose: () => void;
  onSave: (item: IssueCheckItem) => void;
};

function getToday() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function createEmptyItem(): IssueCheckItem {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
    obr_no: "",
    responsibility_center: "",
    account_code: "",
    payee_name: "",
    nature_of_payment: "",
    item_date: getToday(),
    total_debit: "",
    total_wtax: "0",
    other_deduction: "0",
    retention_10_percent: "0",
    wtax_1_percent: "0",
    wtax_2_percent: "0",
    wtax_3_percent: "0",
    wtax_4_percent: "0",
    excavation_fees: "0",
    advance_payment: "0",
    liquidated_damages: "0",
    accounts_payable: "0",
    others: "0",
    remarks: "",
  };
}

const inputClass =
  "h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100";

const labelClass =
  "mb-1 block text-[10px] font-bold uppercase tracking-wide text-slate-500";

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  placeholder,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  placeholder?: string;
  min?: string;
  step?: string;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        placeholder={placeholder}
        min={min}
        step={step}
        className={inputClass}
      />
    </div>
  );
}

export default function IssueCheckItemsModal({
  open,
  item,
  onClose,
  onSave,
}: Props) {
  const [form, setForm] = useState<IssueCheckItem>(createEmptyItem);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(item ? { ...item } : createEmptyItem());
    setError("");
  }, [open, item]);

  if (!open) return null;

  function updateField<K extends keyof IssueCheckItem>(
    field: K,
    value: IssueCheckItem[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setError("");
  }

  function handleSubmit() {
    setError("");

    if (!form.obr_no.trim()) {
      setError("Please enter the OBR number.");
      return;
    }

    if (!form.account_code.trim()) {
      setError("Please enter the account code.");
      return;
    }

    if (!form.item_date) {
      setError("Please select the item date.");
      return;
    }

    if (
      form.total_debit.trim() === "" ||
      !Number.isFinite(Number(form.total_debit)) ||
      Number(form.total_debit) <= 0
    ) {
      setError("Please enter a valid debit amount greater than zero.");
      return;
    }

    onSave({
      ...form,
      obr_no: form.obr_no.trim(),
      responsibility_center: form.responsibility_center.trim(),
      account_code: form.account_code.trim(),
      payee_name: form.payee_name.trim(),
      nature_of_payment: form.nature_of_payment.trim(),
      remarks: form.remarks.trim(),
    });
  }

  const deductionFields = [
    ["total_wtax", "Total Withholding Tax"],
    ["other_deduction", "Other Deduction"],
    ["retention_10_percent", "10% Retention"],
    ["wtax_1_percent", "W/Tax 1%"],
    ["wtax_2_percent", "W/Tax 2%"],
    ["wtax_3_percent", "W/Tax 3%"],
    ["wtax_4_percent", "W/Tax 4%"],
    ["excavation_fees", "Excavation Fees"],
    ["advance_payment", "Advance Payment"],
    ["liquidated_damages", "Liquidated Damages"],
    ["accounts_payable", "Accounts Payable"],
    ["others", "Others"],
  ] as const;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/60 p-2 sm:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-check-item-title"
        className="flex max-h-[96vh] w-full max-w-6xl min-w-0 flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between border-b border-slate-200 px-5 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="shrink-0 rounded-lg bg-blue-50 p-2 text-blue-600">
              <ClipboardPlus size={20} />
            </div>

            <div className="min-w-0">
              <h2
                id="issue-check-item-title"
                className="text-base font-bold text-slate-900"
              >
                {item ? "Edit Transaction Item" : "Add Item / OBR"}
              </h2>

              <p className="text-xs text-slate-500">
                Enter obligation, debit, taxes and deduction details.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X size={19} />
          </button>
        </header>

        {/* CONTENT - NO SCROLL */}
        <div className="min-h-0 flex-1 overflow-hidden p-4 sm:p-5">
          <div className="space-y-3">

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </div>
            )}

            {/* OBR INFORMATION */}
            <section className="overflow-hidden rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  OBR Information
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-x-3 gap-y-2 p-3 sm:grid-cols-3">
                <Field
                  label="OBR No."
                  value={form.obr_no}
                  onChange={(value) => updateField("obr_no", value)}
                  placeholder="Enter OBR number"
                  required
                />

                <Field
                  label="Responsibility Center"
                  value={form.responsibility_center}
                  onChange={(value) =>
                    updateField("responsibility_center", value)
                  }
                  placeholder="Enter responsibility center"
                />

                <Field
                  label="Account Code"
                  value={form.account_code}
                  onChange={(value) => updateField("account_code", value)}
                  placeholder="Enter account code"
                  required
                />

                <Field
                  label="Payee Name"
                  value={form.payee_name}
                  onChange={(value) => updateField("payee_name", value)}
                  placeholder="Enter payee name"
                />

                <Field
                  label="Item Date"
                  type="date"
                  value={form.item_date}
                  onChange={(value) => updateField("item_date", value)}
                  required
                />

                <Field
                  label="Total Debit"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.total_debit}
                  onChange={(value) => updateField("total_debit", value)}
                  placeholder="0.00"
                  required
                />

                <div className="sm:col-span-3">
                  <label className={labelClass}>Nature of Payment</label>

                  <textarea
                    value={form.nature_of_payment}
                    onChange={(event) =>
                      updateField("nature_of_payment", event.target.value)
                    }
                    rows={2}
                    placeholder="Enter nature of payment"
                    className="w-full resize-none rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>
            </section>

            {/* TAXES AND DEDUCTIONS */}
            <section className="overflow-hidden rounded-lg border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-3 py-2">
                <h3 className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Taxes and Deductions
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 p-3 sm:grid-cols-4">
                {deductionFields.map(([field, label]) => (
                  <Field
                    key={field}
                    label={label}
                    type="number"
                    min="0"
                    step="0.01"
                    value={form[field]}
                    onChange={(value) => updateField(field, value)}
                    placeholder="0.00"
                  />
                ))}
              </div>
            </section>

            {/* REMARKS */}
            <section className="rounded-lg border border-slate-200 p-3">
              <label className={labelClass}>Remarks</label>

              <input
                type="text"
                value={form.remarks}
                onChange={(event) =>
                  updateField("remarks", event.target.value)
                }
                placeholder="Enter remarks"
                className={inputClass}
              />
            </section>

          </div>
        </div>

        {/* FOOTER */}
        <footer className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-bold text-white hover:bg-blue-700"
          >
            <Save size={16} />
            {item ? "Update Item" : "Add Item"}
          </button>
        </footer>
      </div>
    </div>
  );
}
