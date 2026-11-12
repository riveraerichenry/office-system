
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Building2, RefreshCw } from "lucide-react";

type OfficeAppropriation = {
  office_id: string;
  office_name: string;
  appropriation: number;
};

type ApiResponse = {
  success: boolean;
  data?: OfficeAppropriation[];
  message?: string;
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);

export default function BudgetUtilizationByOffice() {
  const currentYear = new Date().getFullYear();

  const [fiscalYear, setFiscalYear] = useState(currentYear);
  const [offices, setOffices] = useState<OfficeAppropriation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `/budget/api/dashboard/office-utilization?fiscal_year=${fiscalYear}`,
        { cache: "no-store" }
      );

      const result: ApiResponse = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Failed to load office appropriations."
        );
      }

      setOffices(result.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load office appropriations."
      );
      setOffices([]);
    } finally {
      setLoading(false);
    }
  }, [fiscalYear]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalAppropriation = useMemo(
    () =>
      offices.reduce(
        (sum, office) => sum + Number(office.appropriation || 0),
        0
      ),
    [offices]
  );

  return (
    <section className="xl:col-span-4 rounded-lg border border-[#DCE3E9] bg-white p-3">
      {/* HEADER */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-md bg-[#EAF1F6] p-1.5 text-[#6689A5]">
            <Building2 size={16} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Budget Utilization by Office
            </h2>
            <p className="text-[10px] text-slate-500">
              Appropriations per department
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label
            htmlFor="office-utilization-year"
            className="text-[10px] text-slate-500"
          >
            Fiscal Year
          </label>

          <select
            id="office-utilization-year"
            value={fiscalYear}
            onChange={(event) => setFiscalYear(Number(event.target.value))}
            className="rounded-md border border-[#D5DCE3] bg-white px-2 py-1 text-xs text-slate-700 outline-none focus:border-[#829FB5]"
          >
            {Array.from(
              { length: 7 },
              (_, index) => currentYear - 3 + index
            ).map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
            title="Refresh"
            className="rounded-md border border-[#D5DCE3] p-1.5 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw
              size={13}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* TOTAL APPROPRIATION */}
      <div className="mb-3 flex items-center justify-between rounded-md bg-[#F7F9FA] px-3 py-2">
        <div>
          <p className="text-[10px] text-slate-500">
            Total Appropriations
          </p>
          <p className="text-base font-semibold text-slate-800">
            {formatCurrency(totalAppropriation)}
          </p>
        </div>

        <div className="text-right">
          <p className="text-[10px] text-slate-500">Departments</p>
          <p className="text-sm font-semibold text-slate-700">
            {offices.length}
          </p>
        </div>
      </div>

      {/* SCROLLABLE OFFICE LIST */}
      {loading ? (
        <div className="py-5 text-center text-xs text-slate-500">
          Loading office appropriations...
        </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      ) : offices.length === 0 ? (
        <div className="py-5 text-center text-xs text-slate-500">
          No offices found.
        </div>
      ) : (
        <div className="max-h-[320px] overflow-y-auto overscroll-contain pr-2">
          <div className="divide-y divide-slate-100">
            {offices.map((office) => {
              const amount = Number(office.appropriation || 0);

              const share =
                totalAppropriation > 0
                  ? (amount / totalAppropriation) * 100
                  : 0;

              return (
                <div
                  key={office.office_id}
                  className="py-2 first:pt-1 last:pb-1"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="min-w-0 truncate text-xs font-medium text-slate-700">
                      {office.office_name}
                    </span>

                    <div className="flex shrink-0 items-center gap-3">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {formatCurrency(amount)}
                      </span>

                      <span className="w-12 text-right text-[10px] font-medium text-slate-500">
                        {share.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#829FB5] transition-all"
                      style={{
                        width: `${Math.min(share, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="mt-2 border-t border-slate-100 pt-2 text-[9px] text-slate-400">
        Percentage represents each office&apos;s share of total appropriations.
      </div>
    </section>
  );
}
