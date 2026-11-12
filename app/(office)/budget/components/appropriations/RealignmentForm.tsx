
"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";

import type {
  AccountOption,
  OfficeOption,
  SubOfficeOption,
  CategoryOption,
  Appropriation,
  FundSource,
  RealignmentFormData,
} from "./appropriation-types";

type Props = {
  appropriations: Appropriation[];
  accounts: AccountOption[];
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: CategoryOption[];
  fundSources: FundSource[];
  currentYear: number;
  saving: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (data: RealignmentFormData) => void;
};

type SelectorProps = {
  title: string;
  accounts: AccountOption[];
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: CategoryOption[];
  appropriations: Appropriation[];
  selectedId: string;
  excludedId?: string;
  onSelect: (id: string) => void;
};

const money = (value: string | number) => Number(value || 0).toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const formatAmount = (value: string) => {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const parts = cleaned.split(".");
  const whole = parts[0] || "";
  const decimal = parts.slice(1).join("").slice(0, 2);
  if (!whole && !decimal) return "";
  return `${whole ? Number(whole).toLocaleString("en-PH") : "0"}${cleaned.includes(".") ? `.${decimal}` : ""}`;
};
const inputClass = "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition focus:border-[#6689A5] focus:ring-0 disabled:text-slate-400";
const labelClass = "mb-1 block text-[11px] font-medium text-slate-400";
const sectionClass = "mb-4 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]";

function AppropriationSelector({ title, accounts, offices, subOffices, categories, appropriations, selectedId, onSelect }: SelectorProps) {
  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const candidates = appropriations.filter((item) =>
    (!officeId || item.office_id === officeId) &&
    (!subOfficeId || item.sub_office_id === subOfficeId) &&
    (!categoryId || item.category_id === categoryId) &&
    (!accountId || item.account_id === accountId)
  );
  const selected = appropriations.find((item) => item.id === selectedId);
  return <section className="space-y-3">
    <h3 className={sectionClass}>{title}</h3>
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div><label className={labelClass}>Office</label><select value={officeId} onChange={(e) => setOfficeId(e.target.value)} className={inputClass}><option value="">All offices</option>{offices.map((x) => <option key={x.id} value={x.id}>{x.office_code} - {x.office_name}</option>)}</select></div>
      <div><label className={labelClass}>Sub-office</label><select value={subOfficeId} onChange={(e) => setSubOfficeId(e.target.value)} className={inputClass}><option value="">All sub-offices</option>{subOffices.map((x) => <option key={x.id} value={x.id}>{x.sub_office_code ? `${x.sub_office_code} - ` : ""}{x.sub_office_name}</option>)}</select></div>
      <div><label className={labelClass}>Expense Account Category</label><select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className={inputClass}><option value="">All categories</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.category_code} - {x.category_name}</option>)}</select></div>
      <div><label className={labelClass}>Expense Account</label><select value={accountId} onChange={(e) => setAccountId(e.target.value)} className={inputClass}><option value="">All accounts</option>{accounts.map((x) => <option key={x.account_id} value={x.account_id}>{x.account_code} - {x.account_name}</option>)}</select></div>
    </div>
    <div><label className={labelClass}>Appropriation Record *</label><select required value={selectedId} onChange={(e) => onSelect(e.target.value)} className={inputClass}><option value="">Select appropriation</option>{candidates.map((item) => <option key={item.id} value={item.id}>{item.office_name} / {item.sub_office_name} / {item.category_code} / {item.account_code} - {item.account_name} ({item.appropriation_type}{item.ordinance_no ? ` - ${item.ordinance_no}` : ""})</option>)}</select></div>
    {selected && <p className="text-xs text-slate-500">Selected: {selected.office_name} / {selected.sub_office_name} / {selected.category_name} / {selected.account_code} - {selected.account_name}</p>}
  </section>;
}

