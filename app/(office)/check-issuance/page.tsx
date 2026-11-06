"use client";

import { useCallback, useEffect, useState } from "react";
import { ClipboardCheck } from "lucide-react";
import Swal from "sweetalert2";

import IssuedChecksTable, {
  type IssuedCheck,
} from "@/components/check-issuance/IssuedCheckTable";

import IssuedCheckDetailsModal from "@/components/check-issuance/IssuedCheckDetailsModal";

import AvailableChecks, {
  type AvailableCheck,
} from "@/components/check-issuance/AvailableChecks";

import IssueCheckModal, {
  type CheckPrintInfo,
} from "@/components/check-issuance/IssueCheckModal";

import type { IssueCheckForm } from "@/components/check-issuance/IssueCheckTypes";

import CheckIssuancePrint from "@/components/check-issuance/print/CheckIssuancePrint";

import type {
  CheckPrintDetails,
} from "@/components/check-issuance/print/printTypes";


import GenerateRCIModal from "@/components/check-issuance/GenerateRCIModal";

type IssuedChecksResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: IssuedCheck[];
};

type IssueApiResponse = {
  success: boolean;
  message?: string;
  error?: string;
  data?: {
    transaction?: Record<string, unknown>;
    item_count?: number;
    total_amount?: number | string;
    issued_check_number?: string;
    booklet?: Record<string, unknown>;
  };
};

