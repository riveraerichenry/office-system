"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { X, ClipboardCheck } from "lucide-react";

import type { AvailableCheck } from "@/components/check-issuance/AvailableChecks";

import type {
  Signatory,
  IssueCheckItem,
  IssueCheckForm,
} from "./IssueCheckTypes";

import IssueCheckDetails from "./IssueCheckDetails";
import IssueCheckItems from "./IssueCheckItems";

export type SignatoryPrintInfo = {
  name: string;
  position: string;
};

export type CheckPrintInfo = {
  signatory1: SignatoryPrintInfo;
  signatory2: SignatoryPrintInfo;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    data: IssueCheckForm,
    printInfo: CheckPrintInfo
  ) => Promise<void>;
  selectedBooklet: AvailableCheck | null;
};

function getToday() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatPHP(amount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}

function getSignatoryPrintInfo(
  signatory: Signatory | undefined
): SignatoryPrintInfo {
  if (!signatory) {
    return {
      name: "",
      position: "",
    };
  }

  const record = signatory as unknown as Record<string, unknown>;

  const name =
    record.full_name ??
    record.name ??
    record.signatory_name ??
    record.employee_name ??
    "";

  const position =
    record.position ??
    record.position_title ??
    record.designation ??
    record.job_title ??
    "";

  return {
    name: String(name),
    position: String(position),
  };
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

  const [items, setItems] = useState<IssueCheckItem[]>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // =====================================================
  // FETCH SIGNATORIES
  // =====================================================

  const fetchSignatories = useCallback(
    async (signal?: AbortSignal) => {
      setLoadingSignatories(true);
      setSignatoryError("");

      try {
        const response = await fetch("/api/signatories", {
          signal,
          cache: "no-store",
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result.error || "Unable to load signatories."
          );
        }

        const records = Array.isArray(result)
          ? result
          : Array.isArray(result.data)
            ? result.data
            : [];

        setSignatories(records);
      } catch (err) {
        if (signal?.aborted) return;

        console.error(err);

        setSignatoryError(
          err instanceof Error
            ? err.message
            : "Failed to load signatories."
        );
      } finally {
        if (!signal?.aborted) {
          setLoadingSignatories(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!open) return;

    const controller = new AbortController();

    void fetchSignatories(controller.signal);

    return () => controller.abort();
  }, [open, fetchSignatories]);

  // =====================================================
  // RESET FORM
  // =====================================================

  useEffect(() => {
    if (!open) return;

    setDvNo("");
    setCheckDate(getToday());
    setPayee("");
    setPayor("");
    setSignatory1("");
    setSignatory2("");
    setParticulars("");
    setItems([]);
    setError("");
    setSubmitting(false);
  }, [open, selectedBooklet?.id]);

  // =====================================================
  // GRAND TOTAL
  // =====================================================

  const grandTotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + (Number(item.total_debit) || 0),
        0
      ),
    [items]
  );

  // =====================================================
  // BOOKLET INFORMATION
  // =====================================================

  const issued = Number(selectedBooklet?.issued_checks ?? 0);
  const total = Number(selectedBooklet?.total_checks ?? 0);
  const remaining = Number(
    selectedBooklet?.remaining_checks ?? 0
  );

  const usedPercentage =
    total > 0 ? Math.min(100, (issued / total) * 100) : 0;

  if (!open || !selectedBooklet) return null;

  // =====================================================
  // SUBMIT FORM
  // =====================================================

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (submitting) return;

    setError("");

    if (!selectedBooklet) {
      setError("Please select a check booklet.");
      return;
    }

    if (
      !selectedBooklet.check_number?.trim() ||
      remaining <= 0
    ) {
      setError("The selected booklet has no available check.");
      return;
    }

    if (!dvNo.trim()) {
      setError("Please enter the DV number.");
      return;
    }

    if (!checkDate) {
      setError("Please select the check date.");
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
      setError(
        "Signatory 1 and Signatory 2 must be different."
      );
      return;
    }

    if (items.length === 0) {
      setError("Please add at least one transaction item.");
      return;
    }

    if (items.some((item) => !item.obr_no.trim())) {
      setError("Please enter an OBR number for every item.");
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
      setError(
        "Every transaction item needs a debit amount greater than zero."
      );
      return;
    }

    const selectedSignatory1 = signatories.find(
      (item) => String(item.id) === signatory1
    );

    const selectedSignatory2 = signatories.find(
      (item) => String(item.id) === signatory2
    );

    if (!selectedSignatory1 || !selectedSignatory2) {
      setError(
        "Unable to retrieve the selected signatory information. Please reload the signatories."
      );
      return;
    }

    const printInfo: CheckPrintInfo = {
      signatory1: getSignatoryPrintInfo(selectedSignatory1),
      signatory2: getSignatoryPrintInfo(selectedSignatory2),
    };

    const payload: IssueCheckForm = {
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
      bank_code: selectedBooklet.bank_code ?? "",
      account_number: selectedBooklet.account_number,
      particulars: particulars.trim(),
      items,
      grand_total: grandTotal,
    };

    setSubmitting(true);

    try {
      await onSubmit(payload, printInfo);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save check issuance."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-3 sm:p-6"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !submitting
        ) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="issue-check-title"
        className="flex max-h-[95vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
      >
        {/* HEADER */}
        <header className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-6">
          <div className="flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <ClipboardCheck
                  className="text-blue-600"
                  size={21}
                />

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
                  <b className="text-emerald-600">
                    {remaining}
                  </b>
                </span>
              </div>
            </div>

            <div className="hidden min-w-[150px] rounded-xl bg-blue-600 px-4 py-3 text-center text-white sm:block">
              <p className="text-xs text-blue-100">
                Current Check No.
              </p>

              <p className="mt-1 text-2xl font-extrabold">
                {selectedBooklet.check_number || "—"}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              aria-label="Close modal"
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-40"
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
            {/* GENERAL ERROR */}
            {error && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </div>
            )}

            {/* TRANSACTION DETAILS */}
            <IssueCheckDetails
              dvNo={dvNo}
              setDvNo={setDvNo}
              checkDate={checkDate}
              setCheckDate={setCheckDate}
              payee={payee}
              setPayee={setPayee}
              payor={payor}
              setPayor={setPayor}
              signatory1={signatory1}
              setSignatory1={setSignatory1}
              signatory2={signatory2}
              setSignatory2={setSignatory2}
              particulars={particulars}
              setParticulars={setParticulars}
              signatories={signatories}
              loadingSignatories={loadingSignatories}
              signatoryError={signatoryError}
              onRetrySignatories={() =>
                void fetchSignatories()
              }
            />

            {/* TRANSACTION ITEMS */}
            <section className="overflow-hidden rounded-xl border border-slate-200">
              <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Transaction Items
                </h3>
              </div>

              <div className="p-4">
                <IssueCheckItems
                  items={items}
                  onItemsChange={setItems}
                />
              </div>
            </section>

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
                <p>
                  Check No.:{" "}
                  {selectedBooklet.check_number || "—"}
                </p>
                <p>Fund: {selectedBooklet.fund_source}</p>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="flex shrink-0 justify-end gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:px-6">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                submitting ||
                remaining <= 0 ||
                !selectedBooklet.check_number ||
                loadingSignatories ||
                signatories.length < 2
              }
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {submitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Saving...
                </>
              ) : (
                <>
                  <ClipboardCheck size={17} />
                  Save Transaction
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}