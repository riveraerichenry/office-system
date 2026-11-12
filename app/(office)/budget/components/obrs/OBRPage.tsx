
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Plus,
  RefreshCw,
  Receipt,
  FileText,
  Wallet,
} from "lucide-react";

import OBRTable from "./OBRTable";
import OBRFormModal, {
  type OBRFormData,
} from "./OBRFormModal";

import type {
  AccountOption,
  CategoryOption,
  OfficeOption,
  OBRRecord,
  PurchaseRequestOption,
  SubOfficeOption,
} from "./types";

type ApiResult = {
  success: boolean;
  message?: string;
  data?: OBRRecord[];
  purchaseRequests?: PurchaseRequestOption[];
  offices?: OfficeOption[];
  subOffices?: SubOfficeOption[];
  categories?: CategoryOption[];
  accounts?: AccountOption[];
};

const peso = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

export default function OBRPage() {
  const [records, setRecords] = useState<OBRRecord[]>([]);

  const [purchaseRequests, setPurchaseRequests] = useState<
    PurchaseRequestOption[]
  >([]);

  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [subOffices, setSubOffices] = useState<SubOfficeOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [accounts, setAccounts] = useState<AccountOption[]>([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showForm, setShowForm] = useState(false);

  // ===================================================
  // LOAD DATA
  // ===================================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/budget/api/obrs", {
        method: "GET",
        cache: "no-store",
      });

      const result: ApiResult = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to load OBR records."
        );
      }

      setRecords(result.data || []);
      setPurchaseRequests(result.purchaseRequests || []);
      setOffices(result.offices || []);
      setSubOffices(result.subOffices || []);
      setCategories(result.categories || []);
      setAccounts(result.accounts || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load OBR records."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // ===================================================
  // SAVE OBR
  // ===================================================

  const handleSave = async (data: OBRFormData) => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const response = await fetch("/budget/api/obrs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          obr_number: data.obr_number,
          obr_date: data.obr_date,
          payee: data.payee,
          particulars: data.particulars,
          office_id: data.office_id,
          sub_office_id: data.sub_office_id,
          category_id: data.category_id,
          account_id: data.account_id,
          remarks: data.remarks,

          purchase_requests: data.purchase_requests.map((item) => ({
            purchase_request_id: item.purchase_request_id,
            amount: Number(item.amount),
          })),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to save OBR."
        );
      }

      setShowForm(false);
      setSuccess("OBR saved successfully.");

      // Reload OBRs and PR remaining balances.
      await loadData();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save OBR."
      );
    } finally {
      setSaving(false);
    }
  };

  // ===================================================
  // SEARCH
  // ===================================================

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return records;

    return records.filter((record) => {
      const linkedPRs = (
        record.purchase_requests || []
      )
        .map((pr) => pr.pr_number)
        .join(" ");

      return [
        record.obr_number,
        record.payee,
        record.particulars,
        record.office_name,
        record.category_name,
        record.account_name,
        linkedPRs,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        );
    });
  }, [records, search]);

  // ===================================================
  // SUMMARY
  // ===================================================

  const totalAllocation = useMemo(
    () =>
      records.reduce(
        (sum, record) =>
          sum + Number(record.total_allocation || 0),
        0
      ),
    [records]
  );

  const totalLinkedPRs = useMemo(
    () =>
      records.reduce(
        (sum, record) =>
          sum + Number(record.pr_count || 0),
        0
      ),
    [records]
  );

  // ===================================================
  // UI
  // ===================================================

  return (
    <main className="min-h-screen bg-[#F5F7F9] p-4 md:p-6">
      {/* PAGE HEADER */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs text-slate-400">
            Budget Management / OBR
          </p>

          <h1 className="mt-2 text-2xl font-semibold text-slate-800">
            Obligation Requests
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage OBR records and their corresponding Purchase Requests.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setError("");
            setSuccess("");
            setShowForm(true);
          }}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-md bg-[#6689A5] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#557992] disabled:opacity-50"
        >
          <Plus size={17} />
          Add OBR
        </button>
      </div>

      {/* SUMMARY CARDS */}
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard
          label="Total OBR Records"
          value={records.length.toLocaleString("en-PH")}
          icon={<Receipt size={19} />}
        />

        <SummaryCard
          label="Linked Purchase Requests"
          value={totalLinkedPRs.toLocaleString("en-PH")}
          icon={<FileText size={19} />}
        />

        <SummaryCard
          label="Total OBR Allocation"
          value={peso(totalAllocation)}
          icon={<Wallet size={19} />}
        />
      </div>

      {/* SUCCESS MESSAGE */}
      {success && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <span>{success}</span>

          <button
            type="button"
            onClick={() => setSuccess("")}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ERROR MESSAGE */}
      {error && (
        <div className="mb-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span>{error}</span>

          <button
            type="button"
            onClick={() => setError("")}
            className="text-xs font-semibold hover:underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* OBR TABLE */}
      <section className="overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 p-4">
          <div>
            <h2 className="font-semibold text-slate-800">
              OBR Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Each OBR is displayed once, with all linked PRs.
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search OBR, payee, PR number..."
              className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#6689A5] sm:w-72"
            />

            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                size={14}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>
          </div>
        </div>

        <OBRTable
          records={filteredRecords}
          loading={loading}
        />
      </section>

      {/* OBR FORM MODAL */}
      {showForm && (
        <OBRFormModal
          offices={offices}
          subOffices={subOffices}
          categories={categories}
          accounts={accounts}
          purchaseRequests={purchaseRequests}
          onClose={() => {
            if (!saving) {
              setShowForm(false);
            }
          }}
          onSave={handleSave}
        />
      )}
    </main>
  );
}

// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#DCE3E9] bg-white p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#EDF3F7] text-[#6689A5]">
        {icon}
      </div>

      <div className="min-w-0">
        <p className="text-xs text-slate-500">
          {label}
        </p>

        <p className="mt-1 truncate text-lg font-semibold text-slate-800">
          {value}
        </p>
      </div>
    </div>
  );
}
