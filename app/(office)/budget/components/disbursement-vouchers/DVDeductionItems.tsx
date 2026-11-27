"use client";

import {
  Pencil,
  Trash2,
  Receipt,
} from "lucide-react";

import type { DVDeduction } from "./types";

interface DVDeductionItemsProps {
  deductions: DVDeduction[];
  onEdit: (deduction: DVDeduction) => void;
  onDelete: (id: string) => void;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value || 0);

export default function DVDeductionItems({
  deductions,
  onEdit,
  onDelete,
}: DVDeductionItemsProps) {
  const totalDeductions = deductions.reduce(
    (total, deduction) =>
      total + Number(deduction.deduction_amount || 0),
    0
  );

  if (deductions.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-center">
        <Receipt className="mx-auto mb-2 h-8 w-8 text-gray-400" />

        <p className="text-sm font-medium text-gray-500">
          No deductions added
        </p>

        <p className="mt-1 text-xs text-gray-400">
          Add deductions to calculate the net amount payable.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] text-sm">
            <thead className="bg-gray-50">
              <tr className="border-b border-gray-200">
                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Deduction
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Type
                </th>

                <th className="px-4 py-3 text-left font-semibold text-gray-600">
                  Computation
                </th>

                <th className="px-4 py-3 text-right font-semibold text-gray-600">
                  Amount
                </th>

                <th className="px-4 py-3 text-center font-semibold text-gray-600">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {deductions.map((deduction) => (
                <tr
                  key={deduction.id}
                  className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50"
                >
                  {/* Deduction Name */}
                  <td className="px-4 py-4">
                    <div className="font-medium text-gray-800">
                      {deduction.deduction_name}
                    </div>

                    {deduction.remarks && (
                      <div className="mt-1 text-xs text-gray-500">
                        {deduction.remarks}
                      </div>
                    )}
                  </td>

                  {/* Deduction Type */}
                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        deduction.deduction_type === "PERCENTAGE"
                          ? "bg-blue-50 text-blue-700"
                          : deduction.deduction_type === "FIXED"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {deduction.deduction_type}
                    </span>
                  </td>

                  {/* Computation */}
                  <td className="px-4 py-4">
                    {deduction.deduction_type === "PERCENTAGE" ? (
                      <div className="space-y-1 text-xs text-gray-500">
                        <div>
                          {Number(deduction.rate || 0)}%
                        </div>

                        <div>
                          of {formatCurrency(
                            Number(deduction.basis_amount || 0)
                          )}
                        </div>
                      </div>
                    ) : deduction.deduction_type === "FIXED" ? (
                      <span className="text-xs text-gray-500">
                        Fixed amount
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">
                        Manual entry
                      </span>
                    )}
                  </td>

                  {/* Amount */}
                  <td className="px-4 py-4 text-right">
                    <span className="font-semibold text-red-600">
                      {formatCurrency(
                        Number(deduction.deduction_amount || 0)
                      )}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(deduction)}
                        title="Edit deduction"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Pencil size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onDelete(deduction.id)}
                        title="Delete deduction"
                        className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Deductions */}
      <div className="flex items-center justify-between rounded-xl border border-red-100 bg-red-50 px-4 py-3">
        <div>
          <p className="text-sm font-medium text-red-700">
            Total Deductions
          </p>

          <p className="text-xs text-red-500">
            {deductions.length} deduction
            {deductions.length !== 1 ? "s" : ""} applied
          </p>
        </div>

        <p className="text-lg font-bold text-red-700">
          {formatCurrency(totalDeductions)}
        </p>
      </div>
    </div>
  );
}