export default function RealignmentForm({
  appropriations = [],
  accounts = [],
  offices = [],
  subOffices = [],
  categories = [],
  fundSources = [],
  currentYear,
  saving,
  error,
  onClose,
  onSubmit,
}: Props) {
  const safeAppropriations: Appropriation[] = Array.isArray(appropriations)
    ? appropriations
    : [];
  const safeAccounts: AccountOption[] = Array.isArray(accounts) ? accounts : [];
  const safeOffices = Array.isArray(offices) ? offices : [];
  const safeSubOffices = Array.isArray(subOffices) ? subOffices : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeFundSources: FundSource[] = Array.isArray(fundSources)
    ? fundSources
    : [];

  const [form, setForm] = useState<RealignmentFormData>({
    // Retain these legacy fields in the payload for compatibility,
    // but they are no longer displayed or required by the form.
    realignment_no: "",
    authority_reference: "",
    authority_date: "",
    fiscal_year: currentYear,
    fund_source_id: "",
    justification: "",
    source_appropriation_id: "",
    destination_appropriation_id: "",
    amount: "",
    remarks: "",
  });

  // Only appropriations with the selected fiscal year and fund source.
  const eligibleAppropriations = useMemo(
    () =>
      safeAppropriations.filter(
        (item) =>
          Number(item.fiscal_year) === Number(form.fiscal_year) &&
          String(item.fund_source_id) === String(form.fund_source_id)
      ),
    [
      safeAppropriations,
      form.fiscal_year,
      form.fund_source_id,
    ]
  );

  // SELECTED SOURCE
  const source = eligibleAppropriations.find(
    (item) => item.id === form.source_appropriation_id
  );

  // Destination must be a different appropriation
  // under the SAME Expense Account Category.
  const destinationAppropriations = useMemo(() => {
    if (!source) return [];

    return eligibleAppropriations.filter(
      (item) =>
        String(item.category_id) === String(source.category_id) &&
        item.id !== source.id
    );
  }, [eligibleAppropriations, source]);

  // SELECTED DESTINATION
  const destination = destinationAppropriations.find(
    (item) => item.id === form.destination_appropriation_id
  );

  // FORM UPDATE
  function update<K extends keyof RealignmentFormData>(
    key: K,
    value: RealignmentFormData[K]
  ) {
    setForm((previous) => {
      const next = { ...previous, [key]: value };

      if (key === "fiscal_year" || key === "fund_source_id") {
        next.source_appropriation_id = "";
        next.destination_appropriation_id = "";
      }

      if (key === "source_appropriation_id") {
        next.destination_appropriation_id = "";
      }

      return next;
    });
  }

  // AMOUNT
  const amountValue = Number(
    String(form.amount || "").replace(/,/g, "")
  );

  // BALANCE
  const sourceBalance = Number(source?.adjusted_amount || 0);
  const remainingBalance = sourceBalance - amountValue;

  // CATEGORY VALIDATION
  const sameCategory =
    Boolean(source && destination) &&
    String(source?.category_id) === String(destination?.category_id);

  // SUBMIT
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!source || !destination || !sameCategory) {
      return;
    }

    if (
      !Number.isFinite(amountValue) ||
      amountValue <= 0 ||
      amountValue > sourceBalance
    ) {
      return;
    }

    onSubmit({
      ...form,
      realignment_no: "",
      authority_reference: "",
      authority_date: "",
      amount: amountValue.toFixed(2),
    });
  }

  return (
    <form
      onSubmit={submit}
      className="space-y-5 bg-[#F8FAFC] text-slate-700"
    >
      {/* REALIGNMENT INFORMATION */}
      <section>
        <h3 className={sectionClass}>
          Realignment Information
        </h3>

        <div className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
          {/* FISCAL YEAR */}
          <div>
            <label className={labelClass}>
              Fiscal Year <span className="text-red-500">*</span>
            </label>

            <select
              required
              value={form.fiscal_year}
              onChange={(e) =>
                update("fiscal_year", Number(e.target.value))
              }
              className={inputClass}
            >
              {Array.from(
                { length: 11 },
                (_, i) => currentYear - 5 + i
              ).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* FUND SOURCE */}
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
            >
              <option value="">Select fund source</option>

              {safeFundSources.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.fund_code} - {fund.fund_name}
                </option>
              ))}
            </select>
          </div>

        </div>
      </section>

      {/* SOURCE APPROPRIATION */}
      <AppropriationSelector
        key={`source-${form.fiscal_year}-${form.fund_source_id}`}
        title="Source Appropriation"
        accounts={safeAccounts}
        offices={safeOffices}
        subOffices={safeSubOffices}
        categories={safeCategories}
        appropriations={eligibleAppropriations}
        selectedId={form.source_appropriation_id}
        onSelect={(id) =>
          update("source_appropriation_id", id)
        }
      />

      {/* SOURCE INFORMATION */}
      {source && (
        <div className="rounded-lg border border-[#C7D8E3] bg-white p-4">
          <p className={labelClass}>Source Category</p>

          <p className="text-sm font-semibold text-slate-700">
            {source.category_code} - {source.category_name}
          </p>

          <p className="mt-2 text-[11px] text-slate-400">
            Destination accounts will be limited to this category.
          </p>

          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className={labelClass}>
              Available Adjusted Appropriation
            </p>

            <p className="text-xl font-semibold tabular-nums text-[#557992]">
              ₱{money(sourceBalance)}
            </p>
          </div>
        </div>
      )}

      {/* DESTINATION APPROPRIATION */}
      {source ? (
        <section>
          <h3 className={sectionClass}>Destination Appropriation</h3>

          <p className="mb-3 text-xs text-slate-500">
            Choose an expense account within the same category:
            {" "}
            <span className="font-semibold text-[#557992]">
              {source.category_code} - {source.category_name}
            </span>
          </p>

          {destinationAppropriations.length > 0 ? (
            <select
              required
              value={form.destination_appropriation_id}
              onChange={(e) =>
                update("destination_appropriation_id", e.target.value)
              }
              className={inputClass}
            >
              <option value="">Select destination expense account</option>

              {destinationAppropriations.map((appropriation) => {
                const account = safeAccounts.find(
                  (item) => item.account_id === appropriation.account_id
                );

                return (
                  <option key={appropriation.id} value={appropriation.id}>
                    {account
                      ? `${account.account_code} - ${account.account_name}`
                      : `${appropriation.account_code} - ${appropriation.account_name}`}
                    {` (${appropriation.appropriation_type}`}
                    {appropriation.ordinance_no
                      ? ` - ${appropriation.ordinance_no}`
                      : ""}
                    {")"}
                  </option>
                );
              })}
            </select>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              No other appropriation exists under this Expense Account
              Category for the selected fiscal year and fund source.
              Realignment cannot proceed.
            </div>
          )}

          {destination && (
            <div className="mt-4 rounded-lg border border-[#C7D8E3] bg-white p-4">
              <p className={labelClass}>Selected Destination</p>
              <p className="text-sm font-semibold text-slate-700">
                {destination.account_code} - {destination.account_name}
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {destination.office_name} / {destination.sub_office_name}
              </p>
              <p className="mt-1 text-xs font-medium text-[#557992]">
                {destination.category_code} - {destination.category_name}
              </p>
            </div>
          )}
        </section>
      ) : (
        <section>
          <h3 className={sectionClass}>Destination Appropriation</h3>
          <p className="text-xs text-slate-400">
            Select a source appropriation first.
          </p>
        </section>
      )}

      {/* REALIGNMENT AMOUNT */}
      <section>
        <h3 className={sectionClass}>
          Realignment Amount
        </h3>

        <label className={labelClass}>
          Amount <span className="text-red-500">*</span>
        </label>

        <div className="flex items-center border-b border-slate-300 focus-within:border-[#6689A5]">
          <span className="pr-2 text-sm font-medium text-slate-400">
            ₱
          </span>

          <input
            required
            type="text"
            inputMode="decimal"
            value={form.amount}
            onChange={(e) =>
              update("amount", formatAmount(e.target.value))
            }
            onBlur={() => {
              if (form.amount && amountValue > 0) {
                update("amount", money(amountValue));
              }
            }}
            className="w-full border-0 bg-transparent px-0 py-2 text-right text-lg font-semibold tabular-nums text-slate-700 outline-none focus:ring-0"
            placeholder="0.00"
          />
        </div>

        {/* BALANCE PREVIEW */}
        {source && (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className={labelClass}>
                Available Balance
              </p>

              <p className="text-sm font-semibold tabular-nums text-slate-700">
                ₱{money(sourceBalance)}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className={labelClass}>
                Remaining After Transfer
              </p>

              <p
                className={`text-sm font-semibold tabular-nums ${
                  remainingBalance < 0
                    ? "text-red-600"
                    : "text-[#557992]"
                }`}
              >
                ₱{money(remainingBalance)}
              </p>
            </div>
          </div>
        )}

        {source && amountValue > sourceBalance && (
          <p className="mt-2 text-xs text-red-600">
            The amount exceeds the available source appropriation.
          </p>
        )}
      </section>

      {/* JUSTIFICATION AND REMARKS */}
      <section>
        <h3 className={sectionClass}>
          Justification and Remarks
        </h3>

        <div className="space-y-4">
          {/* JUSTIFICATION */}
          <div>
            <label className={labelClass}>
              Justification{" "}
              <span className="text-red-500">*</span>
            </label>

            <textarea
              required
              rows={3}
              value={form.justification}
              onChange={(e) =>
                update("justification", e.target.value)
              }
              className="w-full resize-none border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition focus:border-[#6689A5] focus:ring-0"
              placeholder="State the reason for this realignment..."
            />
          </div>

          {/* REMARKS */}
          <div>
            <label className={labelClass}>
              Remarks (Optional)
            </label>

            <textarea
              rows={2}
              value={form.remarks}
              onChange={(e) =>
                update("remarks", e.target.value)
              }
              className="w-full resize-none border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-700 outline-none transition focus:border-[#6689A5] focus:ring-0"
              placeholder="Additional remarks..."
            />
          </div>
        </div>
      </section>

      {/* ERROR */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* FOOTER */}
      <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            saving ||
            !source ||
            !destination ||
            !sameCategory ||
            !Number.isFinite(amountValue) ||
            amountValue <= 0 ||
            amountValue > sourceBalance
          }
          className="rounded-md bg-[#6689A5] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Realignment"}
        </button>
      </div>
    </form>
  );
}
