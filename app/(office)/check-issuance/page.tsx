"use client";

import { useState } from "react";
import { ClipboardCheck } from "lucide-react";

import IssuedChecksTable from "@/components/check-issuance/IssuedCheckTable";
import AvailableChecks, {
  type AvailableCheck,
} from "@/components/check-issuance/AvailableChecks";
import IssueCheckModal, {
  type IssueCheckForm,
} from "@/components/check-issuance/IssueCheckModal";

type IssuedCheck = {
  id: string | number;
  check_number: string;
  issue_date: string | null;
  payee: string;
  fund_source: string;
  bank_name: string;
  account_number: string;
  amount: number | string;
  status: string;
  booklet_number?: string | null;
};

export default function CheckIssuancePage() {
  const [issuedChecks] = useState<IssuedCheck[]>([]);
  const [selectedBooklet, setSelectedBooklet] =
    useState<AvailableCheck | null>(null);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  function handleView(check: IssuedCheck) {
    console.log("Selected issued check:", check);
  }

  function handleSelectAvailableCheck(booklet: AvailableCheck) {
    setMessage(null);
    setSelectedBooklet(booklet);
    setIsIssueModalOpen(true);
  }

  function handleCloseModal() {
    if (saving) return;

    setIsIssueModalOpen(false);
    setSelectedBooklet(null);
  }

  async function handleIssueCheck(data: IssueCheckForm) {
    if (!selectedBooklet || saving) return;

    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch("/api/check-issuance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          bank_id: selectedBooklet.bank_id,
          bank_account_id: selectedBooklet.bank_account_id,
          fund_source_id: selectedBooklet.fund_source_id,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.error ||
            `Failed to save check issuance (HTTP ${response.status}).`
        );
      }

      setMessage({
        type: "success",
        text: result?.message || "Check issuance saved successfully.",
      });

      setIsIssueModalOpen(false);
      setSelectedBooklet(null);

      // Refresh issued-check records here after implementing the GET API.
      // Refresh available booklets so the remaining check count is updated.
    } catch (error) {
      console.error("Check issuance error:", error);

      setMessage({
        type: "error",
        text:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while saving.",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1800px] space-y-6">
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

        {message && (
          <div
            role="alert"
            className={`rounded-xl border px-4 py-3 text-sm ${
              message.type === "success"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-red-200 bg-red-50 text-red-800"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(360px,1fr)]">
          <section className="min-w-0">
            <IssuedChecksTable
              rows={issuedChecks}
              loading={false}
              onView={handleView}
            />
          </section>

          <section className="min-w-0">
            <AvailableChecks onSelect={handleSelectAvailableCheck} />
          </section>
        </div>
      </div>

      <IssueCheckModal
        open={isIssueModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleIssueCheck}
        selectedBooklet={selectedBooklet}
      />

      {saving && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 p-4">
          <div className="rounded-xl bg-white px-6 py-5 text-center shadow-xl">
            <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
            <p className="text-sm font-semibold text-slate-800">
              Saving check issuance...
            </p>
          </div>
        </div>
      )}
    </main>
  );
}