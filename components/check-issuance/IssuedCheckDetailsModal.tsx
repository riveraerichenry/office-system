
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  ClipboardList,
  Loader2,
  Building2,
  Banknote,
  FileText,
  Pencil,
  Save,
  Plus,
  Trash2,
  RotateCcw,
} from "lucide-react";

import CheckIssuancePrint from "./print/CheckIssuancePrint";

import type { IssuedCheck } from "./IssuedCheckTable";

type TransactionItem = {
  obr_no: string | null;
  dv_no: string | null;
  responsibility_center: string | null;
  account_code: string | null;
  payee_name: string | null;
  nature_of_payment: string | null;
  item_date: string | null;
  total_debit: number | string;
  total_wtax: number | string;
  other_deduction: number | string;
  retention_10_percent: number | string;
  wtax_1_percent: number | string;
  wtax_2_percent: number | string;
  wtax_3_percent: number | string;
  wtax_4_percent: number | string;
  excavation_fees: number | string;
  advance_payment: number | string;
  liquidated_damages: number | string;
  accounts_payable: number | string;
  others: number | string;
  remarks: string | null;
};

type TransactionDetails = {
  id: string | number;
  check_number: string;
  dv_no: string;
  check_date: string | null;
  payee: string;
  payor: string | null;
  signatory_1: string | null;
  signatory_2: string | null;
  signatory_1_name?: string | null;
  signatory_1_position?: string | null;
  signatory_2_name?: string | null;
  signatory_2_position?: string | null;
  fund_source_id: string | null;
  fund_source: string;
  bank_name: string;
  bank_code: string | null;
  account_number: string;
  total_amount: number | string;
  status: string;
  particulars: string | null;
  created_at: string | null;
  items: TransactionItem[];
};

type Signatory = {
  id: string;
  full_name: string;
  position?: string | null;
  office?: string | null;
};

type FundSource = {
  id: string;
  fund_code: string;
  acronym: string | null;
  fund_name: string;
};

type ApiResponse = {
  success: boolean;
  error?: string;
  data?: TransactionDetails;
};

type Props = {
  open: boolean;
  check: IssuedCheck | null;
  onClose: () => void;
};

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-slate-600";

const amountFields = [
  { key: "total_debit", label: "Total Debit" },
  { key: "total_wtax", label: "Total Withholding Tax" },
  { key: "other_deduction", label: "Other Deduction" },
  { key: "retention_10_percent", label: "Retention 10%" },
  { key: "wtax_1_percent", label: "WTax 1%" },
  { key: "wtax_2_percent", label: "WTax 2%" },
  { key: "wtax_3_percent", label: "WTax 3%" },
  { key: "wtax_4_percent", label: "WTax 4%" },
] as const;

const otherPaymentFields = [
  { key: "excavation_fees", label: "Excavation Fees" },
  { key: "advance_payment", label: "Advance Payment" },
  { key: "liquidated_damages", label: "Liquidated Damages" },
  { key: "accounts_payable", label: "Accounts Payable" },
  { key: "others", label: "Others" },
] as const;

