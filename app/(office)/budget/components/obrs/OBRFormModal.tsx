
"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  X,
  Receipt,
  Plus,
  Trash2,
  Loader2,
  FileText,
} from "lucide-react";

import PRFormModal, {
  type PRAllocation,
} from "./PRFormModal";

import type {
  AccountOption,
  CategoryOption,
  OfficeOption,
  PurchaseRequestOption,
  SubOfficeOption,
} from "./types";

export type OBRFormData = {
  obr_number: string;
  obr_date: string;
  payee: string;
  particulars: string;
  office_id: string;
  sub_office_id: string | null;
  category_id: string;
  account_id: string;
  remarks: string;
  purchase_requests: {
    purchase_request_id: string;
    amount: number;
  }[];
};

type Props = {
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: CategoryOption[];
  accounts: AccountOption[];
  purchaseRequests: PurchaseRequestOption[];
  onClose: () => void;
  onSave: (data: OBRFormData) => Promise<void>;
};

const inputClass =
  "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm text-slate-800 outline-none transition focus:border-[#6689A5] placeholder:text-slate-400 disabled:opacity-50";

const labelClass =
  "mb-1 block text-[11px] font-medium text-slate-400";

const sectionTitleClass =
  "mb-3 border-b border-slate-300 pb-1.5 text-sm font-medium text-[#557992]";

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

