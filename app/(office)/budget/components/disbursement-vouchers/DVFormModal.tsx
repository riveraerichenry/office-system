
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

import type {
  DVFormData,
  DVItem,
  OBRRecord,
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
    .join(", ");
}

// ============================================================
// GENERATE DV PARTICULARS
// One line per OBR
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
        .join(", ")
    )
    .join("\n");
}

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

  // Automatic payor
  const payor = DEFAULT_PAYOR;

  const [particulars, setParticulars] = useState("");

  const [items, setItems] = useState<DVItem[]>([]);

  const [showOBRModal, setShowOBRModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // ============================================================
  // AUTOMATICALLY GENERATE PARTICULARS
  // ============================================================

  useEffect(() => {
    setParticulars(generateDVParticulars(items));
  }, [items]);

  // ============================================================
  // TOTAL OBR AMOUNT
  // ============================================================

  const grandTotal = useMemo(() => {
    return items.reduce(
      (sum, item) =>
        sum + (Number(item.obligation_amount) || 0),
      0
    );
  }, [items]);

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

      office_name: obr.office_name || "",
      sub_office_name: obr.sub_office_name || "",

      category_code: obr.category_code || "",
      category_name: obr.category_name || "",

      account_code: obr.account_code || "",
      account_name: obr.account_name || "",

      particulars: generateOBRParticulars(obr),

      obligation_amount: obligationAmount,

      // Retained for compatibility with the existing DV API.
      total_debit:
        obligationAmount > 0
          ? obligationAmount.toFixed(2)
          : "",
    };

    setItems((previous) => [
      ...previous,
      newItem,
    ]);

    setError("");
    setShowOBRModal(false);
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
        })),

        grand_total: grandTotal,
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
  // UI
  // ============================================================

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 backdrop-blur-[2px]">
      <div className="flex max-h-[98vh] w-full max-w-6xl flex-col overflow-hidden rounded-md border border-slate-200 bg-[#F8FAFC] shadow-2xl">

        {/* HEADER */}
        <div className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#83A8C5] text-white">
              <Receipt size={23} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-800">
                Create Disbursement Voucher
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Record voucher details and attach one or more OBRs.
                This will not issue a check.
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

        {/* FORM */}
        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">

            {/* ERROR */}
            {error && (
              <p
                role="alert"
                className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700"
              >
                {error}
              </p>
            )}

            {/* DV DETAILS */}
            <section className="rounded-md border border-slate-200 bg-white p-4">
              <h3 className="mb-4 border-b border-slate-200 pb-2 text-sm font-semibold text-[#557992]">
                Voucher Information
              </h3>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                {/* DV NUMBER */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    DV Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={dvNo}
                    onChange={(e) => setDvNo(e.target.value)}
                    placeholder="Enter DV number"
                    required
                    disabled={saving}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#6689A5] focus:ring-2 focus:ring-[#6689A5]/20"
                  />
                </div>

                {/* DV DATE */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    DV Date <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="date"
                    value={dvDate}
                    onChange={(e) => setDvDate(e.target.value)}
                    required
                    disabled={saving}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#6689A5] focus:ring-2 focus:ring-[#6689A5]/20"
                  />
                </div>

                {/* PAYEE */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Payee <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="text"
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    placeholder="Enter payee"
                    required
                    disabled={saving}
                    className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#6689A5] focus:ring-2 focus:ring-[#6689A5]/20"
                  />
                </div>

                {/* PAYOR */}
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Payor
                  </label>

                  <input
                    type="text"
                    value={payor}
                    readOnly
                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm text-slate-600 outline-none"
                  />
                </div>

              </div>

              {/* PARTICULARS */}
              <div className="mt-4">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Particulars
                </label>

                <textarea
                  value={particulars}
                  readOnly
                  rows={Math.max(3, items.length)}
                  placeholder="Particulars will be generated from the selected OBRs."
                  className="w-full resize-y rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs leading-6 text-slate-700 outline-none"
                />

                <p className="mt-1 text-[10px] text-slate-400">
                  Automatically generated from the office, sub-office,
                  expense category, and expense account of each OBR.
                </p>
              </div>
            </section>

            {/* OBR ALLOCATIONS */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <FileText
                    size={16}
                    className="text-[#6689A5]"
                  />

                  <h3 className="text-sm font-medium text-[#557992]">
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
                  className="flex items-center gap-2 rounded-sm border border-[#6689A5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7] disabled:opacity-50"
                >
                  <Plus size={14} />
                  Add OBR
                </button>
              </div>

              <DVItems
                items={items}
                onChange={setItems}
              />

              <p className="mt-2 text-[10px] text-slate-400">
                Selected OBR amounts determine the voucher total.
                Check issuance is a separate process.
              </p>
            </section>

            {/* TOTAL */}
            <section className="flex items-center justify-between rounded-md border border-[#D5E3EC] bg-[#EDF3F7] p-4">
              <div>
                <p className="text-[10px] font-semibold uppercase text-[#557992]">
                  Total OBR Amount
                </p>

                <p className="mt-1 text-xl font-bold text-[#557992]">
                  {peso(grandTotal)}
                </p>
              </div>

              <div className="text-right text-[10px] text-slate-500">
                {items.length} OBR item(s)
              </div>
            </section>
          </div>

          {/* FOOTER */}
          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div>
              <p className="text-[10px] text-slate-400">
                VOUCHER TOTAL
              </p>

              <p className="text-xl font-bold text-[#557992]">
                {peso(grandTotal)}
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
                disabled={saving || !items.length}
                className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving && (
                  <Loader2
                    size={14}
                    className="animate-spin"
                  />
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
      </div>
    </div>
  );
}
