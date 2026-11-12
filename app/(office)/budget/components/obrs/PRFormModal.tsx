
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  X,
  FileText,
  Search,
  Plus,
  Trash2,
  Loader2,
  ArrowLeft,
} from "lucide-react";

import type { PurchaseRequestOption } from "./types";

export type PRAllocation = {
  purchase_request_id: string;
  pr_number: string;
  pr_date: string;
  purpose: string;
  total_amount: number;
  allocated_amount: number;
  remaining_amount: number;
  office_name: string;
  amount: number;
};

type PRItem = {
  row_id: string;
  unit: string;
  quantity: string;
  item_description: string;
  specifications: string;
  estimated_unit_cost: string;
};

type OfficeOption = {
  id: string;
  office_code?: string | null;
  office_name: string;
  is_active?: boolean;
};

type Props = {
  purchaseRequests: PurchaseRequestOption[];
  selectedPurchaseRequestIds: string[];
  onClose: () => void;
  onAdd: (allocation: PRAllocation) => void;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none focus:border-[#6689A5] placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const peso = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function today() {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
}

function makeId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random()}`;
}

function makeItem(): PRItem {
  return {
    row_id: makeId(),
    unit: "",
    quantity: "1",
    item_description: "",
    specifications: "",
    estimated_unit_cost: "",
  };
}

function parseAmount(value: string) {
  return Number(value.replace(/,/g, ""));
}

export default function PRFormModal({
  purchaseRequests,
  selectedPurchaseRequestIds,
  onClose,
  onAdd,
}: Props) {
  const [prOptions, setPrOptions] =
    useState<PurchaseRequestOption[]>(purchaseRequests);

  const [offices, setOffices] = useState<OfficeOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [search, setSearch] = useState("");
  const [selectedPRId, setSelectedPRId] = useState("");
  const [amountInput, setAmountInput] = useState("");

  const [view, setView] = useState<"select" | "create">("select");

  const [prNumber, setPrNumber] = useState("");
  const [prDate, setPrDate] = useState(today());
  const [officeId, setOfficeId] = useState("");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");
  const [items, setItems] = useState<PRItem[]>([makeItem()]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadOptions() {
      try {
        setLoadingOptions(true);

        const response = await fetch(
          "/budget/api/obrs/purchase-requests",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(
            result.message || "Unable to load Purchase Requests."
          );
        }

        if (!active) return;

        setPrOptions(result.data || []);
        setOffices(result.offices || []);
      } catch (err) {
        if (!active) return;

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load Purchase Requests."
        );
      } finally {
        if (active) setLoadingOptions(false);
      }
    }

    void loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const availablePRs = useMemo(() => {
    return prOptions.filter((item) => {
      const remaining = Number(
        item.remaining_amount ?? item.total_amount
      );

      return (
        !selectedPurchaseRequestIds.includes(item.id) &&
        remaining > 0
      );
    });
  }, [prOptions, selectedPurchaseRequestIds]);

  const filteredPRs = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return availablePRs;

    return availablePRs.filter((item) =>
      [
        item.pr_number,
        item.purpose,
        item.office_name,
        item.pr_date,
      ]
        .filter(Boolean)
        .some((value) =>
          String(value).toLowerCase().includes(keyword)
        )
    );
  }, [availablePRs, search]);

  const selectedPR = prOptions.find(
    (item) => item.id === selectedPRId
  );

  const selectedRemaining = selectedPR
    ? Number(
        selectedPR.remaining_amount ?? selectedPR.total_amount
      )
    : 0;

  const allocationAmount = parseAmount(amountInput);

  const itemTotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity || 0);
    const unitCost = parseAmount(
      item.estimated_unit_cost || "0"
    );

    return sum + quantity * unitCost;
  }, 0);

  const normalizedItemTotal =
    Math.round((itemTotal + Number.EPSILON) * 100) / 100;

  function handleAdd() {
    setError("");

    if (!selectedPR) {
      setError("Please select a Purchase Request.");
      return;
    }

    if (
      !Number.isFinite(allocationAmount) ||
      allocationAmount <= 0
    ) {
      setError("Enter an allocation amount greater than zero.");
      return;
    }

    if (allocationAmount > selectedRemaining) {
      setError(
        `Allocation cannot exceed the remaining PR balance of ${peso(
          selectedRemaining
        )}.`
      );
      return;
    }

    onAdd({
      purchase_request_id: selectedPR.id,
      pr_number: selectedPR.pr_number,
      pr_date: String(selectedPR.pr_date).slice(0, 10),
      purpose: selectedPR.purpose || "",
      total_amount: Number(selectedPR.total_amount || 0),
      allocated_amount: Number(selectedPR.allocated_amount || 0),
      remaining_amount: selectedRemaining,
      office_name: selectedPR.office_name || "",
      amount:
        Math.round(
          (allocationAmount + Number.EPSILON) * 100
        ) / 100,
    });
  }

  function updateItem(
    rowId: string,
    field: keyof Omit<PRItem, "row_id">,
    value: string
  ) {
    setItems((current) =>
      current.map((item) =>
        item.row_id === rowId
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function addItem() {
    setItems((current) => [...current, makeItem()]);
  }

  function removeItem(rowId: string) {
    setItems((current) => {
      if (current.length <= 1) return current;

      return current.filter((item) => item.row_id !== rowId);
    });
  }

  async function createPurchaseRequest() {
    setError("");

    if (!prNumber.trim()) {
      setError("PR number is required.");
      return;
    }

    if (!prDate) {
      setError("PR date is required.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one PR item.");
      return;
    }

    const invalidItem = items.some((item) => {
      const quantity = Number(item.quantity);
      const unitCost = parseAmount(
        item.estimated_unit_cost || "0"
      );

      return (
        !item.unit.trim() ||
        !item.item_description.trim() ||
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        !Number.isFinite(unitCost) ||
        unitCost < 0
      );
    });

    if (invalidItem) {
      setError(
        "Complete all item descriptions, units, quantities, and costs."
      );
      return;
    }

    if (normalizedItemTotal <= 0) {
      setError("PR total must be greater than zero.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        "/budget/api/obrs/purchase-requests",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            pr_number: prNumber.trim(),
            pr_date: prDate,
            office_id: officeId || null,
            purpose: purpose.trim(),
            remarks: remarks.trim(),
            items: items.map((item) => ({
              unit: item.unit.trim(),
              quantity: Number(item.quantity),
              item_description: item.item_description.trim(),
              specifications: item.specifications.trim(),
              estimated_unit_cost: parseAmount(
                item.estimated_unit_cost || "0"
              ),
            })),
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to create Purchase Request."
        );
      }

      const createdPR: PurchaseRequestOption = {
        id: result.data.id,
        pr_number: result.data.pr_number,
        pr_date: String(result.data.pr_date).slice(0, 10),
        purpose: result.data.purpose || "",
        total_amount: Number(result.data.total_amount || 0),
        allocated_amount: 0,
        remaining_amount: Number(
          result.data.remaining_amount ??
            result.data.total_amount ??
            0
        ),
        office_id: result.data.office_id || null,
        office_name: result.data.office_name || "",
      };

      setPrOptions((current) => [
        createdPR,
        ...current.filter((item) => item.id !== createdPR.id),
      ]);

      setSelectedPRId(createdPR.id);
      setAmountInput(
        Number(createdPR.remaining_amount).toFixed(2)
      );

      setPrNumber("");
      setPrDate(today());
      setOfficeId("");
      setPurpose("");
      setRemarks("");
      setItems([makeItem()]);
      setView("select");
      setSearch(createdPR.pr_number);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create Purchase Request."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-3 backdrop-blur-[2px]">
      <div className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <FileText size={20} />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-800">
                {view === "select"
                  ? "Select Purchase Request"
                  : "Create Purchase Request"}
              </h2>
              <p className="mt-0.5 text-[11px] text-slate-500">
                {view === "select"
                  ? "Choose an available PR and enter its OBR allocation."
                  : "Create a PR independently, then link it to this OBR."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60 disabled:opacity-50"
          >
            <X size={18} />
          </button>
        </div>

        {view === "select" ? (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="relative min-w-[220px] flex-1">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#6689A5]"
                    placeholder="Search PR number, purpose, or office..."
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setView("create");
                  }}
                  className="flex items-center gap-2 rounded-md border border-[#6689A5] bg-white px-3 py-2 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7]"
                >
                  <Plus size={14} />
                  Create New PR
                </button>
              </div>

              {loadingOptions ? (
                <div className="flex items-center justify-center gap-2 py-12 text-xs text-slate-400">
                  <Loader2 size={16} className="animate-spin" />
                  Loading Purchase Requests...
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                  <table className="w-full min-w-[760px] text-left">
                    <thead className="bg-[#EDF3F7] text-[10px] font-semibold text-slate-500">
                      <tr>
                        <th className="px-3 py-2">PR Number</th>
                        <th className="px-3 py-2">Date</th>
                        <th className="px-3 py-2">Purpose / Office</th>
                        <th className="px-3 py-2 text-right">PR Total</th>
                        <th className="px-3 py-2 text-right">Allocated</th>
                        <th className="px-3 py-2 text-right">Remaining</th>
                        <th className="w-20 px-3 py-2 text-center">Select</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {filteredPRs.length === 0 ? (
                        <tr>
                          <td
                            colSpan={7}
                            className="px-4 py-10 text-center text-xs text-slate-400"
                          >
                            No available Purchase Requests with remaining balance.
                          </td>
                        </tr>
                      ) : (
                        filteredPRs.map((item) => {
                          const remaining = Number(
                            item.remaining_amount ?? item.total_amount
                          );

                          const allocated = Number(
                            item.allocated_amount || 0
                          );

                          return (
                            <tr
                              key={item.id}
                              className={
                                selectedPRId === item.id
                                  ? "bg-[#F0F6FA]"
                                  : "hover:bg-slate-50"
                              }
                            >
                              <td className="px-3 py-2 text-xs font-semibold text-slate-700">
                                {item.pr_number}
                              </td>

                              <td className="px-3 py-2 text-xs text-slate-500">
                                {String(item.pr_date).slice(0, 10)}
                              </td>

                              <td className="max-w-[240px] px-3 py-2 text-xs text-slate-600">
                                <p className="truncate">
                                  {item.purpose || "—"}
                                </p>
                                <p className="mt-0.5 text-[10px] text-slate-400">
                                  {item.office_name || "No office assigned"}
                                </p>
                              </td>

                              <td className="px-3 py-2 text-right text-xs tabular-nums text-slate-600">
                                {peso(item.total_amount)}
                              </td>

                              <td className="px-3 py-2 text-right text-xs tabular-nums text-slate-500">
                                {peso(allocated)}
                              </td>

                              <td className="px-3 py-2 text-right text-xs font-semibold tabular-nums text-emerald-700">
                                {peso(remaining)}
                              </td>

                              <td className="px-3 py-2 text-center">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedPRId(item.id);
                                    setAmountInput("");
                                    setError("");
                                  }}
                                  className={`rounded px-3 py-1.5 text-[10px] font-semibold ${
                                    selectedPRId === item.id
                                      ? "bg-[#557992] text-white"
                                      : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
                                  }`}
                                >
                                  {selectedPRId === item.id
                                    ? "Selected"
                                    : "Select"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {selectedPR && (
                <div className="rounded-md border border-[#C7D8E3] bg-white p-4">
                  <h3 className="mb-3 text-xs font-semibold text-[#557992]">
                    OBR Allocation
                  </h3>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <p className={labelClass}>Selected PR</p>
                      <p className="text-sm font-semibold text-slate-700">
                        {selectedPR.pr_number}
                      </p>
                    </div>

                    <div>
                      <p className={labelClass}>Remaining Balance</p>
                      <p className="text-sm font-semibold text-emerald-700">
                        {peso(selectedRemaining)}
                      </p>
                    </div>

                    <div>
                      <label className={labelClass}>
                        Allocation Amount
                      </label>
                      <input
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className={inputClass}
                        placeholder="0.00"
                        inputMode="decimal"
                      />
                      <p className="mt-1 text-[10px] text-slate-400">
                        Maximum: {peso(selectedRemaining)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleAdd}
                disabled={!selectedPR}
                className="rounded-md bg-[#6689A5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Add Selected PR
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4">
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setView("select");
                }}
                disabled={saving}
                className="flex items-center gap-2 text-xs font-semibold text-[#557992] hover:text-[#35566E]"
              >
                <ArrowLeft size={14} />
                Back to PR selection
              </button>

              <section>
                <h3 className="mb-3 border-b border-slate-300 pb-2 text-sm font-medium text-[#557992]">
                  Purchase Request Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <label className={labelClass}>PR Number *</label>
                    <input
                      value={prNumber}
                      onChange={(e) => setPrNumber(e.target.value)}
                      className={inputClass}
                      placeholder="Enter PR number"
                      disabled={saving}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>PR Date *</label>
                    <input
                      type="date"
                      value={prDate}
                      onChange={(e) => setPrDate(e.target.value)}
                      className={inputClass}
                      disabled={saving}
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className={labelClass}>Office</label>
                    <select
                      value={officeId}
                      onChange={(e) => setOfficeId(e.target.value)}
                      className={inputClass}
                      disabled={saving}
                    >
                      <option value="">No office assigned</option>
                      {offices
                        .filter((office) => office.is_active !== false)
                        .map((office) => (
                          <option key={office.id} value={office.id}>
                            {office.office_code
                              ? `${office.office_code} — `
                              : ""}
                            {office.office_name}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className={labelClass}>Purpose</label>
                    <textarea
                      value={purpose}
                      onChange={(e) => setPurpose(e.target.value)}
                      className="w-full resize-y border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none focus:border-[#6689A5]"
                      rows={2}
                      placeholder="Enter purpose"
                      disabled={saving}
                    />
                  </div>

                  <div className="sm:col-span-2 lg:col-span-4">
                    <label className={labelClass}>Remarks</label>
                    <input
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className={inputClass}
                      placeholder="Optional remarks"
                      disabled={saving}
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-3 flex items-center justify-between border-b border-slate-300 pb-2">
                  <h3 className="text-sm font-medium text-[#557992]">
                    Purchase Request Items
                  </h3>

                  <button
                    type="button"
                    onClick={addItem}
                    disabled={saving}
                    className="flex items-center gap-1.5 rounded border border-[#6689A5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7]"
                  >
                    <Plus size={13} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-3">
                  {items.map((item, index) => {
                    const lineTotal =
                      Number(item.quantity || 0) *
                      parseAmount(item.estimated_unit_cost || "0");

                    return (
                      <div
                        key={item.row_id}
                        className="rounded-md border border-slate-200 bg-white p-3"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-600">
                            Item {index + 1}
                          </p>

                          <button
                            type="button"
                            onClick={() => removeItem(item.row_id)}
                            disabled={saving || items.length === 1}
                            className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                            title="Remove item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
                          <div className="sm:col-span-1">
                            <label className={labelClass}>Unit *</label>
                            <input
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "unit",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                              placeholder="Unit"
                              disabled={saving}
                            />
                          </div>

                          <div className="sm:col-span-1">
                            <label className={labelClass}>Quantity *</label>
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                              disabled={saving}
                            />
                          </div>

                          <div className="sm:col-span-4">
                            <label className={labelClass}>
                              Item Description *
                            </label>
                            <input
                              value={item.item_description}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "item_description",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                              placeholder="Enter item description"
                              disabled={saving}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className={labelClass}>
                              Specifications
                            </label>
                            <input
                              value={item.specifications}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "specifications",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                              placeholder="Optional specifications"
                              disabled={saving}
                            />
                          </div>

                          <div className="sm:col-span-3">
                            <label className={labelClass}>
                              Estimated Unit Cost *
                            </label>
                            <input
                              value={item.estimated_unit_cost}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "estimated_unit_cost",
                                  e.target.value
                                )
                              }
                              className={inputClass}
                              placeholder="0.00"
                              inputMode="decimal"
                              disabled={saving}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex justify-end border-t border-slate-100 pt-2">
                          <p className="text-xs text-slate-500">
                            Item Total:{" "}
                            <span className="font-semibold text-slate-700">
                              {peso(
                                Number.isFinite(lineTotal) ? lineTotal : 0
                              )}
                            </span>
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 flex justify-end rounded-md bg-[#EDF3F7] px-4 py-3">
                  <div className="text-right">
                    <p className="text-[10px] font-medium text-slate-500">
                      PURCHASE REQUEST TOTAL
                    </p>
                    <p className="text-lg font-bold text-[#557992]">
                      {peso(normalizedItemTotal)}
                    </p>
                  </div>
                </div>
              </section>

              {error && (
                <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}
                </p>
              )}
            </div>

            <div className="flex shrink-0 items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3">
              <p className="text-[10px] text-slate-400">
                This PR will be saved without an OBR.
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setView("select")}
                  disabled={saving}
                  className="rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={createPurchaseRequest}
                  disabled={saving || normalizedItemTotal <= 0}
                  className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {saving && (
                    <Loader2 size={14} className="animate-spin" />
                  )}
                  {saving ? "Saving..." : "Save PR"}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
