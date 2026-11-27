"use client";

import { useMemo, useState } from "react";
import {
  X,
  Calculator,
  PencilLine,
  Receipt,
} from "lucide-react";

import { generateUUID } from "@/lib/generateUUID";

import type {
  DVItem,
  DVDeduction,
  DVDeductionComputationMethod,
} from "./types";

type Props = {
  items: DVItem[];
  onClose: () => void;
  onSave: (deduction: DVDeduction) => void;
  initialData?: DVDeduction | null;
};

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

const inputClass =
  "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-[#6689A5] focus:ring-2 focus:ring-[#6689A5]/20";

const labelClass =
  "mb-1.5 block text-xs font-semibold text-slate-600";

export default function DVDeductionModal({
  items,
  onClose,
  onSave,
  initialData,
}: Props) {
  // Kept for compatibility with DVFormModal.
  // This simplified deduction is no longer allocated per DV item.
  void items;

  const [deductionName, setDeductionName] = useState(
    initialData?.deduction_name ?? ""
  );

  const [deductionType, setDeductionType] =
    useState<DVDeductionComputationMethod>(
      initialData?.deduction_type ?? "MANUAL"
    );

  const [basisAmount, setBasisAmount] = useState<number>(
    Number(initialData?.basis_amount) || 0
  );

  const [rate, setRate] = useState<number>(
    Number(initialData?.rate) || 0
  );

  const [deductionAmount, setDeductionAmount] = useState<number>(
    Number(initialData?.deduction_amount) || 0
  );

  const [remarks, setRemarks] = useState(
    initialData?.remarks ?? ""
  );

  const [error, setError] = useState("");

  const computedAmount = useMemo(() => {
    if (deductionType !== "PERCENTAGE") {
      return Number(deductionAmount) || 0;
    }

    return Number(
      ((Number(basisAmount) * Number(rate)) / 100).toFixed(2)
    );
  }, [deductionType, basisAmount, rate, deductionAmount]);

  function handleTypeChange(
    newType: DVDeductionComputationMethod
  ) {
    setDeductionType(newType);
    setError("");

    if (newType !== "PERCENTAGE") {
      setBasisAmount(0);
      setRate(0);
    } else {
      setDeductionAmount(0);
    }
  }

  function handleSubmit() {
    setError("");

    if (!deductionName.trim()) {
      setError("Deduction name is required.");
      return;
    }

    if (deductionType === "PERCENTAGE") {
      if (basisAmount <= 0) {
        setError("Basis amount must be greater than zero.");
        return;
      }

      if (rate < 0) {
        setError("Rate cannot be negative.");
        return;
      }
    } else {
      if (!Number.isFinite(deductionAmount) || deductionAmount <= 0) {
        setError("Deduction amount must be greater than zero.");
        return;
      }
    }

    if (computedAmount <= 0) {
      setError("Deduction amount must be greater than zero.");
      return;
    }

    const deduction: DVDeduction = {
      id: initialData?.id ?? generateUUID(),
      deduction_name: deductionName.trim(),
      deduction_type: deductionType,
      basis_amount:
        deductionType === "PERCENTAGE"
          ? Number(basisAmount)
          : 0,
      rate:
        deductionType === "PERCENTAGE"
          ? Number(rate)
          : 0,
      deduction_amount: Number(computedAmount.toFixed(2)),
      remarks: remarks.trim(),
    };

    onSave(deduction);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/50 p-2 backdrop-blur-[2px]">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}

        <header className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Receipt size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {initialData
                  ? "Edit Deduction"
                  : "Add Deduction"}
              </h2>

              <p className="text-xs text-slate-500">
                Enter deduction details and amount.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60"
          >
            <X size={18} />
          </button>
        </header>

        {/* CONTENT */}

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 sm:p-5">

          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* BASIC DETAILS */}

          <section className="rounded-md border border-slate-200 bg-white p-4">
            <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-[#557992]">
              Deduction Information
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* NAME */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Deduction Name
                </label>

                <input
                  value={deductionName}
                  onChange={(e) =>
                    setDeductionName(e.target.value)
                  }
                  placeholder="e.g. Withholding Tax, Retention, Liquidated Damages"
                  className={inputClass}
                />
              </div>

              {/* TYPE */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Computation Type
                </label>

                <select
                  value={deductionType}
                  onChange={(e) =>
                    handleTypeChange(
                      e.target.value as DVDeductionComputationMethod
                    )
                  }
                  className={inputClass}
                >
                  <option value="PERCENTAGE">
                    Percentage
                  </option>

                  <option value="FIXED">
                    Fixed Amount
                  </option>

                  <option value="MANUAL">
                    Manual Entry
                  </option>
                </select>
              </div>

              {/* REMARKS */}

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Remarks
                </label>

                <textarea
                  value={remarks}
                  onChange={(e) =>
                    setRemarks(e.target.value)
                  }
                  rows={2}
                  placeholder="Optional remarks"
                  className={inputClass}
                />
              </div>
            </div>
          </section>

          {/* COMPUTATION */}

          <section className="rounded-md border border-slate-200 bg-white p-4">

            <div className="mb-4 flex items-center gap-2 border-b border-slate-200 pb-2">
              {deductionType === "PERCENTAGE" ? (
                <Calculator
                  size={16}
                  className="text-[#6689A5]"
                />
              ) : (
                <PencilLine
                  size={16}
                  className="text-[#6689A5]"
                />
              )}

              <h3 className="text-sm font-semibold text-[#557992]">
                {deductionType === "PERCENTAGE"
                  ? "Percentage Computation"
                  : deductionType === "FIXED"
                    ? "Fixed Deduction Amount"
                    : "Manual Deduction"}
              </h3>
            </div>

            {/* PERCENTAGE */}

            {deductionType === "PERCENTAGE" && (
              <div className="space-y-4">

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                  {/* BASIS */}

                  <div>
                    <label className={labelClass}>
                      Basis Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={basisAmount || ""}
                      onChange={(e) =>
                        setBasisAmount(
                          Number(e.target.value) || 0
                        )
                      }
                      placeholder="0.00"
                      className={inputClass}
                    />
                  </div>

                  {/* RATE */}

                  <div>
                    <label className={labelClass}>
                      Rate (%)
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.0001"
                      value={rate || ""}
                      onChange={(e) =>
                        setRate(
                          Number(e.target.value) || 0
                        )
                      }
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>

                  {/* RESULT */}

                  <div>
                    <label className={labelClass}>
                      Computed Amount
                    </label>

                    <input
                      value={peso(computedAmount)}
                      readOnly
                      className={`${inputClass} bg-slate-100 font-semibold`}
                    />
                  </div>
                </div>

                <div className="rounded-md border border-[#D5E3EC] bg-[#EDF3F7] p-3">
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">
                      Computation:
                    </span>{" "}
                    {peso(basisAmount)} × {rate}% ={" "}
                    <span className="font-semibold text-[#557992]">
                      {peso(computedAmount)}
                    </span>
                  </p>
                </div>
              </div>
            )}

            {/* FIXED */}

            {deductionType === "FIXED" && (
              <div>
                <label className={labelClass}>
                  Fixed Deduction Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deductionAmount || ""}
                  onChange={(e) =>
                    setDeductionAmount(
                      Number(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  className={inputClass}
                />

                <p className="mt-1 text-[10px] text-slate-400">
                  Enter the fixed deduction amount.
                </p>
              </div>
            )}

            {/* MANUAL */}

            {deductionType === "MANUAL" && (
              <div>
                <label className={labelClass}>
                  Deduction Amount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={deductionAmount || ""}
                  onChange={(e) =>
                    setDeductionAmount(
                      Number(e.target.value) || 0
                    )
                  }
                  placeholder="0.00"
                  className={inputClass}
                />

                <p className="mt-1 text-[10px] text-slate-400">
                  Enter the exact deduction amount manually.
                </p>
              </div>
            )}
          </section>

          {/* TOTAL */}

          <section className="rounded-md border border-[#D5E3EC] bg-[#EDF3F7] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase text-[#557992]">
                  Total Deduction
                </p>

                <p className="mt-1 text-xl font-bold text-[#557992]">
                  {peso(computedAmount)}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                {deductionType === "PERCENTAGE"
                  ? `${rate}%`
                  : deductionType === "FIXED"
                    ? "Fixed"
                    : "Manual"}
              </div>
            </div>
          </section>
        </div>

        {/* FOOTER */}

        <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
          <div>
            <p className="text-[10px] text-slate-400">
              DEDUCTION AMOUNT
            </p>

            <p className="text-lg font-bold text-[#557992]">
              {peso(computedAmount)}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              className="rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992]"
            >
              {initialData
                ? "Update Deduction"
                : "Add Deduction"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}