function formatCurrency(value: number | string): string {
  const amount = Number(value);

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

function formatDate(value: string | null): string {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function dateInputValue(value: string | null): string {
  if (!value) return "";
  return value.substring(0, 10);
}

function createEmptyItem(): TransactionItem {
  return {
    obr_no: "",
    dv_no: "",
    responsibility_center: "",
    account_code: "",
    payee_name: "",
    nature_of_payment: "",
    item_date: "",
    total_debit: "0",
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

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 break-words text-sm font-medium text-slate-800">
        {value === null || value === undefined || value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string;
  value: string | number | null;
  onChange?: (value: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        type={type}
        step={type === "number" ? "0.01" : undefined}
        min={type === "number" ? "0" : undefined}
        value={value ?? ""}
        onChange={(event) => onChange?.(event.target.value)}
        required={required}
        className={inputClass}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      >
        {children}
      </select>
    </div>
  );
}

function ReadOnlyField({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="min-w-0">
      <label className={labelClass}>{label}</label>

      <div className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700">
        {value || "—"}
      </div>
    </div>
  );
}

export default function IssuedCheckDetailsModal({
  open,
  check,
  onClose,
}: Props) {
  const [details, setDetails] =
    useState<TransactionDetails | null>(null);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [signatories, setSignatories] =
    useState<Signatory[]>([]);

  const [fundSources, setFundSources] =
    useState<FundSource[]>([]);

  // =====================================================
  // FETCH TRANSACTION DETAILS
  // =====================================================

  useEffect(() => {
    if (!open || !check) {
      setDetails(null);
      setError("");
      setSuccess("");
      setLoading(false);
      setIsEditing(false);
      return;
    }

    const selectedCheck = check;
    const controller = new AbortController();

    async function fetchDetails() {
      setLoading(true);
      setError("");
      setSuccess("");
      setIsEditing(false);

      try {
        const response = await fetch(
          `/api/check-issuance/${encodeURIComponent(
            String(selectedCheck.id)
          )}`,
          {
            method: "GET",
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result: ApiResponse = await response.json();

        if (!response.ok || !result.success || !result.data) {
          throw new Error(
            result.error || "Unable to retrieve check details."
          );
        }

        setDetails(result.data);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "Unable to retrieve check details."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void fetchDetails();

    return () => controller.abort();
  }, [open, check]);

  // =====================================================
  // FETCH SIGNATORIES AND FUND SOURCES
  // =====================================================

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    async function fetchDropdownData() {
      try {
        const [signatoryResponse, fundSourceResponse] =
          await Promise.all([
            fetch("/api/signatories", {
              cache: "no-store",
              signal: controller.signal,
            }),
            fetch("/api/fund-sources", {
              cache: "no-store",
              signal: controller.signal,
            }),
          ]);

        if (signatoryResponse.ok) {
          const signatoryResult =
            await signatoryResponse.json();

          const signatoryData = Array.isArray(signatoryResult)
            ? signatoryResult
            : signatoryResult.data ?? [];

          setSignatories(signatoryData);
        }

        if (fundSourceResponse.ok) {
          const fundSourceResult =
            await fundSourceResponse.json();

          setFundSources(fundSourceResult.data ?? []);
        }
      } catch (err) {
        if (
          err instanceof Error &&
          err.name === "AbortError"
        ) {
          return;
        }

        console.error("Dropdown loading error:", err);
      }
    }

    void fetchDropdownData();

    return () => controller.abort();
  }, [open]);

  // =====================================================
  // ESCAPE KEY
  // =====================================================

  useEffect(() => {
    if (!open) return;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) {
        onClose();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose, saving]);

  // =====================================================
  // UPDATE HEADER FIELD
  // =====================================================

  function updateHeader<K extends keyof TransactionDetails>(
    field: K,
    value: TransactionDetails[K]
  ) {
    setDetails((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        [field]: value,
      };
    });
  }

  // =====================================================
  // UPDATE ITEM FIELD
  // =====================================================

  function updateItem<K extends keyof TransactionItem>(
    index: number,
    field: K,
    value: TransactionItem[K]
  ) {
    setDetails((previous) => {
      if (!previous) return previous;

      const updatedItems = [...previous.items];

      updatedItems[index] = {
        ...updatedItems[index],
        [field]: value,
      };

      return {
        ...previous,
        items: updatedItems,
      };
    });
  }

  // =====================================================
  // ADD ITEM
  // =====================================================

  function addItem() {
    setDetails((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        items: [...previous.items, createEmptyItem()],
      };
    });
  }

  // =====================================================
  // REMOVE ITEM
  // =====================================================

  function removeItem(index: number) {
    setDetails((previous) => {
      if (!previous) return previous;

      return {
        ...previous,
        items: previous.items.filter(
          (_, itemIndex) => itemIndex !== index
        ),
      };
    });
  }

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const grandTotal = useMemo(() => {
    if (!details) return 0;

    return details.items.reduce(
      (sum, item) =>
        sum + (Number(item.total_debit) || 0),
      0
    );
  }, [details]);

  // =====================================================
  // RELOAD DETAILS
  // =====================================================

  async function reloadDetails(id: string | number) {
    try {
      const response = await fetch(
        `/api/check-issuance/${encodeURIComponent(String(id))}`,
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success || !result.data) {
        throw new Error(
          result.error || "Unable to reload transaction."
        );
      }

      setDetails(result.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to reload transaction."
      );
    }
  }

  // =====================================================
  // CANCEL EDIT
  // =====================================================

  async function handleCancelEdit() {
    if (!details) return;

    setError("");
    setSuccess("");
    setIsEditing(false);

    await reloadDetails(details.id);
  }

  // =====================================================
  // SAVE CHANGES
  // =====================================================

  async function handleSave() {
    if (!details) return;

    setError("");
    setSuccess("");

    if (!details.dv_no?.trim()) {
      setError("Please enter the DV number.");
      return;
    }

    if (!details.check_date) {
      setError("Please select the check date.");
      return;
    }

    if (!details.payee?.trim()) {
      setError("Please enter the payee.");
      return;
    }

    if (!details.signatory_1 || !details.signatory_2) {
      setError("Please select both signatories.");
      return;
    }

    if (details.signatory_1 === details.signatory_2) {
      setError(
        "Signatory 1 and Signatory 2 must be different."
      );
      return;
    }

    if (!details.fund_source_id) {
      setError("Please select a fund source.");
      return;
    }

    if (details.items.length === 0) {
      setError("Please add at least one transaction item.");
      return;
    }

    const invalidItem = details.items.some(
      (item) =>
        !item.account_code?.trim() ||
        !Number.isFinite(Number(item.total_debit)) ||
        Number(item.total_debit) <= 0 ||
        [
          item.total_wtax,
          item.other_deduction,
          item.retention_10_percent,
          item.wtax_1_percent,
          item.wtax_2_percent,
          item.wtax_3_percent,
          item.wtax_4_percent,
          item.excavation_fees,
          item.advance_payment,
          item.liquidated_damages,
          item.accounts_payable,
          item.others,
        ].some(
          (amount) =>
            !Number.isFinite(Number(amount)) ||
            Number(amount) < 0
        )
    );

    if (invalidItem) {
      setError(
        "Please check the account codes and all transaction amounts. Amounts cannot be negative."
      );
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/check-issuance/${encodeURIComponent(
          String(details.id)
        )}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dv_no: details.dv_no.trim(),
            check_date: dateInputValue(details.check_date),
            payee: details.payee.trim(),
            payor: details.payor?.trim() || "",
            signatory_1: details.signatory_1,
            signatory_2: details.signatory_2,
            fund_source_id: details.fund_source_id,
            particulars: details.particulars || "",
            items: details.items.map((item) => ({
              ...item,
              total_debit: Number(item.total_debit || 0),
              total_wtax: Number(item.total_wtax || 0),
              other_deduction: Number(item.other_deduction || 0),
              retention_10_percent: Number(
                item.retention_10_percent || 0
              ),
              wtax_1_percent: Number(item.wtax_1_percent || 0),
              wtax_2_percent: Number(item.wtax_2_percent || 0),
              wtax_3_percent: Number(item.wtax_3_percent || 0),
              wtax_4_percent: Number(item.wtax_4_percent || 0),
              excavation_fees: Number(item.excavation_fees || 0),
              advance_payment: Number(item.advance_payment || 0),
              liquidated_damages: Number(
                item.liquidated_damages || 0
              ),
              accounts_payable: Number(item.accounts_payable || 0),
              others: Number(item.others || 0),
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to save changes."
        );
      }

      setSuccess("Check issuance updated successfully.");
      setIsEditing(false);

      await reloadDetails(details.id);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save changes."
      );
    } finally {
      setSaving(false);
    }
  }

  if (!open || !check) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/50 p-3 sm:p-5"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

        {/* HEADER */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white">
              <ClipboardList size={22} />
            </div>

            <div className="min-w-0">
              <h2 className="text-lg font-bold text-slate-900">
                Issued Check Details
              </h2>

              <p className="mt-1 truncate text-xs text-slate-500">
                Check No. {check.check_number}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-100 disabled:opacity-50"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* BODY */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <Loader2
                size={32}
                className="animate-spin text-blue-700"
              />
              <p className="mt-3 text-sm font-medium">
                Loading transaction details...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm font-semibold text-red-800">
                {error}
              </p>
            </div>
          )}

          {!loading && success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm font-semibold text-green-800">
                {success}
              </p>
            </div>
          )}

          {!loading && details && (
            <div className="space-y-5">

              {/* CHECK INFORMATION */}
              <section className="rounded-xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <FileText
                    size={17}
                    className="text-blue-800"
                  />
                  <h3 className="text-sm font-bold text-slate-800">
                    Check Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  <ReadOnlyField
                    label="Check Number"
                    value={details.check_number}
                  />

                  {isEditing ? (
                    <>
                      <TextField
                        label="DV Number"
                        value={details.dv_no}
                        onChange={(value) =>
                          updateHeader("dv_no", value)
                        }
                        required
                      />

                      <TextField
                        label="Check Date"
                        type="date"
                        value={dateInputValue(details.check_date)}
                        onChange={(value) =>
                          updateHeader("check_date", value)
                        }
                        required
                      />

                      <TextField
                        label="Payee"
                        value={details.payee}
                        onChange={(value) =>
                          updateHeader("payee", value)
                        }
                        required
                      />

                      <TextField
                        label="Payor"
                        value={details.payor}
                        onChange={(value) =>
                          updateHeader("payor", value)
                        }
                      />
                    </>
                  ) : (
                    <>
                      <DetailField
                        label="DV Number"
                        value={details.dv_no}
                      />

                      <DetailField
                        label="Check Date"
                        value={formatDate(details.check_date)}
                      />

                      <DetailField
                        label="Payee"
                        value={details.payee}
                      />

                      <DetailField
                        label="Payor"
                        value={details.payor}
                      />
                    </>
                  )}

                  <DetailField
                    label="Status"
                    value={details.status}
                  />

                  <DetailField
                    label="Date Created"
                    value={formatDate(details.created_at)}
                  />
                </div>
              </section>

              {/* BANK AND FUND INFORMATION */}
              <section className="rounded-xl border border-slate-200 p-4">
                <div className="mb-4 flex items-center gap-2">
                  <Building2
                    size={17}
                    className="text-blue-800"
                  />
                  <h3 className="text-sm font-bold text-slate-800">
                    Bank and Fund Information
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                  <ReadOnlyField
                    label="Bank Name"
                    value={details.bank_name}
                  />

                  <ReadOnlyField
                    label="Bank Code"
                    value={details.bank_code}
                  />

                  <ReadOnlyField
                    label="Account Number"
                    value={details.account_number}
                  />

                  {isEditing ? (
                    <SelectField
                      label="Fund Source"
                      value={details.fund_source_id || ""}
                      onChange={(value) => {
                        const selected = fundSources.find(
                          (fund) => fund.id === value
                        );

                        updateHeader("fund_source_id", value);
                        updateHeader(
                          "fund_source",
                          selected?.fund_name || ""
                        );
                      }}
                    >
                      <option value="">
                        Select Fund Source
                      </option>

                      {details.fund_source_id &&
                        !fundSources.some(
                          (fund) =>
                            fund.id === details.fund_source_id
                        ) && (
                          <option value={details.fund_source_id}>
                            {details.fund_source}
                          </option>
                        )}

                      {fundSources.map((fund) => (
                        <option
                          key={fund.id}
                          value={fund.id}
                        >
                          {fund.fund_code} - {fund.fund_name}
                          {fund.acronym
                            ? ` (${fund.acronym})`
                            : ""}
                        </option>
                      ))}
                    </SelectField>
                  ) : (
                    <DetailField
                      label="Fund Source"
                      value={details.fund_source}
                    />
                  )}
                </div>
              </section>

              {/* SIGNATORIES */}
              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-4 text-sm font-bold text-slate-800">
                  Authorized Signatories
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {isEditing ? (
                    <>
                      <SelectField
                        label="Signatory 1"
                        value={details.signatory_1 || ""}
                        onChange={(value) =>
                          updateHeader("signatory_1", value)
                        }
                      >
                        <option value="">
                          Select Signatory 1
                        </option>

                        {details.signatory_1 &&
                          !signatories.some(
                            (s) => s.id === details.signatory_1
                          ) && (
                            <option value={details.signatory_1}>
                              {details.signatory_1_name ||
                                "Current signatory (unavailable)"}
                            </option>
                          )}

                        {signatories.map((signatory) => (
                          <option
                            key={signatory.id}
                            value={signatory.id}
                          >
                            {signatory.full_name}
                            {signatory.position
                              ? ` - ${signatory.position}`
                              : ""}
                          </option>
                        ))}
                      </SelectField>

                      <SelectField
                        label="Signatory 2"
                        value={details.signatory_2 || ""}
                        onChange={(value) =>
                          updateHeader("signatory_2", value)
                        }
                      >
                        <option value="">
                          Select Signatory 2
                        </option>

                        {details.signatory_2 &&
                          !signatories.some(
                            (s) => s.id === details.signatory_2
                          ) && (
                            <option value={details.signatory_2}>
                              {details.signatory_2_name ||
                                "Current signatory (unavailable)"}
                            </option>
                          )}

                        {signatories.map((signatory) => (
                          <option
                            key={signatory.id}
                            value={signatory.id}
                          >
                            {signatory.full_name}
                            {signatory.position
                              ? ` - ${signatory.position}`
                              : ""}
                          </option>
                        ))}
                      </SelectField>
                    </>
                  ) : (
                    <>
                      <DetailField
                        label="Signatory 1"
                        value={
                          details.signatory_1_name ||
                          details.signatory_1
                        }
                      />

                      <DetailField
                        label="Signatory 2"
                        value={
                          details.signatory_2_name ||
                          details.signatory_2
                        }
                      />
                    </>
                  )}
                </div>
              </section>

              {/* PARTICULARS */}
              <section className="rounded-xl border border-slate-200 p-4">
                <h3 className="mb-3 text-sm font-bold text-slate-800">
                  Particulars
                </h3>

                {isEditing ? (
                  <textarea
                    value={details.particulars || ""}
                    onChange={(event) =>
                      updateHeader(
                        "particulars",
                        event.target.value
                      )
                    }
                    rows={3}
                    className={inputClass}
                    placeholder="Enter particulars..."
                  />
                ) : (
                  <p className="whitespace-pre-wrap break-words text-sm text-slate-700">
                    {details.particulars || "—"}
                  </p>
                )}
              </section>

              {/* TRANSACTION ITEMS */}
              <section className="overflow-hidden rounded-xl border border-slate-200">

                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <ClipboardList
                      size={17}
                      className="text-blue-800"
                    />

                    <h3 className="text-sm font-bold text-slate-800">
                      Transaction Items
                    </h3>

                    <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold text-blue-800">
                      {details.items.length} Items
                    </span>
                  </div>

                  {isEditing && (
                    <button
                      type="button"
                      onClick={addItem}
                      className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800"
                    >
                      <Plus size={15} />
                      Add Item
                    </button>
                  )}
                </div>

                {details.items.length === 0 ? (
                  <p className="p-6 text-center text-sm text-slate-500">
                    No transaction items found.
                  </p>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {details.items.map((item, index) => (
                      <div
                        key={index}
                        className="space-y-5 p-4"
                      >

                        {/* ITEM HEADER */}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <h4 className="text-sm font-bold text-slate-800">
                            Item {index + 1}
                          </h4>

                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-600">
                                OBR: {item.obr_no || "—"}
                              </span>
                            )}

                            {isEditing && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                              >
                                <Trash2 size={14} />
                                Remove
                              </button>
                            )}
                          </div>
                        </div>

                        {/* BASIC ITEM INFORMATION */}
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                          {isEditing ? (
                            <>
                              <TextField
                                label="OBR Number"
                                value={item.obr_no}
                                onChange={(value) =>
                                  updateItem(index, "obr_no", value)
                                }
                              />

                              <TextField
                                label="Responsibility Center"
                                value={item.responsibility_center}
                                onChange={(value) =>
                                  updateItem(
                                    index,
                                    "responsibility_center",
                                    value
                                  )
                                }
                              />

                              <TextField
                                label="Account Code"
                                value={item.account_code}
                                onChange={(value) =>
                                  updateItem(
                                    index,
                                    "account_code",
                                    value
                                  )
                                }
                                required
                              />

                              <TextField
                                label="Payee"
                                value={item.payee_name}
                                onChange={(value) =>
                                  updateItem(
                                    index,
                                    "payee_name",
                                    value
                                  )
                                }
                              />

                              <TextField
                                label="Item Date"
                                type="date"
                                value={dateInputValue(item.item_date)}
                                onChange={(value) =>
                                  updateItem(
                                    index,
                                    "item_date",
                                    value
                                  )
                                }
                              />

                              <TextField
                                label="Nature of Payment"
                                value={item.nature_of_payment}
                                onChange={(value) =>
                                  updateItem(
                                    index,
                                    "nature_of_payment",
                                    value
                                  )
                                }
                              />
                            </>
                          ) : (
                            <>
                              <DetailField
                                label="OBR Number"
                                value={item.obr_no}
                              />

                              <DetailField
                                label="DV Number"
                                value={item.dv_no}
                              />

                              <DetailField
                                label="Responsibility Center"
                                value={item.responsibility_center}
                              />

                              <DetailField
                                label="Account Code"
                                value={item.account_code}
                              />

                              <DetailField
                                label="Payee"
                                value={item.payee_name}
                              />

                              <DetailField
                                label="Item Date"
                                value={formatDate(item.item_date)}
                              />

                              <DetailField
                                label="Nature of Payment"
                                value={item.nature_of_payment}
                              />
                            </>
                          )}
                        </div>

                        {/* ALL AMOUNT FIELDS */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">

                          {/* DEBIT AND DEDUCTIONS */}
                          <div className="rounded-lg bg-slate-50 p-3">
                            <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">
                              Debit and Deductions
                            </h5>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {amountFields.map((field) => (
                                <div key={field.key}>
                                  <label className={labelClass}>
                                    {field.label}
                                  </label>

                                  {isEditing ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={item[field.key] ?? ""}
                                      onChange={(event) =>
                                        updateItem(
                                          index,
                                          field.key,
                                          event.target.value
                                        )
                                      }
                                      className={inputClass}
                                    />
                                  ) : (
                                    <p className="text-sm font-semibold tabular-nums text-slate-800">
                                      {formatCurrency(item[field.key])}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* OTHER PAYMENTS */}
                          <div className="rounded-lg bg-slate-50 p-3">
                            <h5 className="mb-3 text-xs font-bold uppercase tracking-wide text-slate-600">
                              Other Payment Details
                            </h5>

                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                              {otherPaymentFields.map((field) => (
                                <div key={field.key}>
                                  <label className={labelClass}>
                                    {field.label}
                                  </label>

                                  {isEditing ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={item[field.key] ?? ""}
                                      onChange={(event) =>
                                        updateItem(
                                          index,
                                          field.key,
                                          event.target.value
                                        )
                                      }
                                      className={inputClass}
                                    />
                                  ) : (
                                    <p className="text-sm font-semibold tabular-nums text-slate-800">
                                      {formatCurrency(item[field.key])}
                                    </p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* REMARKS */}
                        <div>
                          {isEditing ? (
                            <div>
                              <label className={labelClass}>
                                Remarks
                              </label>

                              <textarea
                                value={item.remarks || ""}
                                onChange={(event) =>
                                  updateItem(
                                    index,
                                    "remarks",
                                    event.target.value
                                  )
                                }
                                rows={2}
                                className={inputClass}
                                placeholder="Enter remarks..."
                              />
                            </div>
                          ) : (
                            item.remarks && (
                              <div>
                                <p className="text-[10px] font-semibold uppercase text-slate-400">
                                  Remarks
                                </p>

                                <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                                  {item.remarks}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* GRAND TOTAL */}
              <section className="rounded-xl bg-blue-950 p-5 text-white">
                <div className="flex items-center gap-2 text-blue-200">
                  <Banknote size={18} />

                  <span className="text-xs font-semibold uppercase tracking-wide">
                    Total Check Amount
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold tabular-nums sm:text-3xl">
                  {formatCurrency(
                    isEditing ? grandTotal : details.total_amount
                  )}
                </p>

                {isEditing && (
                  <p className="mt-2 text-xs text-blue-200">
                    Automatically calculated from all Total Debit fields.
                  </p>
                )}
              </section>
            </div>
          )}
        </div>

        {/* FOOTER */}
<div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 bg-slate-50 px-5 py-3">

  {!isEditing ? (
    <>
      {/* CLOSE */}
      <button
        type="button"
        onClick={onClose}
        className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
      >
        Close
      </button>

            {/* REPRINT */}
                {!loading && details && (
                    <CheckIssuancePrint
                    details={{
                        check_date: details.check_date,
                        payee: details.payee,
                        total_amount: details.total_amount,
                        bank_code: details.bank_code,
                        signatory_1_name: details.signatory_1_name,
                        signatory_1_position: details.signatory_1_position,
                        signatory_2_name: details.signatory_2_name,
                        signatory_2_position: details.signatory_2_position,
                    }}
                    />
                )}

                {/* EDIT */}
                {!loading && details && (
                    <button
                    type="button"
                    onClick={() => {
                        setError("");
                        setSuccess("");
                        setIsEditing(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800"
                    >
                    <Pencil size={16} />
                    Edit
                    </button>
                )}
                </>
            ) : (
                <>
                {/* CANCEL */}
                <button
                    type="button"
                    onClick={handleCancelEdit}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                    <RotateCcw size={15} />
                    Cancel
                </button>

                {/* SAVE CHANGES */}
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {saving ? (
                    <>
                        <Loader2 size={16} className="animate-spin" />
                        Saving...
                    </>
                    ) : (
                    <>
                        <Save size={16} />
                        Save Changes
                    </>
                    )}
                </button>
                </>
            )}
        </div>
      </div>
    </div>
  );
}
