
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Wallet, Plus, RefreshCw, ArrowLeftRight, X } from "lucide-react";

import AppropriationForm from "./AppropriationForm";
import AdjustmentForm from "./AdjustmentForm";
import RealignmentForm from "./RealignmentForm";
import AppropriationsTable from "./AppropriationsTable";

import {
  AccountOption,
  AdjustmentFormData,
  Appropriation,
  AppropriationFormData,
  FundSource,
  RealignmentFormData,
} from "./appropriation-types";

type ModalType = "appropriation" | "adjustment" | "realignment" | null;

const currentYear = new Date().getFullYear();

const API = "/budget/api/appropriations";

const emptyForm = (year: number): AppropriationFormData => ({
  fiscal_year: year,
  appropriation_type: "annual",
  ordinance_no: "",
  ordinance_date: "",
  fund_source_id: "",
  account_id: "",
  appropriated_amount: "",
  remarks: "",
});

const peso = (value: string | number) =>
  Number(value || 0).toLocaleString("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

async function readResponse(response: Response) {
  const contentType = response.headers.get("content-type") || "";

  if (!contentType.includes("application/json")) {
    throw new Error(
      `Server returned a non-JSON response (${response.status}). Please check the API route.`
    );
  }

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Request failed.");
  }

  return result;
}

