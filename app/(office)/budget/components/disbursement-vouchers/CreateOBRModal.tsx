"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { X, Loader2, Save } from "lucide-react";

export type NewOBRData = {
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars: string;
  office_id: string;
  sub_office_id: string | null;
  category_id: string;
  account_id: string;
  obligation_amount: number;
  remarks: string;

  // Display metadata for temporary OBR
  office_name?: string;
  sub_office_name?: string | null;
  category_name?: string;
  category_code?: string;
  account_name?: string;
  account_code?: string;
};

type Office = {
  id: string;
  office_name: string;
};

type SubOffice = {
  id: string;
  office_id: string;
  sub_office_name: string;
};

type Category = {
  id: string;
  category_code: string;
  category_name: string;
};

type Account = {
  id: string;
  category_id: string;
  account_code: string;
  account_name: string;
};

type Props = {
  onClose: () => void;
  onCreate: (data: NewOBRData) => void;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const sectionTitleClass =
  "mb-3 border-b border-slate-300 pb-1.5 text-sm font-medium text-[#557992]";

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);

function today() {
  const date = new Date();

  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

export default function CreateOBRModal({
  onClose,
  onCreate,
}: Props) {
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [offices, setOffices] = useState<Office[]>([]);
  const [subOffices, setSubOffices] = useState<SubOffice[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);

  const [obrNumber, setObrNumber] = useState("");
  const [obrDate, setObrDate] = useState(today());
  const [payee, setPayee] = useState("");
  const [remarks, setRemarks] = useState("");
  const [amount, setAmount] = useState("");

  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");

  // ==========================================================
  // LOAD OPTIONS
  // ==========================================================

  useEffect(() => {
    let cancelled = false;

    async function loadOptions() {
      try {
        setLoadingOptions(true);
        setError("");

        const response = await fetch("/budget/api/obrs", {
          credentials: "include",
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load OBR form options."
          );
        }

        if (cancelled) return;

        setOffices(result.offices || []);
        setSubOffices(result.subOffices || []);
        setCategories(result.categories || []);
        setAccounts(result.accounts || []);
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load OBR form options."
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  // ==========================================================
  // FILTER SUB-OFFICES
  // ==========================================================

  const filteredSubOffices = useMemo(
    () =>
      subOffices.filter(
        (item) => item.office_id === officeId
      ),
    [subOffices, officeId]
  );

  // ==========================================================
  // FILTER ACCOUNTS
  // ==========================================================

  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (item) => item.category_id === categoryId
      ),
    [accounts, categoryId]
  );

  // ==========================================================
  // SELECTED RECORDS
  // ==========================================================

  const selectedOffice = offices.find(
    (item) => item.id === officeId
  );

  const selectedSubOffice = subOffices.find(
    (item) => item.id === subOfficeId
  );

  const selectedCategory = categories.find(
    (item) => item.id === categoryId
  );

  const selectedAccount = accounts.find(
    (item) => item.id === accountId
  );

  // ==========================================================
  // AUTO-GENERATED PARTICULARS
  // OFFICE + SUB-OFFICE + CATEGORY + ACCOUNT
  // ==========================================================

  const generatedParticulars = [
    selectedOffice?.office_name,
    selectedSubOffice?.sub_office_name,
    selectedCategory?.category_name,
    selectedAccount?.account_name,
  ]
    .filter(Boolean)
    .join(", ");

  // ==========================================================
  // FORM SUBMIT
  // ==========================================================

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!obrNumber.trim()) {
      setError("OBR number is required.");
      return;
    }

    if (!obrDate) {
      setError("OBR date is required.");
      return;
    }

    if (!payee.trim()) {
      setError("Payee is required.");
      return;
    }

    if (!officeId) {
      setError("Please select an office.");
      return;
    }

    if (!categoryId) {
      setError("Please select an expense category.");
      return;
    }

    if (!accountId) {
      setError("Please select an expense account.");
      return;
    }

    const obligationAmount = Number(amount);

    if (
      !Number.isFinite(obligationAmount) ||
      obligationAmount <= 0
    ) {
      setError("Obligation amount must be greater than zero.");
      return;
    }

    if (
      !selectedOffice ||
      !selectedCategory ||
      !selectedAccount
    ) {
      setError("Invalid office, category, or account selection.");
      return;
    }

    if (!generatedParticulars.trim()) {
      setError("Unable to generate particulars.");
      return;
    }

    setSaving(true);

    try {
      onCreate({
        obr_number: obrNumber.trim(),
        obr_date: obrDate,
        payee: payee.trim(),
        particulars: generatedParticulars,
        office_id: officeId,
        sub_office_id: subOfficeId || null,
        category_id: categoryId,
        account_id: accountId,
        obligation_amount: Number(
          obligationAmount.toFixed(2)
        ),
        remarks: remarks.trim(),

        // Display metadata for temporary OBR
        office_name: selectedOffice.office_name,
        sub_office_name:
          selectedSubOffice?.sub_office_name ?? null,
        category_name: selectedCategory.category_name,
        category_code: selectedCategory.category_code,
        account_name: selectedAccount.account_name,
        account_code: selectedAccount.account_code,
      });
    } finally {
      setSaving(false);
    }
  } // <-- CORRECTLY CLOSES handleSubmit

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-2 backdrop-blur-[2px] sm:p-4">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Create Standalone OBR
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Create a new OBR directly within the DV workflow.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 transition hover:bg-white/60 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </header>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">

            {/* ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </div>
            )}

            {/* LOADING */}
            {loadingOptions ? (
              <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                <Loader2 size={18} className="animate-spin" />
                Loading offices, categories and accounts...
              </div>
            ) : (
              <>
                {/* OBR INFORMATION */}
                <section>
                  <h3 className={sectionTitleClass}>
                    OBR Information
                  </h3>

                  <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">

                    {/* OBR NUMBER */}
                    <div>
                      <label className={labelClass}>
                        OBR Number{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        value={obrNumber}
                        onChange={(e) =>
                          setObrNumber(e.target.value)
                        }
                        required
                        disabled={saving}
                        className={inputClass}
                        placeholder="Enter OBR number"
                      />
                    </div>

                    {/* OBR DATE */}
                    <div>
                      <label className={labelClass}>
                        OBR Date{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        type="date"
                        value={obrDate}
                        onChange={(e) =>
                          setObrDate(e.target.value)
                        }
                        required
                        disabled={saving}
                        className={inputClass}
                      />
                    </div>

                    {/* PAYEE */}
                    <div className="sm:col-span-2">
                      <label className={labelClass}>
                        Payee{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <input
                        value={payee}
                        onChange={(e) =>
                          setPayee(e.target.value)
                        }
                        required
                        disabled={saving}
                        className={inputClass}
                        placeholder="Enter payee"
                      />
                    </div>
                  </div>
                </section>

                {/* OFFICE AND CLASSIFICATION */}
                <section>
                  <h3 className={sectionTitleClass}>
                    Office and Expense Classification
                  </h3>

                  <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2">

                    {/* OFFICE */}
                    <div>
                      <label className={labelClass}>
                        Office{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={officeId}
                        onChange={(e) => {
                          setOfficeId(e.target.value);
                          setSubOfficeId("");
                        }}
                        required
                        disabled={saving}
                        className={inputClass}
                      >
                        <option value="">
                          Select Office
                        </option>

                        {offices.map((office) => (
                          <option
                            key={office.id}
                            value={office.id}
                          >
                            {office.office_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* SUB-OFFICE */}
                    <div>
                      <label className={labelClass}>
                        Sub-office
                      </label>

                      <select
                        value={subOfficeId}
                        onChange={(e) =>
                          setSubOfficeId(e.target.value)
                        }
                        disabled={!officeId || saving}
                        className={inputClass}
                      >
                        <option value="">
                          No Sub-office
                        </option>

                        {filteredSubOffices.map(
                          (subOffice) => (
                            <option
                              key={subOffice.id}
                              value={subOffice.id}
                            >
                              {subOffice.sub_office_name}
                            </option>
                          )
                        )}
                      </select>
                    </div>

                    {/* CATEGORY */}
                    <div>
                      <label className={labelClass}>
                        Expense Category{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={categoryId}
                        onChange={(e) => {
                          setCategoryId(e.target.value);
                          setAccountId("");
                        }}
                        required
                        disabled={saving}
                        className={inputClass}
                      >
                        <option value="">
                          Select Expense Category
                        </option>

                        {categories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id}
                          >
                            {category.category_code} -{" "}
                            {category.category_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* ACCOUNT */}
                    <div>
                      <label className={labelClass}>
                        Expense Account{" "}
                        <span className="text-red-500">*</span>
                      </label>

                      <select
                        value={accountId}
                        onChange={(e) =>
                          setAccountId(e.target.value)
                        }
                        required
                        disabled={!categoryId || saving}
                        className={inputClass}
                      >
                        <option value="">
                          Select Expense Account
                        </option>

                        {filteredAccounts.map((account) => (
                          <option
                            key={account.id}
                            value={account.id}
                          >
                            {account.account_code} -{" "}
                            {account.account_name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </section>

                {/* AUTO-GENERATED PARTICULARS */}
                <section>
                  <h3 className={sectionTitleClass}>
                    Particulars
                  </h3>

                  <div>
                    <label className={labelClass}>
                      Automatically Generated
                    </label>

                    <textarea
                      rows={3}
                      value={generatedParticulars}
                      readOnly
                      className="w-full resize-none border-0 border-b border-slate-300 bg-slate-50 px-0 py-2 text-sm text-slate-700 outline-none"
                      placeholder="Select office, sub-office, category and account"
                    />

                    <p className="mt-1 text-[10px] text-slate-400">
                      Particulars are automatically generated
                      from the selected office, sub-office,
                      expense category and expense account.
                    </p>
                  </div>
                </section>

                {/* OBLIGATION AMOUNT */}
                <section>
                  <h3 className={sectionTitleClass}>
                    Obligation Amount
                  </h3>

                  <div>
                    <label className={labelClass}>
                      Amount{" "}
                      <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={amount}
                      onChange={(e) =>
                        setAmount(e.target.value)
                      }
                      required
                      disabled={saving}
                      className={`${inputClass} text-right font-semibold tabular-nums`}
                      placeholder="0.00"
                    />

                    {Number(amount) > 0 && (
                      <p className="mt-2 text-right text-sm font-semibold text-[#557992]">
                        {peso(Number(amount))}
                      </p>
                    )}
                  </div>
                </section>

                {/* REMARKS */}
                <section>
                  <h3 className={sectionTitleClass}>
                    Remarks
                  </h3>

                  <div>
                    <label className={labelClass}>
                      Remarks
                    </label>

                    <textarea
                      rows={2}
                      value={remarks}
                      onChange={(e) =>
                        setRemarks(e.target.value)
                      }
                      disabled={saving}
                      className={`${inputClass} resize-y`}
                      placeholder="Optional remarks"
                    />
                  </div>
                </section>
              </>
            )}
          </div>

          {/* FOOTER */}
          <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loadingOptions || saving}
              className="flex items-center gap-2 rounded-md bg-[#6689A5] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Save size={14} />
              )}

              {saving ? "Adding..." : "Add OBR to DV"}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}