
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileCheck2,
  RefreshCw,
  Wallet,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";

import AvailableDV, {
  type DVRecord,
} from "@/app/(office)/budget/components/check-issuance/AvailableDV";

import CheckAssignModal from "@/app/(office)/budget/components/check-issuance/CheckAssignModal";

type BankAccount = {
  id: string;
  account_number: string;
  account_code?: string;
  account_name: string;
  bank_id?: string;
  fund_source_id?: string;
  deposit_label?: string;
};

export default function CheckAssignPage() {
  const [dvs, setDvs] = useState<DVRecord[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  const [loadingDVs, setLoadingDVs] = useState(true);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  const [selectedDV, setSelectedDV] = useState<DVRecord | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const loadDVs = useCallback(async () => {
    try {
      setLoadingDVs(true);

      const response = await fetch(
        "/budget/api/check-issuance/available-dvs",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load available DVs.");
      }

      setDvs(result.data || []);
    } catch (error) {
      console.error("Available DVs error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to Load DVs",
        text:
          error instanceof Error
            ? error.message
            : "Unable to retrieve available DVs.",
      });
    } finally {
      setLoadingDVs(false);
    }
  }, []);

  const loadBankAccounts = useCallback(async () => {
    try {
      setLoadingAccounts(true);

      const response = await fetch(
        "/budget/api/check-issuance/bank-accounts",
        { cache: "no-store" }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load bank accounts.");
      }

      setBankAccounts(result.data || []);
    } catch (error) {
      console.error("Bank accounts error:", error);

      Swal.fire({
        icon: "error",
        title: "Failed to Load Bank Accounts",
        text:
          error instanceof Error
            ? error.message
            : "Unable to retrieve bank accounts.",
      });
    } finally {
      setLoadingAccounts(false);
    }
  }, []);

  const refreshData = useCallback(async () => {
    await Promise.all([loadDVs(), loadBankAccounts()]);
  }, [loadDVs, loadBankAccounts]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleAssign = (dv: DVRecord) => {
    setSelectedDV(dv);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedDV(null);
  };

  const handleAssignmentSuccess = async () => {
    setModalOpen(false);
    setSelectedDV(null);

    await loadDVs();
  };

  const isLoading = loadingDVs || loadingAccounts;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
              <FileCheck2 className="h-6 w-6" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Check Assign
              </h1>

              <p className="mt-1 text-sm text-gray-500">
                Assign registered checks to approved disbursement vouchers.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={refreshData}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                isLoading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Available DVs
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {loadingDVs ? "..." : dvs.length}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Waiting for check assignment
                </p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FileCheck2 className="h-6 w-6" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">
                  Active Bank Accounts
                </p>

                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {loadingAccounts ? "..." : bankAccounts.length}
                </p>

                <p className="mt-1 text-xs text-gray-500">
                  Available bank accounts
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Available DV Table */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-gray-900">
              Available Disbursement Vouchers
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Select a DV to assign a check from a registered check booklet.
            </p>
          </div>

          <AvailableDV
            dvs={dvs}
            loading={loadingDVs}
            onRefresh={loadDVs}
            onAssign={handleAssign}
          />
        </div>
      </div>

      {/* Check Assignment Modal */}
      <CheckAssignModal
        open={modalOpen}
        dv={selectedDV}
        bankAccounts={bankAccounts}
        onClose={handleCloseModal}
        onSuccess={handleAssignmentSuccess}
      />
    </div>
  );
}
