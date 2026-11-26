"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Wallet,
  FileCheck,
  Receipt,
  CalendarDays,
} from "lucide-react";
import Swal from "sweetalert2";

import type { DVRecord } from "./AvailableDV";

type OBRDetail = {
  id: string;
  obr_no: string;
  obr_date?: string;
  amount?: number | string;
  particulars?: string;
  payee?: string;
  status?: string;
};

type DVDetail = DVRecord & {
  payor?: string;
  created_at?: string;
  updated_at?: string;
  status?: string;
  obrs?: OBRDetail[];
};

type BankAccount = {
  id: string;
  account_number: string;
  account_code?: string;
  account_name: string;
  bank_id?: string;
  fund_source_id?: string;
  deposit_label?: string;
};

type AvailableCheck = {
  id: string;
  booklet_number: string;
  book_no: string;
  bank: string;
  account_number: string;
  beginning_check_no: string;
  ending_check_no: string;
  current_check_no: string;
  total_checks: number;
  issued_checks: number;
  remaining_checks: number;
  bank_account_id: string;
  bank_id?: string;
  fund_source_id?: string;
};

interface CheckAssignModalProps {
  open: boolean;
  dv: DVDetail | null;
  bankAccounts: BankAccount[];
  onClose: () => void;
  onSuccess: () => void;
}

const formatCurrency = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));

