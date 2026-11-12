"use client";

import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Layers3, Pencil, Plus, Power, Search } from "lucide-react";
import type { ExpenseAccountCategory } from "./account-types";

type Props = {
  categories: ExpenseAccountCategory[];
  loading: boolean;
  search: string;
  page: number;
  pageSize: number;
  total: number;
  expanded: boolean;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onToggleExpanded: () => void;
  onAdd: () => void;
  onEdit: (item: ExpenseAccountCategory) => void;
  onToggleStatus: (item: ExpenseAccountCategory) => void;
  statusBadge: (active: boolean) => React.ReactNode;
};

const PAGE_SIZE_OPTIONS = [5, 10, 20];

export default function AccountCategoryTable({ categories, loading, search, page, pageSize, total, expanded, onSearchChange, onPageChange, onPageSizeChange, onToggleExpanded, onAdd, onEdit, onToggleStatus, statusBadge }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <section className="mb-6 overflow-hidden rounded-lg border border-[#DCE3E9] bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DCE3E9] p-4">
        <button type="button" onClick={onToggleExpanded} className="flex items-center gap-3 text-left">
          <div className="rounded-md bg-[#EAF1F6] p-2 text-[#6689A5]"><Layers3 size={19} /></div>
          <div><h2 className="text-sm font-semibold text-slate-800">Account Categories</h2><p className="text-[11px] text-slate-400">Global categories available to all offices and sub-offices</p></div>
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative"><Search size={14} className="absolute left-3 top-2.5 text-slate-400" /><input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Search categories..." className="rounded-md border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs outline-none focus:border-[#829FB5]" /></div>
          <button type="button" onClick={onAdd} className="flex items-center gap-2 rounded-md bg-[#6689A5] px-3 py-2.5 text-xs font-semibold text-white hover:bg-[#557992]"><Plus size={15} />Add Category</button>
        </div>
      </div>

      {expanded && <>
        <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm">
          <thead className="bg-[#F3F6F8] text-[10px] uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">Category Code</th><th className="px-5 py-3">Category Name</th><th className="px-5 py-3">Description</th><th className="px-5 py-3 text-center">Status</th><th className="px-5 py-3 text-center">Actions</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? <tr><td colSpan={5} className="py-10 text-center text-slate-400">Loading categories...</td></tr> : categories.length === 0 ? <tr><td colSpan={5} className="py-10 text-center text-sm text-slate-400">No account categories found.</td></tr> : categories.map((item) => <tr key={item.id} className="transition hover:bg-[#F8FAFC]">
              <td className="px-5 py-3 font-semibold text-[#6689A5]">{item.category_code}</td>
              <td className="px-5 py-3 text-xs font-medium text-slate-700">{item.category_name}</td>
              <td className="max-w-[300px] truncate px-5 py-3 text-xs text-slate-500">{item.description || "—"}</td>
              <td className="px-5 py-3 text-center">{statusBadge(item.is_active)}</td>
              <td className="px-5 py-3"><div className="flex justify-center gap-1">
                <button type="button" title="Edit category" onClick={() => onEdit(item)} className="rounded-md border border-slate-200 p-2 text-slate-500 hover:bg-[#EAF1F6] hover:text-[#557992]"><Pencil size={14} /></button>
                <button type="button" title={item.is_active ? "Deactivate category" : "Activate category"} onClick={() => onToggleStatus(item)} className={`rounded-md border border-slate-200 p-2 ${item.is_active ? "text-amber-600 hover:bg-amber-50" : "text-emerald-600 hover:bg-emerald-50"}`}><Power size={14} /></button>
              </div></td>
            </tr>)}
          </tbody>
        </table></div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2"><span className="text-[11px] text-slate-400">Rows per page</span><select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-600 outline-none">{PAGE_SIZE_OPTIONS.map((size) => <option key={size} value={size}>{size}</option>)}</select><span className="text-[11px] text-slate-400">Showing {start}-{end} of {total}</span></div>
          <div className="flex items-center gap-1"><button type="button" onClick={() => onPageChange(page - 1)} disabled={page <= 1} className="rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"><ChevronLeft size={15} /></button><span className="min-w-[90px] text-center text-[11px] text-slate-500">Page {page} of {totalPages}</span><button type="button" onClick={() => onPageChange(page + 1)} disabled={page >= totalPages} className="rounded-md border border-slate-200 p-1.5 text-slate-500 disabled:opacity-40"><ChevronRight size={15} /></button></div>
        </div>
      </>}
    </section>
  );
}
