
"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Wallet,
  Landmark,
  FolderTree,
  X,
  Save,
} from "lucide-react";

import type {
  AccountOption,
  CategoryOption,
  OfficeOption,
  SubOfficeOption,
  FundSource,
  AppropriationFormData,
} from "./appropriation-types";

type Props = {
  initialData: AppropriationFormData;
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: CategoryOption[];
  accounts: AccountOption[];
  fundSources: FundSource[];
  saving: boolean;
  error: string;
  currentYear: number;
  onClose: () => void;
  onSubmit: (data: AppropriationFormData) => void;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition focus:border-[#6689A5] focus:ring-0 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-500";

function formatAmountInput(value: string) {
  if (!value) return "";

  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const dot = cleaned.indexOf(".");

  const whole = (
    dot < 0 ? cleaned : cleaned.slice(0, dot)
  ).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  const decimal =
    dot < 0
      ? undefined
      : cleaned.slice(dot + 1).replace(/\./g, "").slice(0, 2);

  return decimal === undefined ? whole : `${whole}.${decimal}`;
}

export default function AppropriationForm({
  initialData,
  offices,
  subOffices,
  categories,
  accounts,
  fundSources,
  saving,
  error,
  onClose,
  onSubmit,
}: Props) {
  const [form, setForm] = useState<AppropriationFormData>({
    ...initialData,
  });

  const [validationError, setValidationError] = useState("");

  useEffect(() => {
    setForm({ ...initialData });
    setValidationError("");
  }, [initialData]);

  // Sub-offices are filtered based on the selected office.
  const filteredSubOffices = useMemo(() => {
    if (!form.office_id) return [];

    return subOffices.filter(
      (subOffice) => subOffice.office_id === form.office_id
    );
  }, [subOffices, form.office_id]);

  // Expense accounts are filtered based on the selected category.
  const filteredAccounts = useMemo(() => {
    if (!form.category_id) return [];

    return accounts.filter(
      (account) => account.category_id === form.category_id
    );
  }, [accounts, form.category_id]);

  const selectedAccount = accounts.find(
    (item) => item.account_id === form.account_id
  );

  function update<K extends keyof AppropriationFormData>(
    field: K,
    value: AppropriationFormData[K]
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setValidationError("");
  }

  // Changing office automatically clears the selected sub-office.
  function handleOfficeChange(officeId: string) {
    setForm((previous) => ({
      ...previous,
      office_id: officeId,
      sub_office_id: "",
    }));

    setValidationError("");
  }

  // Changing category automatically clears the selected account.
  function handleCategoryChange(categoryId: string) {
    setForm((previous) => ({
      ...previous,
      category_id: categoryId,
      account_id: "",
    }));

    setValidationError("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const amount = Number(
      String(form.appropriated_amount || "").replace(/,/g, "")
    );

    if (!form.fiscal_year || form.fiscal_year < 2000) {
      return setValidationError("Please provide a valid fiscal year.");
    }

    if (!form.fund_source_id) {
      return setValidationError("Please select a fund source.");
    }

    if (!form.office_id) {
      return setValidationError("Please select an office.");
    }

    if (!form.category_id) {
      return setValidationError(
        "Please select an expense account category."
      );
    }

    if (!form.account_id) {
      return setValidationError("Please select an expense account.");
    }

    const selectedAccount = accounts.find(
      (item) => item.account_id === form.account_id
    );

    if (
      !selectedAccount ||
      selectedAccount.category_id !== form.category_id
    ) {
      return setValidationError(
        "The selected expense account does not belong to the selected category."
      );
    }

    // Sub-office is optional, but when selected it must belong to the office.
    if (form.sub_office_id) {
      const selectedSubOffice = subOffices.find(
        (item) => item.id === form.sub_office_id
      );

      if (
        !selectedSubOffice ||
        selectedSubOffice.office_id !== form.office_id
      ) {
        return setValidationError(
          "The selected sub-office does not belong to the selected office."
        );
      }
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return setValidationError(
        "Please enter a valid appropriation amount."
      );
    }

    onSubmit({
      ...form,
      fiscal_year: Number(form.fiscal_year),
      ordinance_no: form.ordinance_no.trim(),
      ordinance_date: form.ordinance_date || "",
      appropriated_amount: String(amount),
      remarks: form.remarks || "",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* APPROPRIATION INFORMATION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <FileText size={17} className="text-[#6689A5]" />
          <h3 className="text-sm font-semibold text-slate-700">
            Appropriation Information
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Fiscal Year *</label>
            <input
              required
              type="number"
              min="2000"
              max="2100"
              value={form.fiscal_year}
              onChange={(e) =>
                update("fiscal_year", Number(e.target.value))
              }
              className={inputClass}
              disabled={saving}
            />
          </div>

          <div>
            <label className={labelClass}>Appropriation Type *</label>
            <select
              required
              value={form.appropriation_type}
              onChange={(e) =>
                update(
                  "appropriation_type",
                  e.target.value as "annual" | "supplemental"
                )
              }
              className={inputClass}
              disabled={saving}
            >
              <option value="annual">Annual Appropriation</option>
              <option value="supplemental">
                Supplemental Appropriation
              </option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Ordinance Number</label>
            <input
              value={form.ordinance_no || ""}
              onChange={(e) => update("ordinance_no", e.target.value)}
              placeholder="Enter ordinance number"
              className={inputClass}
              disabled={saving}
            />
          </div>

          <div>
            <label className={labelClass}>Ordinance Date</label>
            <input
              type="date"
              value={form.ordinance_date || ""}
              onChange={(e) => update("ordinance_date", e.target.value)}
              className={inputClass}
              disabled={saving}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>Fund Source *</label>
            <select
              required
              value={form.fund_source_id}
              onChange={(e) =>
                update("fund_source_id", e.target.value)
              }
              className={inputClass}
              disabled={saving}
            >
              <option value="">Select fund source</option>
              {fundSources.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.fund_code} - {fund.fund_name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* OFFICE AND ACCOUNT CLASSIFICATION */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Landmark size={17} className="text-[#6689A5]" />
          <h3 className="text-sm font-semibold text-slate-700">
            Office and Account Classification
          </h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* OFFICE */}
          <div>
            <label className={labelClass}>Office *</label>
            <select
              required
              value={form.office_id}
              onChange={(e) => handleOfficeChange(e.target.value)}
              className={inputClass}
              disabled={saving}
            >
              <option value="">Select office</option>
              {offices.map((office) => (
                <option key={office.id} value={office.id}>
                  {office.office_code} - {office.office_name}
                </option>
              ))}
            </select>
          </div>

          {/* SUB-OFFICE - CASCADING */}
          <div>
            <label className={labelClass}>
              Sub-office{" "}
              <span className="font-normal normal-case text-slate-400">
                (Optional)
              </span>
            </label>

            <select
              value={form.sub_office_id}
              onChange={(e) =>
                update("sub_office_id", e.target.value)
              }
              className={inputClass}
              disabled={saving || !form.office_id}
            >
              <option value="">
                {!form.office_id
                  ? "Select office first"
                  : "No sub-office / Office-level"}
              </option>

              {filteredSubOffices.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.sub_office_code
                    ? `${sub.sub_office_code} - `
                    : ""}
                  {sub.sub_office_name}
                </option>
              ))}
            </select>
          </div>

          {/* CATEGORY */}
          <div>
            <label className={labelClass}>
              Expense Account Category *
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={inputClass}
              disabled={saving}
            >
              <option value="">Select category</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.category_code} - {category.category_name}
                </option>
              ))}
            </select>
          </div>

          {/* ACCOUNT - CASCADING */}
          <div>
            <label className={labelClass}>Expense Account *</label>
            <select
              required
              value={form.account_id}
              onChange={(e) => update("account_id", e.target.value)}
              className={inputClass}
              disabled={saving || !form.category_id}
            >
              <option value="">
                {!form.category_id
                  ? "Select category first"
                  : "Select expense account"}
              </option>

              {filteredAccounts.map((account) => (
                <option
                  key={account.account_id}
                  value={account.account_id}
                >
                  {account.account_code} - {account.account_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-400">
          Sub-offices are filtered according to the selected office.
          Expense accounts are filtered according to the selected
          category.
        </p>

        {selectedAccount && (
          <div className="rounded-md border border-[#C7D8E3] bg-[#F1F6F9] p-3">
            <div className="flex items-start gap-2">
              <FolderTree
                size={16}
                className="mt-0.5 text-[#6689A5]"
              />

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Selected Expense Account
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedAccount.account_code} -{" "}
                  {selectedAccount.account_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedAccount.category_code} -{" "}
                  {selectedAccount.category_name}
                </p>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* APPROPRIATION AMOUNT */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <Wallet size={17} className="text-[#6689A5]" />
          <h3 className="text-sm font-semibold text-slate-700">
            Appropriation Amount
          </h3>
        </div>

        <label className={labelClass}>Amount *</label>

        <div className="relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 text-lg font-semibold text-[#6689A5]">
            ₱
          </span>

          <input
            required
            type="text"
            inputMode="decimal"
            value={formatAmountInput(form.appropriated_amount)}
            onChange={(e) =>
              update(
                "appropriated_amount",
                e.target.value
                  .replace(/,/g, "")
                  .replace(/[^\d.]/g, "")
              )
            }
            placeholder="0.00"
            disabled={saving}
            className={`${inputClass} pl-6 text-right text-2xl font-semibold tabular-nums`}
          />
        </div>
      </section>

      {/* REMARKS */}
      <section>
        <label className={labelClass}>Remarks</label>

        <textarea
          rows={3}
          value={form.remarks || ""}
          onChange={(e) => update("remarks", e.target.value)}
          placeholder="Enter additional remarks..."
          className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#6689A5] focus:ring-1 focus:ring-[#6689A5]/20"
          disabled={saving}
        />
      </section>

      {/* ERRORS */}
      {(validationError || error) && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {validationError || error}
        </div>
      )}

      {/* ACTIONS */}
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
        >
          <X size={15} />
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2 text-sm font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save size={15} />
          {saving ? "Saving..." : "Save Appropriation"}
        </button>
      </div>
    </form>
  );
}
