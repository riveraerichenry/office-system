"use client";

import { useMemo, useState } from "react";
import { generateUUID } from "@/lib/generateUUID";
import {
  Search,
  X,
  Plus,
  Building2,
  FolderOpen,
  Wallet,
  FilePlus2,
} from "lucide-react";

import type { OBRRecord } from "./types";
import CreateOBRModal, {
  type NewOBRData,
} from "./CreateOBRModal";

type OBRDisplayRecord = OBRRecord & {
  office_name?: string;
  sub_office_name?: string | null;
  category_code?: string;
  category_name?: string;
  account_code?: string;
  account_name?: string;
  obligation_amount?: number | string;
  total_allocation?: number | string;
  new_obr?: NewOBRData;
};

type Props = {
  obrs: OBRDisplayRecord[];
  selectedIds: string[];
  onClose: () => void;
  onSelect: (obr: OBRRecord) => void;
};

const peso = (value: number | string) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

function getId() {
  return typeof crypto !== "undefined" &&
    "randomUUID" in crypto
    ? generateUUID()
    : `${Date.now()}-${Math.random()}`;
}

export default function SelectOBRModal({
  obrs,
  selectedIds,
  onClose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");
  const [showCreateOBR, setShowCreateOBR] = useState(false);

  // ==========================================================
  // SEARCH
  // ==========================================================

  const filtered = useMemo(() => {
    const query = search.toLowerCase().trim();

    return obrs.filter((obr) => {
      const matchesSearch = [
        obr.obr_number,
        obr.payee,
        obr.particulars,
        obr.office_name,
        obr.sub_office_name,
        obr.category_code,
        obr.category_name,
        obr.account_code,
        obr.account_name,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      return (
        !selectedIds.includes(obr.id) &&
        matchesSearch
      );
    });
  }, [obrs, selectedIds, search]);

  // ==========================================================
  // CREATE TEMPORARY OBR
  // ==========================================================

  function handleCreateOBR(data: NewOBRData) {
    const temporaryId = `NEW-${getId()}`;

    const newOBR: OBRRecord & {
      new_obr?: NewOBRData;
    } = {
      id: temporaryId,

      obr_number: data.obr_number,
      obr_date: data.obr_date,
      payee: data.payee,
      particulars: data.particulars,

      // IDs
      office_id: data.office_id,
      sub_office_id: data.sub_office_id,
      category_id: data.category_id,
      account_id: data.account_id,

      // DISPLAY DATA - IMPORTANT FIX
      office_name: data.office_name || "",
      sub_office_name: data.sub_office_name ?? null,

      category_code: data.category_code || "",
      category_name: data.category_name || "",

      account_code: data.account_code || "",
      account_name: data.account_name || "",

      // AMOUNT
      obligation_amount: data.obligation_amount,
      total_amount: data.obligation_amount,
      total_allocation: data.obligation_amount,
      available_amount: data.obligation_amount,

      status: "temporary",

      // Preserve complete payload until DV save
      new_obr: data,
    };

    // Add to DV
    onSelect(newOBR);

    setShowCreateOBR(false);
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <>
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
        <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl">

          {/* HEADER */}
          <header className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3">
            <div>
              <h3 className="text-sm font-semibold text-slate-800">
                Select Obligation Request
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Select an existing OBR or create a new standalone OBR.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="rounded p-2 text-slate-500 hover:bg-white/60"
            >
              <X size={18} />
            </button>
          </header>

          {/* ACTIONS AND SEARCH */}
          <div className="shrink-0 space-y-3 border-b border-slate-200 p-3">

            <div className="flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setShowCreateOBR(true)}
                className="inline-flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#557992]"
              >
                <FilePlus2 size={15} />
                Create OBR
              </button>

              <p className="text-[10px] text-slate-400">
                New OBR will be saved together with the DV.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded border border-slate-200 bg-slate-50 px-3">
              <Search
                size={15}
                className="shrink-0 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search OBR, payee, office, category, account..."
                className="w-full bg-transparent py-2.5 text-sm outline-none"
              />
            </div>
          </div>

          {/* TABLE */}
          <div className="min-h-0 flex-1 overflow-auto p-3">
            <div className="overflow-x-auto rounded border border-slate-200">
              <table className="w-full min-w-[1150px] text-left">

                <thead className="sticky top-0 z-10 bg-[#EDF3F7] text-[10px] font-semibold uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-3">
                      OBR Number / Date
                    </th>

                    <th className="px-3 py-3">
                      Payee
                    </th>

                    <th className="px-3 py-3">
                      Office / Sub-office
                    </th>

                    <th className="px-3 py-3">
                      Expense Category
                    </th>

                    <th className="px-3 py-3">
                      Expense Account
                    </th>

                    <th className="px-3 py-3 text-right">
                      Obligation Amount
                    </th>

                    <th className="px-3 py-3 text-center">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">

                  {filtered.length > 0 ? (
                    filtered.map((obr) => {
                      const obligationAmount = Number(
                        obr.obligation_amount ??
                          obr.total_allocation ??
                          obr.total_amount ??
                          0
                      );

                      return (
                        <tr
                          key={obr.id}
                          className="transition-colors hover:bg-[#F8FAFC]"
                        >
                          {/* OBR NUMBER */}
                          <td className="px-3 py-3 align-top">
                            <p className="text-xs font-bold text-slate-700">
                              {obr.obr_number}
                            </p>

                            <p className="mt-1 text-[10px] text-slate-400">
                              {obr.obr_date
                                ? String(obr.obr_date).slice(0, 10)
                                : "—"}
                            </p>
                          </td>

                          {/* PAYEE */}
                          <td className="px-3 py-3 align-top">
                            <p className="text-xs font-medium text-slate-700">
                              {obr.payee || "—"}
                            </p>

                            {obr.particulars && (
                              <p className="mt-1 max-w-[180px] text-[10px] text-slate-400">
                                {obr.particulars}
                              </p>
                            )}
                          </td>

                          {/* OFFICE */}
                          <td className="px-3 py-3 align-top">
                            <div className="flex items-start gap-2">
                              <Building2
                                size={14}
                                className="mt-0.5 shrink-0 text-[#6689A5]"
                              />

                              <div>
                                <p className="text-xs font-medium text-slate-700">
                                  {obr.office_name || "—"}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {obr.sub_office_name ||
                                    "No sub-office"}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* CATEGORY */}
                          <td className="px-3 py-3 align-top">
                            <div className="flex items-start gap-2">
                              <FolderOpen
                                size={14}
                                className="mt-0.5 shrink-0 text-[#6689A5]"
                              />

                              <div>
                                <p className="text-xs font-medium text-slate-700">
                                  {obr.category_name || "—"}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {obr.category_code || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* ACCOUNT */}
                          <td className="px-3 py-3 align-top">
                            <div className="flex items-start gap-2">
                              <Wallet
                                size={14}
                                className="mt-0.5 shrink-0 text-[#6689A5]"
                              />

                              <div>
                                <p className="text-xs font-medium text-slate-700">
                                  {obr.account_name || "—"}
                                </p>

                                <p className="mt-1 text-[10px] text-slate-400">
                                  {obr.account_code || ""}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* AMOUNT */}
                          <td className="px-3 py-3 text-right align-top">
                            <p className="whitespace-nowrap text-xs font-bold tabular-nums text-[#557992]">
                              {peso(obligationAmount)}
                            </p>
                          </td>

                          {/* ACTION */}
                          <td className="px-3 py-3 text-center align-top">
                            <button
                              type="button"
                              onClick={() => onSelect(obr)}
                              className="inline-flex items-center gap-1 rounded border border-[#6689A5] bg-white px-2.5 py-1.5 text-xs font-semibold text-[#557992] transition-colors hover:bg-[#EDF3F7]"
                            >
                              <Plus size={13} />
                              Add
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-12 text-center text-xs text-slate-400"
                      >
                        No available OBR found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* FOOTER */}
          <footer className="flex shrink-0 items-center justify-between border-t border-slate-200 bg-slate-50 px-4 py-3">
            <p className="text-[10px] text-slate-400">
              {filtered.length} available OBR record(s)
            </p>

            <button
              type="button"
              onClick={onClose}
              className="rounded border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Close
            </button>
          </footer>
        </div>
      </div>

      {/* CREATE OBR */}
      {showCreateOBR && (
        <CreateOBRModal
          onClose={() => setShowCreateOBR(false)}
          onCreate={handleCreateOBR}
        />
      )}
    </>
  );
}