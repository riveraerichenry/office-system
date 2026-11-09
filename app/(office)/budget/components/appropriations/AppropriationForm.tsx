
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
  FundSource,
  AppropriationFormData,
} from "./appropriation-types";

type Props = {
  initialData: AppropriationFormData;
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
  const firstDot = cleaned.indexOf(".");

  let whole =
    firstDot === -1 ? cleaned : cleaned.slice(0, firstDot);

  const decimal =
    firstDot === -1
      ? undefined
      : cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);

  whole = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return decimal !== undefined
    ? `${whole}.${decimal}`
    : whole;
}

function formatCurrency(value: string) {
  const amount = Number(value.replace(/,/g, "") || 0);

  return amount.toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default function AppropriationForm({
  initialData,
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

  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");

  const [validationError, setValidationError] = useState("");

  // =====================================================
  // INITIALIZE FORM
  // =====================================================

  useEffect(() => {
    setForm({ ...initialData });
    setValidationError("");

    const selected = accounts.find(
      (item) => item.account_id === initialData.account_id
    );

    setOfficeId(selected?.office_id ?? "");
    setSubOfficeId(selected?.sub_office_id ?? "");
    setCategoryId(selected?.category_id ?? "");
  }, [initialData, accounts]);

  // =====================================================
  // FORM UPDATE
  // =====================================================

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

  // =====================================================
  // OFFICE OPTIONS
  // =====================================================

  const offices = useMemo(() => {
    const unique = new Map<string, AccountOption>();

    accounts.forEach((item) => {
      if (item.office_id) {
        unique.set(item.office_id, item);
      }
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.office_name.localeCompare(b.office_name)
    );
  }, [accounts]);

  // =====================================================
  // SUB-OFFICE OPTIONS
  // =====================================================

  const subOffices = useMemo(() => {
    if (!officeId) return [];

    const unique = new Map<string, AccountOption>();

    accounts
      .filter(
        (item) =>
          item.office_id === officeId &&
          item.sub_office_id !== null
      )
      .forEach((item) => {
        const id = item.sub_office_id;

        if (id) {
          unique.set(id, item);
        }
      });

    return Array.from(unique.values()).sort((a, b) =>
      (a.sub_office_name ?? "").localeCompare(
        b.sub_office_name ?? ""
      )
    );
  }, [accounts, officeId]);

  // =====================================================
  // CATEGORY OPTIONS
  // =====================================================

  const categories = useMemo(() => {
    if (!officeId) return [];

    const filtered = accounts.filter((item) => {
      if (item.office_id !== officeId) return false;

      if (subOfficeId) {
        return item.sub_office_id === subOfficeId;
      }

      return item.sub_office_id === null;
    });

    const unique = new Map<string, AccountOption>();

    filtered.forEach((item) => {
      unique.set(item.category_id, item);
    });

    return Array.from(unique.values()).sort((a, b) =>
      a.category_name.localeCompare(b.category_name)
    );
  }, [accounts, officeId, subOfficeId]);

  // =====================================================
  // EXPENSE ACCOUNT OPTIONS
  // =====================================================

  const filteredAccounts = useMemo(() => {
    if (!officeId || !categoryId) return [];

    return accounts
      .filter((item) => {
        const correctOffice = item.office_id === officeId;
        const correctCategory = item.category_id === categoryId;

        const correctSubOffice = subOfficeId
          ? item.sub_office_id === subOfficeId
          : item.sub_office_id === null;

        return (
          correctOffice &&
          correctCategory &&
          correctSubOffice
        );
      })
      .sort((a, b) =>
        a.account_code.localeCompare(b.account_code)
      );
  }, [accounts, officeId, subOfficeId, categoryId]);

  const selectedAccount = accounts.find(
    (item) => item.account_id === form.account_id
  );

  // =====================================================
  // CASCADING SELECTIONS
  // =====================================================

  function handleOfficeChange(value: string) {
    setOfficeId(value);
    setSubOfficeId("");
    setCategoryId("");

    update("account_id", "");
  }

  function handleSubOfficeChange(value: string) {
    setSubOfficeId(value);
    setCategoryId("");

    update("account_id", "");
  }

  function handleCategoryChange(value: string) {
    setCategoryId(value);

    update("account_id", "");
  }

  // =====================================================
  // AMOUNT INPUT
  // =====================================================

  function handleAmountChange(value: string) {
    let raw = value.replace(/,/g, "").replace(/[^\d.]/g, "");

    const firstDot = raw.indexOf(".");

    if (firstDot !== -1) {
      const whole = raw.slice(0, firstDot);
      const decimal = raw
        .slice(firstDot + 1)
        .replace(/\./g, "")
        .slice(0, 2);

      raw = `${whole}.${decimal}`;
    }

    update("appropriated_amount", raw);
  }

  // =====================================================
  // SUBMIT
  // =====================================================

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setValidationError("");

    const amount = Number(
      String(form.appropriated_amount ?? "").replace(/,/g, "")
    );

    if (!form.fiscal_year || form.fiscal_year < 2000) {
      setValidationError("Please provide a valid fiscal year.");
      return;
    }

    if (!form.appropriation_type) {
      setValidationError("Please select an appropriation type.");
      return;
    }

    if (!form.fund_source_id) {
      setValidationError("Please select a fund source.");
      return;
    }

    if (!form.account_id) {
      setValidationError("Please select an expense account.");
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setValidationError("Please enter a valid appropriation amount.");
      return;
    }

    onSubmit({
      ...form,
      fiscal_year: Number(form.fiscal_year),
      ordinance_no: form.ordinance_no ?? "",
      ordinance_date: form.ordinance_date ?? "",
      fund_source_id: form.fund_source_id,
      account_id: form.account_id,
      appropriated_amount: String(amount),
      remarks: form.remarks ?? "",
    });
  }

  // =====================================================
  // RENDER
  // =====================================================

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
            <label className={labelClass}>
              Fiscal Year <span className="text-red-500">*</span>
            </label>

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
            <label className={labelClass}>
              Appropriation Type <span className="text-red-500">*</span>
            </label>

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
            <label className={labelClass}>
              Ordinance Number
            </label>

            <input
              type="text"
              value={form.ordinance_no ?? ""}
              onChange={(e) =>
                update("ordinance_no", e.target.value)
              }
              placeholder="Enter ordinance number"
              className={inputClass}
              disabled={saving}
            />
          </div>

          <div>
            <label className={labelClass}>
              Ordinance Date
            </label>

            <input
              type="date"
              value={form.ordinance_date ?? ""}
              onChange={(e) =>
                update("ordinance_date", e.target.value)
              }
              className={inputClass}
              disabled={saving}
            />
          </div>

          <div className="sm:col-span-2">
            <label className={labelClass}>
              Fund Source <span className="text-red-500">*</span>
            </label>

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

        {/* OFFICE */}
        <div>
          <label className={labelClass}>
            Office <span className="text-red-500">*</span>
          </label>

          <select
            required
            value={officeId}
            onChange={(e) => handleOfficeChange(e.target.value)}
            className={inputClass}
            disabled={saving}
          >
            <option value="">Select office</option>

            {offices.map((office) => (
              <option
                key={office.office_id}
                value={office.office_id}
              >
                {office.office_code} - {office.office_name}
              </option>
            ))}
          </select>
        </div>

        {/* SUB-OFFICE */}
        <div>
          <label className={labelClass}>
            Sub-office{" "}
            <span className="font-normal normal-case text-slate-400">
              (Optional)
            </span>
          </label>

          <select
            value={subOfficeId}
            onChange={(e) =>
              handleSubOfficeChange(e.target.value)
            }
            className={inputClass}
            disabled={!officeId || saving}
          >
            <option value="">Office-level account</option>

            {subOffices.map((subOffice) => (
              <option
                key={subOffice.sub_office_id ?? ""}
                value={subOffice.sub_office_id ?? ""}
              >
                {subOffice.sub_office_code} -{" "}
                {subOffice.sub_office_name}
              </option>
            ))}
          </select>
        </div>

        {/* CATEGORY */}
        <div>
          <label className={labelClass}>
            Expense Account Category{" "}
            <span className="text-red-500">*</span>
          </label>

          <select
            required
            value={categoryId}
            onChange={(e) =>
              handleCategoryChange(e.target.value)
            }
            className={inputClass}
            disabled={!officeId || saving}
          >
            <option value="">Select category</option>

            {categories.map((category) => (
              <option
                key={category.category_id}
                value={category.category_id}
              >
                {category.category_code} -{" "}
                {category.category_name}
              </option>
            ))}
          </select>
        </div>

        {/* EXPENSE ACCOUNT */}
        <div>
          <label className={labelClass}>
            Expense Account <span className="text-red-500">*</span>
          </label>

          <select
            required
            value={form.account_id}
            onChange={(e) =>
              update("account_id", e.target.value)
            }
            className={inputClass}
            disabled={!categoryId || saving}
          >
            <option value="">Select expense account</option>

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

        {/* SELECTED ACCOUNT PREVIEW */}
        {selectedAccount && (
          <div className="rounded-md border border-[#C7D8E3] bg-[#F1F6F9] p-3">
            <div className="flex items-start gap-2">
              <FolderTree
                size={16}
                className="mt-0.5 text-[#6689A5]"
              />

              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  Selected Expense Account
                </p>

                <p className="mt-1 text-sm font-semibold text-slate-700">
                  {selectedAccount.account_code} -{" "}
                  {selectedAccount.account_name}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {selectedAccount.office_name}
                  {selectedAccount.sub_office_name
                    ? ` / ${selectedAccount.sub_office_name}`
                    : ""}
                  {" / "}
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

        <div>
          <label className={labelClass}>
            Amount <span className="text-red-500">*</span>
          </label>

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
                handleAmountChange(e.target.value)
              }
              placeholder="0.00"
              disabled={saving}
              className={`${inputClass} pl-6 text-right text-2xl font-semibold tabular-nums`}
            />
          </div>

          <div className="mt-2 flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              Enter amount using your keyboard.
            </p>

            <p className="text-sm font-semibold tabular-nums text-[#557992]">
              PHP {formatCurrency(form.appropriated_amount)}
            </p>
          </div>
        </div>
      </section>

      {/* REMARKS */}
      <section>
        <label className={labelClass}>Remarks</label>

        <textarea
          rows={3}
          value={form.remarks ?? ""}
          onChange={(e) => update("remarks", e.target.value)}
          placeholder="Enter additional remarks..."
          className="w-full resize-none rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#6689A5] focus:ring-1 focus:ring-[#6689A5]/20"
          disabled={saving}
        />
      </section>

      {/* VALIDATION / API ERROR */}
      {(validationError || error) && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {validationError || error}
        </div>
      )}

      {/* FOOTER */}
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