export default function OBRFormModal({
  offices,
  subOffices,
  categories,
  accounts,
  purchaseRequests,
  onClose,
  onSave,
}: Props) {
  const [obrNumber, setObrNumber] = useState("");
  const [obrDate, setObrDate] = useState(today());
  const [payee, setPayee] = useState("");

  const [officeId, setOfficeId] = useState("");
  const [subOfficeId, setSubOfficeId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [accountId, setAccountId] = useState("");
  const [remarks, setRemarks] = useState("");

  const [selectedPRs, setSelectedPRs] = useState<PRAllocation[]>([]);
  const [showPRModal, setShowPRModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const availableSubOffices = useMemo(
    () =>
      subOffices.filter(
        (item) => item.office_id === officeId
      ),
    [subOffices, officeId]
  );

  // Categories are independent of office and sub-office.
  const availableCategories = useMemo(
    () => categories,
    [categories]
  );

  const availableAccounts = useMemo(
    () =>
      accounts.filter(
        (item) => item.category_id === categoryId
      ),
    [accounts, categoryId]
  );

  // Particulars are automatically derived from the selected
  // expense category and expense account.
  const selectedCategory = categories.find(
    (item) => item.id === categoryId
  );

  const selectedAccount = accounts.find(
    (item) => item.id === accountId
  );

  const particulars = [
    selectedCategory?.category_name,
    selectedAccount?.account_name,
  ]
    .filter(Boolean)
    .join(" — ");

  const totalAllocation = selectedPRs.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  function addPR(allocation: PRAllocation) {
    setError("");

    if (
      selectedPRs.some(
        (item) =>
          item.purchase_request_id === allocation.purchase_request_id
      )
    ) {
      setError("This Purchase Request has already been added.");
      return;
    }

    setSelectedPRs((current) => [...current, allocation]);
    setShowPRModal(false);
  }

  function removePR(id: string) {
    setSelectedPRs((current) =>
      current.filter(
        (item) => item.purchase_request_id !== id
      )
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (!obrNumber.trim()) {
      setError("OBR number is required.");
      return;
    }

    if (!obrDate) {
      setError("OBR date is required.");
      return;
    }

    if (!payee.trim()) {
      setError("Payee is required.");
      return;
    }

    if (!officeId || !categoryId || !accountId) {
      setError(
        "Office, expense category, and expense account are required."
      );
      return;
    }

    if (selectedPRs.length === 0) {
      setError("Add at least one Purchase Request.");
      return;
    }

    if (
      selectedPRs.some(
        (item) =>
          !Number.isFinite(Number(item.amount)) ||
          Number(item.amount) <= 0
      )
    ) {
      setError(
        "Every PR allocation must be greater than zero."
      );
      return;
    }

    setSaving(true);

    try {
      await onSave({
        obr_number: obrNumber.trim(),
        obr_date: obrDate,
        payee: payee.trim(),
        particulars: particulars.trim(),
        office_id: officeId,
        sub_office_id: subOfficeId || null,
        category_id: categoryId,
        account_id: accountId,
        remarks: remarks.trim(),

        purchase_requests: selectedPRs.map((item) => ({
          purchase_request_id: item.purchase_request_id,
          amount: Number(item.amount),
        })),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to save OBR."
      );
    } finally {
      setSaving(false);
    }
  }

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
                Create Obligation Request
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Enter OBR information and attach one or more Purchase Requests.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-md p-2 text-slate-500 hover:bg-white/60 disabled:opacity-50"
          >
            <X size={19} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-5">
            {/* OBR INFORMATION */}
            <section>
              <h3 className={sectionTitleClass}>
                Obligation Request Information
              </h3>

              <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClass}>
                    OBR Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={obrNumber}
                    onChange={(e) => setObrNumber(e.target.value)}
                    className={inputClass}
                    placeholder="Enter OBR number"
                    disabled={saving}
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>
                    OBR Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={obrDate}
                    onChange={(e) => setObrDate(e.target.value)}
                    className={inputClass}
                    disabled={saving}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Payee <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={payee}
                    onChange={(e) => setPayee(e.target.value)}
                    className={inputClass}
                    placeholder="Enter payee"
                    disabled={saving}
                    required
                  />
                </div>

                <div className="sm:col-span-4">
                  <label className={labelClass}>Particulars</label>
                  <textarea
                    value={particulars}
                    readOnly
                    className="w-full resize-none border-0 border-b border-slate-300 bg-slate-50 px-0 py-2 text-sm text-slate-700 outline-none"
                    placeholder="Select expense category and expense account"
                    rows={2}
                  />
                </div>
              </div>
            </section>

            {/* CLASSIFICATION */}
            <section>
              <h3 className={sectionTitleClass}>
                Office and Expense Classification
              </h3>

              <div className="grid grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label className={labelClass}>
                    Office <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={officeId}
                    onChange={(e) => {
                      setOfficeId(e.target.value);
                      setSubOfficeId("");
                    }}
                    className={inputClass}
                    disabled={saving}
                    required
                  >
                    <option value="">Select office</option>
                    {offices.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.office_code
                          ? `${item.office_code} — `
                          : ""}
                        {item.office_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Sub-office</label>
                  <select
                    value={subOfficeId}
                    onChange={(e) =>
                      setSubOfficeId(e.target.value)
                    }
                    className={inputClass}
                    disabled={!officeId || saving}
                  >
                    <option value="">Select sub-office</option>
                    {availableSubOffices.map((item) => (
                      <option key={item.id} value={item.id}>
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
                    Expense Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => {
                      setCategoryId(e.target.value);
                      setAccountId("");
                    }}
                    className={inputClass}
                    disabled={saving}
                    required
                  >
                    <option value="">Select category</option>
                    {availableCategories.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.category_code} — {item.category_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>
                    Expense Account <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className={inputClass}
                    disabled={!categoryId || saving}
                    required
                  >
                    <option value="">Select account</option>
                    {availableAccounts.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.account_code} — {item.account_name}
                      </option>
                    ))}
                  </select>
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

            {/* LINKED PURCHASE REQUESTS */}
            <section>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-300 pb-2">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-[#6689A5]" />
                  <h3 className="text-sm font-medium text-[#557992]">
                    Linked Purchase Requests
                  </h3>
                  <span className="rounded-full bg-[#EDF3F7] px-2 py-0.5 text-[10px] font-semibold text-[#557992]">
                    {selectedPRs.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setError("");
                    setShowPRModal(true);
                  }}
                  disabled={saving}
                  className="flex items-center gap-2 rounded-sm border border-[#6689A5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#557992] hover:bg-[#EDF3F7] disabled:opacity-50"
                >
                  <Plus size={14} />
                  Add PR
                </button>
              </div>

              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="bg-[#EDF3F7] text-[11px] font-semibold text-slate-500">
                    <tr>
                      <th className="w-12 px-2.5 py-2 text-center">#</th>
                      <th className="px-2.5 py-2">PR Number</th>
                      <th className="w-32 px-2.5 py-2">PR Date</th>
                      <th className="px-2.5 py-2">Purpose</th>
                      <th className="w-36 px-2.5 py-2 text-right">PR Total</th>
                      <th className="w-36 px-2.5 py-2 text-right">Allocation</th>
                      <th className="w-12 px-2.5 py-2" />
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {selectedPRs.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-4 py-8 text-center text-xs text-slate-400"
                        >
                          No Purchase Requests added. Click Add PR to select or create one.
                        </td>
                      </tr>
                    ) : (
                      selectedPRs.map((item, index) => (
                        <tr key={item.purchase_request_id}>
                          <td className="px-2.5 py-2 text-center text-xs text-slate-400">
                            {index + 1}
                          </td>

                          <td className="px-2.5 py-2 text-xs font-semibold text-slate-700">
                            {item.pr_number}
                          </td>

                          <td className="px-2.5 py-2 text-xs text-slate-500">
                            {item.pr_date || "—"}
                          </td>

                          <td className="max-w-[260px] px-2.5 py-2 text-xs text-slate-600">
                            <p className="truncate">
                              {item.purpose || "—"}
                            </p>
                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {item.office_name || ""}
                            </p>
                          </td>

                          <td className="px-2.5 py-2 text-right text-xs tabular-nums text-slate-600">
                            {peso(item.total_amount)}
                          </td>

                          <td className="px-2.5 py-2 text-right text-xs font-semibold tabular-nums text-slate-700">
                            {peso(item.amount)}
                          </td>

                          <td className="px-2.5 py-2 text-center">
                            <button
                              type="button"
                              onClick={() =>
                                removePR(item.purchase_request_id)
                              }
                              disabled={saving}
                              className="rounded p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Remove Purchase Request"
                            >
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>

                  <tfoot>
                    <tr className="bg-[#F5F8FA]">
                      <td
                        colSpan={5}
                        className="px-4 py-3 text-right text-xs font-semibold text-slate-600"
                      >
                        TOTAL OBR ALLOCATION
                      </td>
                      <td className="px-2.5 py-2 text-right text-sm font-bold text-[#557992]">
                        {peso(totalAllocation)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <p className="mt-2 text-[10px] text-slate-400">
                Partial PR allocations are allowed. The allocation is recorded separately for each PR.
              </p>
            </section>

            {error && (
              <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-2 text-xs text-red-700">
                {error}
              </p>
            )}
          </div>

          {/* FOOTER */}
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div>
              <p className="text-[10px] text-slate-400">
                TOTAL OBR ALLOCATION
              </p>
              <p className="text-xl font-bold text-[#557992]">
                {peso(totalAllocation)}
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
                disabled={saving || selectedPRs.length === 0}
                className="flex items-center gap-2 rounded-md bg-[#6689A5] px-5 py-2.5 text-xs font-semibold text-white hover:bg-[#557992] disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {saving && (
                  <Loader2 size={14} className="animate-spin" />
                )}
                {saving ? "Saving..." : "Save OBR"}
              </button>
            </div>
          </div>
        </form>

        {showPRModal && (
          <PRFormModal
            purchaseRequests={purchaseRequests}
            selectedPurchaseRequestIds={selectedPRs.map(
              (item) => item.purchase_request_id
            )}
            onClose={() => setShowPRModal(false)}
            onAdd={addPR}
          />
        )}
      </div>
    </div>
  );
}
