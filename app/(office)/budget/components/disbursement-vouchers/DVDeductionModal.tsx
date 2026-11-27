

"use client";

import { useMemo, useState } from "react";
import {
  X,
  Plus,
  Trash2,
  Calculator,
  PencilLine,
  Receipt,
} from "lucide-react";

import { generateUUID } from "@/lib/generateUUID";

import type {
  DVItem,
  DVDeduction,
  DVDeductionType,
  DVDeductionMode,
  DVDeductionComputation,
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

function getId() {
  return generateUUID();
}

const deductionTypes: {
  value: DVDeductionType;
  label: string;
}[] = [
  { value: "CWT", label: "Creditable Withholding Tax (CWT/EWT)" },
  { value: "WITHHOLDING_VAT", label: "Withholding VAT" },
  { value: "LIQUIDATED_DAMAGES", label: "Liquidated Damages" },
  { value: "RETENTION", label: "Retention Money" },
  { value: "OTHER", label: "Other Deductions" },
];

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
  const [deductionType, setDeductionType] =
    useState<DVDeductionType>(
      initialData?.deduction_type ?? "OTHER"
    );

  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );

  const [mode, setMode] = useState<DVDeductionMode>(
    initialData?.computation_mode ?? "MANUAL"
  );

  const [referenceNumber, setReferenceNumber] = useState(
    initialData?.reference_number ?? ""
  );

  const [remarks, setRemarks] = useState(
    initialData?.remarks ?? ""
  );

  const [computations, setComputations] =
    useState<DVDeductionComputation[]>(
      initialData?.computations ?? [
        {
          id: getId(),
          dv_item_id: null,
          computation_method: "MANUAL",
          basis_amount: null,
          rate: null,
          computed_amount: 0,
          remarks: "",
        },
      ]
    );

  const [error, setError] = useState("");

  // ============================================================
  // COMPUTATION TOTAL
  // ============================================================

  const totalAmount = useMemo(() => {
    return computations.reduce(
      (sum, computation) =>
        sum + (Number(computation.computed_amount) || 0),
      0
    );
  }, [computations]);

  // ============================================================
  // UPDATE COMPUTATION
  // ============================================================

  function updateComputation(
    id: string,
    updates: Partial<DVDeductionComputation>
  ) {
    setComputations((previous) =>
      previous.map((computation) =>
        computation.id === id
          ? { ...computation, ...updates }
          : computation
      )
    );
  }

  // ============================================================
  // ADD COMPUTATION LINE
  // ============================================================

  function addComputation() {
    setComputations((previous) => [
      ...previous,
      {
        id: getId(),
        dv_item_id: null,
        computation_method:
          mode === "MANUAL" ? "MANUAL" : "PERCENTAGE",
        basis_amount: null,
        rate: null,
        computed_amount: 0,
        remarks: "",
      },
    ]);
  }

  // ============================================================
  // REMOVE COMPUTATION LINE
  // ============================================================

  function removeComputation(id: string) {
    setComputations((previous) =>
      previous.filter((computation) => computation.id !== id)
    );
  }

  // ============================================================
  // CHANGE MODE
  // ============================================================

  function changeMode(newMode: DVDeductionMode) {
    setMode(newMode);

    setComputations([
      {
        id: getId(),
        dv_item_id: null,
        computation_method:
          newMode === "MANUAL" ? "MANUAL" : "PERCENTAGE",
        basis_amount: null,
        rate: null,
        computed_amount: 0,
        remarks: "",
      },
    ]);
  }

  // ============================================================
  // SELECT DV ITEM
  // ============================================================

  function selectDVItem(
    computationId: string,
    dvItemId: string
  ) {
    const selectedItem = items.find(
      (item) => item.id === dvItemId
    );

    if (!selectedItem) {
      updateComputation(computationId, {
        dv_item_id: null,
        basis_amount: null,
        rate: null,
        computed_amount: 0,
      });

      return;
    }

    const amount = Number(selectedItem.obligation_amount) || 0;

    updateComputation(computationId, {
      dv_item_id: selectedItem.id,
      basis_amount: amount,
      computation_method: "PERCENTAGE",
      computed_amount: 0,
      rate: null,
    });
  }

  // ============================================================
  // CALCULATE PERCENTAGE
  // ============================================================

  function calculatePercentage(
    computationId: string,
    basis: number,
    rate: number
  ) {
    const amount = Number(
      ((basis * rate) / 100).toFixed(2)
    );

    updateComputation(computationId, {
      basis_amount: basis,
      rate,
      computed_amount: amount,
      computation_method: "PERCENTAGE",
    });
  }

  // ============================================================
  // SUBMIT
  // ============================================================

  function handleSubmit() {
    setError("");

    if (!description.trim()) {
      setError("Deduction description is required.");
      return;
    }

    if (!computations.length) {
      setError("Add at least one computation line.");
      return;
    }

    if (computations.some(
      (computation) =>
        !Number.isFinite(
          Number(computation.computed_amount)
        ) ||
        Number(computation.computed_amount) < 0
    )) {
      setError("Invalid deduction amount.");
      return;
    }

    if (totalAmount <= 0) {
      setError("Deduction amount must be greater than zero.");
      return;
    }

    // Computed mode validation
    if (mode === "COMPUTED") {
      const invalid = computations.some(
        (computation) => {
          if (
            computation.computation_method === "PERCENTAGE"
          ) {
            return (
              computation.basis_amount === null ||
              computation.rate === null ||
              computation.basis_amount <= 0 ||
              computation.rate < 0
            );
          }

          return (
            computation.computed_amount <= 0
          );
        }
      );

      if (invalid) {
        setError(
          "Check the basis, rate, and computed amounts."
        );
        return;
      }
    }

    const deduction: DVDeduction = {
      id: initialData?.id ?? getId(),
      deduction_type: deductionType,
      description: description.trim(),
      computation_mode: mode,
      total_deduction_amount: Number(
        totalAmount.toFixed(2)
      ),
      reference_number: referenceNumber.trim(),
      remarks: remarks.trim(),
      computations: computations.map((computation) => ({
        ...computation,
        basis_amount:
          computation.basis_amount === null
            ? null
            : Number(computation.basis_amount),
        rate:
          computation.rate === null
            ? null
            : Number(computation.rate),
        computed_amount: Number(
          Number(computation.computed_amount).toFixed(2)
        ),
      })),
    };

    onSave(deduction);
  }

  // ============================================================
  // UI
  // ============================================================

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
                Enter deduction details and computation.
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

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Deduction Type
                </label>

                <select
                  value={deductionType}
                  onChange={(e) =>
                    setDeductionType(
                      e.target.value as DVDeductionType
                    )
                  }
                  className={inputClass}
                >
                  {deductionTypes.map((type) => (
                    <option
                      key={type.value}
                      value={type.value}
                    >
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className={labelClass}>
                  Description
                </label>

                <input
                  value={description}
                  onChange={(e) =>
                    setDescription(e.target.value)
                  }
                  placeholder="Enter deduction description"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Reference Number
                </label>

                <input
                  value={referenceNumber}
                  onChange={(e) =>
                    setReferenceNumber(e.target.value)
                  }
                  placeholder="Optional reference"
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>
                  Computation Mode
                </label>

                <select
                  value={mode}
                  onChange={(e) =>
                    changeMode(
                      e.target.value as DVDeductionMode
                    )
                  }
                  className={inputClass}
                >
                  <option value="MANUAL">
                    Manual Amount
                  </option>

                  <option value="COMPUTED">
                    Computed
                  </option>
                </select>
              </div>

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

          {/* COMPUTATIONS */}

          <section className="rounded-md border border-slate-200 bg-white p-4">

            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                {mode === "COMPUTED" ? (
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
                  {mode === "COMPUTED"
                    ? "Computation Breakdown"
                    : "Manual Deduction"}
                </h3>
              </div>

              {mode === "COMPUTED" && (
                <button
                  type="button"
                  onClick={addComputation}
                  className="flex items-center gap-1.5 rounded-md border border-[#6689A5] px-2.5 py-1.5 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7]"
                >
                  <Plus size={14} />
                  Add Computation
                </button>
              )}
            </div>

            {/* MANUAL */}

            {mode === "MANUAL" && (
              <div className="space-y-3">

                {computations.map((computation) => (
                  <div
                    key={computation.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <label className={labelClass}>
                      Deduction Amount
                    </label>

                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        computation.computed_amount || ""
                      }
                      onChange={(e) =>
                        updateComputation(
                          computation.id,
                          {
                            computation_method: "MANUAL",
                            basis_amount: null,
                            rate: null,
                            dv_item_id: null,
                            computed_amount:
                              Number(e.target.value) || 0,
                          }
                        )
                      }
                      placeholder="0.00"
                      className={inputClass}
                    />

                    <p className="mt-1 text-[10px] text-slate-400">
                      Enter the exact deduction amount.
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* COMPUTED */}

            {mode === "COMPUTED" && (
              <div className="space-y-3">

                {computations.map(
                  (computation, index) => (
                    <div
                      key={computation.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="mb-3 flex items-center justify-between">
                        <p className="text-xs font-semibold text-slate-700">
                          Computation {index + 1}
                        </p>

                        {computations.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeComputation(
                                computation.id
                              )
                            }
                            className="rounded-md p-1.5 text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      {/* DV ITEM */}

                      <div className="mb-3">
                        <label className={labelClass}>
                          DV Allocation
                        </label>

                        <select
                          value={
                            computation.dv_item_id ?? ""
                          }
                          onChange={(e) =>
                            selectDVItem(
                              computation.id,
                              e.target.value
                            )
                          }
                          className={inputClass}
                        >
                          <option value="">
                            Select DV allocation
                          </option>

                          {items.map((item) => (
                            <option
                              key={item.id}
                              value={item.id}
                            >
                              {item.obr_no} —{" "}
                              {item.account_name} —{" "}
                              {peso(
                                Number(
                                  item.obligation_amount
                                ) || 0
                              )}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* METHOD */}

                      <div className="mb-3">
                        <label className={labelClass}>
                          Computation Method
                        </label>

                        <select
                          value={
                            computation.computation_method
                          }
                          onChange={(e) => {
                            const method =
                              e.target.value as DVDeductionComputationMethod;

                            updateComputation(
                              computation.id,
                              {
                                computation_method: method,
                                rate: null,
                                computed_amount: 0,
                                basis_amount:
                                  method === "PERCENTAGE"
                                    ? computation.basis_amount
                                    : null,
                              }
                            );
                          }}
                          className={inputClass}
                        >
                          <option value="PERCENTAGE">
                            Percentage
                          </option>

                          <option value="FIXED">
                            Fixed Amount
                          </option>
                        </select>
                      </div>

                      {/* PERCENTAGE */}

                      {computation.computation_method ===
                        "PERCENTAGE" && (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">

                          <div>
                            <label className={labelClass}>
                              Basis Amount
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={
                                computation.basis_amount ??
                                ""
                              }
                              onChange={(e) => {
                                const basis =
                                  Number(
                                    e.target.value
                                  ) || 0;

                                calculatePercentage(
                                  computation.id,
                                  basis,
                                  Number(
                                    computation.rate
                                  ) || 0
                                );
                              }}
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Rate (%)
                            </label>

                            <input
                              type="number"
                              min="0"
                              step="0.0001"
                              value={
                                computation.rate ?? ""
                              }
                              onChange={(e) => {
                                const rate =
                                  Number(
                                    e.target.value
                                  ) || 0;

                                calculatePercentage(
                                  computation.id,
                                  Number(
                                    computation.basis_amount
                                  ) || 0,
                                  rate
                                );
                              }}
                              placeholder="0"
                              className={inputClass}
                            />
                          </div>

                          <div>
                            <label className={labelClass}>
                              Computed Amount
                            </label>

                            <input
                              value={peso(
                                computation.computed_amount
                              )}
                              readOnly
                              className={`${inputClass} bg-slate-100 font-semibold`}
                            />
                          </div>
                        </div>
                      )}

                      {/* FIXED */}

                      {computation.computation_method ===
                        "FIXED" && (
                        <div>
                          <label className={labelClass}>
                            Deduction Amount
                          </label>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              computation.computed_amount ||
                              ""
                            }
                            onChange={(e) =>
                              updateComputation(
                                computation.id,
                                {
                                  computation_method: "FIXED",
                                  basis_amount: null,
                                  rate: null,
                                  computed_amount:
                                    Number(
                                      e.target.value
                                    ) || 0,
                                }
                              )
                            }
                            placeholder="0.00"
                            className={inputClass}
                          />
                        </div>
                      )}

                      {/* LINE REMARKS */}

                      <div className="mt-3">
                        <label className={labelClass}>
                          Computation Remarks
                        </label>

                        <input
                          value={
                            computation.remarks ?? ""
                          }
                          onChange={(e) =>
                            updateComputation(
                              computation.id,
                              {
                                remarks:
                                  e.target.value,
                              }
                            )
                          }
                          placeholder="Optional"
                          className={inputClass}
                        />
                      </div>
                    </div>
                  )
                )}
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
                  {peso(totalAmount)}
                </p>
              </div>

              <div className="text-right text-xs text-slate-500">
                {computations.length} computation line(s)
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
              {peso(totalAmount)}
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
