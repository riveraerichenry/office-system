
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  X,
  Receipt,
  Plus,
  FileText,
  Loader2,
} from "lucide-react";

import DVItems from "./DVItems";
import SelectOBRModal from "./SelectOBRModal";
import DVDeductionModal from "./DVDeductionModal";
import DVDeductionItems from "./DVDeductionItems";

import type {
  DVFormData,
  DVItem,
  OBRRecord,
  DVDeduction,
} from "./types";

type Props = {
  obrs: OBRRecord[];
  onClose: () => void;
  onSave: (data: DVFormData) => Promise<void>;
};

const DEFAULT_PAYOR = "Municipality of Taytay, Palawan";

const peso = (value: number) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(value);

function today() {
  const date = new Date();

  return new Date(
    date.getTime() - date.getTimezoneOffset() * 60000
  )
    .toISOString()
    .slice(0, 10);
}

function getId() {
  return typeof crypto !== "undefined" &&
    "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;
}

// ============================================================
// GENERATE PARTICULARS FOR ONE OBR
// ============================================================

function generateOBRParticulars(obr: OBRRecord): string {
  return [
    obr.office_name,
    obr.sub_office_name,
    obr.category_name,
    obr.account_name,
  ]
    .map((value) => String(value ?? "").trim())
    .filter(Boolean)
    .join(", ");
}

// ============================================================
// GENERATE DV PARTICULARS
// ============================================================

function generateDVParticulars(items: DVItem[]): string {
  return items
    .map((item) =>
      [
        item.office_name,
        item.sub_office_name,
        item.category_name,
        item.account_name,
      ]
        .map((value) => String(value ?? "").trim())
        .filter(Boolean)
        .join(", ")
    )
    .filter(Boolean)
    .join("\n");
}

// ============================================================
// COMPONENT
// ============================================================