export default function CheckIssuancePage() {
  const [issuedChecks, setIssuedChecks] = useState<IssuedCheck[]>([]);
  const [loadingChecks, setLoadingChecks] = useState(true);

  const [selectedBooklet, setSelectedBooklet] =
    useState<AvailableCheck | null>(null);

  const [selectedIssuedCheck, setSelectedIssuedCheck] =
    useState<IssuedCheck | null>(null);

  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [saving, setSaving] = useState(false);

  const [printDetails, setPrintDetails] =
    useState<CheckPrintDetails | null>(null);

  const [shouldPrint, setShouldPrint] = useState(false);

  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // =====================================================
  // RCI
  // =====================================================

  const [isRCIModalOpen, setIsRCIModalOpen] = useState(false);


  // =====================================================
  // FETCH ISSUED CHECKS
  // =====================================================

  const fetchIssuedChecks = useCallback(async () => {
    setLoadingChecks(true);

    try {
      const response = await fetch("/api/check-issuance", {
        method: "GET",
        cache: "no-store",
      });

      const result: IssuedChecksResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            "Failed to retrieve issued checks."
        );
      }

      setIssuedChecks(
        Array.isArray(result.data) ? result.data : []
      );
    } catch (error) {
      console.error("Fetch issued checks error:", error);

      setIssuedChecks([]);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "Unable to load issued checks.",
      });
    } finally {
      setLoadingChecks(false);
    }
  }, []);

  useEffect(() => {
    void fetchIssuedChecks();
  }, [fetchIssuedChecks]);

  // =====================================================
  // VIEW CHECK DETAILS
  // =====================================================

  function handleView(check: IssuedCheck) {
    setSelectedIssuedCheck(check);
    setIsDetailsModalOpen(true);
  }

  function handleCloseDetails() {
    setIsDetailsModalOpen(false);
    setSelectedIssuedCheck(null);
  }

  // =====================================================
  // SELECT AVAILABLE CHECK
  // =====================================================

  function handleSelectAvailableCheck(booklet: AvailableCheck) {
    if (saving) return;

    setMessage(null);
    setSelectedBooklet(booklet);
    setIsIssueModalOpen(true);
  }

  function handleCloseModal() {
    if (saving) return;

    setIsIssueModalOpen(false);
    setSelectedBooklet(null);
  }

  // =====================================================
  // PRINT AFTER SUCCESSFUL SAVE
  // REFRESH AFTER PRINT DIALOG CLOSES
  // =====================================================

  useEffect(() => {
    if (!shouldPrint || !printDetails) return;

    const handleAfterPrint = () => {
      setShouldPrint(false);
      setPrintDetails(null);

      // REFRESH PAGE AFTER PRINT DIALOG CLOSES
      window.location.reload();
    };

    window.addEventListener("afterprint", handleAfterPrint);

    const timer = window.setTimeout(() => {
      window.print();
    }, 400);

    return () => {
      window.clearTimeout(timer);

      window.removeEventListener(
        "afterprint",
        handleAfterPrint
      );
    };
  }, [shouldPrint, printDetails]);

  // =====================================================
  // ISSUE CHECK
  // =====================================================

  async function handleIssueCheck(
    data: IssueCheckForm,
    printInfo: CheckPrintInfo
  ) {
    if (!selectedBooklet || saving) return;

    setSaving(true);
    setMessage(null);

    try {
      const payload = {
        ...data,
        booklet_id: selectedBooklet.id,
        booklet_number: selectedBooklet.booklet_number,
        check_number: selectedBooklet.check_number,
        bank_id: selectedBooklet.bank_id,
        bank_account_id: selectedBooklet.bank_account_id,
        fund_source_id: selectedBooklet.fund_source_id,
      };

      const response = await fetch("/api/check-issuance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const result: IssueApiResponse = await response
        .json()
        .catch(() => ({
          success: false,
          error: "The server returned an invalid response.",
        }));

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            result.message ||
            `Failed to save check issuance (HTTP ${response.status}).`
        );
      }

      // =================================================
      // SAVE SUCCESSFUL
      // STOP SAVING OVERLAY IMMEDIATELY
      // =================================================

      setSaving(false);

      const transaction = result.data?.transaction;

      const issuedCheckNumber =
        result.data?.issued_check_number ||
        String(transaction?.check_number ?? data.check_number);

      const totalAmount = Number(
        result.data?.total_amount ?? data.grand_total
      );

      // =================================================
      // CLOSE ISSUE MODAL
      // =================================================

      setIsIssueModalOpen(false);
      setSelectedBooklet(null);

      // =================================================
      // REFRESH ISSUED CHECKS
      // =================================================

      await fetchIssuedChecks();

      // =================================================
      // PREPARE PRINT DETAILS
      // =================================================

      const details: CheckPrintDetails = {
        check_date: data.check_date,
        payee: data.payee,
        total_amount: totalAmount,
        bank_code: data.bank_code,
        signatory_1_name: printInfo.signatory1.name,
        signatory_1_position: printInfo.signatory1.position,
        signatory_2_name: printInfo.signatory2.name,
        signatory_2_position: printInfo.signatory2.position,
      };

      // =================================================
      // SUCCESS POPUP
      // =================================================

      const swalResult = await Swal.fire({
        icon: "success",
        title: "Check Issued Successfully!",
        html: `
          <div style="text-align:left; font-size:14px; line-height:1.8;">
            <p>
              <strong>Check Number:</strong>
              ${issuedCheckNumber}
            </p>

            <p>
              <strong>Payee:</strong>
              ${data.payee}
            </p>

            <p>
              <strong>Amount:</strong>
              ${new Intl.NumberFormat("en-PH", {
                style: "currency",
                currency: "PHP",
                minimumFractionDigits: 2,
              }).format(totalAmount)}
            </p>

            <p>
              <strong>Bank:</strong>
              ${data.bank_name}
            </p>
          </div>
        `,
        showCancelButton: true,
        confirmButtonText: "Print Now",
        cancelButtonText: "Close",
        confirmButtonColor: "#2563eb",
        cancelButtonColor: "#64748b",
        reverseButtons: true,
        allowOutsideClick: false,
      });

      // =================================================
      // PRINT NOW
      // =================================================

      if (swalResult.isConfirmed) {
        setPrintDetails(details);
        setShouldPrint(true);
      } else {
        // =================================================
        // CLOSE OR DISMISS SUCCESS POPUP
        // REFRESH PAGE
        // =================================================

        window.location.reload();
      }

    } catch (error) {
      console.error("Check issuance error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "An unexpected error occurred while saving.";

      setMessage({
        type: "error",
        text: errorMessage,
      });

      await Swal.fire({
        icon: "error",
        title: "Unable to Issue Check",
        text: errorMessage,
        confirmButtonText: "OK",
        confirmButtonColor: "#dc2626",
      });

      throw error;

    } finally {
      // SAFETY: ENSURE OVERLAY IS ALWAYS REMOVED
      setSaving(false);
    }
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px] space-y-6">

        {/* PAGE HEADER */}
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
            <ClipboardCheck size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Check Issuance
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage issued checks and available check booklets.
            </p>
          </div>
        </div>

        {/* SUCCESS / ERROR MESSAGE */}
        {message && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span>{message.text}</span>

              <button
                type="button"
                onClick={() => setMessage(null)}
                className="font-semibold hover:opacity-70"
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* MAIN CONTENT */}
        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,1fr)]">

          {/* ISSUED CHECKS */}
          <section className="min-w-0">
            <IssuedChecksTable
              rows={issuedChecks}
              loading={loadingChecks}
              onView={handleView}
              onGenerateRCI={() => setIsRCIModalOpen(true)}
            />
          </section>

          {/* AVAILABLE CHECKS */}
          <section className="min-w-0">
            <AvailableChecks
              onSelect={handleSelectAvailableCheck}
            />
          </section>
        </div>
      </div>

      {/* ISSUE CHECK MODAL */}
      <IssueCheckModal
        open={isIssueModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleIssueCheck}
        selectedBooklet={selectedBooklet}
      />

      {/* ISSUED CHECK DETAILS MODAL */}
      <IssuedCheckDetailsModal
        open={isDetailsModalOpen}
        check={selectedIssuedCheck}
        onClose={handleCloseDetails}
      />

      
      <GenerateRCIModal
        open={isRCIModalOpen}
        onClose={() => setIsRCIModalOpen(false)}
      />



      {/* PRINT COMPONENT */}
      {printDetails && (
        <CheckIssuancePrint details={printDetails} />
      )}

      {/* SAVING OVERLAY */}
      {saving && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 p-4">
          <div className="rounded-xl bg-white px-6 py-5 text-center shadow-xl">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />

            <p className="text-sm font-semibold text-slate-800">
              Saving check issuance...
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Please wait while the transaction is being saved.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}