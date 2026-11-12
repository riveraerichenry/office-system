
"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  X,
  ShoppingCart,
  Loader2,
  Plus,
  Trash2,
  Receipt,
} from "lucide-react";

import type {
  ExpenseAccountCategoryOption,
  ExpenseAccountOption,
  OfficeOption,
  SubOfficeOption,
  PurchaseRequestFormData,
  PurchaseRequestItemFormData,
  PurchaseRequestOBRFormData,
} from "./purchase-requests-types";
import OBRFormModal from "./OBRFormModal";

type Props = {
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: ExpenseAccountCategoryOption[];
  accounts: ExpenseAccountOption[];
  onClose: () => void;
  onSave: (data: PurchaseRequestFormData) => Promise<void>;
};

type ItemRow = PurchaseRequestItemFormData & {
  row_id: string;
};

type ObrRow = PurchaseRequestOBRFormData & {
  row_id: string;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] focus:ring-0 placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const sectionTitleClass =
  "mb-3 border-b border-slate-300 pb-1.5 text-sm font-medium text-[#557992]";

const makeId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const money = (value: number) =>
  Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

/**
 * Converts a formatted currency string into a number.
 */
function parseMoneyInput(value: string): number {
  const cleaned = value.replace(/,/g, "").replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);

  return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Adds thousand separators without removing a decimal point
 * that the user is currently typing.
 */
function formatMoneyInput(value: string | number): string {
  const raw = String(value ?? "").replace(/,/g, "");

  if (!raw) return "";

  const parts = raw.split(".");
  const integerPart = parts[0].replace(/\D/g, "");
  const decimalPart = parts
    .slice(1)
    .join("")
    .replace(/\D/g, "")
    .slice(0, 2);

  const formattedInteger = (integerPart || "0").replace(
    /\B(?=(\d{3})+(?!\d))/g,
    ","
  );

  return parts.length > 1
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;
}

const today = () => {
  const date = new Date();
  const local = new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  );

  return local.toISOString().slice(0, 10);
};

