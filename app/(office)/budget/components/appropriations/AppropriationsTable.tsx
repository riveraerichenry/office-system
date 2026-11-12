"use client";

import { useMemo, useState } from "react";
import type { Appropriation, AccountOption, OfficeOption, SubOfficeOption, CategoryOption } from "./appropriation-types";

type Props = {
  data: Appropriation[];
  offices: OfficeOption[];
  subOffices: SubOfficeOption[];
  categories: CategoryOption[];
  accounts: AccountOption[];
  loading: boolean;
  selectedYear: number;
  onRefresh: () => void;
  onAdjustment: (item: Appropriation) => void;
  totals: { original: number; increases: number; decreases: number; realignmentIn: number; realignmentOut: number; adjusted: number };
};

const peso = (value: string | number) => Number(value || 0).toLocaleString("en-PH", { style: "currency", currency: "PHP", minimumFractionDigits: 2, maximumFractionDigits: 2 });
const filterClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none focus:border-[#6689A5] focus:ring-1 focus:ring-[#6689A5]";
const labelClass = "mb-1 block text-[11px] font-semibold text-slate-500";
function MoneyCell({ value }: { value: string | number }) { return <td className="whitespace-nowrap px-4 py-3 text-right tabular-nums text-slate-700">{peso(value)}</td>; }

export default function AppropriationsTable({ data, offices, subOffices, categories, accounts, loading, selectedYear, onRefresh, onAdjustment }: Props) {
  const [officeFilter, setOfficeFilter] = useState("");
  const [subOfficeFilter, setSubOfficeFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [accountFilter, setAccountFilter] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const filteredData = useMemo(() => (Array.isArray(data) ? data : []).filter((item) =>
    (!officeFilter || item.office_id === officeFilter) &&
    (!subOfficeFilter || item.sub_office_id === subOfficeFilter) &&
    (!categoryFilter || item.category_id === categoryFilter) &&
    (!accountFilter || item.account_id === accountFilter)
  ), [data, officeFilter, subOfficeFilter, categoryFilter, accountFilter]);

  const totals = useMemo(() => filteredData.reduce((acc, item) => {
    acc.original += Number(item.appropriated_amount || 0);
    acc.increases += Number(item.adjustment_in || 0);
    acc.decreases += Number(item.adjustment_out || 0);
    acc.realignmentIn += Number(item.realignment_in || 0);
    acc.realignmentOut += Number(item.realignment_out || 0);
    acc.adjusted += Number(item.adjusted_amount || 0);
    return acc;
  }, { original: 0, increases: 0, decreases: 0, realignmentIn: 0, realignmentOut: 0, adjusted: 0 }), [filteredData]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedData = filteredData.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const startRecord = filteredData.length ? (safePage - 1) * rowsPerPage + 1 : 0;
  const endRecord = Math.min(safePage * rowsPerPage, filteredData.length);
  const hasFilters = Boolean(officeFilter || subOfficeFilter || categoryFilter || accountFilter);
  function clearFilters() { setOfficeFilter(""); setSubOfficeFilter(""); setCategoryFilter(""); setAccountFilter(""); setCurrentPage(1); }

  return <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
    <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-800">Appropriation Records</h2><p className="text-xs text-slate-500">{filteredData.length} record(s) for fiscal year {selectedYear}</p></div><button type="button" onClick={onRefresh} disabled={loading} className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50">{loading ? "Loading..." : "Refresh"}</button></div>
    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4"><div className="mb-3 flex items-center justify-between"><p className="text-xs font-bold text-slate-700">Filter Appropriations</p>{hasFilters && <button type="button" onClick={clearFilters} className="text-xs font-semibold text-[#557992] hover:underline">Clear Filters</button>}</div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><label className={labelClass}>Office</label><select value={officeFilter} onChange={(e) => { setOfficeFilter(e.target.value); setCurrentPage(1); }} className={filterClass}><option value="">All Offices</option>{offices.map((x) => <option key={x.id} value={x.id}>{x.office_code} - {x.office_name}</option>)}</select></div>
        <div><label className={labelClass}>Sub-office</label><select value={subOfficeFilter} onChange={(e) => { setSubOfficeFilter(e.target.value); setCurrentPage(1); }} className={filterClass}><option value="">All Sub-offices</option>{subOffices.map((x) => <option key={x.id} value={x.id}>{x.sub_office_code ? `${x.sub_office_code} - ` : ""}{x.sub_office_name}</option>)}</select></div>
        <div><label className={labelClass}>Category</label><select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className={filterClass}><option value="">All Categories</option>{categories.map((x) => <option key={x.id} value={x.id}>{x.category_code} - {x.category_name}</option>)}</select></div>
        <div><label className={labelClass}>Expense Account</label><select value={accountFilter} onChange={(e) => { setAccountFilter(e.target.value); setCurrentPage(1); }} className={filterClass}><option value="">All Accounts</option>{accounts.map((x) => <option key={x.account_id} value={x.account_id}>{x.account_code} - {x.account_name}</option>)}</select></div>
      </div>
    </div>
    <div className="overflow-x-auto"><table className="w-full min-w-[1350px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Expense Account</th><th className="px-4 py-3">Office</th><th className="px-4 py-3">Sub-office</th><th className="px-4 py-3">Fund Source</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Ordinance</th><th className="px-4 py-3 text-right">Original</th><th className="px-4 py-3 text-right">Adj. In</th><th className="px-4 py-3 text-right">Adj. Out</th><th className="px-4 py-3 text-right">Realignment In</th><th className="px-4 py-3 text-right">Realignment Out</th><th className="px-4 py-3 text-right">Adjusted</th><th className="px-4 py-3 text-center">Action</th></tr></thead>
      <tbody className="divide-y divide-slate-100">{loading ? <tr><td colSpan={13} className="px-4 py-12 text-center text-slate-500">Loading appropriations...</td></tr> : filteredData.length === 0 ? <tr><td colSpan={13} className="px-4 py-12 text-center text-slate-500">No appropriation records found.</td></tr> : paginatedData.map((item) => <tr key={item.id} className="hover:bg-slate-50">
        <td className="px-4 py-3"><p className="font-semibold text-slate-800">{item.account_code}</p><p className="text-xs text-slate-500">{item.account_name}</p><p className="mt-1 text-[11px] text-slate-400">{item.remarks}</p></td>
        <td className="px-4 py-3 text-slate-700">{item.office_code} - {item.office_name}</td><td className="px-4 py-3 text-slate-700">{item.sub_office_code ? `${item.sub_office_code} - ` : ""}{item.sub_office_name || "-"}</td>
        <td className="px-4 py-3"><p className="font-medium text-slate-700">{item.fund_code}</p><p className="text-xs text-slate-500">{item.fund_name}</p></td>
        <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${item.appropriation_type === "annual" ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"}`}>{item.appropriation_type === "annual" ? "Annual" : "Supplemental"}</span></td>
        <td className="px-4 py-3"><p className="font-medium text-slate-700">{item.ordinance_no || "-"}</p><p className="text-xs text-slate-500">{item.ordinance_date ? new Date(item.ordinance_date).toLocaleDateString("en-PH") : ""}</p></td>
        <MoneyCell value={item.appropriated_amount} /><MoneyCell value={item.adjustment_in} /><MoneyCell value={item.adjustment_out} /><MoneyCell value={item.realignment_in} /><MoneyCell value={item.realignment_out} /><td className="whitespace-nowrap px-4 py-3 text-right font-bold text-slate-900">{peso(item.adjusted_amount)}</td><td className="px-4 py-3 text-center"><button type="button" onClick={() => onAdjustment(item)} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100">Adjustment</button></td>
      </tr>)}</tbody>
      {!loading && filteredData.length > 0 && <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-800"><tr><td colSpan={6} className="px-4 py-3">FILTERED TOTAL</td><MoneyCell value={totals.original} /><MoneyCell value={totals.increases} /><MoneyCell value={totals.decreases} /><MoneyCell value={totals.realignmentIn} /><MoneyCell value={totals.realignmentOut} /><td className="px-4 py-3 text-right">{peso(totals.adjusted)}</td><td /></tr></tfoot>}
    </table></div>
    {!loading && filteredData.length > 0 && <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between"><div className="text-xs text-slate-500">Showing <b className="text-slate-700">{startRecord}-{endRecord}</b> of <b className="text-slate-700">{filteredData.length}</b> records</div><div className="flex flex-wrap items-center gap-3"><div className="flex items-center gap-2"><label htmlFor="appropriation-rows-per-page" className="text-xs text-slate-500">Rows:</label><select id="appropriation-rows-per-page" value={rowsPerPage} onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }} className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-xs text-slate-700"><option value={5}>5</option><option value={10}>10</option><option value={20}>20</option></select></div><div className="flex items-center gap-1"><button type="button" onClick={() => setCurrentPage(1)} disabled={safePage === 1} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs disabled:opacity-40">«</button><button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40">Previous</button><span className="px-2 text-xs text-slate-600">Page {safePage} of {totalPages}</span><button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={safePage >= totalPages} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs disabled:opacity-40">Next</button><button type="button" onClick={() => setCurrentPage(totalPages)} disabled={safePage >= totalPages} className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs disabled:opacity-40">»</button></div></div></div>}
  </div>;
}
