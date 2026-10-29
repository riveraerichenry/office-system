"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  ClipboardCheck,
  CalendarDays,
  Plus,
  Trash2,
} from "lucide-react";

import type { AvailableCheck } from "@/components/check-issuance/AvailableChecks";

export type Signatory = {
  id: string;
  full_name: string;
  office: string | null;
  position: string | null;
  remarks: string | null;
};

export type IssueCheckItem = {
  id: string;
  obr_no: string;
  responsibility_center: string;
  account_code: string;
  payee_name: string;
  nature_of_payment: string;
  item_date: string;
  total_debit: string;
  total_wtax: string;
  other_deduction: string;
  retention_10_percent: string;
  wtax_1_percent: string;
  wtax_2_percent: string;
  wtax_3_percent: string;
  wtax_4_percent: string;
  excavation_fees: string;
  advance_payment: string;
  liquidated_damages: string;
  accounts_payable: string;
  others: string;
  remarks: string;
};

export type IssueCheckForm = {
  booklet_id: string;
  booklet_number: string;
  check_number: string;
  dv_no: string;
  check_date: string;
  payee: string;
  payor: string;
  signatory_1: string;
  signatory_2: string;
  fund_source_id: string;
  fund_source: string;
  bank_name: string;
  account_number: string;
  particulars: string;
  items: IssueCheckItem[];
  grand_total: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: IssueCheckForm) => void;
  selectedBooklet: AvailableCheck | null;
};

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createItem(): IssueCheckItem {
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

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

const inputClass =
  "h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const labelClass =
  "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500";

function Field({
  label,
  value,
  onChange,
  required = false,
  type = "text",
  placeholder,
  min,
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
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

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200">
      <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
        <h3 className="text-sm font-bold text-slate-800">{title}</h3>
      </div>

      <div className="space-y-4 p-4">{children}</div>
    </section>
  );
}

export default function IssueCheckModal({
  open,
  onClose,
  onSubmit,
  selectedBooklet,
}: Props) {
  const [signatories, setSignatories] = useState<Signatory[]>([]);
  const [loadingSignatories, setLoadingSignatories] = useState(false);
  const [signatoryError, setSignatoryError] = useState("");

  const [dvNo, setDvNo] = useState("");
  const [checkDate, setCheckDate] = useState(getToday());
  const [payee, setPayee] = useState("");
  const [payor, setPayor] = useState("");
  const [signatory1, setSignatory1] = useState("");
  const [signatory2, setSignatory2] = useState("");
  const [particulars, setParticulars] = useState("");
  const [items, setItems] = useState<IssueCheckItem[]>([createItem()]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function fetchSignatories() {
      setLoadingSignatories(true);
      setSignatoryError("");

      try {
        const response = await fetch("/api/signatories", {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.error || "Unable to load signatories."
          );
        }

        setSignatories(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error(err);
        setSignatoryError(
          err instanceof Error
            ? err.message
            : "Failed to load signatories."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSignatories(false);
        }
      }
    }

    void fetchSignatories();

    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!open) return;

    setDvNo("");
    setCheckDate(getToday());
    setPayee("");
    setPayor("");
    setSignatory1("");
    setSignatory2("");
    setParticulars("");
    setItems([createItem()]);
    setError("");
  }, [open, selectedBooklet?.id]);

  const grandTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.total_debit) || 0),
        0
      ),
    [items]
  );

  const issued = Number(selectedBooklet?.issued_checks ?? 0);
  const total = Number(selectedBooklet?.total_checks ?? 0);
  const remaining = Number(selectedBooklet?.remaining_checks ?? 0);

  const usedPercentage =
    total > 0 ? Math.min(100, (issued / total) * 100) : 0;

  if (!open || !selectedBooklet) return null;

  function updateItem(
    id: string,
    field: keyof IssueCheckItem,
    value: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    setError("");
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!selectedBooklet) {
      setError("Please select a check booklet.");
      return;
    }

    if (!selectedBooklet.check_number?.trim() || remaining <= 0) {
      setError("The selected booklet has no available check.");
      return;
    }

    if (!dvNo.trim()) {
      setError("Please enter the DV number.");
      return;
    }

    if (!payee.trim()) {
      setError("Please enter the payee.");
      return;
    }

    if (!signatory1 || !signatory2) {
      setError("Please select both signatories.");
      return;
    }

    if (signatory1 === signatory2) {
      setError("Signatory 1 and Signatory 2 must be different.");
      return;
    }

    if (items.some((item) => !item.account_code.trim())) {
      setError("Please enter an account code for every item.");
      return;
    }

    if (
      items.some(
        (item) =>
          item.total_debit.trim() === "" ||
          !Number.isFinite(Number(item.total_debit)) ||
          Number(item.total_debit) <= 0
      )
    ) {
      setError("Every transaction item needs a debit amount greater than zero.");
      return;
    }

    onSubmit({
      booklet_id: selectedBooklet.id,
      booklet_number: selectedBooklet.booklet_number,
      check_number: selectedBooklet.check_number,
      dv_no: dvNo.trim(),
      check_date: checkDate,
      payee: payee.trim(),
      payor: payor.trim(),
      signatory_1: signatory1,
      signatory_2: signatory2,
      fund_source_id: selectedBooklet.fund_source_id ?? "",
      fund_source: selectedBooklet.fund_source,
      bank_name: selectedBooklet.bank_name,
      account_number: selectedBooklet.account_number,
      particulars: particulars.trim(),
      items,
      grand_total: grandTotal,
    });
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-check-title"
        className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* HEADER: SELECTED CHECK DETAILS */}
        <header className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ClipboardCheck className="text-blue-600" size={21} />

                <h2
                  id="issue-check-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Check Issuance Transaction
                </h2>

                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold">
                  Booklet {selectedBooklet.booklet_number}
                </span>
              </div>

              <p className="mt-2 text-sm text-slate-600">
                {selectedBooklet.bank_name} · Account{" "}
                {selectedBooklet.account_number}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Fund: {selectedBooklet.fund_source} · Code:{" "}
                {selectedBooklet.fund_code || "—"}
              </p>

              <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                <span>{selectedBooklet.beginning_check_no}</span>

                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-blue-600"
                    style={{ width: `${usedPercentage}%` }}
                  />
                </div>

                <span>{selectedBooklet.ending_check_no}</span>

                <span>
                  Remaining:{" "}
                  <b className="text-emerald-600">{remaining}</b>
                </span>
              </div>
            </div>

            <div className="hidden min-w-[150px] rounded-xl bg-blue-600 px-4 py-3 text-center text-white sm:block">
              <p className="text-xs text-blue-100">Current Check No.</p>
              <p className="mt-1 text-2xl font-extrabold">
                {selectedBooklet.check_number || "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-6">
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* TRANSACTION DETAILS */}
            <Section title="Transaction Details">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field
                  label="DV No."
                  value={dvNo}
                  onChange={setDvNo}
                  placeholder="Enter DV number"
                  required
                />

                <Field
                  label="Check Date"
                  type="date"
                  value={checkDate}
                  onChange={setCheckDate}
                  required
                />

                <Field
                  label="Payee"
                  value={payee}
                  onChange={setPayee}
                  placeholder="Enter payee"
                  required
                />

                <Field
                  label="Payor"
                  value={payor}
                  onChange={setPayor}
                  placeholder="Enter payor"
                />

                <div>
                  <label className={labelClass}>
                    Signatory 1 <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={signatory1}
                    onChange={(event) => setSignatory1(event.target.value)}
                    required
                    disabled={loadingSignatories}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingSignatories
                        ? "Loading signatories..."
                        : "Select Signatory 1"}
                    </option>

                    {signatories.map((signatory) => (
                      <option key={signatory.id} value={signatory.id}>
                        {signatory.full_name} — {signatory.position || signatory.office || ""}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Signatory 2 <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={signatory2}
                    onChange={(event) => setSignatory2(event.target.value)}
                    required
                    disabled={loadingSignatories}
                    className={inputClass}
                  >
                    <option value="">
                      {loadingSignatories
                        ? "Loading signatories..."
                        : "Select Signatory 2"}
                    </option>

                    {signatories.map((signatory) => (
                      <option key={signatory.id} value={signatory.id}>
                        {signatory.full_name} — {signatory.position || signatory.office || ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {signatoryError && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  {signatoryError}
                  <button
                    type="button"
                    onClick={() => {
                      setSignatoryError("");
                      setLoadingSignatories(true);

                      fetch("/api/signatories", { cache: "no-store" })
                        .then(async (response) => {
                          const data = await response.json();

                          if (!response.ok) {
                            throw new Error(
                              data.error || "Failed to load signatories."
                            );
                          }

                          setSignatories(data);
                        })
                        .catch((err) => {
                          setSignatoryError(
                            err instanceof Error
                              ? err.message
                              : "Failed to load signatories."
                          );
                        })
                        .finally(() => setLoadingSignatories(false));
                    }}
                    className="ml-2 font-semibold underline"
                  >
                    Retry
                  </button>
                </div>
              )}

              <div>
                <label className={labelClass}>Particulars / Remarks</label>
                <textarea
                  value={particulars}
                  onChange={(event) => setParticulars(event.target.value)}
                  rows={2}
                  placeholder="Enter transaction particulars"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </Section>

            {/* TRANSACTION ITEMS */}
            <Section title="Transaction Items">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setItems((current) => [...current, createItem()])
                  }
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Plus size={16} />
                  Add Item
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="space-y-4 rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-800">
                      Item {index + 1}
                    </h4>

                    <button
                      type="button"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((row) => row.id !== item.id)
                        )
                      }
                      className="rounded-lg p-2 text-red-500 hover:bg-red-50 disabled:opacity-30"
                      aria-label={`Remove item ${index + 1}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <Field
                      label="OBR No."
                      value={item.obr_no}
                      onChange={(value) => updateItem(item.id, "obr_no", value)}
                    />

                    <Field
                      label="Responsibility Center"
                      value={item.responsibility_center}
                      onChange={(value) =>
                        updateItem(item.id, "responsibility_center", value)
                      }
                    />

                    <Field
                      label="Account Code"
                      value={item.account_code}
                      onChange={(value) =>
                        updateItem(item.id, "account_code", value)
                      }
                      required
                    />

                    <Field
                      label="Payee Name"
                      value={item.payee_name}
                      onChange={(value) =>
                        updateItem(item.id, "payee_name", value)
                      }
                    />

                    <Field
                      label="Item Date"
                      type="date"
                      value={item.item_date}
                      onChange={(value) =>
                        updateItem(item.id, "item_date", value)
                      }
                      required
                    />

                    <Field
                      label="Total Debit"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={item.total_debit}
                      onChange={(value) =>
                        updateItem(item.id, "total_debit", value)
                      }
                      required
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Nature of Payment</label>
                    <textarea
                      value={item.nature_of_payment}
                      onChange={(event) =>
                        updateItem(
                          item.id,
                          "nature_of_payment",
                          event.target.value
                        )
                      }
                      rows={2}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                      Taxes and Deductions
                    </h5>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {(
                        [
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
                        ] as const
                      ).map(([field, label]) => (
                        <Field
                          key={field}
                          label={label}
                          type="number"
                          min="0"
                          step="0.01"
                          value={item[field]}
                          onChange={(value) =>
                            updateItem(item.id, field, value)
                          }
                        />
                      ))}
                    </div>

                    <div className="mt-4">
                      <Field
                        label="Remarks"
                        value={item.remarks}
                        onChange={(value) =>
                          updateItem(item.id, "remarks", value)
                        }
                      />
                    </div>
                  </div>
                </div>
              ))}
            </Section>

            {/* TOTAL */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-100 bg-blue-50 p-4">
              <div>
                <p className="text-xs font-semibold uppercase text-blue-700">
                  Total Debit
                </p>
                <p className="text-2xl font-extrabold text-blue-800">
                  {formatPHP(grandTotal)}
                </p>
              </div>

              <div className="text-right text-xs text-blue-700">
                <p>Check No.: {selectedBooklet.check_number || "—"}</p>
                <p>Fund: {selectedBooklet.fund_source}</p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                remaining <= 0 ||
                !selectedBooklet.check_number ||
                loadingSignatories ||
                signatories.length < 2
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              <ClipboardCheck size={17} />
              Save Transaction
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}