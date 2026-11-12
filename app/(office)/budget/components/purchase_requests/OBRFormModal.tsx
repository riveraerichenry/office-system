"use client";

import { useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import type {
  ExpenseAccountCategoryOption,
  ExpenseAccountOption,
  OfficeOption,
  SubOfficeOption,
  PurchaseRequestOBRFormData,
} from "./purchase-requests-types";

type Props = {
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: ExpenseAccountCategoryOption[];
  accounts: ExpenseAccountOption[];
  onClose: () => void;
  onAdd: (obr: PurchaseRequestOBRFormData) => void;
  initialData?: PurchaseRequestOBRFormData;
  title?: string;
  submitLabel?: string;
  onDelete?: () => void;
  deleting?: boolean;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const today = () => {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );
  return local.toISOString().slice(0, 10);
};

function parseMoneyInput(value: string): number {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatMoneyInput(value: string): string {
  const raw = value.replace(/,/g, "");
  if (!raw) return "";

  const parts = raw.split(".");
  const integerPart = parts[0].replace(/\D/g, "");
  const decimalPart = parts.slice(1).join("").replace(/\D/g, "").slice(0, 2);
  const formattedInteger = (integerPart || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return parts.length > 1
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

export default function OBRFormModal({
  offices,
  subOffices,
  categories,
  accounts,
  onClose,
  onAdd,
  initialData,
  title = "Add Obligation Request (OBR)",
  submitLabel = "Add OBR to Request",
  onDelete,
  deleting = false,
}: Props) {
  const [obr, setObr] = useState<PurchaseRequestOBRFormData>(() => ({
    obr_number: initialData?.obr_number || "",
    obr_date: initialData?.obr_date || today(),
    payee: initialData?.payee || "",
    office_id: initialData?.office_id || "",
    sub_office_id: initialData?.sub_office_id || null,
    category_id: initialData?.category_id || "",
    account_id: initialData?.account_id || "",
    particulars: initialData?.particulars || "",
    amount: Number(initialData?.amount || 0),
    remarks: initialData?.remarks || "",
  }));
  const [amountInput, setAmountInput] = useState(
    initialData?.amount ? formatMoneyInput(String(initialData.amount)) : ""
  );
  const [error, setError] = useState("");

  const availableSubOffices = useMemo(
    () =>
      subOffices.filter(
        (item) =>
          item.office_id === obr.office_id &&
          item.is_active !== false
      ),
    [subOffices, obr.office_id]
  );

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          item.is_active &&
          (!item.office_id || item.office_id === obr.office_id) &&
          (!item.sub_office_id ||
            item.sub_office_id === (obr.sub_office_id || ""))
      ),
    [categories, obr.office_id, obr.sub_office_id]
  );

  const availableAccounts = useMemo(
    () =>
      accounts.filter(
        (item) =>
          item.is_active && item.category_id === obr.category_id
      ),
    [accounts, obr.category_id]
  );

  function updateAmount(value: string) {
    const formatted = formatMoneyInput(value);
    setAmountInput(formatted);
    setObr((current) => ({
      ...current,
      amount: parseMoneyInput(formatted),
    }));
  }

  function submitOBR() {
    setError("");

    if (!obr.obr_number.trim() || !obr.obr_date || !obr.payee.trim()) {
      setError("Complete the OBR number, date, and payee.");
      return;
    }

    if (!obr.office_id) {
      setError("Select an office for this OBR.");
      return;
    }

    if (!obr.category_id || !obr.account_id) {
      setError("Select the OBR expense category and expense account.");
      return;
    }

    if (!Number.isFinite(Number(obr.amount)) || Number(obr.amount) <= 0) {
      setError("Enter a valid OBR allocated amount.");
      return;
    }

    const selectedAccount = availableAccounts.find(
      (item) => item.id === obr.account_id
    );

    if (!selectedAccount) {
      setError("The selected expense account is invalid.");
      return;
    }

    onAdd({
      ...obr,
      obr_number: obr.obr_number.trim(),
      payee: obr.payee.trim(),
      amount: Math.round(Number(obr.amount) * 100) / 100,
      sub_office_id: obr.sub_office_id || null,
      particulars: `${selectedAccount.account_code} — ${selectedAccount.account_name}`,
      remarks: obr.remarks.trim(),
    });
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px]">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-md border border-[#C7D8E3] bg-[#F8FAFC] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-4 sm:px-6">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="mt-1 text-xs text-slate-500">Enter the OBR details and allocation amount.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60"
            aria-label="Close OBR form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>OBR Number *</label>
              <input
                value={obr.obr_number}
                onChange={(e) => setObr({ ...obr, obr_number: e.target.value })}
                className={inputClass}
                placeholder="OBR number"
                autoFocus
              />
            </div>

            <div>
              <label className={labelClass}>OBR Date *</label>
              <input
                type="date"
                value={obr.obr_date}
                onChange={(e) => setObr({ ...obr, obr_date: e.target.value })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={labelClass}>Payee *</label>
              <input
                value={obr.payee}
                onChange={(e) => setObr({ ...obr, payee: e.target.value })}
                className={inputClass}
                placeholder="Payee"
              />
            </div>

            <div>
              <label className={labelClass}>Allocated Amount *</label>
              <input
                type="text"
                inputMode="decimal"
                value={amountInput}
                onChange={(e) => updateAmount(e.target.value)}
                onBlur={() => {
                  const amount = Math.round(Number(obr.amount || 0) * 100) / 100;
                  setObr((current) => ({ ...current, amount }));
                  setAmountInput(amount > 0 ? amount.toFixed(2) : "");
                }}
                className={inputClass}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className={labelClass}>Office *</label>
              <select
                value={obr.office_id}
                onChange={(e) =>
                  setObr({
                    ...obr,
                    office_id: e.target.value,
                    sub_office_id: null,
                    category_id: "",
                    account_id: "",
                    particulars: "",
                  })
                }
                className={inputClass}
              >
                <option value="">Select office</option>
                {offices.filter((item) => item.is_active !== false).map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.office_code ? `${item.office_code} — ` : ""}{item.office_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Sub-office</label>
              <select
                value={obr.sub_office_id || ""}
                onChange={(e) =>
                  setObr({
                    ...obr,
                    sub_office_id: e.target.value || null,
                    category_id: "",
                    account_id: "",
                    particulars: "",
                  })
                }
                className={inputClass}
                disabled={!obr.office_id}
              >
                <option value="">Select sub-office</option>
                {availableSubOffices.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.sub_office_code ? `${item.sub_office_code} — ` : ""}{item.sub_office_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Expense Category *</label>
              <select
                value={obr.category_id}
                onChange={(e) =>
                  setObr({ ...obr, category_id: e.target.value, account_id: "", particulars: "" })
                }
                className={inputClass}
                disabled={!obr.office_id}
              >
                <option value="">Select category</option>
                {availableCategories.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.category_code} — {item.category_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={labelClass}>Expense Account *</label>
              <select
                value={obr.account_id}
                onChange={(e) => {
                  const account = availableAccounts.find((item) => item.id === e.target.value);
                  setObr({
                    ...obr,
                    account_id: e.target.value,
                    particulars: account ? `${account.account_code} — ${account.account_name}` : "",
                  });
                }}
                className={inputClass}
                disabled={!obr.category_id}
              >
                <option value="">Select account</option>
                {availableAccounts.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.account_code} — {item.account_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Particulars</label>
              <input
                value={obr.particulars}
                readOnly
                className={`${inputClass} cursor-not-allowed text-slate-500`}
                placeholder="Automatically populated from selected expense account"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-4">
              <label className={labelClass}>Remarks</label>
              <input
                value={obr.remarks}
                onChange={(e) => setObr({ ...obr, remarks: e.target.value })}
                className={inputClass}
                placeholder="Optional remarks"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center justify-between gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          <div>
            {onDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="rounded-md border border-red-200 bg-white px-4 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete OBR"}
              </button>
            )}
          </div>
          <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitOBR}
            className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992]"
          >
            <Plus size={14} />
            {submitLabel}
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}
