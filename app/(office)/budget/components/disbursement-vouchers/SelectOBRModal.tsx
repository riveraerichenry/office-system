
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  X,
  Plus,
  Building2,
  FolderOpen,
  Wallet,
} from "lucide-react";

import type { OBRRecord } from "./types";

type OBRDisplayRecord = OBRRecord & {
  office_name?: string;
  sub_office_name?: string;
  category_code?: string;
  category_name?: string;
  account_code?: string;
  account_name?: string;
  obligation_amount?: number | string;
  total_allocation?: number | string;
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

export default function SelectOBRModal({
  obrs,
  selectedIds,
  onClose,
  onSelect,
}: Props) {
  const [search, setSearch] = useState("");

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

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/40 p-3 backdrop-blur-[2px]">
      <div className="flex max-h-[90vh] w-full max-w-7xl flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-2xl">

        {/* HEADER */}
        <header className="flex shrink-0 items-center justify-between border-b border-[#C7D8E3] bg-[#D6E5EF] px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">
              Select Obligation Request
            </h3>

            <p className="mt-1 text-xs text-slate-500">
              Choose an OBR to attach to this voucher.
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

        {/* SEARCH */}
        <div className="shrink-0 border-b border-slate-200 p-3">
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

                        {/* OFFICE / SUB-OFFICE */}
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

                        {/* OBRIGATION AMOUNT */}
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
  );
}