export default function AppropriationsPage() {
  // =====================================================
  // DATA
  // =====================================================

  const [data, setData] = useState<Appropriation[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);
  const [fundSources, setFundSources] = useState<FundSource[]>([]);

  // =====================================================
  // FILTERS
  // =====================================================

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedFund, setSelectedFund] = useState("all");
  const [search, setSearch] = useState("");

  // =====================================================
  // MODALS
  // =====================================================

  const [modal, setModal] = useState<ModalType>(null);

  const [selectedAppropriation, setSelectedAppropriation] =
    useState<Appropriation | null>(null);

  const [formData, setFormData] = useState<AppropriationFormData>(
    emptyForm(currentYear)
  );

  // =====================================================
  // LOADING AND NOTIFICATIONS
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // =====================================================
  // FISCAL YEARS
  // =====================================================

  const years = useMemo(
    () => Array.from({ length: 11 }, (_, i) => currentYear - 5 + i),
    []
  );

  // =====================================================
  // LOAD DATA
  // =====================================================

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API}?fiscal_year=${selectedYear}`,
        { cache: "no-store" }
      );

      const result = await readResponse(response);

      setData(Array.isArray(result.data) ? result.data : []);
      setAccounts(Array.isArray(result.accounts) ? result.accounts : []);
      setFundSources(
        Array.isArray(result.fundSources) ? result.fundSources : []
      );
    } catch (err) {
      console.error("Load Appropriations Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load appropriations."
      );
    } finally {
      setLoading(false);
    }
  }, [selectedYear]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // =====================================================
  // NOTIFICATION
  // =====================================================

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  // =====================================================
  // FILTER APPROPRIATIONS
  // =====================================================

  const filteredData = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return data.filter((item) => {
      const matchesFund =
        selectedFund === "all" ||
        item.fund_source_id === selectedFund;

      const matchesSearch =
        !keyword ||
        [
          item.ordinance_no,
          item.account_code,
          item.account_name,
          item.office_code,
          item.office_name,
          item.sub_office_code,
          item.sub_office_name,
          item.category_code,
          item.category_name,
          item.fund_code,
          item.fund_name,
        ].some((value) =>
          String(value ?? "").toLowerCase().includes(keyword)
        );

      return matchesFund && matchesSearch;
    });
  }, [data, selectedFund, search]);

  // =====================================================
  // COMPUTE TOTALS
  // =====================================================

  const totals = useMemo(() => {
    return filteredData.reduce(
      (acc, item) => {
        acc.original += Number(item.appropriated_amount || 0);
        acc.increases += Number(item.adjustment_in || 0);
        acc.decreases += Number(item.adjustment_out || 0);
        acc.realignmentIn += Number(item.realignment_in || 0);
        acc.realignmentOut += Number(item.realignment_out || 0);
        acc.adjusted += Number(item.adjusted_amount || 0);

        return acc;
      },
      {
        original: 0,
        increases: 0,
        decreases: 0,
        realignmentIn: 0,
        realignmentOut: 0,
        adjusted: 0,
      }
    );
  }, [filteredData]);

  // =====================================================
  // MODAL HANDLERS
  // =====================================================

  function openAppropriationForm() {
    setError("");
    setFormData(emptyForm(selectedYear));
    setSelectedAppropriation(null);
    setModal("appropriation");
  }

  function openAdjustment(item: Appropriation) {
    setError("");
    setSelectedAppropriation(item);
    setModal("adjustment");
  }

  function openRealignment() {
    setError("");
    setSelectedAppropriation(null);
    setModal("realignment");
  }

  function closeModal() {
    if (saving) return;

    setModal(null);
    setSelectedAppropriation(null);
    setError("");
  }

  // =====================================================
  // SUBMIT TRANSACTION
  // =====================================================

  async function submitAction(
    body:
      | ({ action: "appropriation" } & AppropriationFormData)
      | ({ action: "adjustment" } & AdjustmentFormData)
      | ({ action: "realignment" } & RealignmentFormData)
  ) {
    setSaving(true);
    setError("");

    try {
      const response = await fetch(API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const result = await readResponse(response);

      setModal(null);
      setSelectedAppropriation(null);

      await loadData();

      notify(result.message || "Transaction saved successfully.");
    } catch (err) {
      console.error("Save Appropriation Error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to save transaction."
      );
    } finally {
      setSaving(false);
    }
  }

  // =====================================================
  // SUMMARY CARD
  // =====================================================

  function SummaryCard({
    label,
    value,
    color,
  }: {
    label: string;
    value: string;
    color: "blue" | "green" | "red" | "slate";
  }) {
    const styles = {
      blue: {
        border: "border-[#D6E5EF]",
        icon: "bg-[#EAF2F7] text-[#6689A5]",
      },
      green: {
        border: "border-emerald-100",
        icon: "bg-emerald-50 text-emerald-600",
      },
      red: {
        border: "border-red-100",
        icon: "bg-red-50 text-red-500",
      },
      slate: {
        border: "border-slate-200",
        icon: "bg-slate-100 text-slate-600",
      },
    };

    return (
      <div
        className={`rounded-md border ${styles[color].border} bg-white p-4`}
      >
        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-2 break-words text-xl font-semibold text-slate-800">
          {value}
        </p>
      </div>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">

      {/* ================================================= */}
      {/* PAGE HEADER */}
      {/* ================================================= */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            Budget Management
            <span>/</span>
            Appropriations
          </div>

          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Appropriations
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage annual appropriations, supplemental appropriations,
            adjustments, and realignments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2.5 text-xs font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={15}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openRealignment}
            className="flex items-center gap-2 rounded-md border border-[#6689A5] bg-white px-4 py-2.5 text-xs font-semibold text-[#557992] hover:bg-[#EDF4F8]"
          >
            <ArrowLeftRight size={15} />
            Realignment
          </button>

          <button
            type="button"
            onClick={openAppropriationForm}
            className="flex items-center gap-2 rounded-md bg-[#6689A5] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#557992]"
          >
            <Plus size={16} />
            New Appropriation
          </button>
        </div>
      </div>

      {/* ================================================= */}
      {/* ALERTS */}
      {/* ================================================= */}

      {error && !modal && (
        <div className="mb-5 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {notice && (
        <div className="mb-5 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700">
          {notice}
        </div>
      )}

      {/* ================================================= */}
      {/* SUMMARY CARDS */}
      {/* ================================================= */}

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Original Appropriation"
          value={peso(totals.original)}
          color="blue"
        />

        <SummaryCard
          label="Adjustment Increases"
          value={peso(totals.increases)}
          color="green"
        />

        <SummaryCard
          label="Adjustment Decreases"
          value={peso(totals.decreases)}
          color="red"
        />

        <SummaryCard
          label="Adjusted Appropriation"
          value={peso(totals.adjusted)}
          color="slate"
        />
      </div>

      {/* ================================================= */}
      {/* FILTERS */}
      {/* ================================================= */}

      <div className="mb-5 rounded-md border border-slate-200 bg-white p-4">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

          {/* FISCAL YEAR */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-400">
              Fiscal Year
            </label>

            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none focus:border-[#6689A5]"
            >
              {years.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          {/* FUND SOURCE */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-400">
              Fund Source
            </label>

            <select
              value={selectedFund}
              onChange={(e) => setSelectedFund(e.target.value)}
              className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none focus:border-[#6689A5]"
            >
              <option value="all">All Fund Sources</option>

              {fundSources.map((fund) => (
                <option key={fund.id} value={fund.id}>
                  {fund.fund_code} — {fund.fund_name}
                </option>
              ))}
            </select>
          </div>

          {/* SEARCH */}
          <div>
            <label className="mb-1 block text-[11px] font-medium text-slate-400">
              Search Appropriations
            </label>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search account, office, ordinance..."
              className="w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#6689A5]"
            />
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* APPROPRIATIONS TABLE */}
      {/* ================================================= */}

      <AppropriationsTable
        data={data}
        accounts={accounts}
        loading={loading}
        selectedYear={selectedYear}
        onRefresh={loadData}
        onAdjustment={openAdjustment}
        totals={totals}
      />

      {/* ================================================= */}
      {/* MODALS */}
      {/* ================================================= */}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">

          <div className="max-h-[95vh] w-full max-w-4xl overflow-y-auto rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

            {/* MODAL HEADER */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-5 py-5 sm:px-8">

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#83A8C5] text-white">
                  <Wallet size={25} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-slate-800">
                    {modal === "appropriation"
                      ? "Add Appropriation"
                      : modal === "adjustment"
                        ? "Appropriation Adjustment"
                        : "Appropriation Realignment"}
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {modal === "appropriation"
                      ? "Enter the appropriation and account classification details."
                      : modal === "adjustment"
                        ? "Record an authorized increase or decrease."
                        : "Transfer an amount between appropriation accounts."}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-md p-2 text-slate-500 hover:bg-white/60 disabled:opacity-50"
                aria-label="Close modal"
              >
                <X size={19} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="p-5 sm:p-8">

              {/* NEW APPROPRIATION */}
              {modal === "appropriation" && (
                <AppropriationForm
                  initialData={formData}
                  accounts={accounts}
                  fundSources={fundSources}
                  saving={saving}
                  error={error}
                  currentYear={currentYear}
                  onClose={closeModal}
                  onSubmit={(form) =>
                    void submitAction({
                      action: "appropriation",
                      ...form,
                    })
                  }
                />
              )}

              {/* ADJUSTMENT */}
              {modal === "adjustment" && selectedAppropriation && (
                <AdjustmentForm
                  appropriation={selectedAppropriation}
                  saving={saving}
                  error={error}
                  onClose={closeModal}
                  onSubmit={(form) =>
                    void submitAction({
                      action: "adjustment",
                      ...form,
                    })
                  }
                />
              )}

              {/* REALIGNMENT */}
                {modal === "realignment" && (
                <RealignmentForm
                    appropriations={Array.isArray(data) ? data : []}
                    accounts={Array.isArray(accounts) ? accounts : []}
                    fundSources={Array.isArray(fundSources) ? fundSources : []}
                    currentYear={currentYear}
                    saving={saving}
                    error={error}
                    onClose={closeModal}
                    onSubmit={(form) =>
                    void submitAction({
                        action: "realignment",
                        ...form,
                    })
                    }
                />
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
