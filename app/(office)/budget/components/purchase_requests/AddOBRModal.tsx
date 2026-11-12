"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, X } from "lucide-react";

import type {
  ExpenseAccountCategoryOption,
  ExpenseAccountOption,
  OfficeOption,
  SubOfficeOption,
  PurchaseRequestOBRFormData,
} from "./purchase-requests-types";

type Props = {
  purchaseRequestId: string;
  onClose: () => void;
  onAdd: (obr: any) => void;
  initialData?: PurchaseRequestOBRFormData;
  title?: string;
  submitLabel?: string;
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

export default function AddOBRModal({
  purchaseRequestId,
  onClose,
  onAdd,
  initialData,
  title = "Add Obligation Request (OBR)",
  submitLabel = "Add OBR to Request",
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
    initialData?.amount
      ? formatMoneyInput(String(initialData.amount))
      : ""
  );
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [subOffices, setSubOffices] = useState<SubOfficeOption[]>([]);
  const [categories, setCategories] = useState<ExpenseAccountCategoryOption[]>([]);
  const [accounts, setAccounts] = useState<ExpenseAccountOption[]>([]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setError("");
    try {
      const [prResponse, categoryResponse, accountResponse] = await Promise.all([
        fetch("/budget/api/purchase_requests", { cache: "no-store" }),
        fetch("/budget/api/expense_account_categories", { cache: "no-store" }),
        fetch("/budget/api/expense_accounts", { cache: "no-store" }),
      ]);

      const [prResult, categoryResult, accountResult] = await Promise.all([
        prResponse.json(),
        categoryResponse.json(),
        accountResponse.json(),
      ]);

      if (!prResponse.ok || !prResult.success) {
        throw new Error(prResult.message || "Unable to load offices and sub-offices.");
      }
      if (!categoryResponse.ok || !categoryResult.success) {
        throw new Error(categoryResult.message || "Unable to load expense categories.");
      }
      if (!accountResponse.ok || !accountResult.success) {
        throw new Error(accountResult.message || "Unable to load expense accounts.");
      }

      setOffices(Array.isArray(prResult.offices) ? prResult.offices : []);
      setSubOffices(Array.isArray(prResult.subOffices) ? prResult.subOffices : []);
      setCategories(Array.isArray(categoryResult.data) ? categoryResult.data : []);
      setAccounts(Array.isArray(accountResult.data) ? accountResult.data : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load OBR form options.");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const availableSubOffices = useMemo(
    () =>
      (Array.isArray(subOffices) ? subOffices : []).filter(
        (item: any) =>
          String(item.office_id ?? "") === String(obr.office_id) &&
          item.is_active !== false &&
          item.active !== false
      ),
    [subOffices, obr.office_id]
  );

  const availableCategories = useMemo(
    () =>
      (Array.isArray(categories) ? categories : []).filter(
        (item: any) =>
          item.is_active !== false &&
          item.active !== false &&
          (!item.office_id ||
            String(item.office_id) === String(obr.office_id)) &&
          (!item.sub_office_id ||
            String(item.sub_office_id) === String(obr.sub_office_id || ""))
      ),
    [categories, obr.office_id, obr.sub_office_id]
  );

  const availableAccounts = useMemo(
    () =>
      (Array.isArray(accounts) ? accounts : []).filter(
        (item: any) =>
          item.is_active !== false &&
          item.active !== false &&
          String(item.category_id ?? "") === String(obr.category_id)
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

    if (optionsLoading) {
      setError("Please wait until the OBR form options finish loading.");
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
      (item: any) =>
        String(item.id ?? item.account_id ?? "") === String(obr.account_id)
    );

    if (!selectedAccount) {
      setError("The selected expense account is invalid.");
      return;
    }

    void saveOBR({
      ...obr,
      obr_number: obr.obr_number.trim(),
      payee: obr.payee.trim(),
      amount: Math.round(Number(obr.amount) * 100) / 100,
      sub_office_id: obr.sub_office_id || null,
      particulars: `${selectedAccount.account_code} — ${selectedAccount.account_name}`,
      remarks: obr.remarks.trim(),
    });
  }


  async function saveOBR(formData: PurchaseRequestOBRFormData) {
    if (!purchaseRequestId) {
      setError("Missing purchase request ID.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/budget/api/purchase_requests/${encodeURIComponent(purchaseRequestId)}/obrs`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const result = await response.json();
      if (!response.ok || !result.success || !result.data) {
        throw new Error(result.message || "Unable to save OBR.");
      }

      onAdd(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save OBR.");
    } finally {
      setSaving(false);
    }
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
            disabled={saving}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60 disabled:opacity-50"
            aria-label="Close OBR form"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
          {optionsLoading && (
            <p className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Loading office and account options...
            </p>
          )}
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
                disabled={optionsLoading}
              >
                <option value="">Select office</option>
                {(Array.isArray(offices) ? offices : [])
                  .filter((item: any) => item.is_active !== false && item.active !== false)
                  .map((item: any) => {
                    const id = item.id ?? item.office_id;
                    const name = item.office_name ?? item.name ?? item.office ?? "";
                    return (
                      <option key={id} value={id}>
                        {item.office_code ? `${item.office_code} — ` : ""}{name}
                      </option>
                    );
                  })}
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
                disabled={optionsLoading || !obr.office_id}
              >
                <option value="">Select sub-office</option>
                {availableSubOffices.map((item: any) => {
                  const id = item.id ?? item.sub_office_id;
                  const name = item.sub_office_name ?? item.name ?? item.sub_office ?? "";
                  return (
                    <option key={id} value={id}>
                      {item.sub_office_code ? `${item.sub_office_code} — ` : ""}{name}
                    </option>
                  );
                })}
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
                disabled={optionsLoading || !obr.office_id}
              >
                <option value="">Select category</option>
                {availableCategories.map((item: any) => {
                  const id = item.id ?? item.category_id;
                  return (
                    <option key={id} value={id}>
                      {item.category_code ?? item.code ?? ""} — {item.category_name ?? item.name ?? ""}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className={labelClass}>Expense Account *</label>
              <select
                value={obr.account_id}
                onChange={(e) => {
                  const account = availableAccounts.find(
                    (item: any) =>
                      String(item.id ?? item.account_id ?? "") === String(e.target.value)
                  );
                  setObr({
                    ...obr,
                    account_id: e.target.value,
                    particulars: account ? `${account.account_code} — ${account.account_name}` : "",
                  });
                }}
                className={inputClass}
                disabled={optionsLoading || !obr.category_id}
              >
                <option value="">Select account</option>
                {availableAccounts.map((item: any) => {
                  const id = item.id ?? item.account_id;
                  return (
                    <option key={id} value={id}>
                      {item.account_code ?? item.code ?? ""} — {item.account_name ?? item.name ?? ""}
                    </option>
                  );
                })}
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

        <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submitOBR}
            disabled={saving || optionsLoading}
            className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={14} />
            {saving ? "Saving OBR..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