export default function PurchaseFormModal({
  offices,
  subOffices,
  categories,
  accounts,
  onClose,
  onSave,
}: Props) {
  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");

  const [prDate, setPrDate] = useState(today());
  const [rpNumber, setRpNumber] = useState("");
  const [purpose, setPurpose] = useState("");
  const [remarks, setRemarks] = useState("");

  const [items, setItems] = useState<ItemRow[]>([
    {
      row_id: makeId(),
      unit: "",
      quantity: 1,
      item_description: "",
      specifications: "",
      estimated_unit_cost: 0,
      total_cost: 0,
    },
  ]);

  const [obrs, setObrs] = useState<ObrRow[]>([]);

  const [showObrForm, setShowObrForm] = useState(false);


  // Preserve the exact text being typed in currency inputs.
  // This allows users to type decimal values naturally.
  const [unitCostInputs, setUnitCostInputs] = useState<
    Record<string, string>
  >({});


  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // --------------------------------------------------
  // PR CASCADE
  // --------------------------------------------------

  const availableSubOffices = useMemo(
    () =>
      subOffices.filter(
        (item) =>
          item.office_id === officeId &&
          item.is_active !== false
      ),
    [subOffices, officeId]
  );

  const availableCategories = useMemo(
    () =>
      categories.filter(
        (item) =>
          item.is_active &&
          (!item.office_id || item.office_id === officeId) &&
          (!item.sub_office_id ||
            item.sub_office_id === subOfficeId)
      ),
    [categories, officeId, subOfficeId]
  );

  const availableAccounts = useMemo(
    () =>
      accounts.filter(
        (item) =>
          item.is_active &&
          item.category_id === categoryId
      ),
    [accounts, categoryId]
  );

  // --------------------------------------------------
  // TOTALS
  // --------------------------------------------------

  const totalAmount = money(
    items.reduce(
      (sum, item) =>
        sum +
        money(
          Number(item.quantity || 0) *
            Number(item.estimated_unit_cost || 0)
        ),
      0
    )
  );

  const totalObrAmount = money(
    obrs.reduce(
      (sum, obr) =>
        sum + money(Number(obr.amount) || 0),
      0
    )
  );


  const hasValidObrAmounts = obrs.every(
    (obr) =>
      Number.isFinite(Number(obr.amount)) &&
      Number(obr.amount) > 0
  );

  // A purchase request can be saved without any OBR.
  // If OBRs are added, each one must have a valid amount.
  const canSave =
    !saving &&
    items.length > 0 &&
    hasValidObrAmounts;

  // --------------------------------------------------
  // ITEM FUNCTIONS
  // --------------------------------------------------

  function updateItem(
    rowId: string,
    field: keyof PurchaseRequestItemFormData,
    value: string | number
  ) {
    setItems((current) =>
      current.map((item) =>
        item.row_id === rowId
          ? { ...item, [field]: value }
          : item
      )
    );
  }

  function updateUnitCostInput(
    rowId: string,
    value: string
  ) {
    const formatted = formatMoneyInput(value);

    setUnitCostInputs((current) => ({
      ...current,
      [rowId]: formatted,
    }));

    updateItem(
      rowId,
      "estimated_unit_cost",
      parseMoneyInput(formatted)
    );
  }

  function finalizeUnitCostInput(rowId: string) {
    const item = items.find(
      (current) => current.row_id === rowId
    );

    if (!item) return;

    const amount = money(
      Number(item.estimated_unit_cost || 0)
    );

    updateItem(
      rowId,
      "estimated_unit_cost",
      amount
    );

    setUnitCostInputs((current) => ({
      ...current,
      [rowId]: amount.toFixed(2),
    }));
  }

  function addItem() {
    const rowId = makeId();

    setItems((current) => [
      ...current,
      {
        row_id: rowId,
        unit: "",
        quantity: 1,
        item_description: "",
        specifications: "",
        estimated_unit_cost: 0,
        total_cost: 0,
      },
    ]);
  }

  function removeItem(rowId: string) {
    setItems((current) =>
      current.filter((item) => item.row_id !== rowId)
    );

    setUnitCostInputs((current) => {
      const updated = { ...current };
      delete updated[rowId];
      return updated;
    });
  }

  // --------------------------------------------------
  // OBR FUNCTIONS
  // --------------------------------------------------

  function addObr(obr: PurchaseRequestOBRFormData) {
    setError("");

    if (
      obrs.some(
        (item) =>
          item.obr_number.toLowerCase() ===
          obr.obr_number.trim().toLowerCase()
      )
    ) {
      setError("This OBR number has already been added.");
      return;
    }

    setObrs((current) => [
      ...current,
      {
        ...obr,
        amount: money(Number(obr.amount)),
        row_id: makeId(),
      },
    ]);
    setShowObrForm(false);
  }

  function removeObr(rowId: string) {
    setObrs((current) =>
      current.filter((obr) => obr.row_id !== rowId)
    );
  }

  // --------------------------------------------------
  // SAVE
  // --------------------------------------------------

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!prDate) {
      setError(
        "Purchase request date is required."
      );
      return;
    }

    if (!rpNumber.trim()) {
      setError("RP number is required.");
      return;
    }

    if (
      !items.length ||
      items.some(
        (item) =>
          !item.unit.trim() ||
          !item.item_description.trim() ||
          Number(item.quantity) <= 0 ||
          Number(item.estimated_unit_cost) < 0
      )
    ) {
      setError(
        "Complete all item details. Quantity must be greater than zero."
      );
      return;
    }

    if (!hasValidObrAmounts) {
      setError(
        "Each attached OBR must have a valid allocated amount greater than zero."
      );
      return;
    }

    setSaving(true);

    try {
      const cleanItems = items.map(
        ({ row_id, ...item }) => ({
          ...item,
          quantity: Number(item.quantity),
          estimated_unit_cost: money(
            Number(item.estimated_unit_cost)
          ),
          total_cost: money(
            Number(item.quantity) *
              Number(item.estimated_unit_cost)
          ),
        })
      );

      const cleanObrs = obrs.map(
        ({ row_id, ...obr }) => ({
          ...obr,
          amount: money(Number(obr.amount)),
        })
      );

      const derivedPurpose =
        purpose.trim() ||
        cleanItems
          .map((item) => item.item_description)
          .filter(Boolean)
          .join(", ");

      await onSave({
        pr_date: prDate,
        rp_number: rpNumber.trim(),
        office_id: officeId || null,
        sub_office_id: subOfficeId || null,
        category_id: categoryId || null,
        account_id: accountId || null,
        purpose: derivedPurpose,
        remarks: remarks.trim(),
        items: cleanItems,
        obrs: cleanObrs,
        total_amount: totalAmount,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save purchase request."
      );
    } finally {
      setSaving(false);
    }
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 backdrop-blur-[2px]">
      <div className="flex max-h-[98vh] w-full max-w-7xl flex-col overflow-hidden rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <ShoppingCart size={23} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Purchase Request
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Create a purchase request. OBRs can be added now or later.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">

            {/* PURCHASE REQUEST INFORMATION */}
            <section>
              <h3 className={sectionTitleClass}>
                Purchase Request Information
              </h3>

              <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">

                <div>
                  <label className={labelClass}>
                    PR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={rpNumber}
                    onChange={(e) =>
                      setRpNumber(e.target.value)
                    }
                    className={inputClass}
                    placeholder="Enter RP number"
                    required
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Purchase Request Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={prDate}
                    onChange={(e) =>
                      setPrDate(e.target.value)
                    }
                    className={inputClass}
                    required
                    disabled={saving}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Purpose
                  </label>
                  <input
                    value={purpose}
                    onChange={(e) =>
                      setPurpose(e.target.value)
                    }
                    className={inputClass}
                    placeholder="Optional; defaults to item descriptions"
                    disabled={saving}
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    Office (Optional)
                  </label>
                  <select
                    value={officeId}
                    onChange={(e) => {
                      setOfficeId(e.target.value);
                      setSubOfficeId("");
                      setCategoryId("");
                      setAccountId("");
                    }}
                    className={inputClass}
                    disabled={saving}
                  >
                    <option value="">Select office</option>
                    {offices
                      .filter(
                        (item) => item.is_active !== false
                      )
                      .map((item) => (
                        <option
                          key={item.id}
                          value={item.id}
                        >
                          {item.office_code
                            ? `${item.office_code} — `
                            : ""}
                          {item.office_name}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Sub-office
                  </label>
                  <select
                    value={subOfficeId}
                    onChange={(e) => {
                      setSubOfficeId(e.target.value);
                      setCategoryId("");
                      setAccountId("");
                    }}
                    className={inputClass}
                    disabled={!officeId || saving}
                  >
                    <option value="">
                      Select sub-office
                    </option>
                    {availableSubOffices.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.sub_office_code
                          ? `${item.sub_office_code} — `
                          : ""}
                        {item.sub_office_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Expense Category (Optional)
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setAccountId("");
                    }}
                    className={inputClass}
                    disabled={!officeId || saving}
                  >
                    <option value="">
                      Select category
                    </option>
                    {availableCategories.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.category_code} — {item.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Expense Account (Optional)
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) =>
                      setAccountId(e.target.value)
                    }
                    className={inputClass}
                    disabled={!categoryId || saving}
                  >
                    <option value="">
                      Select account
                    </option>
                    {availableAccounts.map((item) => (
                      <option
                        key={item.id}
                        value={item.id}
                      >
                        {item.account_code} — {item.account_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Remarks
                  </label>
                  <input
                    value={remarks}
                    onChange={(e) =>
                      setRemarks(e.target.value)
                    }
                    className={inputClass}
                    placeholder="Optional remarks"
                    disabled={saving}
                  />
                </div>
              </div>
            </section>

            {/* PURCHASE REQUEST ITEMS */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
                <h3 className="text-sm font-medium text-[#557992]">
                  Purchase Request Items
                </h3>

                <button
                  type="button"
                  onClick={addItem}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-sm bg-[#6689A5] px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-[#557992]"
                >
                  <Plus size={14} />
                  Add Item
                </button>
              </div>

              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="bg-[#EDF3F7] text-[11px] font-semibold text-slate-500">
                    <tr>
                      <th className="w-12 px-2.5 py-1.5 text-center">#</th>
                      <th className="w-24 px-2.5 py-1.5">Unit</th>
                      <th className="w-24 px-2.5 py-1.5">Qty</th>
                      <th className="px-2.5 py-1.5">Item / Description</th>
                      <th className="w-40 px-2.5 py-1.5">Specifications</th>
                      <th className="w-36 px-2.5 py-1.5 text-right">Unit Cost</th>
                      <th className="w-36 px-2.5 py-1.5 text-right">Total Cost</th>
                      <th className="w-12 px-2.5 py-1.5" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {items.map((item, index) => {
                      const lineTotal = money(
                        Number(item.quantity || 0) *
                          Number(
                            item.estimated_unit_cost || 0
                          )
                      );

                      return (
                        <tr key={item.row_id}>
                          <td className="px-2.5 py-1.5 text-center text-xs text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-2.5 py-1.5">
                            <input
                              value={item.unit}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "unit",
                                  e.target.value
                                )
                              }
                              placeholder="Unit"
                              className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                              disabled={saving}
                            />
                          </td>

                          <td className="px-2.5 py-1.5">
                            <input
                              type="number"
                              min="0.01"
                              step="any"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                              className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                              disabled={saving}
                            />
                          </td>

                          <td className="px-2.5 py-1.5">
                            <input
                              value={item.item_description}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "item_description",
                                  e.target.value
                                )
                              }
                              placeholder="Enter item / description"
                              className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                              disabled={saving}
                            />
                          </td>

                          <td className="px-2.5 py-1.5">
                            <input
                              value={item.specifications}
                              onChange={(e) =>
                                updateItem(
                                  item.row_id,
                                  "specifications",
                                  e.target.value
                                )
                              }
                              placeholder="Optional"
                              className="w-full border-b border-slate-200 bg-transparent py-2 text-xs outline-none focus:border-[#6689A5]"
                              disabled={saving}
                            />
                          </td>

                          {/* POS-STYLE UNIT COST */}
                          <td className="px-2.5 py-1.5">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={unitCostInputs[item.row_id] ?? ""}
                              onChange={(e) => {
                                const formatted = formatMoneyInput(e.target.value);

                                setUnitCostInputs((current) => ({
                                  ...current,
                                  [item.row_id]: formatted,
                                }));

                                updateItem(
                                  item.row_id,
                                  "estimated_unit_cost",
                                  formatted === "" ? 0 : parseMoneyInput(formatted)
                                );
                              }}
                              onBlur={() => {
                                const amount = money(
                                  Number(item.estimated_unit_cost || 0)
                                );

                                updateItem(
                                  item.row_id,
                                  "estimated_unit_cost",
                                  amount
                                );

                                setUnitCostInputs((current) => ({
                                  ...current,
                                  [item.row_id]: amount > 0 ? amount.toFixed(2) : "",
                                }));
                              }}
                              placeholder="0.00"
                              className="w-full border-b border-slate-200 bg-transparent py-2 text-right text-xs tabular-nums outline-none focus:border-[#6689A5]"
                              disabled={saving}
                            />
                          </td>

                          <td className="px-2.5 py-1.5 text-right text-xs font-semibold tabular-nums text-slate-700">
                            {peso(lineTotal)}
                          </td>

                          <td className="px-2.5 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                removeItem(item.row_id)
                              }
                              disabled={
                                saving || items.length === 1
                              }
                              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-30"
                              title="Remove item"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>

                  <tfoot>
                    <tr className="bg-[#F5F8FA]">
                      <td
                        colSpan={6}
                        className="px-4 py-3 text-right text-xs font-semibold text-slate-600"
                      >
                        TOTAL PURCHASE REQUEST
                      </td>

                      <td className="px-2.5 py-1.5 text-right text-sm font-bold text-[#557992]">
                        {peso(totalAmount)}
                      </td>

                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="mt-2 text-[10px] text-slate-400">
                Total cost is calculated automatically: Quantity × Unit Cost.
              </p>
            </section>

            {/* OBR SECTION */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <Receipt
                    size={16}
                    className="text-[#6689A5]"
                  />
                  <h3 className="text-sm font-medium text-[#557992]">
                    Obligation Requests (OBR)
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setShowObrForm(true);
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-sm border border-[#6689A5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7]"
                >
                  <Plus size={14} />
                  Add OBR
                </button>
              </div>

              {/* OBR FORM MODAL */}
              {showObrForm && (
                <OBRFormModal
                  offices={offices}
                  subOffices={subOffices}
                  categories={categories}
                  accounts={accounts}
                  onClose={() => setShowObrForm(false)}
                  onAdd={addObr}
                />
              )}

              {/* OBR TABLE */}
              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-[#EDF3F7] text-[11px] font-semibold text-slate-500">
                    <tr>
                      <th className="px-2.5 py-1.5">OBR Number</th>
                      <th className="px-2.5 py-1.5">Date</th>
                      <th className="px-2.5 py-1.5">Payee</th>
                      <th className="px-2.5 py-1.5">Particulars</th>
                      <th className="w-40 px-2.5 py-1.5 text-right">Amount</th>
                      <th className="w-12 px-2.5 py-1.5" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {obrs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-xs text-slate-400"
                        >
                          No OBR attached. You can add an OBR now or later.
                        </td>
                      </tr>
                    ) : (
                      obrs.map((obr) => (
                        <tr key={obr.row_id}>
                          <td className="px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                            {obr.obr_number}
                          </td>

                          <td className="px-2.5 py-1.5 text-xs text-slate-500">
                            {obr.obr_date}
                          </td>

                          <td className="px-2.5 py-1.5 text-xs text-slate-600">
                            {obr.payee}
                          </td>

                          <td className="max-w-[260px] px-2.5 py-1.5 text-xs text-slate-600">
                            <p className="font-medium text-slate-700">
                              {obr.particulars}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {offices.find(
                                (item) =>
                                  item.id === obr.office_id
                              )?.office_name || "Office"}

                              {obr.sub_office_id
                                ? ` / ${
                                    subOffices.find(
                                      (item) =>
                                        item.id ===
                                        obr.sub_office_id
                                    )?.sub_office_name ||
                                    "Sub-office"
                                  }`
                                : ""}
                            </p>

                            <p className="text-[10px] text-slate-400">
                              {categories.find(
                                (item) =>
                                  item.id === obr.category_id
                              )?.category_name || "Category"}
                            </p>
                          </td>

                          <td className="px-2.5 py-1.5 text-right text-xs font-semibold tabular-nums">
                            {peso(obr.amount)}
                          </td>

                          <td className="px-2.5 py-1.5 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                removeObr(obr.row_id)
                              }
                              disabled={saving}
                              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Remove OBR"
                            >
                              <Trash2 size={15} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  <tfoot>
                    <tr className="bg-[#F5F8FA]">
                      <td
                        colSpan={4}
                        className="px-4 py-3 text-right text-xs font-semibold text-slate-600"
                      >
                        TOTAL OBR ALLOCATION
                      </td>

                      <td className="px-2.5 py-1.5 text-right text-sm font-bold text-[#557992]">
                        {peso(totalObrAmount)}
                      </td>

                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </section>

            {/* ERROR */}
            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-xs text-red-700">
                {error}
              </p>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div>
              <p className="text-[10px] text-slate-400">
                PURCHASE REQUEST TOTAL
              </p>

              <p className="text-xl font-bold text-[#557992]">
                {peso(totalAmount)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-md border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={!canSave}
                title="Save Purchase Request"
                className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-70"
              >
                {saving && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
                )}

                {saving
                  ? "Saving..."
                  : "Save Purchase Request"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