export default function DVFormModal({
  obrs,
  onClose,
  onSave,
}: Props) {
  // ============================================================
  // FORM STATES
  // ============================================================

  const [dvNo, setDvNo] = useState("");
  const [dvDate, setDvDate] = useState(today());
  const [payee, setPayee] = useState("");

  const payor = DEFAULT_PAYOR;

  const [particulars, setParticulars] = useState("");

  const [items, setItems] = useState<DVItem[]>([]);

  // DEDUCTIONS
  const [deductions, setDeductions] = useState<DVDeduction[]>([]);
  const [showDeductionModal, setShowDeductionModal] = useState(false);
  const [editingDeduction, setEditingDeduction] =
    useState<DVDeduction | null>(null);

  // OBR MODAL
  const [showOBRModal, setShowOBRModal] = useState(false);

  // SAVING / ERROR
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // AUTOMATICALLY GENERATE PARTICULARS
  // ============================================================

  useEffect(() => {
    setParticulars(generateDVParticulars(items));
  }, [items]);

  // ============================================================
  // GROSS AMOUNT
  // ============================================================

  const grandTotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + (Number(item.obligation_amount) || 0),
      0
    );
  }, [items]);

  // ============================================================
  // TOTAL DEDUCTIONS
  // ============================================================

  const totalDeductions = useMemo(() => {
    return deductions.reduce(
      (sum, deduction) =>
        sum +
        (Number(deduction.total_deduction_amount) || 0),
      0
    );
  }, [deductions]);

  // ============================================================
  // NET AMOUNT DUE
  // ============================================================

  const netAmountDue = useMemo(() => {
    return grandTotal - totalDeductions;
  }, [grandTotal, totalDeductions]);

  // ============================================================
  // ADD OBR
  // ============================================================

  function addOBR(obr: OBRRecord) {
    const alreadyAdded = items.some(
      (item) => item.obr_id === obr.id
    );

    if (alreadyAdded) {
      setError(`OBR ${obr.obr_number} was already added.`);
      setShowOBRModal(false);
      return;
    }

    const obligationAmount = Number(
      obr.obligation_amount ??
      obr.total_allocation ??
      obr.total_amount ??
      0
    );

    const newItem: DVItem = {
      id: getId(),

      obr_id: obr.id,
      obr_no: obr.obr_number,

      // FIX: COPY PAYEE FROM THE SELECTED OBR
      payee: obr.payee || "",

      office_name: obr.office_name || "",
      sub_office_name: obr.sub_office_name || "",

      category_code: obr.category_code || "",
      category_name: obr.category_name || "",

      account_code: obr.account_code || "",
      account_name: obr.account_name || "",

      particulars: generateOBRParticulars(obr),

      obligation_amount: obligationAmount,

      total_debit:
        obligationAmount > 0
          ? obligationAmount.toFixed(2)
          : "",

      // Preserve temporary OBR data for saving with the DV
      new_obr: obr.new_obr,
    };

    setItems((previous) => [
      ...previous,
      newItem,
    ]);

    setError("");
    setShowOBRModal(false);
  }

  // ============================================================
  // ADD / EDIT DEDUCTION
  // ============================================================

  function handleSaveDeduction(deduction: DVDeduction) {
    setDeductions((previous) => {
      const exists = previous.some(
        (item) => item.id === deduction.id
      );

      if (exists) {
        return previous.map((item) =>
          item.id === deduction.id
            ? deduction
            : item
        );
      }

      return [...previous, deduction];
    });

    setEditingDeduction(null);
    setShowDeductionModal(false);
    setError("");
  }

  // ============================================================
  // EDIT DEDUCTION
  // ============================================================

  function editDeduction(deduction: DVDeduction) {
    setEditingDeduction(deduction);
    setShowDeductionModal(true);
  }

  // ============================================================
  // DELETE DEDUCTION
  // ============================================================

  function deleteDeduction(id: string) {
    setDeductions((previous) =>
      previous.filter((item) => item.id !== id)
    );
  }

  // ============================================================
  // OPEN NEW DEDUCTION MODAL
  // ============================================================

  function openNewDeduction() {
    setEditingDeduction(null);
    setShowDeductionModal(true);
  }

  // ============================================================
  // SUBMIT DV
  // ============================================================

  async function handleSubmit(
    e: FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    if (!dvNo.trim()) {
      setError("DV number is required.");
      return;
    }

    if (!dvDate) {
      setError("DV date is required.");
      return;
    }

    if (!payee.trim()) {
      setError("Payee is required.");
      return;
    }

    if (!items.length) {
      setError("Add at least one OBR.");
      return;
    }

    if (
      items.some(
        (item) => !item.account_code?.trim()
      )
    ) {
      setError(
        "Account code is missing from one or more OBR records."
      );
      return;
    }

    if (
      items.some(
        (item) =>
          !Number.isFinite(Number(item.obligation_amount)) ||
          Number(item.obligation_amount) <= 0
      )
    ) {
      setError(
        "Every selected OBR must have a valid obligation amount."
      );
      return;
    }

    const duplicate = items.find(
      (item, index) =>
        items.findIndex(
          (other) => other.obr_id === item.obr_id
        ) !== index
    );

    if (duplicate) {
      setError(
        `OBR ${duplicate.obr_no} was added more than once.`
      );
      return;
    }

    if (totalDeductions > grandTotal) {
      setError(
        "Total deductions cannot exceed the gross DV amount."
      );
      return;
    }

    if (netAmountDue < 0) {
      setError("Net amount due cannot be negative.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        dv_no: dvNo.trim(),
        dv_date: dvDate,

        payee: payee.trim(),
        payor: DEFAULT_PAYOR,

        particulars: generateDVParticulars(items),

        items: items.map((item) => ({
          obr_id: item.obr_id,
          obr_no: item.obr_no,
          account_code: item.account_code.trim(),

          particulars: generateOBRParticulars({
            id: item.obr_id,
            obr_number: item.obr_no,
            office_name: item.office_name,
            sub_office_name: item.sub_office_name,
            category_name: item.category_name,
            account_name: item.account_name,
          } as OBRRecord),

          total_debit: Number(item.obligation_amount),
          new_obr: item.new_obr,
        })),

        // GROSS
        grand_total: grandTotal,

        // DEDUCTIONS
        deductions,

        total_deductions: totalDeductions,

        // NET
        net_amount_due: netAmountDue,
      } as DVFormData;

      await onSave(payload);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Unable to save disbursement voucher."
      );
    } finally {
      setSaving(false);
    }
  }

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 backdrop-blur-[2px]">
      <div className="flex h-[94vh] max-h-[900px] w-full max-w-7xl flex-col overflow-hidden rounded-lg border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-2.5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Receipt size={19} />
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Create Disbursement Voucher
              </h2>

              <p className="text-[10px] text-slate-500">
                Voucher details, OBR allocations, and deductions
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-1.5 text-slate-500 hover:bg-white/60"
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* DESKTOP 9/3 GRID */}
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-hidden p-3 lg:grid-cols-12">

            {/* LEFT COLUMN - 9/12 */}
            <div className="flex min-h-0 flex-col gap-3 overflow-hidden lg:col-span-9">

              {error && (
                <p
                  role="alert"
                  className="shrink-0 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
                >
                  {error}
                </p>
              )}

              {/* VOUCHER DETAILS */}
              <section className="shrink-0 rounded-md border border-slate-200 bg-white p-3">
                <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#557992]">
                  <Receipt size={14} />
                  Voucher Information
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      DV Number *
                    </label>

                    <input
                      value={dvNo}
                      onChange={(e) => setDvNo(e.target.value)}
                      placeholder="Enter DV number"
                      required
                      disabled={saving}
                      className="w-full rounded border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-[#6689A5]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      DV Date *
                    </label>

                    <input
                      type="date"
                      value={dvDate}
                      onChange={(e) => setDvDate(e.target.value)}
                      required
                      disabled={saving}
                      className="w-full rounded border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-[#6689A5]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Payee *
                    </label>

                    <input
                      value={payee}
                      onChange={(e) => setPayee(e.target.value)}
                      placeholder="Enter payee"
                      required
                      disabled={saving}
                      className="w-full rounded border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-[#6689A5]"
                    />
                  </div>

                  <div>
                    <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                      Payor
                    </label>

                    <input
                      value={payor}
                      readOnly
                      className="w-full rounded border border-slate-200 bg-slate-100 px-2.5 py-2 text-xs text-slate-600"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <label className="mb-1 block text-[10px] font-semibold text-slate-600">
                    Particulars (auto-generated)
                  </label>

                  <textarea
                    value={particulars}
                    readOnly
                    rows={2}
                    placeholder="Generated from selected OBRs"
                    className="w-full resize-none rounded border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] leading-4 text-slate-700"
                  />
                </div>
              </section>

              {/* OBR SECTION */}
              <section className="flex min-h-0 flex-1 flex-col rounded-md border border-slate-200 bg-white p-2">

                <div className="mb-2 flex shrink-0 items-center justify-between border-b border-slate-200 pb-2">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-[#6689A5]" />

                    <h3 className="text-xs font-semibold text-[#557992]">
                      OBR Allocations
                    </h3>

                    <span className="rounded-full bg-[#EDF3F7] px-2 py-0.5 text-[10px] font-semibold text-[#557992]">
                      {items.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setError("");
                      setShowOBRModal(true);
                    }}
                    disabled={saving}
                    className="flex items-center gap-1 rounded border border-[#6689A5] px-2 py-1 text-[10px] font-semibold text-[#557992] hover:bg-[#EDF3F7] disabled:opacity-50"
                  >
                    <Plus size={12} />
                    Add OBR
                  </button>
                </div>

                {/* OBR CONTENT */}
                <div className="min-h-0 flex-1 overflow-hidden">
                  <DVItems items={items} onChange={setItems} />
                </div>

                <div className="mt-1 flex shrink-0 items-center justify-between rounded bg-[#EDF3F7] px-3 py-1.5">
                  <span className="text-[10px] text-slate-500">
                    {items.length} OBR item(s)
                  </span>

                  <span className="text-sm font-bold text-[#557992]">
                    {peso(grandTotal)}
                  </span>
                </div>
              </section>
            </div>

            {/* RIGHT COLUMN - 3/12 */}
            <div className="flex min-h-0 flex-col gap-3 overflow-hidden lg:col-span-3">

              {/* DEDUCTIONS */}
              <section className="flex min-h-0 flex-1 flex-col rounded-md border border-slate-200 bg-white p-2.5">

                <div className="mb-1.5 flex shrink-0 items-center justify-between border-b border-slate-200 pb-1.5">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-700">
                      DV Deductions
                    </h3>

                    <p className="text-[10px] text-slate-400">
                      Computed or manually entered
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={openNewDeduction}
                    disabled={saving || !items.length}
                    className="flex items-center gap-1 rounded border border-red-200 px-2 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
                  >
                    <Plus size={12} />
                    Add
                  </button>
                </div>

                {/* DEDUCTION LIST */}
                <div className="min-h-0 flex-1 overflow-auto">
                  <div style={{ zoom: 0.88 }}>
                    <DVDeductionItems
                      deductions={deductions}
                      onEdit={editDeduction}
                      onDelete={deleteDeduction}
                    />
                  </div>
                </div>

                <div className="mt-1.5 flex shrink-0 items-center justify-between border-t border-slate-100 pt-1.5 text-xs">
                  <span className="text-red-600">
                    Total Deductions
                  </span>

                  <span className="font-semibold text-red-600">
                    - {peso(totalDeductions)}
                  </span>
                </div>
              </section>

              {/* AMOUNT SUMMARY */}
              <section className="shrink-0 rounded-md border border-slate-200 bg-white p-3">
                <h3 className="mb-2 text-xs font-semibold text-slate-700">
                  DV Amount Summary
                </h3>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      Gross Amount
                    </span>

                    <span className="font-semibold text-slate-700">
                      {peso(grandTotal)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-red-600">
                      Total Deductions
                    </span>

                    <span className="font-semibold text-red-600">
                      - {peso(totalDeductions)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between border-t border-slate-200 pt-2">
                    <span className="text-xs font-semibold text-slate-700">
                      Net Amount Due
                    </span>

                    <span className="text-lg font-bold text-emerald-700">
                      {peso(netAmountDue)}
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-white px-4 py-2.5">

            <div>
              <p className="text-[9px] font-semibold text-slate-400">
                NET AMOUNT DUE
              </p>

              <p className="text-lg font-bold text-emerald-700">
                {peso(netAmountDue)}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving || !items.length}
                className="flex items-center gap-2 rounded bg-[#6689A5] px-4 py-2 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving && (
                  <Loader2 size={14} className="animate-spin" />
                )}

                {saving ? "Saving..." : "Save DV"}
              </button>
            </div>
          </footer>
        </form>

        {/* SELECT OBR MODAL */}
        {showOBRModal && (
          <SelectOBRModal
            obrs={obrs}
            selectedIds={items.map((item) => item.obr_id)}
            onClose={() => setShowOBRModal(false)}
            onSelect={addOBR}
          />
        )}

        {/* DEDUCTION MODAL */}
        {showDeductionModal && (
          <DVDeductionModal
            items={items}
            initialData={editingDeduction}
            onClose={() => {
              setShowDeductionModal(false);
              setEditingDeduction(null);
            }}
            onSave={handleSaveDeduction}
          />
        )}
      </div>
    </div>
  );
}
