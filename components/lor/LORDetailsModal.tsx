"use client";

import {
  X,
  FileText,
  Receipt,
  User,
  Landmark,
  Calendar,
  BookOpen,
  Save,
  Pencil,
} from "lucide-react";

import axios from "axios";
import { useEffect, useState } from "react";

import LORTransactionsModal from "./LORTransactionsModal";

type Props = {
  open: boolean;
  selected: any;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
};

export default function LORDetailsModal({
  open,
  selected,
  onClose,
  onSuccess,
}: Props) {
  /*
  |--------------------------------------------------------------------------
  | State
  |--------------------------------------------------------------------------
  */

  const [editingFund, setEditingFund] =
    useState(false);

  const [savingFund, setSavingFund] =
    useState(false);

  const [fundSources, setFundSources] =
    useState<any[]>([]);

  const [selectedFundId, setSelectedFundId] =
    useState<string>("");

  const [loadingFunds, setLoadingFunds] =
    useState(false);


  const [
    openTransactionsModal,
    setOpenTransactionsModal,
  ] = useState(false);

  /*
  |--------------------------------------------------------------------------
  | Load Data When Modal Opens
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (!open || !selected) {
      return;
    }

    setEditingFund(false);

    /*
     * IMPORTANT:
     * Actual column is fund_source_id.
     */
    setSelectedFundId(
      selected.fund_source_id ?? ""
    );

    loadFundSources();
  }, [open, selected]);

  /*
  |--------------------------------------------------------------------------
  | Load Fund Sources
  |--------------------------------------------------------------------------
  */

  async function loadFundSources() {
    try {
      setLoadingFunds(true);

      const res = await axios.get(
        "/api/lor/fund-sources"
      );

      setFundSources(
        res.data?.data ?? []
      );
    } catch (error) {
      console.error(
        "Failed to load fund sources:",
        error
      );

      setFundSources([]);
    } finally {
      setLoadingFunds(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Save Fund Source
  |--------------------------------------------------------------------------
  */

  async function saveFundSource() {
    if (!selected?.id) {
      alert("LOR ID is missing.");
      return;
    }

    if (!selectedFundId) {
      alert("Please select a fund source.");
      return;
    }

    try {
      setSavingFund(true);

      console.log(
        "Updating LOR Fund Source:",
        {
          lorId: selected.id,
          fundSourceId: selectedFundId,
        }
      );

      await axios.patch(
        `/api/lor/${selected.id}/fund-source`,
        {
          fund_source_id: selectedFundId,
        }
      );

      setEditingFund(false);

      /*
      |--------------------------------------------------------------------------
      | Refresh Parent LOR Data
      |--------------------------------------------------------------------------
      */

      if (onSuccess) {
        await onSuccess();
      }

    } catch (error: any) {
      console.error(
        "Failed to update fund source:",
        error
      );

      alert(
        error?.response?.data?.message ??
          "Failed to update fund source."
      );
    } finally {
      setSavingFund(false);
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Don't Render
  |--------------------------------------------------------------------------
  */

  if (!open || !selected) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | Receipt Usage
  |--------------------------------------------------------------------------
  */

  const used = Math.max(
    0,
    Number(selected.current_or) -
      Number(selected.beginning_or)
  );

  const total =
    Number(selected.ending_or) -
    Number(selected.beginning_or) +
    1;

  const remaining = Math.max(
    0,
    total - used
  );

  const percent =
    total > 0
      ? Math.min(
          100,
          Math.max(
            0,
            (used / total) * 100
          )
        )
      : 0;

  /*
  |--------------------------------------------------------------------------
  | Render
  |--------------------------------------------------------------------------
  */

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[95vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >

        {/* ============================================================
            HEADER
        ============================================================ */}

        <div className="flex items-center justify-between border-b bg-slate-50 px-6 py-5">

          <div>
            <h2 className="text-2xl font-semibold text-slate-800">
              Letter of Receipt
            </h2>

            <p className="text-sm text-slate-500">
              Released Booklet Information
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-slate-200"
            title="Close"
            aria-label="Close"
          >
            <X size={22} />
          </button>

        </div>

        {/* ============================================================
            BODY
        ============================================================ */}

        <div className="grid flex-1 grid-cols-2 gap-6 overflow-y-auto p-6">

          {/* ==========================================================
              LEFT COLUMN
          ========================================================== */}

          <div className="space-y-6">

            {/* ========================================================
                LOR INFORMATION
            ======================================================== */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <FileText
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">
                  LOR Information
                </span>

              </div>

              <div className="space-y-4 p-4">

                {/* LOR NUMBER */}

                <div>
                  <div className="text-xs text-slate-500">
                    LOR Number
                  </div>

                  <div className="font-semibold text-blue-700">
                    {selected.lor_no ?? "-"}
                  </div>
                </div>

                {/* STATUS */}

                <div>
                  <div className="text-xs text-slate-500">
                    Status
                  </div>

                  <span className="mt-1 inline-flex rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
                    {selected.status ?? "-"}
                  </span>
                </div>

                {/* RELEASED DATE */}

                <div>
                  <div className="text-xs text-slate-500">
                    Released Date
                  </div>

                  <div className="text-sm text-slate-700">
                    {selected.released_at
                      ? new Date(
                          selected.released_at
                        ).toLocaleString()
                      : "-"}
                  </div>
                </div>

                {/* RELEASED BY */}

                <div>
                  <div className="text-xs text-slate-500">
                    Released By
                  </div>

                  <div className="text-sm text-slate-700">
                    {selected.released_by ?? "-"}
                  </div>
                </div>

              </div>
            </div>

            {/* ========================================================
                BOOKLET INFORMATION
            ======================================================== */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <Receipt
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">
                  Booklet Information
                </span>

              </div>

              <div className="grid grid-cols-2 gap-4 p-4">

                {/* FORM CODE */}

                <div>
                  <div className="text-xs text-slate-500">
                    Form Code
                  </div>

                  <div className="font-medium">
                    {selected.form_code ?? "-"}
                  </div>
                </div>

                {/* FORM NAME */}

                <div>
                  <div className="text-xs text-slate-500">
                    Form Name
                  </div>

                  <div>
                    {selected.form_name ?? "-"}
                  </div>
                </div>

                {/* CONTROL NUMBER */}

                <div>
                  <div className="text-xs text-slate-500">
                    Control No.
                  </div>

                  <div>
                    {selected.control_no ?? "-"}
                  </div>
                </div>

                {/* COVERAGE */}

                <div>
                  <div className="text-xs text-slate-500">
                    Coverage
                  </div>

                  <div>
                    {selected.beginning_or ?? "-"}
                    {" - "}
                    {selected.ending_or ?? "-"}
                  </div>
                </div>

                {/* CURRENT OR */}

                <div>
                  <div className="text-xs text-slate-500">
                    Current OR
                  </div>

                  <div className="font-semibold text-blue-700">
                    {selected.current_or ?? "-"}
                  </div>
                </div>

                {/* BOOKLET STATUS */}

                <div>
                  <div className="text-xs text-slate-500">
                    Booklet Status
                  </div>

                  <span className="inline-flex rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {selected.booklet_status ?? "-"}
                  </span>
                </div>

              </div>
            </div>

            {/* ========================================================
                ASSIGNMENT INFORMATION
            ======================================================== */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <User
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">
                  Assignment Information
                </span>

              </div>

              <div className="grid grid-cols-2 gap-4 p-4">

                {/* RAT NUMBER */}

                <div>
                  <div className="text-xs text-slate-500">
                    RAT Number
                  </div>

                  <div className="font-medium">
                    {selected.rat_no ?? "-"}
                  </div>
                </div>

                {/* RIS NUMBER */}

                <div>
                  <div className="text-xs text-slate-500">
                    RIS Number
                  </div>

                  <div>
                    {selected.ris_no ?? "-"}
                  </div>
                </div>

                {/* ACCOUNTABLE OFFICER */}

                <div className="col-span-2">
                  <div className="text-xs text-slate-500">
                    Accountable Officer
                  </div>

                  <div className="font-medium">
                    {selected.accountable_officer ??
                      "-"}
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* ==========================================================
              RIGHT COLUMN
          ========================================================== */}

          <div className="space-y-6">

            {/* ========================================================
                FUND INFORMATION
            ======================================================== */}

            <div className="rounded-xl border">

              <div className="flex items-center justify-between border-b bg-slate-50 px-4 py-3">

                <div className="flex items-center gap-2">

                  <Landmark
                    size={18}
                    className="text-blue-600"
                  />

                  <span className="font-semibold">
                    Fund Information
                  </span>

                </div>

                {!editingFund && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFundId(
                        selected.fund_source_id ??
                          ""
                      );

                      setEditingFund(true);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Pencil size={14} />
                    Edit
                  </button>
                )}

              </div>

              <div className="space-y-4 p-4">

                {!editingFund ? (
                  <>
                    {/* CURRENT FUND CODE */}

                    <div>
                      <div className="text-xs text-slate-500">
                        Fund Code
                      </div>

                      <div className="font-semibold text-slate-800">
                        {selected.fund_code ??
                          "-"}
                      </div>
                    </div>

                    {/* CURRENT FUND NAME */}

                    <div>
                      <div className="text-xs text-slate-500">
                        Fund Name
                      </div>

                      <div className="text-sm text-slate-700">
                        {selected.fund_name ??
                          "-"}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* =================================================
                        FUND SOURCE DROPDOWN
                    ================================================== */}

                    <div>

                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Select Fund Source
                      </label>

                      <select
                        value={selectedFundId}
                        onChange={(event) =>
                          setSelectedFundId(
                            event.target.value
                          )
                        }
                        disabled={
                          loadingFunds ||
                          savingFund
                        }
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                      >

                        <option value="">
                          {loadingFunds
                            ? "Loading fund sources..."
                            : "Select fund source"}
                        </option>

                        {fundSources.map(
                          (fund) => (
                            <option
                              key={fund.id}
                              value={fund.id}
                            >
                              {fund.fund_code}
                              {" - "}
                              {fund.fund_name}
                              {fund.acronym
                                ? ` (${fund.acronym})`
                                : ""}
                            </option>
                          )
                        )}

                      </select>

                    </div>

                    {/* =================================================
                        CURRENT FUND SOURCE
                    ================================================== */}

                    <div className="rounded-lg bg-slate-50 p-3">

                      <div className="text-[11px] font-semibold uppercase text-slate-500">
                        Current Fund Source
                      </div>

                      <div className="mt-1 text-sm font-semibold text-slate-800">
                        {selected.fund_code ??
                          "-"}
                        {" - "}
                        {selected.fund_name ??
                          "-"}
                      </div>

                    </div>

                    {/* =================================================
                        BUTTONS
                    ================================================== */}

                    <div className="flex justify-end gap-2">

                      <button
                        type="button"
                        onClick={() => {
                          setEditingFund(false);

                          setSelectedFundId(
                            selected.fund_source_id ??
                              ""
                          );
                        }}
                        disabled={savingFund}
                        className="rounded-lg border px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={
                          saveFundSource
                        }
                        disabled={
                          savingFund ||
                          loadingFunds ||
                          !selectedFundId
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Save size={16} />

                        {savingFund
                          ? "Saving..."
                          : "Save Fund Source"}
                      </button>

                    </div>

                  </>
                )}

              </div>
            </div>

            {/* ========================================================
                RECEIPT USAGE
            ======================================================== */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <Calendar
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">
                  Receipt Usage
                </span>

              </div>

              <div className="space-y-4 p-4">

                <div className="flex justify-between text-sm">

                  <span>
                    Used
                  </span>

                  <span className="font-semibold">
                    {used} / {total}
                  </span>

                </div>

                {/* PROGRESS BAR */}

                <div className="h-3 overflow-hidden rounded-full bg-slate-200">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all"
                    style={{
                      width: `${percent}%`,
                    }}
                  />

                </div>

                {/* USED / REMAINING */}

                <div className="grid grid-cols-2 gap-4">

                  <div>

                    <div className="text-xs text-slate-500">
                      Used
                    </div>

                    <div className="font-semibold text-red-600">
                      {used}
                    </div>

                  </div>

                  <div>

                    <div className="text-xs text-slate-500">
                      Remaining
                    </div>

                    <div className="font-semibold text-green-600">
                      {remaining}
                    </div>

                  </div>

                </div>

              </div>
            </div>

            {/* ========================================================
                REMARKS
            ======================================================== */}

            <div className="rounded-xl border">

              <div className="flex items-center gap-2 border-b bg-slate-50 px-4 py-3">

                <BookOpen
                  size={18}
                  className="text-blue-600"
                />

                <span className="font-semibold">
                  Remarks
                </span>

              </div>

              <div className="p-4 text-sm text-slate-700">
                {selected.remarks ||
                  "No remarks provided."}
              </div>

            </div>

          </div>

        </div>

        {/* ============================================================
            FOOTER
        ============================================================ */}

        <div className="flex items-center justify-end gap-3 border-t bg-slate-50 px-6 py-4">

          <button
            type="button"
            onClick={() =>
              setOpenTransactionsModal(true)
            }
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white transition hover:bg-blue-700"
          >
            <BookOpen size={18} />
            View Transactions
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border px-5 py-2 transition hover:bg-slate-100"
          >
            Close
          </button>

          <LORTransactionsModal
            open={openTransactionsModal}
            lor={selected}
            onClose={() =>
              setOpenTransactionsModal(false)
            }
          />

        </div>

      </div>
    </div>
  );
}