const formatDate = (value?: string) => {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function CheckAssignModal({
  open,
  dv,
  bankAccounts,
  onClose,
  onSuccess,
}: CheckAssignModalProps) {
  const [bankAccountId, setBankAccountId] = useState("");
  const [availableChecks, setAvailableChecks] = useState<AvailableCheck[]>([]);
  const [selectedBookletId, setSelectedBookletId] = useState("");
  const [checkNumber, setCheckNumber] = useState("");
  const [checkDate, setCheckDate] = useState("");
  const [remarks, setRemarks] = useState("");

  const [loadingChecks, setLoadingChecks] = useState(false);
  const [saving, setSaving] = useState(false);

  // Reset form whenever modal opens or DV changes
  useEffect(() => {
    if (!open) return;

    setBankAccountId("");
    setAvailableChecks([]);
    setSelectedBookletId("");
    setCheckNumber("");
    setCheckDate(new Date().toISOString().slice(0, 10));
    setRemarks("");
  }, [open, dv?.id]);

  // Fetch registered check booklets for selected bank account
  useEffect(() => {
    if (!open || !bankAccountId) {
      setAvailableChecks([]);
      setSelectedBookletId("");
      setCheckNumber("");
      return;
    }

    const loadChecks = async () => {
      try {
        setLoadingChecks(true);

        const response = await fetch(
          `/budget/api/check-issuance/available-checks?bank_account_id=${encodeURIComponent(
            bankAccountId
          )}`,
          { cache: "no-store" }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Failed to fetch available checks."
          );
        }

        setAvailableChecks(result.data || []);
      } catch (error) {
        console.error("Available checks error:", error);

        setAvailableChecks([]);

        Swal.fire({
          icon: "error",
          title: "Unable to load checks",
          text:
            error instanceof Error
              ? error.message
              : "Failed to load registered checks.",
        });
      } finally {
        setLoadingChecks(false);
      }
    };

    loadChecks();
  }, [open, bankAccountId]);

  const selectedBooklet = availableChecks.find(
    (item) => item.id === selectedBookletId
  );

  // Automatically use current_check_no
  useEffect(() => {
    setCheckNumber(selectedBooklet?.current_check_no || "");
  }, [selectedBooklet]);

  if (!open || !dv) return null;

  const obrTotal = (dv.obrs || []).reduce(
    (total, obr) => total + Number(obr.amount || 0),
    0
  );

  const dvAmount = Number(dv.grand_total || 0);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!bankAccountId) {
      Swal.fire({
        icon: "warning",
        title: "Select bank account",
        text: "Please select a bank account.",
      });
      return;
    }

    if (!selectedBookletId || !checkNumber) {
      Swal.fire({
        icon: "warning",
        title: "Select registered check",
        text: "Please select an available registered check booklet.",
      });
      return;
    }

    if (!checkDate) {
      Swal.fire({
        icon: "warning",
        title: "Check date required",
        text: "Please select the check date.",
      });
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(
        "/budget/api/check-issuance/check-assign",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            dv_id: dv.id,
            dv_no: dv.dv_no,
            bank_account_id: bankAccountId,
            booklet_registration_id: selectedBookletId,
            check_number: checkNumber,
            check_date: checkDate,
            amount: dvAmount,
            remarks,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to assign check.");
      }

      await Swal.fire({
        icon: "success",
        title: "Check Assigned",
        text: `Check No. ${checkNumber} has been assigned to DV ${dv.dv_no}.`,
        confirmButtonColor: "#557992",
      });

      onClose();
      onSuccess();
    } catch (error) {
      console.error("Check assignment error:", error);

      Swal.fire({
        icon: "error",
        title: "Assignment Failed",
        text:
          error instanceof Error
            ? error.message
            : "Failed to assign check.",
      });
    } finally {
      setSaving(false);
    }
  };

  const fieldClass =
    "w-full border-b border-slate-300 bg-transparent py-1 text-xs outline-none focus:border-[#6689A5] disabled:cursor-not-allowed disabled:text-slate-400";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="flex max-h-[94vh] w-full max-w-6xl flex-col overflow-hidden rounded-xl bg-[#EAF1F6] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-[#C7D8E3] bg-white px-3 py-2 sm:px-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Assign Check
            </h2>

            <p className="mt-0.5 text-xs text-slate-500">
              Assign a registered check to a disbursement voucher.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="flex-1 overflow-hidden space-y-2 p-2 sm:p-3">

            {/* DV INFORMATION */}
            <section className="rounded-lg border border-[#C7D8E3] bg-white p-2.5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#557992]">
                <FileCheck className="h-4 w-4" />
                Disbursement Voucher Information
              </div>

              <div className="grid grid-cols-2 gap-x-3 gap-y-2 sm:grid-cols-3 lg:grid-cols-4">

                <div>
                  <label className="text-xs text-slate-500">
                    DV Number
                  </label>
                  <p className="mt-0.5 font-semibold text-slate-800">
                    {dv.dv_no}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    DV Date
                  </label>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {formatDate(dv.dv_date)}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Status
                  </label>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {dv.status || "—"}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    DV Amount
                  </label>
                  <p className="mt-0.5 font-semibold text-[#557992]">
                    {formatCurrency(dv.grand_total)}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Payee
                  </label>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {dv.payee || "—"}
                  </p>
                </div>

                <div>
                  <label className="text-xs text-slate-500">
                    Payor
                  </label>
                  <p className="mt-0.5 font-medium text-slate-800">
                    {dv.payor || "—"}
                  </p>
                </div>

                <div className="col-span-2 sm:col-span-3 lg:col-span-4">
                  <label className="text-xs text-slate-500">
                    Particulars
                  </label>
                  <p className="mt-0.5 line-clamp-2 whitespace-pre-wrap text-xs text-slate-700">
                    {dv.particulars || "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* OBR DETAILS - ONE LINE PER OBR */}
            <section className="rounded-lg border border-[#C7D8E3] bg-white p-2.5">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#557992]">
                  <Receipt className="h-4 w-4" />
                  Obligation Request Details
                </div>

                <span className="rounded-full bg-[#EAF1F6] px-2.5 py-1 text-xs font-medium text-[#557992]">
                  {(dv.obrs || []).length} OBR(s)
                </span>
              </div>

              {!dv.obrs || dv.obrs.length === 0 ? (
                <div className="rounded-md bg-slate-50 p-3 text-center text-xs text-slate-500">
                  No linked OBR details were returned for this DV.
                </div>
              ) : (
                <div className="overflow-hidden rounded-md border border-slate-200">
                  <div className="divide-y divide-slate-200">
                    {dv.obrs.map((obr, index) => (
                      <div
                        key={obr.id || index}
                        className="flex min-w-0 items-center gap-2 px-2.5 py-1.5 transition hover:bg-slate-50"
                      >
                        <span className="shrink-0 text-xs font-semibold text-slate-800">
                          {obr.obr_no || "—"}
                        </span>

                        <span className="shrink-0 text-[11px] text-slate-400">
                          {formatDate(obr.obr_date)}
                        </span>

                        <p className="min-w-0 flex-1 truncate text-xs text-slate-500">
                          {obr.particulars || "No particulars"}
                          {obr.payee && obr.payee !== dv.payee
                            ? ` • Payee: ${obr.payee}`
                            : ""}
                        </p>

                        <span className="shrink-0 text-right text-xs font-semibold text-[#557992]">
                          {formatCurrency(obr.amount || 0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TOTALS */}
              <div className="mt-1.5 flex flex-col gap-1.5 rounded-md bg-[#EAF1F6] px-2.5 py-1.5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-[11px] text-slate-500">
                    Total Linked OBR Amount
                  </p>
                  <p className="text-sm font-bold text-[#557992]">
                    {formatCurrency(obrTotal)}
                  </p>
                </div>

                <div className="sm:text-right">
                  <p className="text-[11px] text-slate-500">
                    DV Grand Total
                  </p>
                  <p className="text-sm font-bold text-slate-800">
                    {formatCurrency(dvAmount)}
                  </p>
                </div>
              </div>
            </section>

            {/* CHECK INFORMATION */}
            <section className="rounded-lg border border-[#C7D8E3] bg-white p-2.5">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#557992]">
                <Wallet className="h-4 w-4" />
                Check Information
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                {/* BANK ACCOUNT */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Bank Account <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    required
                    className={fieldClass}
                  >
                    <option value="">Select bank account</option>

                    {bankAccounts.map((account) => (
                      <option key={account.id} value={account.id}>
                        {account.account_name} — {account.account_number}
                      </option>
                    ))}
                  </select>
                </div>

                {/* REGISTERED BOOKLET */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Registered Check Booklet{" "}
                    <span className="text-red-500">*</span>
                  </label>

                  <select
                    value={selectedBookletId}
                    onChange={(e) => setSelectedBookletId(e.target.value)}
                    disabled={!bankAccountId || loadingChecks}
                    required
                    className={fieldClass}
                  >
                    <option value="">
                      {loadingChecks
                        ? "Loading registered checks..."
                        : !bankAccountId
                        ? "Select bank account first"
                        : availableChecks.length === 0
                        ? "No available registered checks"
                        : "Select registered booklet"}
                    </option>

                    {availableChecks.map((booklet) => (
                      <option key={booklet.id} value={booklet.id}>
                        {booklet.booklet_number} — Check No.{" "}
                        {booklet.current_check_no}
                      </option>
                    ))}
                  </select>

                  {loadingChecks && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Loading registered checks...
                    </div>
                  )}
                </div>
              </div>

              {/* CHECK NUMBER, DATE AND REMARKS */}
              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3">

                {/* CHECK NUMBER */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Check Number
                  </label>

                  <input
                    type="text"
                    value={checkNumber}
                    readOnly
                    className={`${fieldClass} font-semibold text-slate-800`}
                  />

                  <p className="mt-1 text-[11px] text-slate-500">
                    Automatically determined.
                  </p>
                </div>

                {/* CHECK DATE */}
                <div>
                  <label className="mb-1 flex items-center gap-2 text-xs font-medium text-slate-700">
                    <CalendarDays className="h-3.5 w-3.5 text-[#6689A5]" />
                    Check Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    required
                    className={fieldClass}
                  />
                </div>

                {/* REMARKS */}
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Remarks
                  </label>

                  <input
                    type="text"
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    placeholder="Optional remarks..."
                    className={fieldClass}
                  />
                </div>
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <div className="flex flex-col-reverse gap-2 border-t border-[#C7D8E3] bg-white px-3 py-2 sm:flex-row sm:justify-end sm:px-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                saving ||
                loadingChecks ||
                !bankAccountId ||
                !selectedBookletId ||
                !checkNumber
              }
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6689A5] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#557992] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Assigning..." : "Assign Check"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}